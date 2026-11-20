import { revealOnPage } from './helpers/pagination';
import { test, expect } from './fixtures/reservas';
import type { APIRequestContext, Page } from '@playwright/test';
import { apiUrl, createFromUi, evidence, selectRange, sendReceipt, summary } from './helpers/app';

async function createConfirmedReservation(page: Page, app: {
  client: APIRequestContext;
  secretary: APIRequestContext;
}, start = '10:00', end = '11:00') {
  await selectRange(page, start, end);
  const reservation = await createFromUi(page);
  await sendReceipt(page);
  const payments = await app.secretary.get(`${apiUrl}/secretary/payments/pending`);
  expect(payments.ok()).toBeTruthy();
  const payment = (await payments.json()).find(
    (item: { reservationId: string }) => item.reservationId === reservation.reservationId,
  );
  expect(payment, 'Encontrar el anticipo de la reserva bajo prueba').toBeTruthy();
  const validated = await app.secretary.post(`${apiUrl}/secretary/payments/${payment.paymentId}/validate`);
  expect(validated.ok(), 'Validar el anticipo de la reserva bajo prueba').toBeTruthy();
  const confirmedSummary = await summary(app.client, reservation.reservationId);
  expect(confirmedSummary.status).toBe('CONFIRMED');
  return { reservation, confirmedSummary, payment };
}

test('PAY-EP-01 @reservas @ostin @ui Comprobante válido pasa a validación', async ({ page, app }, info) => {
  await selectRange(page);
  const reservation = await createFromUi(page);
  const before = await summary(app.client, reservation.reservationId);
  expect(before.status).toBe('TEMPORAL');
  expect(before.advanceRequired).toBeCloseTo(before.totalPrice * 0.25, 2);

  await sendReceipt(page);

  const after = await summary(app.client, reservation.reservationId);
  expect(after.status).toBe('PENDING_VALIDATION');
  expect(after.pendingBalance).toBe(before.pendingBalance);
  await evidence(page, info);
});

test('PAY-EP-02 @reservas @ostin @api Comprobante vacío es rechazado', async ({ page, app }, info) => {
  await selectRange(page);
  const reservation = await createFromUi(page);
  const response = await app.client.post(`${apiUrl}/payments/${reservation.reservationId}/receipt`, {
    data: { receiptImageUrl: '' },
  });

  expect(response.status()).toBe(400);
  expect((await summary(app.client, reservation.reservationId)).status).toBe('TEMPORAL');
  await info.attach('rechazo-comprobante-vacio', {
    body: await response.body(),
    contentType: 'application/json',
  });
});

for (const amountDelta of [-0.01, 0.01]) {
  test(`PAY-BVA-01-${amountDelta < 0 ? 'INSUFICIENTE' : 'EXCESO'} @reservas @ostin @api Pago final fuera del saldo`, async ({ page, app }) => {
    const { reservation, confirmedSummary } = await createConfirmedReservation(page, app);
    const amount = Number((confirmedSummary.pendingBalance + amountDelta).toFixed(2));
    const response = await app.secretary.post(
      `${apiUrl}/secretary/reservations/${reservation.reservationId}/final-payment`,
      { data: { amount, paymentMethod: 'EFECTIVO' } },
    );

    expect(response.status()).toBe(400);
    const detail = await app.secretary.get(`${apiUrl}/secretary/reservations/${reservation.reservationId}`);
    expect(detail.ok()).toBeTruthy();
    expect((await detail.json()).pendingBalance).toBe(confirmedSummary.pendingBalance);
  });
}

for (const method of ['EFECTIVO', 'QR'] as const) test(`${method === 'EFECTIVO' ? 'PAY-EP-03' : 'PAY-EP-04'} @reservas @ostin @saldo @ui Pago final exacto ${method} deja saldo cero`, async ({ page, app, browser }, info) => {
  const { reservation, confirmedSummary } = await createConfirmedReservation(page, app);
  const context = await browser.newContext({
    storageState: app.secretaryState,
    baseURL: String(info.project.use.baseURL),
    timezoneId: 'America/La_Paz',
  });
  try {
    const secretary = await context.newPage();
    const initialBoardResponse = secretary.waitForResponse(response =>
      response.url().includes('/secretary/operational-board') &&
      response.request().method() === 'GET',
    );
    await secretary.goto('/secretary');
    await expect(initialBoardResponse).resolves.toBeTruthy();
    const boardResponse = secretary.waitForResponse(response =>
      response.url().includes('/secretary/operational-board') &&
      response.request().method() === 'GET',
    );
    const dateInput = secretary.locator('#boardDate');
    await dateInput.fill(app.date);
    await dateInput.dispatchEvent('change');
    const board = await boardResponse;
    expect(board.ok(), `Cargar tablero operativo para ${app.date}`).toBeTruthy();
    const boardBody = await board.json();
    expect(
      boardBody.courts?.some((item: { reservations?: { id: string }[] }) =>
        item.reservations?.some(reservationItem => reservationItem.id === reservation.reservationId),
      ),
      'El tablero debe mostrar la reserva confirmada creada por este caso',
    ).toBeTruthy();
    const court = secretary.locator('.court-board-card').filter({
      has: secretary.getByRole('heading', { name: app.courtName, exact: true }),
    });
    await revealOnPage(secretary, court, 'Paginación del tablero');
    const collectButton = court.getByRole('button', { name: /Cobrar Saldo/ });
    await expect(collectButton).toBeVisible();
    await collectButton.click();
    await secretary.getByLabel('Monto a Cobrar (Bs):').fill(String(confirmedSummary.pendingBalance));
    if (method === 'QR') await secretary.getByRole('radio', { name: /Código QR/ }).check();
    await secretary.getByRole('button', { name: 'Registrar Cobro', exact: true }).click();
    await expect(secretary.getByRole('heading', { name: 'Cobro de Saldo Restante (75%)' }))
      .toBeHidden({ timeout: 15_000 });

    await expect.poll(
      async () => (await summary(app.client, reservation.reservationId)).pendingBalance,
      { timeout: 15_000 },
    ).toBe(0);
    const detail = await app.secretary.get(`${apiUrl}/secretary/reservations/${reservation.reservationId}`);
    expect(detail.ok()).toBeTruthy();
    const body = await detail.json();
    expect(body.pendingBalance).toBe(0);
    expect(body.payments.some((payment: { paymentType: string; status: string; paymentMethod: string; amount: number }) =>
      payment.paymentType === 'SALDO_FINAL' && payment.status === 'VALIDATED' && payment.paymentMethod === method && payment.amount === confirmedSummary.pendingBalance)).toBeTruthy();
    await evidence(secretary, info);
  } finally {
    await context.close();
  }
});
