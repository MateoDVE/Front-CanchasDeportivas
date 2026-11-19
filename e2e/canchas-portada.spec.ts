import { test, expect } from './fixtures/administracion';
import { openForm } from './helpers/altas';
import { apiUrl, evidence } from './helpers/app';

// Imagen PNG real con relleno posterior a IEND: el navegador la decodifica;
// el tamaño se controla sin falsear File.size ni sustituir respuestas.
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0l8AAAAASUVORK5CYII=','base64');
const examples=[
  {id:'BVA-F08-FILE1',size:2097151,ok:true},
  {id:'BVA-F08-FILE2',size:2097152,ok:true},
  {id:'BVA-F08-FILE3',size:2097153,ok:false},
  {id:'EP-F08-FILE4',size:100,ok:false,mime:'image/gif'},
  {id:'EP-F08-FILE5',size:100,ok:false,corrupt:true},
  {id:'EP-F08-FILE6',size:0,ok:true,mime:'image/jpeg'},
  {id:'EP-F08-FILE7',size:0,ok:true,mime:'image/webp'},
];
for(const c of examples) test(`${c.id} @altas @canchas @ui Portada ${c.size===0?'generada':`${c.size} bytes`} ${c.mime??'image/png'}${c.corrupt?' corrupta':''}`,async({admin,records,page},info)=>{
  const marker=`EC3-Portada-${Date.now()}`;
  await openForm(page,'courts',admin.complexId,marker);
  let buffer:Buffer=Buffer.alloc(c.size); if(!c.corrupt) png.copy(buffer);
  if(c.size===0) {
    const data=await page.evaluate(mime=>{
      const canvas=document.createElement('canvas');canvas.width=2;canvas.height=2;
      canvas.getContext('2d')!.fillRect(0,0,2,2);return canvas.toDataURL(mime);
    },c.mime!);
    buffer=Buffer.from(data.split(',')[1],'base64');
  }
  await page.locator('app-court-cover input[type=file]').setInputFiles({name:'EC3-portada.png',mimeType:c.mime??'image/png',buffer});
  if(c.ok) {
    await expect(page.getByAltText('Vista previa de la portada')).toBeVisible();
    const pending=page.waitForResponse(r=>r.url()===`${apiUrl}/admin/courts`&&r.request().method()==='POST');
    await page.getByRole('button',{name:'Registrar Cancha',exact:true}).click();
    const response=await pending; const body=await response.json();
    if(response.status()===201) records.courts.add(body.id);
    expect(response.status()).toBe(201);
    const detail=await admin.api.get(`${apiUrl}/courts/${body.id}`); expect(detail.ok()).toBeTruthy();
    const saved=await detail.json();
    expect(saved.images[0]).toBe(`data:${c.mime??'image/png'};base64,${buffer.toString('base64')}`);
    await expect(page.getByRole('button',{name:'Registrar Cancha',exact:true})).toBeHidden();
  } else {
    await expect(page.locator('app-court-cover [role=alert]')).toContainText(c.corrupt?'El archivo no es una imagen válida':'hasta 2 MB');
    await expect(page.getByAltText('Vista previa de la portada')).toHaveCount(0);
  }
  await evidence(page,info);
});
