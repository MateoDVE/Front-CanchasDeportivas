import { expect, type APIRequestContext, type Page, type TestInfo } from '@playwright/test';

export const apiUrl = process.env['E2E_API_URL'] || 'http://localhost:3000/api/v1';
export type Role = 'CLIENTE' | 'SECRETARIA' | 'ADMIN';
export async function demoLogin(page: Page, role: Role) {
  await page.goto('/login');
  const label = { CLIENTE: /Cliente/, SECRETARIA: /Secretaría/, ADMIN: /Administrador/ }[role];
  await page.getByRole('button', { name: label }).click();
  const submit = async () => (await Promise.all([
    page.waitForResponse(r => r.url().endsWith('/auth/login') && r.request().method() === 'POST'),
    page.locator('form').getByRole('button', { name: 'Iniciar sesión', exact: true }).click(),
  ]))[0];
  let response = await submit();
  if (response.status() === 429) {
    // Preparación, no caso de autenticación: respetar la ventana de un minuto del login.
    console.log(`Preparación ${role}: límite de login; esperando 61 segundos antes de un único reintento.`);
    await page.waitForTimeout(61_000);
    response = await submit();
  }
  expect(response.status(), 'Login de cuenta demo').toBe(200);
  await expect(page).not.toHaveURL(/\/login/);
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  if (!token) throw new Error(`No se obtuvo sesión ${role}`);
  return token;
}

export function boliviaDate(offset = 0) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export async function chooseDate(page: Page, date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const today = boliviaDate().split('-').map(Number);
  const delta = (year - today[0]) * 12 + month - today[1];
  for (let i = 0; i < Math.abs(delta); i++) {
    await page.getByRole('button', { name: delta > 0 ? 'Mes siguiente' : 'Mes anterior' }).click();
  }
  const loaded = page.waitForResponse(r => r.url().includes(`/availability?date=${date}`));
  await page.getByRole('button', { name: String(day), exact: true }).click();
  expect((await loaded).ok()).toBeTruthy();
  await expect(page.getByRole('group', { name: 'Seleccionar rango de horas' })).toBeVisible();
}

export function hour(page: Page, time: string) {
  return page.getByRole('group', { name: 'Seleccionar rango de horas' })
    .getByRole('button', { name: new RegExp(`^${time},`) });
}

export async function openCourt(page: Page, courtId: number, date: string) {
  await page.goto(`/court-detail/${courtId}`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await chooseDate(page, date);
}

export async function selectRange(page: Page, start = '10:00', end = '11:00') {
  await hour(page, start).click();
  await hour(page, end).click();
}

export async function createFromUi(page: Page) {
  const response = page.waitForResponse(r => r.url().endsWith('/reservations') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Continuar con la reserva', exact: true }).click();
  const result = await response;
  expect(result.status()).toBe(201);
  const reservation = await result.json();
  await expect(page.getByRole('heading', { name: 'Pagar anticipo', exact: true })).toBeVisible();
  return reservation as { reservationId: string; expiresAt: string; totalPrice: number; advanceRequired: number; status: string };
}

export async function evidence(page: Page, info: TestInfo, name = 'resultado') {
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  await info.attach(name, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
}

export async function summary(api: APIRequestContext, id: string) {
  const response = await api.get(`${apiUrl}/reservations/${id}/summary`);
  expect(response.ok(), 'Consultar resumen persistido').toBeTruthy();
  return response.json();
}

export async function sendReceipt(page: Page) {
  // PNG sintético de 1 píxel: no representa una transacción bancaria real.
  await page.locator('input[type=file]').setInputFiles({
    name: 'EC3-comprobante-sintetico.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0l8AAAAASUVORK5CYII=', 'base64'),
  });
  await page.getByRole('button', { name: 'Enviar comprobante a validación' }).click();
  await expect(page.getByRole('heading', { name: 'Comprobante enviado' })).toBeVisible();
}
