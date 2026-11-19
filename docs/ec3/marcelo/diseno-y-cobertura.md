# Diseño ejecutable de Crear Complejo y Crear Cancha

Responsable del bloque: Marcelo. Consolidación técnica: 18/11/2026. Basado en el aporte Word y contrastado con la versión local. Este catálogo describe expectativas; los resultados reales están en resultado-ultima-ejecucion.md.

## Reglas y precondiciones

ADMIN autenticado con la cuenta demo autorizada. Frontend local 4200 y API 3000; sistema real, sin mocks. Se crea un complejo exclusivo para las canchas. Cada prueba modifica solo el campo indicado; los demás conservan una base válida. No se presupone unicidad de nombres. El contrato HTTP usa conversión implícita: números en campos de texto se caracterizan como textos persistidos. EP-F07-008 caracteriza la conversión de objeto a [object Object]; no la recomienda como validación de negocio. EP-F07-TYPE1 verifica rechazo del arreglo. La fecha comercial usa America/La_Paz.

Base Complejo: nombre y ubicación EC3 con marca única; contacto 70000000; QR omitido. Base Cancha: complejo propio existente, nombre EC3 de menos de 30 caracteres, Futsal, Bs 100/h, sin portada. Para errores se comprueba rechazo y ausencia de alta parcial propia; para éxitos se consulta el listado API y se comparan los campos persistidos. En UI se observa además el formulario y su cierre.

| Campo | Particiones y fronteras |
| --- | --- |
| Complejo: nombre | Texto no blanco de 1–100; vacío, blancos, exceso, ausencia y tipos alternativos. BVA 0/1/2 y 99/100/101. |
| Complejo: ubicación y contacto | Texto no blanco de 1–255; mismos grupos. BVA 0/1/2 y 254/255/256. Contacto no exige formato telefónico. |
| QR complementario API | Omitido/null válidos; texto no blanco de 1–255. La omisión es EP independiente; BVA inferior corregido a 0/1/2. No se exige URL. |
| Cancha: complejo | Referencia propia existente; ausente/null/cero/negativo/fracción/no numérico/inexistente. No se crean canchas en complejos ajenos para simular IDs 1 y 2. |
| Cancha: nombre | UI 1–30, API 1–50. UI rechaza blancos antes de enviar. BVA UI 0/1/2 y 29/30/31; API 49/50/51. |
| Cancha: deporte | Futsal, Wally, Racket, Padel; sinónimos reconocidos por API; vacío, omitido, null, número, deporte no admitido. Es categórico: no corresponde BVA de orden entre deportes. |
| Cancha: precio | Positivo, máximo 99999999.99, dos decimales. BVA -0.01/0/0.01 más 0.02 para cubrir el vecino interior del mínimo representable; 99999999.98/99999999.99/100000000. UI 0.99/1/1.01 como caracterización de la discrepancia min=1. |
| Cancha: portada API | Omitida/lista vacía/una imagen; exceso de cantidad, protocolo y tipo no permitido, estructura incorrecta. BVA cantidad 0/1/2; longitud 2799999/2800000/2800001 caracteres. El patrón API no demuestra decodificación del archivo. |
| Cancha: portada UI | PNG/JPG/WebP, archivo corrupto o tipo no permitido, sin imagen. BVA tamaño 2097151/2097152/2097153 bytes con PNG decodificable. |

## Procedimiento común

1. Preparar sesión y datos base propios. Registrar los IDs existentes para identificar altas inesperadas.
2. UI: abrir Administración → Complejos & Canchas → Nuevo Complejo/Nueva Cancha; llenar la base y sustituir el campo del caso. API: enviar POST /api/v1/admin/complexes o /courts con la misma base.
3. En aceptación: guardar, exigir HTTP 201 y comprobar valores persistidos. En rechazo: exigir mensaje/HTTP de rechazo y comprobar que no hay un registro propio nuevo. En límite UI: comprobar que maxlength no admite el carácter adicional, sin atribuir al backend un dato que no recibió.
4. Adjuntar respuesta/persistencia y captura para UI. Retirar las portadas sintéticas propias tras verificar persistencia y desactivar únicamente las altas identificadas de la prueba; no borrar historial ni otros datos.

## Matriz de casos

### F07 Crear Complejo

| ID | Entrada o partición | Canal | Resultado esperado |
| --- | --- | --- | --- |
| EP-F07-001 | name: "Complejo Norte" | UI | Crear y verificar persistencia (201) |
| EP-F07-002 | name: "A" | UI | Crear y verificar persistencia (201) |
| EP-F07-003 | name: "" | UI | Rechazar sin alta (mensaje visible) |
| EP-F07-004 | name: "     " | UI | Rechazar sin alta (mensaje visible) |
| EP-F07-005 | name: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | API | Rechazar sin alta (400) |
| EP-F07-006 | name: 12345; conversión HTTP a texto | API | Crear y verificar persistencia (201) |
| EP-F07-007 | name: null | API | Rechazar sin alta (400) |
| EP-F07-008 | name: {}; caracterización: conversión a [object Object] | API | Crear y verificar persistencia (201) |
| EP-F07-009 | name: "Complejo ñ áé" | UI | Crear y verificar persistencia (201) |
| EP-F07-010 | name: "  Complejo Norte  " | UI | Crear y verificar persistencia (201) |
| EP-F07-011 | location: "Av. Bolívar 456" | UI | Crear y verificar persistencia (201) |
| EP-F07-012 | location: "A" | UI | Crear y verificar persistencia (201) |
| EP-F07-013 | location: "" | UI | Rechazar sin alta (mensaje visible) |
| EP-F07-014 | location: "     " | UI | Rechazar sin alta (mensaje visible) |
| EP-F07-015 | location: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | API | Rechazar sin alta (400) |
| EP-F07-016 | location: 500; conversión HTTP a texto | API | Crear y verificar persistencia (201) |
| EP-F07-017 | location: null | API | Rechazar sin alta (400) |
| EP-F07-018 | location: "Av. Norte #123" | UI | Crear y verificar persistencia (201) |
| EP-F07-019 | contactInfo: "71234567" | UI | Crear y verificar persistencia (201) |
| EP-F07-020 | contactInfo: "correo@ejemplo.com" | UI | Crear y verificar persistencia (201) |
| EP-F07-021 | contactInfo: "A" | UI | Crear y verificar persistencia (201) |
| EP-F07-022 | contactInfo: "" | UI | Rechazar sin alta (mensaje visible) |
| EP-F07-023 | contactInfo: "     " | UI | Rechazar sin alta (mensaje visible) |
| EP-F07-024 | contactInfo: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | API | Rechazar sin alta (400) |
| EP-F07-025 | contactInfo: 71234567; conversión HTTP a texto | API | Crear y verificar persistencia (201) |
| EP-F07-026 | contactInfo: null | API | Rechazar sin alta (400) |
| EP-F07-027 | paymentQrUrl: omitido | API | Crear y verificar persistencia (201) |
| EP-F07-028 | paymentQrUrl: null | API | Crear y verificar persistencia (201) |
| EP-F07-029 | paymentQrUrl: "https://example.com/qr.png" | API | Crear y verificar persistencia (201) |
| EP-F07-030 | paymentQrUrl: "A" | API | Crear y verificar persistencia (201) |
| EP-F07-031 | paymentQrUrl: "" | API | Rechazar sin alta (400) |
| EP-F07-032 | paymentQrUrl: "     " | API | Rechazar sin alta (400) |
| EP-F07-033 | paymentQrUrl: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | API | Rechazar sin alta (400) |
| EP-F07-034 | paymentQrUrl: 123; conversión HTTP a texto | API | Crear y verificar persistencia (201) |
| BVA-F07-001 | name: longitud 0 | UI | Rechazar sin alta (mensaje visible) |
| BVA-F07-002 | name: longitud 1 | UI | Crear y verificar persistencia (201) |
| BVA-F07-003 | name: longitud 2 | UI | Crear y verificar persistencia (201) |
| BVA-F07-004 | name: longitud 99 | UI | Crear y verificar persistencia (201) |
| BVA-F07-005 | name: longitud 100 | UI | Crear y verificar persistencia (201) |
| BVA-F07-006 | name: longitud 101 | UI | Impedir carácter que excede maxlength |
| BVA-F07-007 | location: longitud 0 | UI | Rechazar sin alta (mensaje visible) |
| BVA-F07-008 | location: longitud 1 | UI | Crear y verificar persistencia (201) |
| BVA-F07-009 | location: longitud 2 | UI | Crear y verificar persistencia (201) |
| BVA-F07-010 | location: longitud 254 | UI | Crear y verificar persistencia (201) |
| BVA-F07-011 | location: longitud 255 | UI | Crear y verificar persistencia (201) |
| BVA-F07-012 | location: longitud 256 | UI | Impedir carácter que excede maxlength |
| BVA-F07-013 | contactInfo: longitud 0 | UI | Rechazar sin alta (mensaje visible) |
| BVA-F07-014 | contactInfo: longitud 1 | UI | Crear y verificar persistencia (201) |
| BVA-F07-015 | contactInfo: longitud 2 | UI | Crear y verificar persistencia (201) |
| BVA-F07-016 | contactInfo: longitud 254 | UI | Crear y verificar persistencia (201) |
| BVA-F07-017 | contactInfo: longitud 255 | UI | Crear y verificar persistencia (201) |
| BVA-F07-018 | contactInfo: longitud 256 | UI | Impedir carácter que excede maxlength |
| BVA-F07-019 | paymentQrUrl: longitud 0 | API | Rechazar sin alta (400) |
| BVA-F07-020 | paymentQrUrl: longitud 1 | API | Crear y verificar persistencia (201) |
| BVA-F07-021 | paymentQrUrl: longitud 2 | API | Crear y verificar persistencia (201) |
| BVA-F07-022 | paymentQrUrl: longitud 254 | API | Crear y verificar persistencia (201) |
| BVA-F07-023 | paymentQrUrl: longitud 255 | API | Crear y verificar persistencia (201) |
| BVA-F07-024 | paymentQrUrl: longitud 256 | API | Rechazar sin alta (400) |
| EP-F07-OM1 | name omitido | API | Rechazar sin alta (400) |
| EP-F07-OM2 | location omitido | API | Rechazar sin alta (400) |
| EP-F07-OM3 | contactInfo omitido | API | Rechazar sin alta (400) |
| EP-F07-TYPE1 | arreglo no convertible a nombre escalar | API | Rechazar sin alta (400) |

### F08 Crear Cancha

| ID | Entrada o partición | Canal | Resultado esperado |
| --- | --- | --- | --- |
| EP-F08-001 | complexId: "$existing" | UI | Crear y verificar persistencia (201) |
| EP-F08-002 | complexId: 0 | API | Rechazar sin alta (400) |
| EP-F08-003 | complexId: -1 | API | Rechazar sin alta (400) |
| EP-F08-004 | complexId: 1.5 | API | Rechazar sin alta (400) |
| EP-F08-005 | complexId: 2147483647 | API | Rechazar sin alta (404) |
| EP-F08-006 | complexId: "abc" | API | Rechazar sin alta (400) |
| EP-F08-007 | complexId: null | API | Rechazar sin alta (400) |
| EP-F08-008 | complexId: omitido | API | Rechazar sin alta (400) |
| EP-F08-009 | name: "Cancha Central" | UI | Crear y verificar persistencia (201) |
| EP-F08-010 | name: "A" | UI | Crear y verificar persistencia (201) |
| EP-F08-011 | name: "" | UI | Rechazar sin alta (mensaje visible) |
| EP-F08-012 | name: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" | API | Rechazar sin alta (400) |
| EP-F08-013 | name: 123; conversión HTTP a texto | API | Crear y verificar persistencia (201) |
| EP-F08-014 | name: null | API | Rechazar sin alta (400) |
| EP-F08-015 | name: "     " | UI | Rechazar sin alta (mensaje visible) |
| EP-F08-016 | name: "Cancha ñ" | UI | Crear y verificar persistencia (201) |
| EP-F08-017 | name: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" | API | Crear y verificar persistencia (201) |
| EP-F08-018 | courtType: "Futsal" | UI | Crear y verificar persistencia (201) |
| EP-F08-019 | courtType: "Wally" | UI | Crear y verificar persistencia (201) |
| EP-F08-020 | courtType: "Racket" | UI | Crear y verificar persistencia (201) |
| EP-F08-021 | courtType: "Padel" | UI | Crear y verificar persistencia (201) |
| EP-F08-022 | courtType: "futsal" | API | Crear y verificar persistencia (201) |
| EP-F08-023 | courtType: "pádel" | API | Crear y verificar persistencia (201) |
| EP-F08-024 | courtType: "Básquet" | API | Rechazar sin alta (400) |
| EP-F08-025 | courtType: "" | API | Rechazar sin alta (400) |
| EP-F08-026 | courtType: null | API | Rechazar sin alta (400) |
| EP-F08-027 | courtType: 123 | API | Rechazar sin alta (400) |
| EP-F08-028 | pricePerHour: 100 | UI | Crear y verificar persistencia (201) |
| EP-F08-029 | pricePerHour: 0 | UI | Rechazar sin alta (mensaje visible) |
| EP-F08-030 | pricePerHour: -1 | UI | Rechazar sin alta (mensaje visible) |
| EP-F08-031 | pricePerHour: 0.01 | API | Crear y verificar persistencia (201) |
| EP-F08-032 | pricePerHour: 100.5 | UI | Crear y verificar persistencia (201) |
| EP-F08-033 | pricePerHour: 100.555 | API | Rechazar sin alta (400) |
| EP-F08-034 | pricePerHour: 100000000 | API | Rechazar sin alta (400) |
| EP-F08-035 | pricePerHour: "abc" | API | Rechazar sin alta (400) |
| EP-F08-036 | pricePerHour: null | API | Rechazar sin alta (400) |
| EP-F08-037 | pricePerHour: 99999999.99 | API | Crear y verificar persistencia (201) |
| EP-F08-038 | images: omitido | API | Crear y verificar persistencia (201) |
| EP-F08-039 | images: [] | API | Crear y verificar persistencia (201) |
| EP-F08-040 | images: ["https://example.com/portada.png"] | API | Crear y verificar persistencia (201) |
| EP-F08-041 | images: ["data:image/jpeg;base64,YQ=="] | API | Crear y verificar persistencia (201) |
| EP-F08-042 | images: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQA | API | Crear y verificar persistencia (201) |
| EP-F08-043 | images: ["data:image/webp;base64,YQ=="] | API | Crear y verificar persistencia (201) |
| EP-F08-044 | images: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQA | API | Rechazar sin alta (400) |
| EP-F08-045 | images: ["http://example.com/portada.png"] | API | Rechazar sin alta (400) |
| EP-F08-046 | images: ["data:image/gif;base64,YQ=="] | API | Rechazar sin alta (400) |
| EP-F08-047 | images: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAA | API | Rechazar sin alta (400) |
| EP-F08-048 | images: [123] | API | Rechazar sin alta (400) |
| EP-F08-049 | images: ["https://example.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | API | Rechazar sin alta (400) |
| BVA-F08-001 | name: longitud 0 | UI | Rechazar sin alta (mensaje visible) |
| BVA-F08-002 | name: longitud 1 | UI | Crear y verificar persistencia (201) |
| BVA-F08-003 | name: longitud 2 | UI | Crear y verificar persistencia (201) |
| BVA-F08-004 | name: longitud 29 | UI | Crear y verificar persistencia (201) |
| BVA-F08-005 | name: longitud 30 | UI | Crear y verificar persistencia (201) |
| BVA-F08-006 | name: longitud 31 | UI | Impedir carácter que excede maxlength |
| BVA-F08-007 | name: longitud 49 | API | Crear y verificar persistencia (201) |
| BVA-F08-008 | name: longitud 50 | API | Crear y verificar persistencia (201) |
| BVA-F08-009 | name: longitud 51 | API | Rechazar sin alta (400) |
| BVA-F08-010 | precio -0.01; contrato positivo con dos decimales | API | Rechazar sin alta (400) |
| BVA-F08-011 | precio 0; contrato positivo con dos decimales | API | Rechazar sin alta (400) |
| BVA-F08-012 | precio 0.01; contrato positivo con dos decimales | API | Crear y verificar persistencia (201) |
| BVA-F08-013 | precio 99999999.98; contrato positivo con dos decimales | API | Crear y verificar persistencia (201) |
| BVA-F08-014 | precio 99999999.99; contrato positivo con dos decimales | API | Crear y verificar persistencia (201) |
| BVA-F08-015 | precio 100000000; contrato positivo con dos decimales | API | Rechazar sin alta (400) |
| BVA-F08-016 | precio 0.99; contrato positivo con dos decimales | UI | Crear y verificar persistencia (201) |
| BVA-F08-017 | precio 1; contrato positivo con dos decimales | UI | Crear y verificar persistencia (201) |
| BVA-F08-018 | precio 1.01; contrato positivo con dos decimales | UI | Crear y verificar persistencia (201) |
| BVA-F08-019 | 0 imágenes | API | Crear y verificar persistencia (201) |
| BVA-F08-020 | 1 imágenes | API | Crear y verificar persistencia (201) |
| BVA-F08-021 | 2 imágenes | API | Rechazar sin alta (400) |
| BVA-F08-022 | ID cero | API | Rechazar sin alta (400) |
| BVA-F08-023 | Referencia existente propia; EP, reemplaza supuesto ID 1 | API | Crear y verificar persistencia (201) |
| BVA-F08-024 | Referencia inexistente; EP, reemplaza supuesto ID 2 | API | Rechazar sin alta (404) |
| BVA-F08-IMG1 | imagen longitud 2799999 | API | Crear y verificar persistencia (201) |
| BVA-F08-IMG2 | imagen longitud 2800000 | API | Crear y verificar persistencia (201) |
| BVA-F08-IMG3 | imagen longitud 2800001 | API | Rechazar sin alta (400) |
| BVA-F08-MIN | vecino interior del mínimo monetario 0.01 | API | Crear y verificar persistencia (201) |
| EP-F08-OM1 | name omitido | API | Rechazar sin alta (400) |
| EP-F08-OM2 | courtType omitido | API | Rechazar sin alta (400) |
| EP-F08-OM3 | pricePerHour omitido | API | Rechazar sin alta (400) |

## Casos visuales de portada

| ID | Entrada | Resultado esperado |
| --- | --- | --- |
| BVA-F08-FILE1 | PNG válido de 2097151 bytes | Previsualizar, crear y persistir portada |
| BVA-F08-FILE2 | PNG válido de 2097152 bytes | Previsualizar, crear y persistir portada |
| BVA-F08-FILE3 | PNG válido de 2097153 bytes | Rechazar selección, sin portada |
| EP-F08-FILE4 | MIME image/gif | Rechazar tipo |
| EP-F08-FILE5 | MIME image/png con contenido corrupto | Rechazar por decodificación |
| EP-F08-FILE6 | JPEG real generado con canvas | Previsualizar, crear y persistir portada |
| EP-F08-FILE7 | WebP real generado con canvas | Previsualizar, crear y persistir portada |

## Relación con el documento original

Se conservan los 34 IDs EP y 24 IDs BVA de F07, y los 49 EP y 24 BVA de F08. BVA-F07-019 pasa de omitido a cadena vacía. EP-F08-015 fija rechazo UI para blancos. BVA-F08-023/024 conservan el ID por trazabilidad, pero se reclasifican como EP de referencia existente/inexistente; no cuentan como BVA numérico. Se agregan ausencias, vecinos de longitud de imagen, mínimo monetario y selección visual de portada.

Los 19 escenarios AD del Word son propuestas complementarias de riesgo, no 19 pruebas ya ejecutadas. Los cubiertos por las matrices (alta válida, persistencia, referencia inexistente, roles de preparación, tipos, imagen, diferencias de longitud/precio) no se cuentan dos veces. Cancelar modal, simulación de red, unicidad y políticas de complejo inactivo no forman parte de la cobertura EP/BVA obligatoria cerrada aquí.

La cobertura del formulario se demuestra con UI; los casos marcados API son pruebas funcionales complementarias de caja negra, no E2E de navegador. No se declara 100% de todas las posibles entradas del sistema.
