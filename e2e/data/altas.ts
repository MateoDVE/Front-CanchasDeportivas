export type Case = { id: string; field: string; value?: unknown; omit?: boolean; channel: 'ui' | 'api'; outcome: 'accept' | 'reject' | 'limit'; description: string; status?: number };
export const complexCases: Case[] = [];
export const courtCases: Case[] = [];
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0l8AAAAASUVORK5CYII=';
function add(list: Case[], id: string, field: string, value: unknown, outcome: Case['outcome'], channel: Case['channel'], description: string, omit = false) {
  list.push({ id, field, value, outcome, channel, description, omit });
}
const ep7: [string, unknown, boolean, Case['channel']][] = [
  ['name','Complejo Norte',true,'ui'], ['name','A',true,'ui'], ['name','',false,'ui'], ['name','     ',false,'ui'], ['name','A'.repeat(101),false,'api'], ['name',12345,false,'api'], ['name',null,false,'api'], ['name',{},false,'api'], ['name','Complejo ñ áé',true,'ui'], ['name','  Complejo Norte  ',true,'ui'],
  ['location','Av. Bolívar 456',true,'ui'], ['location','A',true,'ui'], ['location','',false,'ui'], ['location','     ',false,'ui'], ['location','A'.repeat(256),false,'api'], ['location',500,false,'api'], ['location',null,false,'api'], ['location','Av. Norte #123',true,'ui'],
  ['contactInfo','71234567',true,'ui'], ['contactInfo','correo@ejemplo.com',true,'ui'], ['contactInfo','A',true,'ui'], ['contactInfo','',false,'ui'], ['contactInfo','     ',false,'ui'], ['contactInfo','A'.repeat(256),false,'api'], ['contactInfo',71234567,false,'api'], ['contactInfo',null,false,'api'],
  ['paymentQrUrl',undefined,true,'api'], ['paymentQrUrl',null,true,'api'], ['paymentQrUrl','https://example.com/qr.png',true,'api'], ['paymentQrUrl','A',true,'api'], ['paymentQrUrl','',false,'api'], ['paymentQrUrl','     ',false,'api'], ['paymentQrUrl','A'.repeat(256),false,'api'], ['paymentQrUrl',123,false,'api'],
];
ep7.forEach(([field,value,ok,channel], i) => add(complexCases, `EP-F07-${String(i+1).padStart(3,'0')}`,field,value,ok?'accept':'reject',channel,`${field}: ${JSON.stringify(value)?.slice(0,60) ?? 'omitido'}`,value===undefined));
for (const [i, field] of ['name','location','contactInfo','paymentQrUrl'].entries()) {
  const max=field==='name'?100:255;
  [0,1,2,max-1,max,max+1].forEach((n,j)=>add(complexCases,`BVA-F07-${String(i*6+j+1).padStart(3,'0')}`,field,'A'.repeat(n),n===0?'reject':n>max?(field==='paymentQrUrl'?'reject':'limit'):'accept',field==='paymentQrUrl'?'api':'ui',`${field}: longitud ${n}`));
}
for (const [i,field] of ['name','location','contactInfo'].entries()) add(complexCases,`EP-F07-OM${i+1}`,field,undefined,'reject','api',`${field} omitido`,true);

const ep8: [string,unknown,boolean,Case['channel']][] = [
  ['complexId','$existing',true,'ui'],['complexId',0,false,'api'],['complexId',-1,false,'api'],['complexId',1.5,false,'api'],['complexId',2147483647,false,'api'],['complexId','abc',false,'api'],['complexId',null,false,'api'],['complexId',undefined,false,'api'],
  ['name','Cancha Central',true,'ui'],['name','A',true,'ui'],['name','',false,'ui'],['name','A'.repeat(51),false,'api'],['name',123,false,'api'],['name',null,false,'api'],['name','     ',false,'ui'],['name','Cancha ñ',true,'ui'],['name','A'.repeat(50),true,'api'],
  ['courtType','Futsal',true,'ui'],['courtType','Wally',true,'ui'],['courtType','Racket',true,'ui'],['courtType','Padel',true,'ui'],['courtType','futsal',true,'api'],['courtType','pádel',true,'api'],['courtType','Básquet',false,'api'],['courtType','',false,'api'],['courtType',null,false,'api'],['courtType',123,false,'api'],
  ['pricePerHour',100,true,'ui'],['pricePerHour',0,false,'ui'],['pricePerHour',-1,false,'ui'],['pricePerHour',0.01,true,'api'],['pricePerHour',100.50,true,'ui'],['pricePerHour',100.555,false,'api'],['pricePerHour',100000000,false,'api'],['pricePerHour','abc',false,'api'],['pricePerHour',null,false,'api'],['pricePerHour',99999999.99,true,'api'],
  ['images',undefined,true,'api'],['images',[],true,'api'],['images',['https://example.com/portada.png'],true,'api'],['images',['data:image/jpeg;base64,YQ=='],true,'api'],['images',[png],true,'api'],['images',['data:image/webp;base64,YQ=='],true,'api'],['images',[png,png],false,'api'],['images',['http://example.com/portada.png'],false,'api'],['images',['data:image/gif;base64,YQ=='],false,'api'],['images',png,false,'api'],['images',[123],false,'api'],['images',['https://example.com/'+'a'.repeat(2800001)],false,'api'],
];
ep8.forEach(([field,value,ok,channel],i)=>add(courtCases,`EP-F08-${String(i+1).padStart(3,'0')}`,field,value,ok?'accept':'reject',channel,`${field}: ${JSON.stringify(value)?.slice(0,60) ?? 'omitido'}`,value===undefined));
courtCases.find(c=>c.id==='EP-F08-005')!.status=404;
[0,1,2,29,30,31,49,50,51].forEach((n,i)=>add(courtCases,`BVA-F08-${String(i+1).padStart(3,'0')}`,'name','A'.repeat(n),n===0||n===51?'reject':n===31?'limit':'accept',i<6?'ui':'api',`name: longitud ${n}`));
[-0.01,0,0.01,99999999.98,99999999.99,100000000,0.99,1,1.01].forEach((n,i)=>add(courtCases,`BVA-F08-${String(i+10).padStart(3,'0')}`,'pricePerHour',n,n<=0||n>99999999.99?'reject':'accept',i<6?'api':'ui',`precio ${n}; contrato positivo con dos decimales`));
[[],[png],[png,png]].forEach((value,i)=>add(courtCases,`BVA-F08-${19+i}`.replace(/-(\d\d)$/,'-0$1'),'images',value,i===2?'reject':'accept','api',`${i} imágenes`));
// Un identificador es una referencia, no una magnitud del negocio. Usar datos propios.
add(courtCases,'BVA-F08-022','complexId',0,'reject','api','ID cero');
add(courtCases,'BVA-F08-023','complexId','$existing','accept','api','Referencia existente propia; EP, reemplaza supuesto ID 1');
add(courtCases,'BVA-F08-024','complexId',2147483647,'reject','api','Referencia inexistente; EP, reemplaza supuesto ID 2');
courtCases.at(-1)!.status=404;
for (const [i,n] of [2799999,2800000,2800001].entries()) add(courtCases,`BVA-F08-IMG${i+1}`,'images',['https://example.com/'+'a'.repeat(n-20)],n>2800000?'reject':'accept','api',`imagen longitud ${n}`);
add(courtCases,'BVA-F08-MIN','pricePerHour',0.02,'accept','api','vecino interior del mínimo monetario 0.01');
for (const [i,field] of ['name','courtType','pricePerHour'].entries()) add(courtCases,`EP-F08-OM${i+1}`,field,undefined,'reject','api',`${field} omitido`,true);
export const allCases={ complexes:complexCases, courts:courtCases };
// El contrato HTTP activo transforma números a texto antes del DTO
// (ValidationPipe.enableImplicitConversion). No existe una regla de negocio
// que prohíba nombres/contactos numéricos; verificar conversión y persistencia.
for(const c of [...complexCases,...courtCases]) {
  if(typeof c.value==='number'&&['name','location','contactInfo','paymentQrUrl'].includes(c.field)) {
    c.outcome='accept'; c.description+='; conversión HTTP a texto';
  }
}
const objectName=complexCases.find(c=>c.id==='EP-F07-008')!;
objectName.outcome='accept'; objectName.description+='; caracterización: conversión a [object Object]';
add(complexCases,'EP-F07-TYPE1','name',[],'reject','api','arreglo no convertible a nombre escalar');
