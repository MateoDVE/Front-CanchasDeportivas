# EC3 — Pruebas de reservas

Pruebas funcionales de caja negra del recorrido **cliente**, con cuentas demo elegidas mediante los botones reales del login. Frontend y backend reales; no se interceptan respuestas ni se escribe directamente en la base de datos.

## Preparación

1. Instalar dependencias con `npm ci` en frontend y backend.
2. Levantar backend con su configuración habitual: `npm run start:dev`.
3. Levantar frontend: `npm start` (API configurada en `src/environments/environment.ts`).
4. Copiar `.env.e2e.example` a `.env.e2e`; comprobar URLs y colocar `E2E_RUN=true` para el entorno elegido.
5. Tener Chrome instalado (`E2E_CHANNEL=chrome`) o Edge (`msedge`). La suite no requiere descargar Chromium si se utiliza uno de ellos.

La dependencia Playwright ya estaba agregada por el usuario. Se usa Node 22 y su cargador nativo de `.env`; no se agrega dotenv.

## Ejecutar

Ejecutar los comandos desde `FrontCanchasDeportivas`, con backend y frontend levantados. En PowerShell:

```powershell
cd "C:\Users\Mateo\Documents\Mateo Tareas\Calidad\FrontCanchasDeportivas"
npm run test:e2e:typecheck
npx playwright test --list
```

### Un caso individual

Seleccionar el ID del caso con `--grep`. Por ejemplo:

```powershell
# Una partición de equivalencia
npm run test:e2e:pw -- --grep 'EP-RES-01 '

# Un valor límite
npm run test:e2e:pw -- --grep 'BVA-DUR-02 '

# Una transición de estados
npm run test:e2e:pw -- --grep 'TE-01 '
```

Los IDs actuales son únicos. El espacio después del ID evita seleccionar IDs parecidos. No agregar `^`: Playwright también incluye el proyecto y el archivo al aplicar el filtro. Cada caso prepara sus propios datos: no es necesario ejecutar primero los casos anteriores. TE-06 tarda aproximadamente seis minutos porque espera el vencimiento real.

IDs disponibles para ejecutar uno por uno:

| Bloque | IDs |
| --- | --- |
| EP del selector | EP-RES-01, EP-RES-02, EP-RES-03, EP-RES-04, EP-RES-05 |
| BVA de duración | BVA-DUR-01, BVA-DUR-02, BVA-DUR-03, BVA-DUR-04, BVA-DUR-05, BVA-DUR-06 |
| BVA de fecha | BVA-FEC-01, BVA-FEC-02, BVA-FEC-03 |
| EP complementaria de API | EP-API-01, EP-API-02, EP-API-03, EP-API-04, EP-API-05, EP-API-06, EP-API-07 |
| Estados | TE-01, TE-02, TE-03, TE-04, TE-05, TE-06 |

Para observar el navegador durante un caso:

```powershell
npm run test:e2e:pw -- --grep 'TE-01 ' --headed
```

### Cada bloque de reservas por separado

```powershell
# Formulario: EP y BVA; 21 casos
npm run test:e2e:reservas:formularios

# Transiciones y eventos de estado; 6 casos
npm run test:e2e:reservas:estados

# Toda la parte de reservas; 27 casos
npm run test:e2e:reservas
```

### Todas las pruebas Playwright del proyecto

```powershell
npm run test:e2e:pw
```

Este comando descubre todos los archivos de pruebas dentro de `e2e`, incluidos los que posteriormente agreguen los compañeros. Actualmente ejecuta los mismos 27 casos porque solo está implementada esta parte. No ejecuta las pruebas unitarias de Angular ni las de Jest del backend.

La configuración utiliza **un worker**, por lo que los casos se ejecutan uno después de otro. Esto es distinto de seleccionar solamente un caso por su ID.

### Ver resultados y conservar evidencias

Después de cualquier selección:

```powershell
# Guardar la corrida antes de que otra ejecución reemplace el reporte
npm run test:e2e:summary

# Abrir el reporte HTML de la última corrida
npm run test:e2e:pw:report

# Abrir la interfaz interactiva para seleccionar y ejecutar casos
npm run test:e2e:pw:ui
```

Si se ejecuta un solo caso, el reporte y el resumen muestran únicamente ese caso. No presentarlo como una ejecución de los 27. Archivar cada corrida que se quiera conservar antes de iniciar la siguiente.

Para desarrollo rápido en PowerShell: `npx playwright test --grep '@reservas' --grep-invert '@lento'`. Esa ejecución **no** demuestra expiración. La corrida final debe incluir `@lento`, que espera cinco minutos reales más el ciclo del cron. No altera el reloj del backend.

## Datos y limpieza

La fixture crea, mediante API administrativa, un complejo y cancha exclusivos `EC3-Reservas-<marca temporal>-<worker>`, tarifa Bs 100/h y horario 08:00–23:00 todos los días. Son preparación del entorno; **no cuentan como pruebas de Crear de Marcelo**. Utiliza fecha actual de Bolivia + 2 días. Si el login responde 429, espera 61 segundos y reintenta una sola vez esa precondición; no se desactiva el límite ni se reintenta un caso fallido.

Cada test registra las reservas creadas por su página. Al finalizar rechaza comprobantes sintéticos aún pendientes y cancela únicamente sus reservas aún activas, sin borrar historial. Al terminar el worker deshabilita su cancha. Conserva complejo, pagos sintéticos, reservas y eventos para auditoría; pueden aparecer en reportes del entorno. No usar producción. Si el proceso se interrumpe, revisar `test-results/datos-EC3-*.json` y liberar únicamente los registros identificados de esa ejecución.

El comprobante PNG es sintético, no representa dinero transferido. Los tests de estados que validan pagos generan movimientos de prueba. La limpieza cancela reservas pero no inventa devoluciones financieras.

Cada worker usa sus propios datos; un único worker evita conflictos iniciales. Las sesiones quedan en memoria y no se guardan en el repositorio. Las trazas pueden incluir tokens de sesión: conservarlas localmente y revisar su contenido antes de compartirlas.

## Clasificación y evidencia

- `@ui`: acciones del navegador contra el sistema real. Algunas verificaciones auxiliares consultan la API para confirmar persistencia.
- `@api`: pruebas funcionales complementarias de entradas o eventos inaccesibles en UI; no se presentan como E2E de navegador.
- `@lento`: vencimiento real y comprobación de no expiración de Pendiente.
- Login y altas de fixture son precondiciones, no casos adicionales contabilizados.

Los screenshots de éxito se adjuntan explícitamente; fallos guardan captura y traza. Reporte HTML: `playwright-report/index.html`; resultados estructurados: `test-results/results.json`. `npm run test:e2e:summary` archiva ambas carpetas bajo `ec3-artifacts/<fecha>/` y escribe un resumen en `docs/ec3/mateo/resultado-ultima-ejecucion.md` del workspace. Ejecutarlo después de cada corrida que deba conservarse y antes de otra ejecución.

`e2e/tsconfig.json` comprueba únicamente la suite. El runner de Angular incluye `src/**/*.ts`, por lo que no recoge estos tests externos a `src`.

## Alcance compartido

Mateo cubre el selector de reserva y estados. El recorrido activo va de `/court-detail/:id` directamente a `/payment`; `/booking-flow` es una ruta heredada que no se usa en ese recorrido. Los formularios y límites de comprobantes, pago total y anulación detallada corresponden a Ostin; Crear Cancha/Complejo y decisión, a Marcelo.

Los tests TE-01 a TE-05 reutilizan acciones de pago/anulación para verificar transiciones, sin sustituir la matriz EP/BVA de Ostin. Diseño y cobertura: [documento de Mateo](../../docs/ec3/mateo/diseno-y-cobertura.md).
