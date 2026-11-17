import { test, expect } from './fixtures/reservas';
import { apiUrl, chooseDate, createFromUi, evidence, hour, selectRange, sendReceipt, summary } from './helpers/app';

test('TE-01 @reservas @ui Temporal → Pendiente de validación', async ({ page, app }, info) => {
  await selectRange(page);
  const reservation = await createFromUi(page);
  expect((await summary(app.client, reservation.reservationId)).status).toBe('TEMPORAL');
  await sendReceipt(page);
  expect((await summary(app.client, reservation.reservationId)).status).toBe('PENDING_VALIDATION');
  await evidence(page, info);
});

for (const approve of [true, false]) {
  test(`${approve ? 'TE-02' : 'TE-03'} @reservas @ui Pendiente → ${approve ? 'Confirmado' : 'Cancelado'}`, async ({ page, app, browser }, info) => {
    await selectRange(page);
    const reservation = await createFromUi(page);
    await sendReceipt(page);
    expect((await summary(app.client, reservation.reservationId)).status).toBe('PENDING_VALIDATION');
    const context = await browser.newContext({ storageState: app.secretaryState, baseURL: String(info.project.use.baseURL) });
    try {
      const secretary = await context.newPage();
      await secretary.goto('/secretary');
      await secretary.getByRole('button', { name: /Validación Anticipos/ }).click();
      const row = secretary.getByRole('row').filter({ hasText: app.courtName });
      await expect(row).toHaveCount(1);
      await row.getByRole('button', { name: approve ? 'Aprobar' : 'Rechazar', exact: true }).click();
      if (approve) {
        await secretary.getByRole('button', { name: 'Validar pago', exact: true }).click();
      } else {
        await secretary.getByPlaceholder('Ej: La imagen no es legible, monto incorrecto...').fill('EC3: comprobante sintético rechazado para verificar transición');
        await secretary.getByRole('button', { name: 'Confirmar Rechazo', exact: true }).click();
      }
      await expect.poll(async () => (await summary(app.client, reservation.reservationId)).status).toBe(approve ? 'CONFIRMED' : 'CANCELLED');
      await evidence(secretary, info, 'accion-secretaria');
      await page.reload();
      await expect(page).toHaveURL(approve ? /booking-confirmation/ : /payment/);
      await evidence(page, info, 'resultado-cliente');
      if (!approve) {
        await page.goto(`/court-detail/${app.courtId}`);
        await chooseDate(page, app.date);
        await expect(hour(page, '10:00')).toBeEnabled();
      }
    } finally { await context.close(); }
  });
}

test('TE-04 @reservas @api Cancelado rechaza nuevo comprobante y conserva estado', async ({ page, app }, info) => {
  await selectRange(page);
  const reservation = await createFromUi(page);
  const cancelled = await app.client.post(`${apiUrl}/reservations/${reservation.reservationId}/cancel`, { data: { reason: 'Precondición TE-04 EC3' } });
  expect(cancelled.ok()).toBeTruthy();
  const response = await app.client.post(`${apiUrl}/payments/${reservation.reservationId}/receipt`, {
    data: { receiptImageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0l8AAAAASUVORK5CYII=' },
  });
  expect(response.status()).toBe(400);
  expect((await summary(app.client, reservation.reservationId)).status).toBe('CANCELLED');
  await info.attach('rechazo', { body: await response.body(), contentType: 'application/json' });
});

test('TE-05 @reservas @ui Confirmado → Cancelado por secretaría', async ({ page, app, browser }, info) => {
  await selectRange(page);
  const reservation = await createFromUi(page);
  await sendReceipt(page);
  const pending = await app.secretary.get(`${apiUrl}/secretary/payments/pending`);
  expect(pending.ok()).toBeTruthy();
  const payment = (await pending.json()).find((p: { reservationId: string }) => p.reservationId === reservation.reservationId);
  expect(payment).toBeTruthy();
  expect((await app.secretary.post(`${apiUrl}/secretary/payments/${payment.paymentId}/validate`)).ok()).toBeTruthy();
  expect((await summary(app.client, reservation.reservationId)).status).toBe('CONFIRMED');
  const context = await browser.newContext({ storageState: app.secretaryState, baseURL: String(info.project.use.baseURL), timezoneId: 'America/La_Paz' });
  try {
    const secretary = await context.newPage();
    await secretary.goto('/secretary');
    await secretary.getByLabel('Fecha operativa:').fill(app.date);
    const court = secretary.locator('.court-board-card').filter({ has: secretary.getByRole('heading', { name: app.courtName, exact: true }) });
    await expect(court).toHaveCount(1);
    await court.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await secretary.getByLabel('Motivo / Observación').fill('EC3: transición Confirmado a Cancelado');
    await secretary.getByRole('button', { name: 'Confirmar Cancelación' }).click();
    await expect.poll(async () => (await summary(app.client, reservation.reservationId)).status).toBe('CANCELLED');
    await evidence(secretary, info);
    await page.goto(`/court-detail/${app.courtId}`);
    await chooseDate(page, app.date);
    await expect(hour(page, '10:00')).toBeEnabled();
  } finally { await context.close(); }
});

test('TE-06 @reservas @ui @lento Vencimiento real: Temporal expira y Pendiente se conserva', async ({ page, app }, info) => {
  test.setTimeout(450_000);
  await selectRange(page, '10:00', '10:30');
  const temporal = await createFromUi(page);
  await page.goto(`/court-detail/${app.courtId}`);
  await chooseDate(page, app.date);
  await selectRange(page, '11:00', '11:30');
  const pending = await createFromUi(page);
  await sendReceipt(page);
  expect((await summary(app.client, pending.reservationId)).status).toBe('PENDING_VALIDATION');
  // Espera al cron real del backend; no cambia relojes ni columnas de BD.
  await expect.poll(async () => {
    const response = await app.client.get(`${apiUrl}/reservations/${temporal.reservationId}/status`);
    expect(response.ok()).toBeTruthy();
    return (await response.json()).status;
  }, { timeout: 370_000, intervals: [5_000] }).toBe('EXPIRED');
  await expect.poll(() => Date.now(), { timeout: 60_000, intervals: [2_000] })
    .toBeGreaterThan(Date.parse(pending.expiresAt) + 5_000);
  expect((await summary(app.client, pending.reservationId)).status).toBe('PENDING_VALIDATION');
  const invalid = await app.client.post(`${apiUrl}/payments/${temporal.reservationId}/receipt`, {
    data: { receiptImageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0l8AAAAASUVORK5CYII=' },
  });
  expect(invalid.status()).toBe(400);
  expect((await summary(app.client, temporal.reservationId)).status).toBe('EXPIRED');
  await page.goto(`/court-detail/${app.courtId}`);
  await chooseDate(page, app.date);
  await expect(hour(page, '10:00')).toBeEnabled();
  await expect(hour(page, '11:00')).toBeDisabled();
  await evidence(page, info);
  await info.attach('estados-tras-vencimiento', { contentType: 'application/json', body: JSON.stringify({
    temporal: await summary(app.client, temporal.reservationId), pending: await summary(app.client, pending.reservationId),
  }, null, 2) });
});
