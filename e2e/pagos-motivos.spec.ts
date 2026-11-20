import { revealOnPage } from './helpers/pagination';
import { test, expect } from './fixtures/reservas';
import { apiUrl, evidence, summary } from './helpers/app';
import { preparePayment, openBoardAction, paymentDetails } from './helpers/pagos';

for (const action of ['rechazo', 'anulacion'] as const) {
  for (const [index, reason] of ['', 'A', 'AB', '   '].entries()) {
    // El vacío de anulación ya tiene ANU-BVA-01; no duplicarlo.
    if (action === 'anulacion' && index === 0) continue;
    const id = `${action === 'rechazo' ? 'REJ' : 'ANU'}-${index === 3 ? 'EP-ESP' : `BVA-0${index + 1}`}`;
    test(`${id} @reservas @ostin @motivos @ui ${action} motivo ${JSON.stringify(reason)}`, async ({ page, app, browser }, info) => {
      const { reservation, payment } = await preparePayment(page, app, action === 'anulacion');
      const before = await paymentDetails(app.secretary, reservation.reservationId);
      const context = await browser.newContext({ storageState: app.secretaryState, baseURL: String(info.project.use.baseURL), timezoneId: 'America/La_Paz' });
      try {
        const staff = await context.newPage();
        if (action === 'rechazo') {
          await staff.goto('/secretary');
          await staff.getByRole('button', { name: /Validación Anticipos/ }).click();
          const row = staff.getByRole('row').filter({ hasText: app.courtName });
          await revealOnPage(staff, row, 'Paginación de anticipos');
          await row.getByRole('button', { name: 'Rechazar', exact: true }).click();
          await staff.getByPlaceholder('Ej: La imagen no es legible, monto incorrecto...').fill(reason);
          await staff.getByRole('button', { name: 'Confirmar Rechazo', exact: true }).click();
          if (!reason.trim()) await expect(staff.getByText('Debes ingresar el motivo de rechazo del comprobante.', { exact: true })).toBeVisible();
        } else {
          await openBoardAction(staff, app, 'Cancelar');
          await staff.getByLabel('Motivo / Observación').fill(reason);
          const submit = staff.getByRole('button', { name: 'Confirmar Cancelación', exact: true });
          if (!reason.trim()) await expect(submit).toBeDisabled(); else await submit.click();
        }
        const expected = reason.trim() ? 'CANCELLED' : action === 'rechazo' ? 'PENDING_VALIDATION' : 'CONFIRMED';
        await expect.poll(async () => (await summary(app.client, reservation.reservationId)).status).toBe(expected);
        const after = await paymentDetails(app.secretary, reservation.reservationId);
        if (!reason.trim()) {
          expect(after.payments).toEqual(before.payments);
          expect(after.pendingBalance).toBe(before.pendingBalance);
        } else if (action === 'rechazo') {
          expect(after.payments.some((p: any) => p.status === 'REJECTED' && p.paymentType === 'ANTICIPO')).toBe(true);
        } else {
          expect(after.payments.some((p: any) => p.status === 'REFUNDED')).toBe(false);
        }
        await evidence(staff, info);
      } finally { await context.close(); }
    });
  }
}
