# Informe final de ejecución — Pagos y anulación

## Resultado comprobado

Corrida `2026-11-19T04-10-41-965Z`, iniciada el 19/11/2026 a las 00:10:41 de Bolivia. Playwright terminó con código 0: **216 aprobadas, 0 fallidas y 0 omitidas**, duración 29 minutos (1739,79 segundos). Se ejecutó con un worker, sin reintentos, incluyendo el vencimiento real.

| Selección | Ejecutadas | Aprobadas | Fallidas | Omitidas |
| --- | --- | --- | --- | --- |
| Equipo completo | 216 | 216 | 0 | 0 |
| Pagos y anulación, subconjunto de esa misma corrida | 36 | 36 | 0 | 0 |

El equipo reúne 112 pruebas UI/sistema real y 104 funcionales de API. El bloque de pagos reúne 26 UI y 10 API. No son dos corridas ni deben sumarse sus conteos. Los 29 minutos corresponden al equipo completo.

## Interpretación

- PAY-EP-03 y PAY-EP-04 verificaron pago exacto en efectivo y QR, pago SALDO_FINAL validado con monto/método correctos y saldo cero. El timeout original quedó resuelto al asociar la etiqueta del monto con su campo mediante `for`/`id`.
- Los comprobantes JPEG, WebP y PNG se enviaron correctamente. Los casos de archivo ausente, GIF, PDF y exceso de tamaño se bloquearon. Los límites 5242879/5242880/5242881 bytes pasaron.
- Los motivos vacíos o blancos se rechazaron; uno y dos caracteres permitieron el rechazo/anulación previsto. La anulación no produjo una devolución automática.
- Los montos y métodos inválidos no crearon pagos ni modificaron el saldo. Subir un comprobante pendiente no se confundió con validar un anticipo.
- La regresión conjunta pasó las altas, decisiones y transiciones. TE-06 esperó 5,5 minutos: la reserva temporal expiró, liberó el horario y la pendiente se conservó.

La aprobación demuestra el comportamiento de los casos y precondiciones documentados en este entorno local; no es una medición de cobertura de todas las posibles entradas del sistema.

## Evidencias y reproducción

- [Detalle estable de los 36 casos y capturas](resultado-corrida-integral.md).
- [Detalle de los 216 casos](../../../../docs/ec3/equipo/resultado-corrida-integral.md).
- [Captura del reporte global de Playwright](../../../../docs/ec3/equipo/evidencias/2026-11-19T04-10-41-965Z/reporte-resumen.png), que muestra 216 aprobadas.
- Archivo local: `FrontCanchasDeportivas/ec3-artifacts/2026-11-19T04-10-41-965Z/`. Incluye HTML, JSON, adjuntos, `resumen.json` global y `resumen-pagos.json` del subconjunto.
- [Comandos por caso, bloque y suite completa](README.md).

La comprobación de tipos de la suite y la compilación Angular pasaron. La compilación conserva una advertencia previa de Sass sobre `@import`. Los cambios están locales y no se hizo commit ni publicación.

## Antecedentes conservados

La revisión original obtuvo 7/8: el caso de cobro se detenía antes de enviar la solicitud, al buscar una etiqueta sin asociación. Una corrida enfocada posterior obtuvo 6/7 por un mensaje duplicado que hacía ambiguo un selector; ese selector fue corregido antes de la corrida integral de 216/216. Consultar [auditoría](auditoria-y-cierre.md) y [diagnóstico](resultado-diagnostico-2026-11-19.md). Los resultados anteriores se conservan para trazabilidad y no describen el estado final.
