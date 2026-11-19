import { test, expect } from './fixtures/reservas';
import { apiUrl, createFromUi, evidence, hour, openCourt, selectRange, sendReceipt, summary } from './helpers/app';

test('TD-RS1 @decision @api Cancha inactiva impide iniciar el flujo; pago no alcanzable', async ({ app },info)=>{
  expect((await app.admin.patch(`${apiUrl}/admin/courts/${app.courtId}/toggle`)).ok()).toBeTruthy();
  try {
    const response=await app.client.post(`${apiUrl}/reservations`,{data:{courtId:app.courtId,date:app.date,startTime:'10:00',endTime:'11:00'}});
    expect(response.status()).toBe(404);
    const body=await response.json();
    expect(JSON.stringify(body)).toContain('no está disponible');
    expect(body.reservationId).toBeUndefined();
    await info.attach('rechazo-cancha',{body:JSON.stringify(body,null,2),contentType:'application/json'});
  } finally { expect((await app.admin.patch(`${apiUrl}/admin/courts/${app.courtId}/toggle`)).ok()).toBeTruthy(); }
});

test('TD-RS2 @decision @ui Cancha activa y horario ocupado impiden nueva reserva',async ({app,page},info)=>{
  await selectRange(page);
  const own=await createFromUi(page);
  const second=await app.client.post(`${apiUrl}/reservations`,{data:{courtId:app.courtId,date:app.date,startTime:'10:00',endTime:'11:00'}});
  expect(second.status()).toBe(409);
  expect((await summary(app.client,own.reservationId)).status).toBe('TEMPORAL');
  await info.attach('rechazo-solapamiento',{body:await second.body(),contentType:'application/json'});
  await openCourt(page,app.courtId,app.date);
  await expect(hour(page,'10:00')).toBeDisabled();
  await evidence(page,info);
});

for(const validated of [false,true]) test(`${validated?'TD-RS4':'TD-RS3'} @decision @ui Cancha y horario disponibles; anticipo ${validated?'validado confirma':'pendiente no confirma'}`,async({app,page,browser},info)=>{
  await selectRange(page);
  const r=await createFromUi(page);
  await sendReceipt(page);
  const initial=await summary(app.client,r.reservationId);
  expect(initial.status).toBe('PENDING_VALIDATION');
  if(validated) {
    const ctx=await browser.newContext({storageState:app.secretaryState,baseURL:String(info.project.use.baseURL)});
    try {
      const secretary=await ctx.newPage(); await secretary.goto('/secretary');
      await secretary.getByRole('button',{name:/Validación Anticipos/}).click();
      const row=secretary.getByRole('row').filter({hasText:app.courtName});
      await expect(row).toHaveCount(1);
      await row.getByRole('button',{name:'Aprobar',exact:true}).click();
      await secretary.getByRole('button',{name:'Validar pago',exact:true}).click();
      await expect.poll(async()=>(await summary(app.client,r.reservationId)).status).toBe('CONFIRMED');
      await evidence(secretary,info,'validacion');
    } finally {await ctx.close();}
    await page.reload(); await expect(page).toHaveURL(/booking-confirmation/);
  }
  const final=await summary(app.client,r.reservationId);
  expect(final.status).toBe(validated?'CONFIRMED':'PENDING_VALIDATION');
  await info.attach('estado-final',{body:JSON.stringify(final,null,2),contentType:'application/json'});
  await evidence(page,info);
});
