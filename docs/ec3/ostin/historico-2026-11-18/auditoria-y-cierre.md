# Auditoría y cierre — EC3 Ostin

## Alcance revisado

Se revisaron las suites de Ostin, la fixture y helpers compartidos, la configuración de
Playwright, las pantallas de pago y secretaría, y los casos de uso NestJS de comprobantes,
validación, pago final y cancelación.

## Hallazgos y correcciones

| Hallazgo | Corrección | Estado |
| --- | --- | --- |
| La preparación de reservas confirmadas validaba el anticipo con la sesión de cliente contra un endpoint de secretaría. | Se cambió a `app.secretary` para consultar y validar el anticipo. | Corregido |
| La prueba de motivo vacío creaba el contexto con un `baseURL` reconstruido desde `process.env`. | Se usa el `baseURL` efectivo del proyecto Playwright, igual que la prueba de cancelación confirmada. | Corregido |
| El rechazo de comprobante vacío no debía confundirse con una validación de interfaz. | `PAY-EP-02` está etiquetado `@api`, envía `receiptImageUrl: ''` y exige HTTP 400 y estado `TEMPORAL`. | Verificado en código |
| El pago final exige coincidencia exacta con el saldo real. | Los casos de -Bs 0,01 y +Bs 0,01 comprueban HTTP 400 y saldo sin cambios; el caso exacto exige pago `SALDO_FINAL` validado y saldo cero. | Verificado en código |
| La cancelación de secretaría y la del cliente son endpoints distintos. | La suite usa la ruta de cliente solo para la preparación de `ANU-EP-02` y la UI de secretaría para `ANU-EP-01`/`ANU-BVA-01`. | Verificado en código |
| La cancelación no debe implicar devolución automática. | `ANU-EP-01` exige anticipo `VALIDATED` y ausencia de pagos `REFUNDED`. | Verificado en código |

## Validación realizada

| Comprobación | Resultado |
| --- | --- |
| `npm run test:e2e:typecheck` en frontend | Aprobado |
| `npx playwright test --list --grep '@ostin'` | Descubre 8 casos |
| `git diff --check` | Aprobado |
| `npx jest src/modules/payments/application/use-cases/payment-branches.spec.ts --runInBand` | 28/28 aprobadas |

## Ejecución E2E real

Se ejecutó la suite de Ostin contra frontend y backend locales usando `.env.e2e`, datos
sintéticos aislados y Chromium administrado por Playwright. El resultado consolidado fue de
7 casos aprobados y 1 caso fallido reproducible: `PAY-EP-03`. Los cuatro casos de pagos
negativos y de comprobantes pasaron después de corregir las expectativas de saldo; las tres
pruebas de anulación pasaron.

`PAY-EP-03` crea y confirma correctamente la reserva, la muestra en el tablero de Secretaría
y abre el modal con Bs 75. El registro del pago final no finaliza antes del timeout de 90
segundos. Se conservaron capturas, contexto de error y traza en `test-results/`.

La suite integral de 35 casos todavía no se ejecutó.

Para ejecutar con datos sintéticos aislados:

```bash
cd frontend/Front-CanchasDeportivas
cp .env.e2e.example .env.e2e
npm run test:e2e:pw -- --grep '@ostin'
npm run test:e2e:summary
```

El backend debe estar levantado en `E2E_API_URL`, el frontend en `E2E_BASE_URL`, y
`E2E_RUN=true` debe habilitarse explícitamente. Las cuentas demo de cliente, secretaría y
administrador se seleccionan mediante la interfaz de login; no se documentan credenciales.

## Evidencias generadas y pendientes

La ejecución real debe conservar:

- reporte HTML y JSON de Playwright;
- capturas de `PAY-EP-01`, `PAY-EP-03` y `ANU-EP-01`;
- respuestas JSON de los casos API negativos;
- identificación de la corrida y datos EC3 generados.

La corrida inicial archivada se encuentra en
`ec3-artifacts/2026-11-18T17-24-34-236Z/`. La cobertura de Ostin se clasifica como
**ejecutada parcialmente: 7/8 aprobados, 1 bloqueado**, no como aprobada al 100%.

Para el detalle completo, consultar
[informe-final-ejecucion.md](./informe-final-ejecucion.md).
