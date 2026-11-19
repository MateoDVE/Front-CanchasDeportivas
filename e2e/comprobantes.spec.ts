import { test, expect } from './fixtures/reservas';
import { apiUrl, createFromUi, evidence, selectRange, summary } from './helpers/app';
import { paymentDetails } from './helpers/pagos';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0l8AAAAASUVORK5CYII=', 'base64');
const cases = [
  { id: 'REC-EP-01', kind: 'none', mime: '', size: 0, accepted: false },
  { id: 'REC-EP-02', kind: 'generated', mime: 'image/jpeg', size: 0, accepted: true },
  { id: 'REC-EP-03', kind: 'generated', mime: 'image/webp', size: 0, accepted: true },
  { id: 'REC-EP-04', kind: 'invalid', mime: 'image/gif', size: 100, accepted: false },
  { id: 'REC-EP-05', kind: 'invalid', mime: 'application/pdf', size: 100, accepted: false },
  ...[5242879, 5242880, 5242881].map((size, i) => ({ id: `REC-BVA-0${i + 1}`, kind: 'png', mime: 'image/png', size, accepted: size <= 5242880 })),
];

for (const c of cases) test(`${c.id} @reservas @ostin @comprobantes @ui Comprobante ${c.kind} ${c.mime} ${c.size || ''}`, async ({ page, app }, info) => {
  await selectRange(page);
  const reservation = await createFromUi(page);
  const before = await paymentDetails(app.secretary, reservation.reservationId);
  const submit = page.getByRole('button', { name: 'Enviar comprobante a validación' });
  if (c.kind !== 'none') {
    let buffer: Buffer = Buffer.alloc(c.size);
    if (c.kind === 'png') png.copy(buffer);
    if (c.kind === 'generated') {
      const data = await page.evaluate(mime => {
        const canvas = document.createElement('canvas'); canvas.width = 2; canvas.height = 2;
        canvas.getContext('2d')!.fillRect(0, 0, 2, 2);
        return canvas.toDataURL(mime);
      }, c.mime);
      buffer = Buffer.from(data.split(',')[1], 'base64');
    }
    const extension = c.mime.split('/')[1];
    await page.locator('input[type=file]').setInputFiles({ name: `EC3-comprobante.${extension}`, mimeType: c.mime, buffer });
    await info.attach('archivo-sintetico', { body: JSON.stringify({ mime: c.mime, bytes: buffer.length }), contentType: 'application/json' });
  }
  if (c.accepted) {
    await expect(submit).toBeEnabled();
    const response = page.waitForResponse(r => r.url().endsWith(`/payments/${reservation.reservationId}/receipt`) && r.request().method() === 'POST');
    await submit.click(); expect((await response).ok()).toBeTruthy();
    await expect(page.getByRole('heading', { name: 'Comprobante enviado' })).toBeVisible();
    expect((await summary(app.client, reservation.reservationId)).status).toBe('PENDING_VALIDATION');
    const after = await paymentDetails(app.secretary, reservation.reservationId);
    expect(after.payments).toHaveLength(before.payments.length + 1);
    expect(after.pendingBalance).toBe(before.pendingBalance);
    expect(after.payments.some((p: any) => p.paymentType === 'ANTICIPO' && p.status === 'PENDING')).toBe(true);
  } else {
    await expect(submit).toBeDisabled();
    // La pantalla repite el mismo error arriba y junto al archivo.
    if (c.kind !== 'none') await expect(page.getByText('Adjunta una imagen JPG, PNG o WebP de hasta 5 MB.', { exact: true }).first()).toBeVisible();
    expect((await summary(app.client, reservation.reservationId)).status).toBe('TEMPORAL');
    const after = await paymentDetails(app.secretary, reservation.reservationId);
    expect(after.payments).toEqual(before.payments);
  }
  await evidence(page, info);
});
