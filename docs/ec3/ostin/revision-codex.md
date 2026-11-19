# Revisión del bloque de pagos y anulación

Revisión realizada el 19/11/2026 sobre los cambios descargados de Ostin, commit 0d4f1e7, con la versión local actual del frontend. Dictamen: requiere ajustes para cerrar el alcance EC3. No se modificaron las pruebas originales ni el producto durante esta revisión.

## Verificación actual

- TypeScript E2E: aprobado.
- Suite original `npx playwright test --grep '@ostin'`: 8 casos ejecutados, 7 aprobados, 1 fallido, 0 omitidos; aproximadamente 3,3 minutos.
- Caso fallido: PAY-EP-03, timeout esperando `getByLabel('Monto a Cobrar (Bs):')` en reservas-pagos.spec.ts:109.
- Comprobación diagnóstica separada: copia temporal del mismo caso con un único cambio de selector; 1 aprobado en aproximadamente 30 segundos, saldo cero y pago SALDO_FINAL VALIDATED.
- No sumar el diagnóstico a los ocho casos originales ni declarar que la suite sin corregir pasó 8/8.

El inicio de la corrida original fue 18/11/2026 23:58:55 en Bolivia; terminó el 19/11. Se conservaron [reporte HTML](../../../ec3-artifacts/revision-ostin-2026-11-19T03-58-55-390Z/playwright-report/index.html) y [JSON](../../../ec3-artifacts/revision-ostin-2026-11-19T03-58-55-390Z/test-results/results.json). La [prueba diagnóstica](../../../ec3-artifacts/diagnostico-selector-ostin/prueba-temporal.txt) se conserva como texto; el archivo temporal ejecutable fue retirado.

## P1 El caso de pago final no llega a registrar el cobro

Ubicación: e2e/reservas-pagos.spec.ts:109; src/app/pages/secretary/secretary-dashboard.html:670.

El test usa getByLabel, pero el label del monto no tiene for y el input no tiene id ni está contenido en ese label. Playwright no encuentra un control asociado. La ejecución se detiene antes del clic en Registrar Cobro de la línea 110. El informe anterior atribuye el bloqueo al registro del pago o al producto sin identificar este punto.

Corrección preferida: asociar label e input con for/id, mejorando además accesibilidad y conservando el selector semántico. Alternativa de prueba: seleccionar el spinbutton dentro del modal de Cobro de Saldo Restante. El diagnóstico utilizó esta alternativa y completó el pago sin cambiar backend, reglas ni montos. Tras la corrección definitiva debe repetirse la suite original de ocho casos y actualizarse el informe.

## P1 Falta cobertura de formularios comprometidos

Ubicación: e2e/reservas-pagos.spec.ts:25–53 y docs/ec3/ostin/diseno-y-cobertura.md:25–37.

Los ocho casos son una base funcional, pero el reparto asignó F03–F06 con EP/BVA aplicable, no únicamente ocho ejemplos. El comprobante solo tiene PNG válido y cadena vacía por API. El componente payment.ts:69 limita a JPEG/PNG/WebP y 5 * 1024 * 1024 bytes, sin casos para esos límites o formatos.

Completar al menos:

| Formulario | Casos faltantes relevantes |
| --- | --- |
| F03 Comprobante | Sin archivo por UI; JPEG y WebP válidos; formato no permitido; BVA de tamaño 5242879 / 5242880 / 5242881 bytes, manteniendo válido el formato. No inventar que cualquier cadena no vacía es comprobante válido. |
| F04 Rechazo del anticipo | Motivo vacío, solo blancos y valores de 1/2 caracteres; verificar permanencia del pago/reserva ante rechazo inválido. TE-03 aporta el camino válido, pero no cubre esas particiones ni la frontera inferior. |
| F05 Saldo final | Método QR como clase válida distinta de efectivo; entradas no válidas de monto y método aplicables al formulario/contrato. El trío saldo−0.01 / saldo / saldo+0.01 ya está diseñado combinando los BVA y PAY-EP-03: registrar doble trazabilidad, no duplicar innecesariamente. |
| F06 Anulación | Motivo de 1 y 2 caracteres y solo espacios, además del vacío. No inventar un límite superior si no existe en el requisito. |

ANU-BVA-01 (reservas-anulacion.spec.ts:56–73) verifica solo longitud cero. Un texto largo válido en ANU-EP-01 no sustituye los vecinos 1 y 2 de BVA 3. Deben definirse las clases, la frontera, la unidad y el esperado de cada caso antes de ejecutarlo.

## P2 La matriz de comprobante contradice el resultado esperado real

Ubicación: docs/ec3/ostin/diseno-y-cobertura.md:29.

PAY-EP-01 dice PENDING_VALIDATION con saldo 75%. El código del test comprueba que el saldo no cambia al enviar el comprobante, y el propio informe final explica correctamente que permanece en Bs 100 hasta validar el anticipo. Cambiar esa fila a saldo sin reducción hasta validación; después del anticipo validado de Bs 25, queda Bs 75. Distinguir anticipo requerido, comprobante enviado y pago validado.

## Lo que está bien

- Datos propios y limpieza compartida de reservas.
- Uso de la sesión de secretaría para validar anticipos y cobrar saldo.
- Separación explícita entre UI y pruebas API complementarias.
- Verificación de saldo sin cambios cuando se intenta cobrar por debajo o por encima.
- Verificación de que anular no devuelve automáticamente el anticipo.
- Documentación que reconoce el caso fallido en vez de inventar una ejecución satisfactoria.

## Criterio de cierre

Corregir la asociación del campo/selector; completar EP/BVA de los formularios, actualizar la matriz y ejecutar los casos definitivos. Conservar el reporte nuevo junto con este diagnóstico. Ocho pruebas pasando demostrarían esos ocho escenarios, no por sí solas toda la cobertura exigida por EC3. No se requiere agregar una suite separada de integración para subsanar estos hallazgos: corresponden al diseño y automatización funcional de caja negra.
