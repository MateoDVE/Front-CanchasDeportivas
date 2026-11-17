import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { apiUrl, boliviaDate, demoLogin, openCourt } from '../helpers/app';

type Storage = Awaited<ReturnType<import('@playwright/test').BrowserContext['storageState']>>;
type Environment = {
  courtId: number; courtName: string; complexId: number; date: string;
  clientState: Storage; secretaryState: Storage;
  client: APIRequestContext; secretary: APIRequestContext; admin: APIRequestContext;
};

export const test = base.extend<{ app: Environment }, { environment: Environment }>({
  environment: [async ({ browser, playwright }, use, workerInfo) => {
    if (process.env['E2E_RUN'] !== 'true') {
      throw new Error('Configura E2E_RUN=true en .env.e2e para usar el entorno real. Consulta e2e/README.md.');
    }
    const baseURL = String(workerInfo.project.use.baseURL);
    const contexts = [];
    const sessions: Record<string, { state: Storage; api: APIRequestContext }> = {};
    for (const role of ['CLIENTE', 'SECRETARIA', 'ADMIN'] as const) {
      const context = await browser.newContext({ baseURL });
      contexts.push(context);
      const page = await context.newPage();
      const token = await demoLogin(page, role);
      sessions[role] = {
        state: await context.storageState(),
        api: await playwright.request.newContext({ extraHTTPHeaders: { Authorization: `Bearer ${token}` } }),
      };
    }
    const admin = sessions['ADMIN'].api;
    const runId = `EC3-Reservas-${Date.now()}-${workerInfo.workerIndex}`;
    const complexResponse = await admin.post(`${apiUrl}/admin/complexes`, { data: {
      name: runId, location: 'Entorno de pruebas EC3', contactInfo: '70000000',
    } });
    expect(complexResponse.status(), 'Preparar complejo exclusivo EC3').toBe(201);
    const complex = await complexResponse.json();
    const courtResponse = await admin.post(`${apiUrl}/admin/courts`, { data: {
      complexId: complex.id, name: runId, courtType: 'Futsal', pricePerHour: 100,
    } });
    expect(courtResponse.status(), 'Preparar cancha exclusiva EC3').toBe(201);
    const court = await courtResponse.json();
    const schedule = await admin.put(`${apiUrl}/admin/courts/${court.id}/schedules/weekly`, {
      data: { schedules: Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i + 1, openTime: '08:00', closeTime: '23:00' })) },
    });
    expect(schedule.ok(), 'Preparar horario 08:00–23:00').toBeTruthy();
    mkdirSync('test-results', { recursive: true });
    writeFileSync(`test-results/datos-${runId}.json`, JSON.stringify({ runId, complexId: complex.id, courtId: court.id, date: boliviaDate(2) }, null, 2));
    try {
      await use({ courtId: court.id, courtName: runId, complexId: complex.id, date: boliviaDate(2),
        clientState: sessions['CLIENTE'].state, secretaryState: sessions['SECRETARIA'].state,
        client: sessions['CLIENTE'].api, secretary: sessions['SECRETARIA'].api, admin });
    } finally {
      // Solo la cancha creada por esta ejecución; conservar registros para auditoría.
      const disabled = await admin.patch(`${apiUrl}/admin/courts/${court.id}/toggle`);
      expect(disabled.ok(), 'Deshabilitar cancha EC3 creada en esta ejecución').toBeTruthy();
      const hidden = await admin.patch(`${apiUrl}/admin/complexes/${complex.id}/toggle`);
      expect(hidden.ok(), 'Deshabilitar complejo EC3 creado en esta ejecución').toBeTruthy();
      for (const session of Object.values(sessions)) await session.api.dispose();
      for (const context of contexts) await context.close();
    }
  }, { scope: 'worker', timeout: 240_000 }],
  storageState: async ({ environment }, use) => { await use(environment.clientState); },
  app: async ({ environment, page }, use, info) => {
    const ids = new Set<string>();
    const pending: Promise<void>[] = [];
    page.on('response', response => {
      if (response.url() === `${apiUrl}/reservations` && response.request().method() === 'POST' && response.status() === 201) {
        pending.push(response.json().then(body => { ids.add(body.reservationId); }));
      }
    });
    await openCourt(page, environment.courtId, environment.date);
    try { await use(environment); }
    finally {
      await Promise.all(pending);
      const cleanup = [];
      for (const id of ids) {
        // Un comprobante pendiente seguiría en la bandeja y contaminaría el siguiente test.
        const payments = await environment.secretary.get(`${apiUrl}/secretary/payments/pending`);
        expect(payments.ok()).toBeTruthy();
        for (const payment of await payments.json()) {
          if (payment.reservationId === id) {
            const rejected = await environment.secretary.post(`${apiUrl}/secretary/payments/${payment.paymentId}/reject`, {
              data: { reason: `Limpieza EC3 de comprobante sintético: ${info.title.split(' ')[0]}` },
            });
            expect(rejected.ok(), 'Cerrar comprobante sintético propio').toBeTruthy();
          }
        }
        const result = await environment.client.get(`${apiUrl}/reservations/${id}/status`);
        expect(result.ok()).toBeTruthy();
        const body = await result.json();
        if (['TEMPORAL', 'PENDING_VALIDATION', 'CONFIRMED'].includes(body.status)) {
          const cancelled = await environment.client.post(`${apiUrl}/reservations/${id}/cancel`, {
            data: { reason: `Limpieza de prueba ${info.title.split(' ')[0]}` },
          });
          expect(cancelled.ok(), 'Liberar solo reserva creada por el test').toBeTruthy();
        }
        cleanup.push({ id, observedStatus: body.status });
      }
      await info.attach('reservas-de-la-prueba', { body: JSON.stringify(cleanup, null, 2), contentType: 'application/json' });
    }
  },
});
export { expect };
