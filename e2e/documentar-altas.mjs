import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import ts from 'typescript';
const source=readFileSync('e2e/data/altas.ts','utf8');
const mod={exports:{}};
new Function('exports','module',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(mod.exports,mod);
const dir='../docs/ec3/marcelo'; mkdirSync(dir,{recursive:true});
const lines=[
'# Diseño ejecutable de Crear Complejo y Crear Cancha','',
'Responsable del bloque: Marcelo. Consolidación técnica: 18/11/2026. Basado en el aporte Word y contrastado con la versión local. Este catálogo describe expectativas; los resultados reales están en resultado-ultima-ejecucion.md.','',
'## Reglas y precondiciones','',
'ADMIN autenticado con la cuenta demo autorizada. Frontend local 4200 y API 3000; sistema real, sin mocks. Se crea un complejo exclusivo para las canchas. Cada prueba modifica solo el campo indicado; los demás conservan una base válida. No se presupone unicidad de nombres. El contrato HTTP usa conversión implícita: números en campos de texto se caracterizan como textos persistidos. EP-F07-008 caracteriza la conversión de objeto a [object Object]; no la recomienda como validación de negocio. EP-F07-TYPE1 verifica rechazo del arreglo. La fecha comercial usa America/La_Paz.','',
'Base Complejo: nombre y ubicación EC3 con marca única; contacto 70000000; QR omitido. Base Cancha: complejo propio existente, nombre EC3 de menos de 30 caracteres, Futsal, Bs 100/h, sin portada. Para errores se comprueba rechazo y ausencia de alta parcial propia; para éxitos se consulta el listado API y se comparan los campos persistidos. En UI se observa además el formulario y su cierre.','',
'| Campo | Particiones y fronteras |','| --- | --- |',
'| Complejo: nombre | Texto no blanco de 1–100; vacío, blancos, exceso, ausencia y tipos alternativos. BVA 0/1/2 y 99/100/101. |',
'| Complejo: ubicación y contacto | Texto no blanco de 1–255; mismos grupos. BVA 0/1/2 y 254/255/256. Contacto no exige formato telefónico. |',
'| QR complementario API | Omitido/null válidos; texto no blanco de 1–255. La omisión es EP independiente; BVA inferior corregido a 0/1/2. No se exige URL. |',
'| Cancha: complejo | Referencia propia existente; ausente/null/cero/negativo/fracción/no numérico/inexistente. No se crean canchas en complejos ajenos para simular IDs 1 y 2. |',
'| Cancha: nombre | UI 1–30, API 1–50. UI rechaza blancos antes de enviar. BVA UI 0/1/2 y 29/30/31; API 49/50/51. |',
'| Cancha: deporte | Futsal, Wally, Racket, Padel; sinónimos reconocidos por API; vacío, omitido, null, número, deporte no admitido. Es categórico: no corresponde BVA de orden entre deportes. |',
'| Cancha: precio | Positivo, máximo 99999999.99, dos decimales. BVA -0.01/0/0.01 más 0.02 para cubrir el vecino interior del mínimo representable; 99999999.98/99999999.99/100000000. UI 0.99/1/1.01 como caracterización de la discrepancia min=1. |',
'| Cancha: portada API | Omitida/lista vacía/una imagen; exceso de cantidad, protocolo y tipo no permitido, estructura incorrecta. BVA cantidad 0/1/2; longitud 2799999/2800000/2800001 caracteres. El patrón API no demuestra decodificación del archivo. |',
'| Cancha: portada UI | PNG/JPG/WebP, archivo corrupto o tipo no permitido, sin imagen. BVA tamaño 2097151/2097152/2097153 bytes con PNG decodificable. |','',
'## Procedimiento común','',
'1. Preparar sesión y datos base propios. Registrar los IDs existentes para identificar altas inesperadas.','2. UI: abrir Administración → Complejos & Canchas → Nuevo Complejo/Nueva Cancha; llenar la base y sustituir el campo del caso. API: enviar POST /api/v1/admin/complexes o /courts con la misma base.','3. En aceptación: guardar, exigir HTTP 201 y comprobar valores persistidos. En rechazo: exigir mensaje/HTTP de rechazo y comprobar que no hay un registro propio nuevo. En límite UI: comprobar que maxlength no admite el carácter adicional, sin atribuir al backend un dato que no recibió.','4. Adjuntar respuesta/persistencia y captura para UI. Retirar las portadas sintéticas propias tras verificar persistencia y desactivar únicamente las altas identificadas de la prueba; no borrar historial ni otros datos.','',
'## Matriz de casos','',
];
for(const [kind,cases] of Object.entries(mod.exports.allCases)) {
 lines.push(`### ${kind==='complexes'?'F07 Crear Complejo':'F08 Crear Cancha'}`,'','| ID | Entrada o partición | Canal | Resultado esperado |','| --- | --- | --- | --- |');
 for(const c of cases) lines.push(`| ${c.id} | ${c.description.replaceAll('|','/')} | ${c.channel.toUpperCase()} | ${c.outcome==='accept'?'Crear y verificar persistencia (201)':c.outcome==='limit'?'Impedir carácter que excede maxlength':`Rechazar sin alta (${c.channel==='api'?(c.status??400):'mensaje visible'})`} |`);
 lines.push('');
}
lines.push('## Casos visuales de portada','',
'| ID | Entrada | Resultado esperado |','| --- | --- | --- |',
'| BVA-F08-FILE1 | PNG válido de 2097151 bytes | Previsualizar, crear y persistir portada |',
'| BVA-F08-FILE2 | PNG válido de 2097152 bytes | Previsualizar, crear y persistir portada |',
'| BVA-F08-FILE3 | PNG válido de 2097153 bytes | Rechazar selección, sin portada |',
'| EP-F08-FILE4 | MIME image/gif | Rechazar tipo |',
'| EP-F08-FILE5 | MIME image/png con contenido corrupto | Rechazar por decodificación |',
'| EP-F08-FILE6 | JPEG real generado con canvas | Previsualizar, crear y persistir portada |',
'| EP-F08-FILE7 | WebP real generado con canvas | Previsualizar, crear y persistir portada |','',
'## Relación con el documento original','',
'Se conservan los 34 IDs EP y 24 IDs BVA de F07, y los 49 EP y 24 BVA de F08. BVA-F07-019 pasa de omitido a cadena vacía. EP-F08-015 fija rechazo UI para blancos. BVA-F08-023/024 conservan el ID por trazabilidad, pero se reclasifican como EP de referencia existente/inexistente; no cuentan como BVA numérico. Se agregan ausencias, vecinos de longitud de imagen, mínimo monetario y selección visual de portada.','',
'Los 19 escenarios AD del Word son propuestas complementarias de riesgo, no 19 pruebas ya ejecutadas. Los cubiertos por las matrices (alta válida, persistencia, referencia inexistente, roles de preparación, tipos, imagen, diferencias de longitud/precio) no se cuentan dos veces. Cancelar modal, simulación de red, unicidad y políticas de complejo inactivo no forman parte de la cobertura EP/BVA obligatoria cerrada aquí.','',
'La cobertura del formulario se demuestra con UI; los casos marcados API son pruebas funcionales complementarias de caja negra, no E2E de navegador. No se declara 100% de todas las posibles entradas del sistema.','');
writeFileSync(`${dir}/diseno-y-cobertura.md`,lines.join('\n'));
console.log(JSON.stringify(Object.fromEntries(Object.entries(mod.exports.allCases).map(([k,c])=>[k,{total:c.length,ui:c.filter(x=>x.channel==='ui').length,api:c.filter(x=>x.channel==='api').length}]))));
