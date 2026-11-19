# Auditoría y correcciones — Pagos y anulación

## Correcciones aplicadas

- Se asoció la etiqueta «Monto a Cobrar (Bs)» con su input mediante `for` e `id`. El timeout de PAY-EP-03 ocurría al localizar el campo, antes de enviar el cobro; no demostraba un fallo del servicio de pago.
- Se conservó el selector semántico de Playwright y se verifican ambos métodos: efectivo y QR. El oráculo exige pago SALDO_FINAL validado, monto y método correctos y saldo cero.
- Se amplió el bloque de 8 a 36 casos: archivos, límite de 5 MiB, motivos de rechazo/anulación, montos y métodos inválidos. Se distinguen 26 pruebas de navegador y 10 de API.
- Se corrigió el selector de la advertencia de archivo demasiado grande: la interfaz presenta el mismo mensaje en dos lugares. El caso comprueba una instancia visible y también que no se cree ningún pago.
- Se corrigió la explicación del saldo: subir un comprobante pendiente no reduce la deuda. El anticipo reduce el saldo solo después de validarlo.
- Se agregaron comandos por función y reportes separados del equipo y del subconjunto de pagos.

## Evidencia y alcance

La revisión original registró 7/8 aprobados. La corrida enfocada posterior registró 6/7; su único fallo fue la ambigüedad del mensaje duplicado y se corrigió antes de ejecutar la suite conjunta. Estos resultados históricos no deben confundirse ni sumarse con la corrida final.

Consultar [resultado vigente](resultado-ultima-ejecucion.md), [diseño de los 36 casos](diseno-y-cobertura.md) e [instrucciones](README.md). Los informes anteriores se conservan en `historico-2026-11-18`.

Se ejecutaron la comprobación de tipos de la suite y la compilación del frontend. La compilación conserva una advertencia previa de Sass sobre `@import`. No se modificó el backend ni se publicaron cambios. La ejecución funcional usa servicios reales y registros sintéticos propios; los comprobantes y pagos validados permanecen en su historial de auditoría.

## Validación integral final

Corrida `2026-11-19T04-10-41-965Z`: 216/216 aprobadas, 0 fallidas y 0 omitidas; pagos y anulación 36/36. El caso original PAY-EP-03 y el nuevo PAY-EP-04 pasaron con efectivo y QR. [Resultado estable](resultado-corrida-integral.md).
