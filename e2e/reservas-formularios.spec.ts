import { test, expect } from './fixtures/reservas';
import { apiUrl, boliviaDate, chooseDate, createFromUi, evidence, hour, selectRange, summary } from './helpers/app';

test('EP-RES-01 @reservas @ui Sin horas no permite continuar', async ({ page, app }, info) => {
  await expect(page.getByRole('button', { name: 'Selecciona inicio y fin' })).toBeDisabled();
  await evidence(page, info);
});

test('EP-RES-02 @reservas @ui Solo inicio no permite continuar', async ({ page, app }, info) => {
  await hour(page, '10:00').click();
  await expect(page.getByRole('button', { name: 'Selecciona inicio y fin' })).toBeDisabled();
  await evidence(page, info);
});

for (const entry of [
  { id: 'BVA-DUR-01', minutes: 0, end: '10:00', allowed: false },
  { id: 'BVA-DUR-02', minutes: 30, end: '10:30', allowed: true },
  { id: 'BVA-DUR-03', minutes: 60, end: '11:00', allowed: true },
  { id: 'BVA-DUR-04', minutes: 150, end: '12:30', allowed: true },
  { id: 'BVA-DUR-05', minutes: 180, end: '13:00', allowed: true },
  { id: 'BVA-DUR-06', minutes: 210, end: '13:30', allowed: false },
]) {
  test(`${entry.id} @reservas @ui Duración ${entry.minutes} minutos`, async ({ page, app }, info) => {
    await hour(page, '10:00').click();
    if (entry.minutes === 0) {
      await hour(page, entry.end).click(); // mismo punto limpia selección; no crea rango de duración cero
      await expect(page.getByRole('button', { name: 'Selecciona inicio y fin' })).toBeDisabled();
    } else if (!entry.allowed) {
      await expect(hour(page, entry.end)).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Selecciona inicio y fin' })).toBeDisabled();
    } else {
      await hour(page, entry.end).click();
      const price = entry.minutes / 60 * 100;
      const totalRow = page.getByText('Total', { exact: true }).locator('..');
      await expect(totalRow).toContainText(`Bs ${price}`);
      const advanceText = await page.getByText('Anticipo mín.', { exact: true }).locator('..').innerText();
      const visibleAdvance = Number(advanceText.match(/Bs\s*([\d.,]+)/)?.[1].replace(',', '.'));
      // Soft: conserva evidencia del defecto visual y continúa a comprobar persistencia.
      expect.soft(visibleAdvance, 'Anticipo visible debe conservar centavos').toBe(price * 0.25);
      const balanceText = await page.getByText('Saldo pendiente', { exact: true }).locator('..').innerText();
      const visibleBalance = Number(balanceText.match(/Bs\s*([\d.,]+)/)?.[1].replace(',', '.'));
      expect.soft(visibleBalance, 'Saldo estimado visible debe conservar centavos').toBe(price * 0.75);
      await evidence(page, info, 'resumen-antes-de-reservar');
      const reservation = await createFromUi(page);
      expect(reservation.status).toBe('TEMPORAL');
      expect(reservation.totalPrice).toBe(price);
      expect(reservation.advanceRequired).toBe(Math.round(price * 25) / 100);
      const persisted = await summary(app.client, reservation.reservationId);
      expect(persisted.totalPrice).toBe(price);
      expect(persisted.startTime.slice(0, 5)).toBe('10:00');
      expect(persisted.endTime.slice(0, 5)).toBe(entry.end);
    }
    await evidence(page, info);
  });
}

for (const offset of [-1, 0, 1]) {
  test(`BVA-FEC-0${offset + 2} @reservas @ui Fecha hoy ${offset >= 0 ? '+' : ''}${offset}`, async ({ page, app }, info) => {
    await page.goto(`/court-detail/${app.courtId}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const date = boliviaDate(offset);
    if (offset === -1) {
      if (date.slice(0, 7) !== boliviaDate().slice(0, 7)) await page.getByRole('button', { name: 'Mes anterior' }).click();
      await expect(page.getByRole('button', { name: String(Number(date.slice(-2))), exact: true })).toBeDisabled();
    } else {
      await chooseDate(page, date);
      await expect(page.getByRole('button', { name: String(Number(date.slice(-2))), exact: true })).toBeEnabled();
    }
    await evidence(page, info);
  });
}

test('EP-RES-03 @reservas @ui Limpiar selección elimina el rango', async ({ page, app }, info) => {
  await selectRange(page);
  await page.getByRole('button', { name: 'Limpiar selección' }).click();
  await expect(page.getByRole('button', { name: 'Selecciona inicio y fin' })).toBeDisabled();
  await evidence(page, info);
});

test('EP-RES-04 @reservas @ui Cambiar fecha elimina el rango anterior', async ({ page, app }, info) => {
  await selectRange(page);
  // chooseDate asume calendario del mes actual; la navegación ya está en app.date.
  await page.goto(`/court-detail/${app.courtId}`);
  await chooseDate(page, app.date);
  await selectRange(page);
  const date = boliviaDate(3);
  if (date.slice(0, 7) !== app.date.slice(0, 7)) await page.getByRole('button', { name: 'Mes siguiente' }).click();
  const loaded = page.waitForResponse(r => r.url().includes(`/availability?date=${date}`));
  await page.getByRole('button', { name: String(Number(date.slice(-2))), exact: true }).click();
  expect((await loaded).ok()).toBeTruthy();
  await expect(page.getByRole('button', { name: 'Selecciona inicio y fin' })).toBeDisabled();
  await evidence(page, info);
});

test('EP-RES-05 @reservas @ui Reserva temporal bloquea ese horario', async ({ page, app }, info) => {
  await selectRange(page);
  await createFromUi(page);
  await page.goto(`/court-detail/${app.courtId}`);
  await chooseDate(page, app.date);
  await expect(hour(page, '10:00')).toBeDisabled();
  await expect(hour(page, '10:30')).toBeDisabled();
  await evidence(page, info);
});

// Casos funcionales de API complementarios: no se presentan como E2E de navegador.
for (const entry of [
  { id: 'EP-API-01', change: { startTime: '' }, message: /inicio/i },
  { id: 'EP-API-02', change: { endTime: '' }, message: /fin/i },
  { id: 'EP-API-03', change: { date: '' }, message: /fecha/i },
  { id: 'EP-API-04', change: { startTime: '10:15', endTime: '11:15' }, message: /:00|:30/ },
  { id: 'EP-API-05', change: { endTime: '09:30' }, message: /posterior/i },
  { id: 'EP-API-06', change: { courtId: 0 }, message: /positivo/i },
  { id: 'EP-API-07', change: { date: '17/11/2026' }, message: /YYYY-MM-DD/ },
]) {
  test(`${entry.id} @reservas @api Entrada inválida ${JSON.stringify(entry.change)}`, async ({ app }, info) => {
    const response = await app.client.post(`${apiUrl}/reservations`, { data: {
      courtId: app.courtId, date: app.date, startTime: '10:00', endTime: '11:00', ...entry.change,
    } });
    const body = await response.json();
    // Si el producto acepta por error, liberar el dato antes de informar el fallo.
    if (response.status() === 201 && body.reservationId) {
      await app.client.post(`${apiUrl}/reservations/${body.reservationId}/cancel`, { data: { reason: 'Limpieza EC3 entrada inesperadamente aceptada' } });
    }
    await info.attach('respuesta-api', { body: JSON.stringify({ status: response.status(), body }, null, 2), contentType: 'application/json' });
    expect(response.status()).toBe(400);
    expect(JSON.stringify(body.message)).toMatch(entry.message);
  });
}
