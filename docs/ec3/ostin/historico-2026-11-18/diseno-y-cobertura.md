# Ostin — Diseño y cobertura EC3

## Alcance asignado

Según el reparto del EC3, Ostin es responsable de:

- comprobante y validación del anticipo;
- pago del saldo hasta completar el total;
- anulación de reservas, incluyendo motivo y política del anticipo;
- EP/BVA aplicable, automatización, evidencias y resultados.

La creación de reserva y las transiciones generales se reutilizan como precondiciones o trazabilidad compartida cuando ya están cubiertas por Mateo. No se contabilizan como casos nuevos de Ostin.

## Reglas verificadas antes de automatizar

| Regla | Fuente | Resultado esperado |
| --- | --- | --- |
| El anticipo requerido es el 25% del total | `get-reservation-summary.use-case.ts` y pantalla de pago | El resumen muestra anticipo y saldo calculados con dos decimales |
| Un comprobante no vacío se registra como anticipo pendiente | `upload-receipt.use-case.ts` | La reserva pasa de `TEMPORAL` a `PENDING_VALIDATION` |
| El anticipo validado confirma la reserva | `validate-advance-payment.use-case.ts` | Pago `VALIDATED`, reserva `CONFIRMED` y saldo reducido |
| El pago final debe cubrir exactamente el saldo | `register-final-payment.use-case.ts` | Pago inferior o superior se rechaza; pago exacto deja saldo cero |
| El anticipo no se devuelve automáticamente al cancelar | `cancel-reservation.use-case.ts` y RN-08 | La reserva queda `CANCELLED`; el anticipo validado no aparece como reembolsado |
| El motivo de cancelación es obligatorio en la interfaz de secretaría | `secretary-dashboard.ts` | El botón de confirmación permanece deshabilitado sin motivo |

## Casos y trazabilidad

| ID | Técnica | Acción | Tipo | Resultado esperado | Automatización |
| --- | --- | --- | --- | --- | --- |
| PAY-EP-01 | EP | Comprobante PNG sintético válido | UI | `PENDING_VALIDATION`, saldo 75% | `reservas-pagos.spec.ts` |
| PAY-EP-02 | EP/BVA | Comprobante vacío | API complementaria | HTTP 400, reserva `TEMPORAL` | `reservas-pagos.spec.ts` |
| PAY-BVA-01-INSUFICIENTE | BVA | Pago final menor al saldo en Bs 0,01 | API complementaria | HTTP 400, saldo sin cambios | `reservas-pagos.spec.ts` |
| PAY-BVA-01-EXCESO | BVA | Pago final mayor al saldo en Bs 0,01 | API complementaria | HTTP 400, saldo sin cambios | `reservas-pagos.spec.ts` |
| PAY-EP-03 | EP | Pago final exacto por secretaría | UI | Pago `SALDO_FINAL` validado, saldo cero | `reservas-pagos.spec.ts` |
| ANU-EP-01 | EP | Anular reserva confirmada con motivo | UI | `CANCELLED`, anticipo validado sin devolución | `reservas-anulacion.spec.ts` |
| ANU-BVA-01 | BVA | Motivo vacío | UI | Confirmación deshabilitada, estado sin cambios | `reservas-anulacion.spec.ts` |
| ANU-EP-02 | EP | Repetir anulación | API complementaria | HTTP 400, estado permanece `CANCELLED` | `reservas-anulacion.spec.ts` |

## Casos reutilizados de Mateo

- `TE-03` cubre rechazo de comprobante con motivo y la transición a `CANCELLED`.
- `TE-05` cubre validación del anticipo y anulación por secretaría.

Estos casos no se duplican en la suite de Ostin; se deben incluir con doble trazabilidad en el informe consolidado.

## Estado de ejecución

Las ocho pruebas quedaron implementadas y ejecutadas parcialmente contra frontend y backend
locales. El resultado revisado fue de siete aprobados y un bloqueado: `PAY-EP-03`, cuyo
registro del pago final no finaliza antes del timeout. El resumen completo está en
[resumen-avance-y-entrega.md](./resumen-avance-y-entrega.md).
