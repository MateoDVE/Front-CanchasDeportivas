# Resumen de avance EC3 — Responsabilidad de Ostin

**Fecha:** 18 de noviembre de 2026
**Responsable:** Ostin
**Alcance:** comprobantes, validación del anticipo, pago del saldo final y anulación de reservas.

## 1. Objetivo general

La participación de Ostin consistía en demostrar, automatizar y documentar las reglas de negocio de:

1. adjuntar un comprobante de pago;
2. rechazar comprobantes vacíos o estados no admitidos;
3. validar el anticipo del 25%;
4. calcular y cobrar exactamente el saldo restante del 75%;
5. rechazar pagos finales inferiores o superiores al saldo real;
6. cancelar reservas con motivo;
7. impedir la segunda anulación de una reserva ya cancelada;
8. confirmar que una cancelación no genera automáticamente una devolución del anticipo.

El diseño completo está en [diseno-y-cobertura.md](./diseno-y-cobertura.md).
La auditoría posterior está en [auditoria-y-cierre.md](./auditoria-y-cierre.md).
Los resultados consolidados están en [informe-final-ejecucion.md](./informe-final-ejecucion.md).

## 2. Estado final del trabajo

| Indicador | Resultado |
| --- | --- |
| Casos de Ostin automatizados | 8 |
| Casos aprobados en la ejecución revisada | 7 |
| Caso bloqueado o fallido | 1: `PAY-EP-03` |
| Cobertura EP/BVA implementada | Comprobantes, pago final y anulación |
| Pruebas unitarias backend relacionadas | 28/28 aprobadas en `payment-branches.spec.ts` |
| Casos descubiertos por Playwright en la suite completa | 35 |
| Suite integral de 35 casos | Pendiente de ejecución completa |

La ejecución inicial aislada registrada produjo 4 aprobados y 4 fallidos; los tres fallos
correspondientes a expectativas incorrectas del test fueron corregidos. Posteriormente
quedaron 7 aprobados y `PAY-EP-03` falló reproduciblemente al registrar el pago final.

## 3. Técnicas de diseño aplicadas

| Técnica | Aplicación | Ejemplos |
| --- | --- | --- |
| **Partición de equivalencia válida** | Datos dentro de estados y rangos admitidos | Comprobante PNG válido y pago igual al saldo |
| **Partición de equivalencia inválida** | Datos, estados o acciones que deben rechazarse | Comprobante vacío, segunda anulación y motivo vacío |
| **Análisis de valores límite / BVA** | Se prueba alrededor del punto límite exacto del saldo | Bs 0,01 menos y Bs 0,01 más sobre el saldo |
| **Transiciones de estado** | Se comprueba el cambio o permanencia de estado | `TEMPORAL -> PENDING_VALIDATION`, confirmado y cancelado |
| **Prueba de estado inválido** | Acción aplicada fuera del estado permitido | Cancelar otra vez una reserva `CANCELLED` |
| **Prueba positiva** | Registra exitosamente una operación válida | Pago final exacto y anulación con motivo |
| **Prueba negativa** | Rechazo esperado con código HTTP o validación UI | Comprobante vacío, BVA y motivo vacío |

El límite principal utilizado fue el saldo real calculado por la aplicación. Para una reserva
de Bs 100 con anticipo del 25%, el punto válido es:

```text
Saldo real válido = total - pagos validados = 75 Bs
Valores límite probados = 74,99 Bs y 75,01 Bs
Valor válido = 75,00 Bs
```

## 4. Mapa de pruebas y código que cumple Ostin

### 4.1 Comprobante válido — `PAY-EP-01`

**Objetivo:** demostrar que un comprobante válido cambia el estado de `TEMPORAL`
a `PENDING_VALIDATION` y conserva el saldo esperado.

**Archivo de prueba:** [reservas-pagos.spec.ts](../../../e2e/reservas-pagos.spec.ts)
**Líneas:** 25-38

```typescript
test('PAY-EP-01 @reservas @ostin @ui Comprobante válido pasa a validación',
  async ({ page, app }, info) => {
    await selectRange(page);
    const reservation = await createFromUi(page);
    const before = await summary(app.client, reservation.reservationId);

    expect(before.status).toBe('TEMPORAL');
    expect(before.advanceRequired).toBeCloseTo(before.totalPrice * 0.25, 2);

    await sendReceipt(page);

    const after = await summary(app.client, reservation.reservationId);
    expect(after.status).toBe('PENDING_VALIDATION');
    expect(after.pendingBalance).toBe(before.pendingBalance);
    await evidence(page, info);
  });
```

**Implementación backend relacionada:**
- Endpoint: [payments.controller.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/payments/presentation/controllers/payments.controller.ts) en las líneas 32-45.
- Validación y transición: [upload-receipt.use-case.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/payments/application/use-cases/upload-receipt.use-case.ts) en las líneas 51-94.
- El caso rechaza comprobantes vacíos y cambia `TEMPORAL` a `PENDING_VALIDATION`.

### 4.2 Comprobante vacío — `PAY-EP-02`

**Objetivo:** comprobar una entrada inválida por EP y rechazarla antes de cambiar el estado.

**Archivo de prueba:** [reservas-pagos.spec.ts](../../../e2e/reservas-pagos.spec.ts)
**Líneas:** 40-54

```typescript
const response = await app.client.post(
  `${apiUrl}/payments/${reservation.reservationId}/receipt`,
  { data: { receiptImageUrl: '' } },
);

expect(response.status()).toBe(400);
expect((await summary(app.client, reservation.reservationId)).status)
  .toBe('TEMPORAL');
```

**Técnica:** EP negativa.
**Resultado esperado:** HTTP 400 y estado intacto.

**Implementación backend relacionada:** [upload-receipt.use-case.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/payments/application/use-cases/upload-receipt.use-case.ts), líneas 51-54.

### 4.3 Pago final fuera del saldo — `PAY-BVA-01`

**Objetivo:** aplicar BVA al límite exacto del monto que completa el saldo.

**Archivo de prueba:** [reservas-pagos.spec.ts](../../../e2e/reservas-pagos.spec.ts)
**Líneas:** 56-69

```typescript
for (const amountDelta of [-0.01, 0.01]) {
  test(`PAY-BVA-01-${amountDelta < 0 ? 'INSUFICIENTE' : 'EXCESO'}`,
    async ({ page, app }) => {
      const { reservation, confirmedSummary } =
        await createConfirmedReservation(page, app);
      const amount =
        Number((confirmedSummary.pendingBalance + amountDelta).toFixed(2));

      const response = await app.secretary.post(
        `${apiUrl}/secretary/reservations/${reservation.reservationId}/final-payment`,
        { data: { amount, paymentMethod: 'EFECTIVO' } },
      );

      expect(response.status()).toBe(400);
      const detail = await app.secretary.get(
        `${apiUrl}/secretary/reservations/${reservation.reservationId}`,
      );
      expect((await detail.json()).pendingBalance)
        .toBe(confirmedSummary.pendingBalance);
    });
}
```

**Límites:** -0,01 Bs para insuficiente y +0,01 Bs para exceso.
**Implementación backend:** [register-final-payment.use-case.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/payments/application/use-cases/register-final-payment.use-case.ts), líneas 36-64.

### 4.4 Pago final exacto — `PAY-EP-03`

**Objetivo:** pagar exactamente el saldo desde la interfaz de secretaría y dejar la reserva totalmente pagada.

**Archivo de prueba:** [reservas-pagos.spec.ts](../../../e2e/reservas-pagos.spec.ts)
**Líneas:** 71-124

```typescript
await secretary.getByLabel('Monto a Cobrar (Bs):')
  .fill(String(confirmedSummary.pendingBalance));
await secretary.getByRole('button', { name: 'Registrar Cobro', exact: true })
  .click();

await expect.poll(
  async () => (await summary(app.client, reservation.reservationId)).pendingBalance,
  { timeout: 15_000 },
).toBe(0);

const body = await detail.json();
expect(body.pendingBalance).toBe(0);
expect(body.payments.some((payment) =>
  payment.paymentType === 'SALDO_FINAL' &&
  payment.status === 'VALIDATED')).toBeTruthy();
```

**Resultado actual:** bloqueado/fallido reproducible. La reserva se prepara y confirma,
el tablero la muestra y el modal contiene el saldo correcto, pero el registro final no
completa antes del timeout de Playwright.

**Frontend:** [secretary-dashboard.ts](../../../src/app/pages/secretary/secretary-dashboard.ts),
líneas 430-447 y [secretary-dashboard.html](../../../src/app/pages/secretary/secretary-dashboard.html),
líneas 668-718.

**Backend:** [secretary-payments.controller.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/payments/presentation/controllers/secretary-payments.controller.ts),
líneas 90-103 y [register-final-payment.use-case.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/payments/application/use-cases/register-final-payment.use-case.ts),
líneas 36-105.

### 4.5 Anulación de reserva confirmada — `ANU-EP-01`

**Objetivo:** verificar la anulación de una reserva confirmada desde la interfaz de secretaría.

**Archivo de prueba:** [reservas-anulacion.spec.ts](../../../e2e/reservas-anulacion.spec.ts)
**Líneas:** 24-54

```typescript
await court.getByRole('button', { name: 'Cancelar', exact: true }).click();
await secretary.getByLabel('Motivo / Observación')
  .fill('EC3 Ostin: cancelación solicitada por el cliente');
await secretary.getByRole('button', {
  name: 'Confirmar Cancelación',
  exact: true,
}).click();

await expect.poll(async () =>
  (await summary(app.client, reservation.reservationId)).status
).toBe('CANCELLED');

expect(body.payments.some((payment) =>
  payment.paymentType === 'ANTICIPO' &&
  payment.status === 'VALIDATED')).toBeTruthy();
expect(body.payments.some((payment) =>
  payment.status === 'REFUNDED')).toBeFalsy();
```

**Resultado:** aprobado. Verifica la regla RN-08: el anticipo validado no se devuelve automáticamente.

**Frontend:** [secretary-dashboard.ts](../../../src/app/pages/secretary/secretary-dashboard.ts),
líneas 495-520.

**Backend:** [cancel-reservation.use-case.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/reservations/application/use-cases/cancel-reservation.use-case.ts),
líneas 33-82.

### 4.6 Motivo vacío — `ANU-BVA-01`

**Objetivo:** verificar el límite requerido de una entrada textual obligatoria.

**Archivo de prueba:** [reservas-anulacion.spec.ts](../../../e2e/reservas-anulacion.spec.ts)
**Líneas:** 56-77

```typescript
await court.getByRole('button', { name: 'Cancelar', exact: true }).click();
await expect(secretary.getByRole('button', {
  name: 'Confirmar Cancelación',
  exact: true,
})).toBeDisabled();
await expect.poll(async () =>
  (await summary(app.client, reservation.reservationId)).status
).toBe('CONFIRMED');
```

**Técnica:** BVA aplicada a una cadena vacía frente a una cadena no vacía obligatoria.

**Implementación frontend:** [secretary-dashboard.ts](../../../src/app/pages/secretary/secretary-dashboard.ts),
líneas 495-503 y [secretary-dashboard.html](../../../src/app/pages/secretary/secretary-dashboard.html),
líneas 768-769.

### 4.7 Segunda anulación — `ANU-EP-02`

**Objetivo:** impedir cancelar por segunda vez una reserva ya cancelada.

**Archivo de prueba:** [reservas-anulacion.spec.ts](../../../e2e/reservas-anulacion.spec.ts)
**Líneas:** 79-96

```typescript
const first = await app.client.post(
  `${apiUrl}/reservations/${reservation.reservationId}/cancel`,
  { data: { reason: 'EC3 Ostin: primera anulación' } },
);
expect(first.ok()).toBeTruthy();

const second = await app.client.post(
  `${apiUrl}/reservations/${reservation.reservationId}/cancel`,
  { data: { reason: 'EC3 Ostin: intento repetido' } },
);

expect(second.status()).toBe(400);
expect((await summary(app.client, reservation.reservationId)).status)
  .toBe('CANCELLED');
```

**Técnica:** EP de estado inválido.
**Implementación backend:** [cancel-reservation.use-case.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/reservations/application/use-cases/cancel-reservation.use-case.ts),
líneas 53-55.

## 5. Cómo está implementado Playwright

La configuración de Playwright está en [playwright.config.ts](../../../playwright.config.ts),
líneas 7-34:

- `testDir: './e2e'`: descubre archivos de pruebas dentro de `e2e`.
- `workers: 1`: ejecuta las pruebas secuencialmente.
- `timeout: 90_000`: límite predeterminado por caso.
- `expect.timeout: 15_000`: espera predeterminada de las aserciones.
- `baseURL`: usa `E2E_BASE_URL` o `http://localhost:4200`.
- `trace: retain-on-failure`: conserva la traza solo ante fallos.
- `screenshot: only-on-failure`: conserva capturas ante fallos.
- proyecto `chromium`: ejecuta Chromium/Desktop Chrome.

Los datos y recursos de prueba se crean en [reservas.ts](../../../e2e/fixtures/reservas.ts),
líneas 12-61:

1. inicia sesión como cliente, secretaría y administrador;
2. crea un complejo exclusivo EC3;
3. crea una cancha y horario exclusivo;
4. entrega sesiones y contextos HTTP a cada prueba;
5. deshabilita los recursos al finalizar;
6. cancela o rechaza únicamente las reservas creadas por la ejecución.

Los helpers compartidos están en [app.ts](../../../e2e/helpers/app.ts):

- `demoLogin`, líneas 5-23;
- selección de fecha y horas, líneas 25-50;
- creación de reserva mediante UI, líneas 52-58;
- adjuntar comprobante sintético, líneas 82-89;
- consultar el resumen persistido, líneas 72-76.

Los casos se etiquetan con `@reservas`, `@ostin`, `@ui`, `@api` y `@lento`.
Esto permite ejecutar solamente el trabajo de Ostin:

```bash
npx playwright test --grep '@ostin'
```

Los resultados HTML, JSON y capturas se generan con:

```bash
npm run test:e2e:pw
npm run test:e2e:summary
npm run test:e2e:pw:report
```

El reporte HTML de una ejecución seleccionada está disponible en:

- [Reporte HTML archivado](../../../ec3-artifacts/2026-11-18T17-24-34-236Z/playwright-report/index.html)
- [Resumen JSON archivado](../../../ec3-artifacts/2026-11-18T17-24-34-236Z/resumen.json)

En esa corrida seleccionada se encontraron 8 casos de Ostin; 4 aprobaron, 4 fallaron y
seis pertenecían a errores o interpretaciones posteriores corregidas. El reporte debe
leerse como evidencia histórica de una ejecución parcial, no como aprobación final.

## 6. Archivos desarrollados o modificados importantes

### Pruebas y configuración

- [reservas-pagos.spec.ts](../../../e2e/reservas-pagos.spec.ts)
- [reservas-anulacion.spec.ts](../../../e2e/reservas-anulacion.spec.ts)
- [reservas.ts](../../../e2e/fixtures/reservas.ts)
- [app.ts](../../../e2e/helpers/app.ts)
- [playwright.config.ts](../../../playwright.config.ts)
- [e2e/README.md](../../../e2e/README.md)

### Pruebas unitarias relacionadas

- [payment-branches.spec.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/payments/application/use-cases/payment-branches.spec.ts)
- [formal-inspection.spec.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/reservations/application/use-cases/formal-inspection.spec.ts)

### Código backend relacionado

- [upload-receipt.use-case.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/payments/application/use-cases/upload-receipt.use-case.ts)
- [register-final-payment.use-case.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/payments/application/use-cases/register-final-payment.use-case.ts)
- [cancel-reservation.use-case.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/reservations/application/use-cases/cancel-reservation.use-case.ts)
- [secretary-payments.controller.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/payments/presentation/controllers/secretary-payments.controller.ts)
- [payments.controller.ts](../../../../../backend/Back-CanchasDeportivas/src/modules/payments/presentation/controllers/payments.controller.ts)

### Código frontend relacionado

- [secretary-dashboard.ts](../../../src/app/pages/secretary/secretary-dashboard.ts)
- [secretary-dashboard.html](../../../src/app/pages/secretary/secretary-dashboard.html)

## 7. Comandos utilizados

Validar la suite y descubrir casos:

```bash
cd frontend/Front-CanchasDeportivas
npm run test:e2e:typecheck
npx playwright test --list --grep '@ostin'
```

Ejecutar las pruebas de Ostin:

```bash
npx playwright test e2e/reservas-pagos.spec.ts
npx playwright test e2e/reservas-anulacion.spec.ts
```

Ejecutar por etiqueta:

```bash
npm run test:e2e:pw -- --grep '@ostin'
```

Archivar y mostrar reportes:

```bash
npm run test:e2e:summary
npm run test:e2e:pw:report
```

## 8. Conclusión

Ostin completó la implementación de las ocho pruebas asignadas y documentó las reglas de
comprobantes, anticipo, pago final y anulación. La cobertura aplica particiones válidas e
inválidas, valores límite y transiciones de estado. También se corrigieron defectos de
precondición y expectativa en las pruebas.

La cobertura final revisada es de 7 casos aprobados y 1 bloqueado. `PAY-EP-03` requiere
continuar la investigación del registro de pago final, porque los datos se preparan
correctamente y el bloqueo aparece al completar la operación en interfaz.
