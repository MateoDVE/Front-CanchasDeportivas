# Informe de auditoría y ejecución — EC3 Ostin

**Fecha de elaboración:** 18 de noviembre de 2026
**Responsabilidad:** Ostin
**Alcance:** comprobantes, validación del anticipo, pago final y anulación

## 1. Resumen ejecutivo

La responsabilidad de Ostin quedó implementada y auditada sobre el frontend y backend reales.
Se ejecutaron las pruebas contra servicios locales, usando datos sintéticos aislados y sin
modificar reglas de negocio ni datos de producción.

Resultado consolidado de las ejecuciones reales:

- **8 casos automatizados** de Ostin.
- **7 casos aprobados** en ejecuciones reales.
- **1 caso bloqueado/fallido:** `PAY-EP-03`.
- **35 casos** descubiertos por Playwright en la suite general.
- La suite integral de 35 casos **todavía no se ejecutó**.

`PAY-EP-03` prepara correctamente la reserva, valida el anticipo, muestra la reserva en
Secretaría y abre el modal con saldo de **Bs 75**. Sin embargo, el registro del cobro final
no produce una finalización observable antes del timeout de 90 segundos. El fallo fue
reproducido después de levantar nuevamente frontend y backend.

## 2. Archivos revisados

### Pruebas y configuración

- `e2e/reservas-pagos.spec.ts`
- `e2e/reservas-anulacion.spec.ts`
- `e2e/fixtures/reservas.ts`
- `e2e/helpers/app.ts`
- `playwright.config.ts`
- `e2e/README.md`
- `.env.e2e` local, sin exponer valores

### Frontend

- `src/app/pages/secretary/secretary-dashboard.ts`
- `src/app/pages/secretary/secretary-dashboard.html`
- `src/app/services/secretary.service.ts`

### Backend

- `src/modules/payments/application/use-cases/payment-branches.spec.ts`
- `register-final-payment.use-case.ts`
- `validate-advance-payment.use-case.ts`
- `get-daily-operational-board.use-case.ts`
- controlador de pagos de Secretaría
- controladores de reservas de cliente y Secretaría

### Documentación

- `docs/ec3/ostin/diseno-y-cobertura.md`
- `docs/ec3/ostin/auditoria-y-cierre.md`

## 3. Hallazgos y correcciones realizadas

| Hallazgo | Corrección | Estado |
|---|---|---|
| La validación del anticipo usaba accidentalmente la sesión de cliente. | Se utilizó `app.secretary` para consultar y validar el pago pendiente. | Corregido |
| Se reconstruía el `baseURL` de forma inconsistente. | Se usa el `baseURL` efectivo del proyecto Playwright. | Corregido |
| PAY-EP-01 esperaba saldo reducido antes de validar el anticipo. | Se documentó y comprobó que mientras el pago está `PENDING_VALIDATION` el saldo permanece en Bs 100. | Corregido |
| Los casos BVA conservaban el resumen anterior a la validación. | El helper devuelve el resumen posterior a la validación, con saldo real de Bs 75. | Corregido |
| PAY-EP-02 podía confundirse con una prueba UI. | Está marcado como `@api`, envía comprobante vacío y exige HTTP 400 y estado `TEMPORAL`. | Corregido |
| La cancelación podía interpretarse como devolución. | Se comprueba que el anticipo permanece `VALIDATED` y no se crea pago `REFUNDED`. | Verificado |
| PAY-EP-03 no completaba el pago final desde la UI. | Se añadieron esperas por tablero y reserva observable, sin cambiar la regla de negocio. El bloqueo continúa. | Pendiente externo/producto |

## 4. Casos y resultados reales

| ID | Tipo | Resultado | Evidencia/observación |
|---|---|---|---|
| `PAY-EP-01` | UI | **Aprobado** | Comprobante válido; estado `PENDING_VALIDATION`. |
| `PAY-EP-02` | API | **Aprobado** | Comprobante vacío; HTTP 400 y estado `TEMPORAL`. |
| `PAY-BVA-01-INSUFICIENTE` | API | **Aprobado** | Pago Bs 0,01 inferior; HTTP 400 y saldo sin cambios. |
| `PAY-BVA-01-EXCESO` | API | **Aprobado** | Pago Bs 0,01 superior; HTTP 400 y saldo sin cambios. |
| `PAY-EP-03` | UI | **Fallido reproducible** | El modal muestra Bs 75, pero el cobro no finaliza en 90 s. |
| `ANU-EP-01` | UI | **Aprobado** | Anulación confirmada; anticipo validado sin devolución. |
| `ANU-BVA-01` | UI | **Aprobado** | Motivo vacío; confirmación no disponible y estado sin cambios. |
| `ANU-EP-02` | API | **Aprobado** | Segunda anulación rechazada; estado permanece `CANCELLED`. |

La ejecución inicial de las ocho pruebas produjo 4 aprobados y 4 fallos. Tres fallos de
pagos fueron defectos de expectativas del test y se corrigieron. Después de la corrección,
la suite de pagos produjo 4 aprobados y PAY-EP-03 falló nuevamente. Las tres pruebas de
anulación ya habían producido 3 aprobados.

## 5. Evidencias generadas

La primera corrida real archivada se encuentra en:

`ec3-artifacts/2026-11-18T17-24-34-236Z/`

Las ejecuciones posteriores conservaron los artefactos locales de Playwright en:

`test-results/`

Para PAY-EP-03 se generaron:

- capturas de la página cliente;
- capturas del tablero de Secretaría;
- captura del modal de cobro con saldo Bs 75;
- `error-context.md`;
- `trace.zip`.

Las trazas pueden contener información de sesión. Deben conservarse localmente y revisarse
antes de compartirlas.

## 6. Preparación y configuración

Se verificó:

- frontend local en `http://localhost:4200`;
- backend local en `http://localhost:3000`;
- `.env.e2e` configurado con URLs y `E2E_RUN=true`;
- uso de Chromium administrado por Playwright cuando no existe Chrome del sistema;
- un worker de Playwright para evitar conflictos entre datos de prueba;
- fixture que crea complejo y cancha exclusivos `EC3-Reservas-*`;
- limpieza que cancela únicamente reservas creadas por la prueba y deshabilita la cancha creada.

No se expusieron credenciales ni se imprimió el contenido del `.env` del backend.

## 7. Validaciones técnicas

Comandos verificados:

```bash
cd frontend/Front-CanchasDeportivas
npm run test:e2e:typecheck
git diff --check
```

Resultados:

- TypeScript E2E: aprobado.
- `git diff --check`: aprobado.
- Pruebas backend `payment-branches.spec.ts`: **28/28 aprobadas**.
- Playwright descubre **35 casos** en total.

## 8. Comandos de reproducción

### Preparar servicios

```bash
cd backend/Back-CanchasDeportivas
npm start
```

En otra terminal:

```bash
cd frontend/Front-CanchasDeportivas
npm start -- --host 0.0.0.0
```

### Validar y ejecutar Ostin

```bash
cd frontend/Front-CanchasDeportivas
npm run test:e2e:typecheck
npx playwright test e2e/reservas-pagos.spec.ts
npx playwright test e2e/reservas-anulacion.spec.ts
```

### Ejecutar un caso específico

```bash
npx playwright test e2e/reservas-pagos.spec.ts --grep PAY-EP-03
```

### Suite completa

```bash
npm run test:e2e:pw
npm run test:e2e:summary
```

La suite completa debe ejecutarse por separado y sus resultados no deben mezclarse con los
de una corrida parcial.

## 9. Pendientes y riesgos

1. Aislar por qué el clic de `Registrar Cobro` no completa PAY-EP-03 desde la UI, aunque el
   modal y el saldo sean correctos.
2. Revisar la respuesta de red del endpoint
   `/api/v1/secretary/reservations/:id/final-payment` durante el bloqueo.
3. Ejecutar y archivar la suite integral de 35 casos.
4. No declarar cobertura integral aprobada mientras PAY-EP-03 y la suite de 35 casos estén
   pendientes.
5. Mantener los datos sintéticos y no usar producción.

## 10. Conclusión

La responsabilidad de Ostin está automatizada, documentada y parcialmente validada con
ejecuciones reales. La cobertura aprobada es de **7 de 8 casos de Ostin**. El único bloqueo
pendiente está identificado con evidencias auténticas y no se ocultó aumentando timeouts,
eliminando aserciones o alterando reglas de negocio.
