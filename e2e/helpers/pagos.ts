import { revealOnPage } from './pagination';
import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { apiUrl, createFromUi, selectRange, sendReceipt, summary } from './app';

export async function preparePayment(page: Page, app: { client: APIRequestContext; secretary: APIRequestContext }, validate = true) {
  await selectRange(page);
  const reservation = await createFromUi(page);
  await sendReceipt(page);
  const response = await app.secretary.get(`${apiUrl}/secretary/payments/pending`);
  expect(response.ok()).toBeTruthy();
  const payment = (await response.json()).find((p: { reservationId: string }) => p.reservationId === reservation.reservationId);
  expect(payment).toBeTruthy();
  if (validate) expect((await app.secretary.post(`${apiUrl}/secretary/payments/${payment.paymentId}/validate`)).ok()).toBeTruthy();
  expect((await summary(app.client, reservation.reservationId)).status).toBe(validate ? 'CONFIRMED' : 'PENDING_VALIDATION');
  return { reservation, payment };
}

export async function paymentDetails(api: APIRequestContext, id: string) {
  const response = await api.get(`${apiUrl}/secretary/reservations/${id}`);
  expect(response.ok()).toBeTruthy();
  return response.json();
}

export async function openBoardAction(page: Page, app: { date: string; courtName: string }, action: RegExp | string) {
  await page.goto('/secretary');
  await page.getByLabel('Fecha operativa:').fill(app.date);
  const court = page.locator('.court-board-card').filter({ has: page.getByRole('heading', { name: app.courtName, exact: true }) });
  await revealOnPage(page, court, 'Paginación del tablero');
  await court.getByRole('button', { name: action, exact: typeof action === 'string' }).click();
}
