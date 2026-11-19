import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { apiUrl, demoLogin } from '../helpers/app';
import { mkdirSync, writeFileSync } from 'node:fs';

type Storage = Awaited<ReturnType<import('@playwright/test').BrowserContext['storageState']>>;
type Admin = { api: APIRequestContext; state: Storage; complexId: number; run: string };
export const test = base.extend<{ records: { complexes: Set<number>; courts: Set<number> } }, { admin: Admin }>({
  admin: [async ({ browser, playwright }, use, info) => {
    if (process.env['E2E_RUN'] !== 'true') throw new Error('Configura E2E_RUN=true en .env.e2e');
    const context = await browser.newContext({ baseURL: String(info.project.use.baseURL) });
    const token = await demoLogin(await context.newPage(), 'ADMIN');
    const api = await playwright.request.newContext({ extraHTTPHeaders: { Authorization: `Bearer ${token}` } });
    const run = `EC3-Altas-${Date.now()}-${info.workerIndex}`;
    const response = await api.post(`${apiUrl}/admin/complexes`, { data: { name: run, location: run, contactInfo: '70000000' } });
    expect(response.status()).toBe(201);
    const complex = await response.json();
    mkdirSync('test-results', { recursive: true });
    const manifest=`test-results/datos-${run}.json`;
    writeFileSync(manifest,JSON.stringify({run,complexId:complex.id,cleaned:false}));
    try { await use({ api, state: await context.storageState(), complexId: complex.id, run }); }
    finally {
      expect((await api.patch(`${apiUrl}/admin/complexes/${complex.id}/toggle`)).ok()).toBeTruthy();
      writeFileSync(manifest,JSON.stringify({run,complexId:complex.id,cleaned:true}));
      await api.dispose(); await context.close();
    }
  }, { scope: 'worker', timeout: 180_000 }],
  storageState: async ({ admin }, use) => { await use(admin.state); },
  records: async ({ admin }, use, info) => {
    const records = { complexes: new Set<number>(), courts: new Set<number>() };
    try { await use(records); }
    finally {
      await info.attach('registros-propios', { body: JSON.stringify({ complexes: [...records.complexes], courts: [...records.courts] }), contentType: 'application/json' });
      for (const kind of ['courts', 'complexes'] as const) {
        if (!records[kind].size) continue;
        for (const id of records[kind]) {
          if(kind==='courts') {
            // Retirar solo la portada sintética propia una vez adjuntada la evidencia.
            expect((await admin.api.put(`${apiUrl}/admin/courts/${id}`,{data:{images:[]}})).ok()).toBeTruthy();
          }
          expect((await admin.api.patch(`${apiUrl}/admin/${kind}/${id}/toggle`)).ok(), `Desactivar ${kind} propio ${id}`).toBeTruthy();
        }
      }
    }
  },
});
export { expect };
