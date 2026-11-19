# Diseño de pruebas de pagos y anulación EC3

Actualización del 19/11/2026. Se cubren F03 comprobante, F04 rechazo/validación, F05 saldo final y F06 anulación. Casos de transición se reutilizan con trazabilidad; no se exige una suite de integración separada. La automatización usa Playwright, servicios reales y cuentas demo autorizadas.

## Oráculos y precondiciones

Cada caso prepara su propia reserva de cliente en la cancha exclusiva EC3, fecha Bolivia +2, de 10:00 a 11:00, tarifa Bs 100/h. Total Bs 100; anticipo requerido Bs 25. Enviar comprobante no reduce el saldo: mientras está pendiente de validar, son Bs 100; tras validar el anticipo quedan Bs 75. El pago final exige exactamente el saldo real. No confundir monto requerido con dinero validado.

Los casos de rechazo mantienen válidas las demás entradas y comprueban que no se creen pagos ni cambie el saldo/estado indebidamente. La fixture rechaza comprobantes sintéticos pendientes, cancela reservas propias activas y desactiva cancha/complejo. Los pagos ya validados y comprobantes quedan auditados; no representan dinero real y no se fabrican devoluciones.

## EP y BVA 3 por formulario

| Formulario/campo | Particiones | Fronteras y unidad |
| --- | --- | --- |
| F03 archivo | PNG/JPEG/WebP válidos; sin archivo; GIF/PDF inválidos; exceso de tamaño | Máximo 5242880 bytes: 5242879, 5242880, 5242881. PNG con relleno posterior a IEND mantiene válido el formato. |
| F03 API comprobante | Cadena vacía rechazada | Caso complementario; no equivale a seleccionar un archivo vacío por UI. |
| F04 motivo de rechazo | Texto no blanco válido; vacío y solo espacios inválidos | Mínimo de contenido 1 carácter: 0/1/2; espacios se prueban como EP separada. No se inventa máximo. |
| F05 monto | Saldo exacto válido; inferior/superior, cero, negativo, vacío, no numérico, null/omitido y exceso de decimales inválidos | Saldo 75: 74.99, 75.00, 75.01; unidad Bs 0.01. El exacto reutiliza PAY-EP-03 como BVA, no se cuenta dos veces. |
| F05 método | EFECTIVO y QR válidos; CHEQUE, vacío y null inválidos | Categórico, no corresponde BVA numérico. |
| F06 motivo | Texto no blanco válido; vacío y espacios inválidos | 0/1/2 caracteres; no hay máximo definido en la UI revisada. |
| F06 estado | Confirmada cancelable; ya cancelada rechaza repetición | Clase de estado, cubierta con ANU-EP-01/02. |

## Casos y trazabilidad

| ID | Formulario/técnica | Entrada y canal | Resultado esperado |
| --- | --- | --- | --- |
| PAY-EP-01 | F03 EP | PNG sintético válido, UI | PENDING_VALIDATION; saldo sin reducción |
| PAY-EP-02 | F03 EP | Comprobante vacío, API | HTTP 400; TEMPORAL |
| PAY-BVA-01-INSUFICIENTE | F05 BVA 3 | Saldo −0.01, API | HTTP 400; saldo sin cambios |
| PAY-BVA-01-EXCESO | F05 BVA 3 | Saldo +0.01, API | HTTP 400; saldo sin cambios |
| PAY-EP-03 | F05 EP y BVA 3 | Saldo exacto, efectivo, UI | SALDO_FINAL VALIDATED, monto/método correctos, saldo 0 |
| PAY-EP-04 | F05 EP | Saldo exacto, QR, UI | SALDO_FINAL VALIDATED, monto/método correctos, saldo 0 |
| REC-EP-01 | F03 EP | Sin seleccionar archivo, UI | Envío deshabilitado; sin pago nuevo |
| REC-EP-02 | F03 EP | JPEG real generado, UI | Comprobante pendiente, saldo intacto |
| REC-EP-03 | F03 EP | WebP real generado, UI | Comprobante pendiente, saldo intacto |
| REC-EP-04 | F03 EP | GIF, UI | Error de formato; sin pago nuevo |
| REC-EP-05 | F03 EP | PDF, UI | Error de formato; sin pago nuevo |
| REC-BVA-01 | F03 BVA 3 | PNG 5242879 bytes, UI | Enviar y persistir pago pendiente |
| REC-BVA-02 | F03 BVA 3 | PNG 5242880 bytes, UI | Enviar y persistir pago pendiente |
| REC-BVA-03 | F03 BVA 3 | PNG 5242881 bytes, UI | Rechazar selección, TEMPORAL y sin pago |
| REJ-BVA-01 | F04 BVA 3 | Motivo vacío, UI | Mostrar error; reserva y pagos intactos |
| REJ-BVA-02 | F04 BVA 3 | Motivo A, UI | Cancelar reserva y rechazar anticipo |
| REJ-BVA-03 | F04 BVA 3 | Motivo AB, UI | Cancelar reserva y rechazar anticipo |
| REJ-EP-ESP | F04 EP | Tres espacios, UI | Error; reserva y pagos intactos |
| SAL-UI-01 | F05 EP | Vacío, UI | HTTP 400; sin pago adicional |
| SAL-UI-02 | F05 EP | 0, UI | HTTP 400; sin pago adicional |
| SAL-UI-03 | F05 EP | −0.01, UI | HTTP 400; sin pago adicional |
| SAL-UI-04 | F05 BVA 3 | 74.99, UI | HTTP 400; sin pago adicional |
| SAL-UI-05 | F05 BVA 3 | 75.01, UI | HTTP 400; sin pago adicional |
| SAL-UI-06 | F05 EP | 75.001, UI | HTTP 400; sin pago adicional |
| SAL-API-01 | F05 EP | Monto abc, API | HTTP 400; sin pago adicional |
| SAL-API-02 | F05 EP | Monto null, API | HTTP 400; sin pago adicional |
| SAL-API-03 | F05 EP | Monto omitido, API | HTTP 400; sin pago adicional |
| SAL-API-04 | F05 EP | Método CHEQUE, API | HTTP 400; sin pago adicional |
| SAL-API-05 | F05 EP | Método vacío, API | HTTP 400; sin pago adicional |
| SAL-API-06 | F05 EP | Método null, API | HTTP 400; sin pago adicional |
| ANU-EP-01 | F06 EP | Confirmada con motivo, UI | CANCELLED; anticipo validado sin devolución |
| ANU-BVA-01 | F06 BVA 3 | Motivo vacío, UI | Confirmación deshabilitada, CONFIRMED |
| ANU-BVA-02 | F06 BVA 3 | Motivo A, UI | CANCELLED; sin devolución |
| ANU-BVA-03 | F06 BVA 3 | Motivo AB, UI | CANCELLED; sin devolución |
| ANU-EP-ESP | F06 EP | Tres espacios, UI | Confirmación deshabilitada; pagos/estado intactos |
| ANU-EP-02 | F06 EP | Segunda anulación, API | HTTP 400; CANCELLED |

Total: 36 casos, 26 de navegador/sistema real y 10 complementarios API. Los conteos de ejecución deben tomarse del reporte, no del diseño.

## Procedimientos

- Comprobante: seleccionar rango, crear reserva, abrir pago; adjuntar el archivo del caso (o no adjuntar), observar el control de envío y enviar cuando corresponda. Verificar respuesta, estado, cantidad de pagos y saldo. Adjuntar tamaño y MIME reales.
- Rechazo: crear y enviar comprobante, abrir secretaría → Validación Anticipos, identificar la fila de la cancha propia, abrir Rechazar y escribir el motivo. Confirmar; verificar pagos y estado.
- Saldo: preparar y validar anticipo, abrir secretaría en la fecha de la reserva, Cobrar Saldo, ingresar monto y método. Verificar persistencia de un pago validado en aceptación; en rechazo conservar la lista de pagos y el saldo.
- Anulación: preparar reserva confirmada, seleccionar fecha operativa y cancha propia, Cancelar, introducir motivo; verificar estado y política de no devolución. El caso repetido usa API de cliente y no se presenta como validación de secretaría.

La validación positiva del anticipo se reutiliza de TE-02 y TD-RS4. Se conserva el diseño histórico de ocho casos en historico-2026-11-18; no describe el estado actual.
