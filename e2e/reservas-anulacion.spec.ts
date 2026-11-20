import { revealOnPage } from './helpers/pagination';
import { test, expect } from './fixtures/reservas';
import type { APIRequestContext, Page } from '@playwright/test';
import { apiUrl, createFromUi, evidence, selectRange, sendReceipt, summary } from './helpers/app';

async function confirmReservation(page: Page, app: {
  client: APIRequestContext;
  secretary: APIRequestContext;
}) {
  await selectRange(page);
  const reservation = await createFromUi(page);
  await sendReceipt(page);
  const payments = await app.secretary.get(`${apiUrl}/secretary/payments/pending`);
  expect(payments.ok()).toBeTruthy();
  const payment = (await payments.json()).find(
    (item: { reservationId: string }) => item.reservationId === reservation.reservationId,
  );
  expect(payment).toBeTruthy();
  const validated = await app.secretary.post(`${apiUrl}/secretary/payments/${payment.paymentId}/validate`);
  expect(validated.ok()).toBeTruthy();
  expect((await summary(app.client, reservation.reservationId)).status).toBe('CONFIRMED');
  return reservation;
}

test('ANU-EP-01 @reservas @ostin @ui Secretaría anula una reserva confirmada con motivo', async ({ page, app, browser }, info) => {
  const reservation = await confirmReservation(page, app);
  const context = await browser.newContext({
    storageState: app.secretaryState,
    baseURL: String(info.project.use.baseURL),
    timezoneId: 'America/La_Paz',
  });
  try {
    const secretary = await context.newPage();
    await secretary.goto('/secretary');
    await secretary.getByLabel('Fecha operativa:').fill(app.date);
    const court = secretary.locator('.court-board-card').filter({
      has: secretary.getByRole('heading', { name: app.courtName, exact: true }),
    });
    await revealOnPage(secretary, court, 'Paginación del tablero');
    await court.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await secretary.getByLabel('Motivo / Observación').fill('EC3 Ostin: cancelación solicitada por el cliente');
    await secretary.getByRole('button', { name: 'Confirmar Cancelación', exact: true }).click();

    await expect.poll(async () => (await summary(app.client, reservation.reservationId)).status).toBe('CANCELLED');
    const detail = await app.secretary.get(`${apiUrl}/secretary/reservations/${reservation.reservationId}`);
    expect(detail.ok()).toBeTruthy();
    const body = await detail.json();
    expect(body.payments.some((payment: { paymentType: string; status: string }) =>
      payment.paymentType === 'ANTICIPO' && payment.status === 'VALIDATED')).toBeTruthy();
    expect(body.payments.some((payment: { status: string }) => payment.status === 'REFUNDED')).toBeFalsy();
    await evidence(secretary, info);
  } finally {
    await context.close();
  }
});

test('ANU-BVA-01 @reservas @ostin @ui Motivo vacío impide anular', async ({ page, app, browser }, info) => {
  const reservation = await confirmReservation(page, app);
  const context = await browser.newContext({
    storageState: app.secretaryState,
    baseURL: String(info.project.use.baseURL),
    timezoneId: 'America/La_Paz',
  });
  try {
    const secretary = await context.newPage();
    await secretary.goto('/secretary');
    await secretary.getByLabel('Fecha operativa:').fill(app.date);
    const court = secretary.locator('.court-board-card').filter({
      has: secretary.getByRole('heading', { name: app.courtName, exact: true }),
    });
    await revealOnPage(secretary, court, 'Paginación del tablero');
    await court.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(secretary.getByRole('button', { name: 'Confirmar Cancelación', exact: true })).toBeDisabled();
    await expect.poll(async () => (await summary(app.client, reservation.reservationId)).status).toBe('CONFIRMED');
  } finally {
    await context.close();
  }
});

test('ANU-EP-02 @reservas @ostin @api Reserva cancelada no acepta una segunda anulación', async ({ page, app }) => {
  const reservation = await confirmReservation(page, app);
  const first = await app.client.post(`${apiUrl}/reservations/${reservation.reservationId}/cancel`, {
    data: { reason: 'EC3 Ostin: primera anulación' },
  });
  expect(first.ok()).toBeTruthy();
  const second = await app.client.post(`${apiUrl}/reservations/${reservation.reservationId}/cancel`, {
    data: { reason: 'EC3 Ostin: intento repetido' },
  });
  expect(second.status()).toBe(400);
  expect((await summary(app.client, reservation.reservationId)).status).toBe('CANCELLED');
});
