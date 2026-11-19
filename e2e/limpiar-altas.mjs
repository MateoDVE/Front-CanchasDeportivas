// Recuperación explícita por IDs extraídos de trazas propias; no participa en la suite.
import { chromium, request } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
loadEnvFile('.env.e2e');
const plan=JSON.parse(readFileSync('../tmp/ec3/limpieza-altas.json','utf8'));
const browser=await chromium.launch({channel:process.env.E2E_CHANNEL||'chrome'});
const page=await browser.newPage();
let api;
try {
 await page.goto(`${process.env.E2E_BASE_URL||'http://localhost:4200'}/login`);
 await page.getByRole('button',{name:/Administrador/}).click();
 const response=page.waitForResponse(r=>r.url().endsWith('/auth/login')&&r.request().method()==='POST');
 await page.locator('form').getByRole('button',{name:'Iniciar sesión',exact:true}).click();
 if((await response).status()!==200) throw new Error('Login no disponible; no se modificó ningún dato.');
 await page.waitForURL(/\/admin/);
 const token=await page.evaluate(()=>localStorage.getItem('access_token'));
 api=await request.newContext({extraHTTPHeaders:{Authorization:`Bearer ${token}`}});
 const root=process.env.E2E_API_URL||'http://localhost:3000/api/v1';
 const complexesResponse=await api.get(`${root}/admin/complexes`);
 if(!complexesResponse.ok()) throw new Error('No se pudo verificar propiedad');
 const all=await complexesResponse.json();
 for(const id of plan.complexes) if(!/^EC3-Altas-\d+-\d+$/.test(all.find(c=>c.id===id)?.name||'')) throw new Error(`Complejo ${id} no identificado como propio`);
 const ids=new Set(plan.courts);
 for(const id of plan.complexes) {
  const r=await api.get(`${root}/complexes/${id}/courts`);
  if(!r.ok()) throw new Error('No se pudo consultar cancha propia');
  for(const c of await r.json()) ids.add(c.id);
 }
 const cleaned=[];
 for(const id of ids) {
  const r=await api.get(`${root}/courts/${id}`); if(!r.ok()) throw new Error(`No se pudo leer ${id}`);
  const c=await r.json(); if(!plan.complexes.includes(c.complexId)) throw new Error(`Cancha ${id} ajena al plan`);
  if(!(await api.put(`${root}/admin/courts/${id}`,{data:{images:[]}})).ok()) throw new Error(`No se retiró portada ${id}`);
  if(c.isActive&&!(await api.patch(`${root}/admin/courts/${id}/toggle`)).ok()) throw new Error(`No se desactivó ${id}`);
  cleaned.push(id);
 }
 for(const id of plan.complexes) if(all.find(c=>c.id===id).isActive&&!(await api.patch(`${root}/admin/complexes/${id}/toggle`)).ok()) throw new Error(`No se desactivó complejo ${id}`);
 writeFileSync('../tmp/ec3/limpieza-altas-resultado.json',JSON.stringify({complexes:plan.complexes,courts:cleaned},null,2));
 console.log(JSON.stringify({complexes:plan.complexes.length,courts:cleaned.length}));
} finally {await api?.dispose();await browser.close();}
