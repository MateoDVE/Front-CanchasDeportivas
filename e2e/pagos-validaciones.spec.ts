import { test, expect } from './fixtures/reservas';
import { apiUrl, evidence } from './helpers/app';
import { preparePayment, openBoardAction, paymentDetails } from './helpers/pagos';

for (const [i, value] of ['', '0', '-0.01', '74.99', '75.01', '75.001'].entries()) {
  test(`SAL-UI-0${i + 1} @reservas @ostin @saldo @ui Rechazar monto ${JSON.stringify(value)} con saldo 75`, async ({ page, app, browser }, info) => {
    const { reservation } = await preparePayment(page, app);
    const before = await paymentDetails(app.secretary, reservation.reservationId);
    expect(before.pendingBalance).toBe(75);
    const context = await browser.newContext({ storageState: app.secretaryState, baseURL: String(info.project.use.baseURL), timezoneId: 'America/La_Paz' });
    try {
      const staff = await context.newPage();
      await openBoardAction(staff, app, /Cobrar Saldo/);
      await staff.getByLabel('Monto a Cobrar (Bs):').fill(value);
      const response = staff.waitForResponse(r => r.url().endsWith(`/reservations/${reservation.reservationId}/final-payment`) && r.request().method() === 'POST');
      await staff.getByRole('button', { name: 'Registrar Cobro', exact: true }).click();
      const result = await response;
      expect(result.status()).toBe(400);
      await expect(staff.getByRole('button', { name: 'Registrar Cobro', exact: true })).toBeEnabled();
      const after = await paymentDetails(app.secretary, reservation.reservationId);
      expect(after.pendingBalance).toBe(before.pendingBalance);
      expect(after.payments).toEqual(before.payments);
      await info.attach('rechazo-cobro', { body: await result.body(), contentType: 'application/json' });
      await evidence(staff, info);
    } finally { await context.close(); }
  });
}

const invalid: Record<string, unknown>[] = [
  { amount: 'abc' }, { amount: null }, { amount: undefined },
  { paymentMethod: 'CHEQUE' }, { paymentMethod: '' }, { paymentMethod: null },
];
for (const [i, change] of invalid.entries()) {
  test(`SAL-API-0${i + 1} @reservas @ostin @saldo @api Rechazar ${JSON.stringify(change) || 'monto omitido'}`, async ({ page, app }, info) => {
    const { reservation } = await preparePayment(page, app);
    const before = await paymentDetails(app.secretary, reservation.reservationId);
    const response = await app.secretary.post(`${apiUrl}/secretary/reservations/${reservation.reservationId}/final-payment`, {
      data: { amount: before.pendingBalance, paymentMethod: 'EFECTIVO', ...change },
    });
    expect(response.status()).toBe(400);
    const after = await paymentDetails(app.secretary, reservation.reservationId);
    expect(after.pendingBalance).toBe(before.pendingBalance);
    expect(after.payments).toEqual(before.payments);
    await info.attach('rechazo', { body: await response.body(), contentType: 'application/json' });
  });
}
