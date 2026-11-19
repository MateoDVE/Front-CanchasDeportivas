# Tabla de decisión del flujo de confirmación de reserva

## Alcance y justificación

El flujo elegido es solicitar una reserva de cliente, enviar comprobante de anticipo y validar ese anticipo en secretaría. El resultado de interés es alcanzar CONFIRMED. Se conservan las condiciones comprometidas: cancha, disponibilidad y pago confirmado. Pago confirmado significa anticipo validado del 25%; no significa pago total ni autorización de ingreso. El saldo restante corresponde al bloque de pagos.

Las condiciones se observan en distintas etapas de un mismo recorrido real. Esta tabla no afirma que exista un endpoint que evalúe las tres simultáneamente. Tampoco promete revalidar disponibilidad o estado de cancha después de pagar. Se mantiene estable la cancha y el intervalo durante cada caso, salvo el bloqueo preparado antes de iniciar RS2.

## Condiciones

| Código | Condición y momento |
| --- | --- |
| C1 | La cancha está activa al solicitar la reserva. |
| C2 | El intervalo solicitado está dentro del horario habilitado y no tiene una reserva bloqueante ajena a la nueva solicitud, al reservar. |
| C3 | El anticipo de la reserva creada fue validado por secretaría después de enviar comprobante. |

Precondiciones comunes: cliente autenticado; fecha futura de Bolivia; rango válido de una hora; tarifa Bs 100/h; horario 08:00–23:00; sin incidentes; cancha propia de pruebas. RS2 crea primero una reserva independiente del intento nuevo; no confunde el bloqueo de la propia reserva con un conflicto.

## Tabla completa de análisis

| Regla teórica | C1 | C2 | C3 | Factibilidad y resultado |
| --- | --- | --- | --- | --- |
| R1 | S | S | S | Alcanzable: reserva CONFIRMED. |
| R2 | S | S | N | Alcanzable: comprobante enviado, sin validar; PENDING_VALIDATION. |
| R3 | S | N | S | No alcanzable para una reserva nueva de este recorrido: el conflicto impide crearla y pagarla. |
| R4 | S | N | N | El intento se rechaza por conflicto antes de llegar al pago. C3 realmente no se evalúa. |
| R5 | N | S | S | No alcanzable: no se crea la reserva con cancha inactiva. |
| R6 | N | S | N | Rechazo por cancha inactiva; disponibilidad y pago no se evalúan. |
| R7 | N | N | S | No alcanzable: no se crea la reserva con cancha inactiva. |
| R8 | N | N | N | Rechazo por cancha inactiva; disponibilidad y pago no se evalúan. |

Las ocho filas son análisis teórico, no ocho ejecuciones. N en C3 no puede interpretarse como un pago existente si la reserva nunca se creó. No se fabrican pagos huérfanos ni conflictos imposibles para completar una matriz booleana.

## Reglas ejecutables

| Caso | C1 | C2 | C3 | Acción observable y resultado exacto |
| --- | --- | --- | --- | --- |
| TD-RS1 | N | — | — | POST de reserva responde 404, informa cancha no disponible y no devuelve reservationId. No llega a pago. |
| TD-RS2 | S | N | — | Nueva solicitud responde 409. El selector muestra el bloque deshabilitado; la primera reserva permanece TEMPORAL. |
| TD-RS3 | S | S | N | Se crea TEMPORAL, se envía comprobante, queda PENDING_VALIDATION y no se declara confirmada. |
| TD-RS4 | S | S | S | Tras el mismo recorrido, secretaría aprueba el anticipo; API informa CONFIRMED y cliente ve la confirmación. |

“—” significa condición no evaluada porque el flujo terminó antes. RS1 agrupa los intentos con cancha inactiva; RS2 agrupa los que no pueden obtener el intervalo. RS3 y RS4 distinguen el resultado de validación del anticipo. Hay cuatro reglas relevantes y ejecutables, cumpliendo el mínimo de tres combinaciones de la consigna.

## Preparación, pasos y evidencia

Cada caso usa el complejo/cancha exclusivo de la fixture de reservas y crea sus propias reservas. RS1 desactiva temporalmente esa cancha y la reactiva en finally. RS2 reserva 10:00–11:00 por UI y repite la solicitud por API para comprobar también la protección del servidor. RS3/RS4 operan por navegador; RS4 usa otra sesión de secretaría y valida exclusivamente el comprobante asociado a la cancha del caso.

Se adjuntan respuestas de rechazo, estado final y capturas en los casos UI. La limpieza cancela reservas propias activas y rechaza comprobantes propios aún pendientes. Los movimientos validados son sintéticos y quedan auditados; no representan dinero real. No se simula una devolución.

Implementación: [reservas-decision.spec.ts](../../../e2e/reservas-decision.spec.ts). El conteo y estado observado de cada caso están en [resultado de ejecución](resultado-ultima-ejecucion.md). Cuatro reglas diseñadas no equivalen a cuatro aprobadas hasta consultar ese reporte.
