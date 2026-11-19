import { type Page } from '@playwright/test';
import { test, expect } from '../fixtures/administracion';
import { apiUrl, evidence } from './app';
import type { Case } from '../data/altas';

export async function openForm(page: Page, kind: 'complexes'|'courts', complexId: number, marker: string) {
  await page.goto('/admin');
  await page.getByRole('button', { name: /Complejos & Canchas/ }).click();
  await page.getByRole('button', { name: kind==='complexes'?'+ Nuevo Complejo':'+ Nueva Cancha', exact:true }).click();
  if(kind==='complexes') {
    await page.locator('#complex-name').fill(marker);
    await page.locator('#complex-address').fill(marker);
    await page.locator('#complex-phone').fill('70000000');
  } else {
    await page.locator('#court-complex').selectOption(String(complexId));
    await page.locator('#court-name').fill(marker.slice(-28));
    await page.locator('#court-type').selectOption('Futsal');
    await page.locator('#court-price').fill('100');
  }
}

export function defineCases(kind:'complexes'|'courts', cases: Case[]) {
  const tag=kind==='complexes'?'complejos':'canchas';
  for(const c of cases) test(`${c.id} @altas @${tag} @${c.channel} ${c.description}`, async ({ admin, records, page }, info)=>{
    const marker=`EC3-${Date.now()}-${info.testId.slice(-6)}`;
    const endpoint=`${apiUrl}/admin/${kind}`;
    const listEndpoint=kind==='courts'?`${apiUrl}/complexes/${admin.complexId}/courts`:endpoint;
    const payload:Record<string,unknown>=kind==='complexes'
      ?{ name:marker,location:marker,contactInfo:'70000000' }
      :{ complexId:admin.complexId,name:marker.slice(-28),courtType:'Futsal',pricePerHour:100,images:[] };
    if(c.omit) delete payload[c.field]; else payload[c.field]=c.value==='$existing'?admin.complexId:c.value;
    const beforeIds=new Set<number>();
    if(c.outcome==='reject') {
      const before=await admin.api.get(listEndpoint); expect(before.ok()).toBeTruthy();
      for(const r of await before.json()) beforeIds.add(r.id);
    }
    const pending:Promise<void>[]=[];
    // Registrar éxitos inesperados también: nunca abandonar registros por una aserción fallida.
    page.on('response',r=>{if(r.url()===endpoint&&r.request().method()==='POST'&&r.status()===201) pending.push(r.json().then(b=>{records[kind].add(b.id);}));});
    try {
      if(c.channel==='api') {
        const response=await admin.api.post(endpoint,{data:payload});
        const body=await response.json();
        if(response.status()===201) records[kind].add(body.id);
        await info.attach('respuesta-api',{body:JSON.stringify({status:response.status(),body},null,2),contentType:'application/json'});
        expect(response.status()).toBe(c.outcome==='accept'?201:(c.status??400));
      } else {
        await openForm(page,kind,admin.complexId,marker);
        const selectors:Record<string,string>={name:kind==='complexes'?'#complex-name':'#court-name',location:'#complex-address',contactInfo:'#complex-phone',complexId:'#court-complex',courtType:'#court-type',pricePerHour:'#court-price'};
        const input=page.locator(selectors[c.field]);
        if(c.field==='courtType'||c.field==='complexId') await input.selectOption(String(payload[c.field]));
        else await input.fill(String(c.value));
        if(c.outcome==='limit') {
          const max=Number(await input.getAttribute('maxlength'));
          await expect(input).toHaveValue(String(c.value).slice(0,max));
          await evidence(page,info,'limite-entrada');
          return;
        }
        const submit=page.getByRole('button',{name:kind==='complexes'?'Guardar complejo':'Registrar Cancha',exact:true});
        if(c.outcome==='accept') {
          const response=page.waitForResponse(r=>r.url()===endpoint&&r.request().method()==='POST');
          await submit.click();
          expect((await response).status()).toBe(201);
          await expect(submit).toBeHidden();
        } else {
          await submit.click();
          await expect(page.getByText(kind==='complexes'?'Nombre, ubicación y contacto son requeridos.':c.field==='name'?'Nombre y complejo son requeridos para la cancha.':'El precio por hora debe ser mayor a 0',{exact:false})).toBeVisible();
          await expect(submit).toBeVisible();
        }
        await evidence(page,info);
      }
      await Promise.all(pending);
      const after=await admin.api.get(listEndpoint); expect(after.ok()).toBeTruthy();
      const all=await after.json();
      if(c.outcome==='accept') {
        expect(records[kind].size).toBe(1);
        const saved=all.find((r:any)=>records[kind].has(r.id));
        expect(saved).toBeTruthy();
        for(const [field,value] of Object.entries(payload)) {
          if(field==='courtType') expect(saved[field]).toBe(value==='futsal'?'Futsal':value==='pádel'?'Padel':value);
          else if(field==='images') expect(saved[field]??[]).toEqual(value);
          else if(typeof value==='number'&&['name','location','contactInfo','paymentQrUrl'].includes(field)) expect(saved[field]).toBe(String(value));
          else if(field==='name'&&value!==null&&typeof value==='object') expect(saved[field]).toBe(String(value));
          else expect(saved[field]).toEqual(typeof value==='string'?value.trim():value);
        }
        expect(saved.isActive).toBe(true);
        await info.attach('persistencia',{body:JSON.stringify(saved,null,2),contentType:'application/json'});
      } else {
        const unexpected=all.filter((r:any)=>!beforeIds.has(r.id)&&(kind==='courts'?r.complexId===admin.complexId:r.name===marker||r.location===marker));
        for(const r of unexpected) records[kind].add(r.id);
        expect(unexpected,'Rechazo sin alta parcial propia').toEqual([]);
      }
    } finally { await Promise.all(pending); }
  });
}
