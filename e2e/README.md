# EC3 — Guía de ejecución de todas las pruebas del equipo

Pruebas funcionales de caja negra de reserva del cliente, pagos, anulación, transiciones, Crear Complejo, Crear Cancha y tabla de decisión. Se utilizan las cuentas demo desde el login, frontend y backend reales. Actualización: 20/11/2026.

## Ejecutar todo el equipo, incluida la parte de Marcelo

Con backend y frontend encendidos y `.env.e2e` configurado según la preparación de abajo, ejecutar desde el frontend:

```powershell
cd "C:\Users\Mateo\Documents\Mateo Tareas\Calidad\FrontCanchasDeportivas"

# Comprobar tipos y listar el inventario sin ejecutar casos
npm run test:e2e:typecheck
npm run test:e2e:pw -- --list --reporter=list

# Ejecutar las 216 pruebas: Mateo + Ostin + Marcelo
npm run test:e2e:pw

# Cuando termine, conservar resultados y capturas antes de otra corrida
npm run test:e2e:summary:equipo
npm run test:e2e:summary:administracion
npm run test:e2e:summary:pagos

# Abrir el reporte HTML: aprobadas, fallidas, omitidas y adjuntos
npm run test:e2e:pw:report
```

Los comandos `summary` se ejecutan después de que Playwright termine, incluso si hubo casos fallidos. No ejecutan pruebas: leen y archivan el reporte existente. El resumen de administración extrae los casos de Marcelo de la misma corrida; el de pagos extrae los de Ostin. No sumar esos subconjuntos al total del equipo.

| Responsable / alcance | Casos | Comando |
| --- | ---: | --- |
| Mateo: formulario de reserva | 21 | `npm run test:e2e:reservas:formularios` |
| Mateo: transiciones de estados | 6 | `npm run test:e2e:reservas:estados` |
| Ostin: pagos, comprobantes, motivos y anulación | 36 | `npm run test:e2e:pagos-anulacion` |
| Marcelo: Crear Complejo | 62 | `npm run test:e2e:complejos` |
| Marcelo: Crear Cancha, incluida portada | 87 | `npm run test:e2e:canchas` |
| Marcelo: tabla de decisión | 4 | `npm run test:e2e:decision` |
| **Marcelo completo (subtotal)** | **153** | `npm run test:e2e:administracion` |
| **Equipo completo** | **216** | `npm run test:e2e:pw` |

Inventario comprobado el 20/11/2026 con `--list`. Estos números indican casos disponibles, no resultados de una nueva corrida. Como referencia, la corrida conjunta anterior duró aproximadamente 29 minutos; la duración puede variar. Incluye TE-06, que espera el vencimiento real durante unos 5–6 minutos. No cerrar la terminal durante esa espera.

`test:e2e:reservas` selecciona reservas y pagos/anulación; **no incluye las altas ni la tabla de decisión de Marcelo**. Para todo el equipo usar `test:e2e:pw`.

## Preparación

1. Instalar dependencias con `npm ci` en frontend y backend.
2. Levantar backend con su configuración habitual: `npm run start:dev`.
3. Levantar frontend: `npm start` (API configurada en `src/environments/environment.ts`).
4. Copiar `.env.e2e.example` a `.env.e2e`; comprobar URLs y colocar `E2E_RUN=true` para el entorno elegido.
5. Tener Chrome instalado (`E2E_CHANNEL=chrome`) o Edge (`msedge`). La suite no requiere descargar Chromium si se utiliza uno de ellos.

Se usa Node 22 y su cargador nativo de `.env`. No sobrescribir un `.env.e2e` ya configurado. Si PowerShell bloquea `npm.ps1` o `npx.ps1`, usar `npm.cmd` y `npx.cmd` en los mismos comandos.

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
| Pagos y comprobantes | Ver los 36 IDs y su trazabilidad en [diseño](../docs/ec3/ostin/diseno-y-cobertura.md). |
| Anulación y motivos | Incluidos en el mismo diseño; comandos por bloque al final de esta guía. |

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

# Pagos y anulación de Ostin
npm run test:e2e:pagos-anulacion

# Todos los casos etiquetados como reservas, incluidos pagos y anulación
npm run test:e2e:reservas
```

### Todas las pruebas Playwright del proyecto

```powershell
npm run test:e2e:pw
```

Este comando descubre todos los archivos de pruebas dentro de `e2e`, incluidos reservas, pagos/anulación, altas y decisión. Consultar el total actual con `npx playwright test --list --reporter=list`. No ejecuta las pruebas unitarias de Angular ni las de Jest del backend.

### Parte de Marcelo: Crear Complejo, Crear Cancha y decisión

```powershell
# Un caso individual
npm run test:e2e:pw -- --grep 'EP-F07-001 '
npm run test:e2e:pw -- --grep 'EP-F08-001 '
npm run test:e2e:pw -- --grep 'BVA-F08-FILE2 '
npm run test:e2e:pw -- --grep 'TD-RS4 ' --headed

# Bloques por separado
npm run test:e2e:complejos
npm run test:e2e:canchas
npm run test:e2e:decision

# Altas de ambas tablas / bloque completo con decisión
npm run test:e2e:altas
npm run test:e2e:administracion

# Conservar la corrida de este bloque
npm run test:e2e:summary:administracion

# Tras ejecutar toda la suite, conservar el reporte del equipo
npm run test:e2e:summary:equipo
```

Diseño y evidencia de este bloque en [entrega de altas y decisión](../docs/ec3/marcelo/README.md). Los comandos no utilizan nombres de integrantes. La limpieza retira las imágenes sintéticas propias después de verificar su persistencia y conserva los registros desactivados. Las consultas de verificación de canchas se limitan al complejo propio para evitar descargar todas las portadas del sistema.

La configuración utiliza **un worker**, por lo que los casos se ejecutan uno después de otro. Esto es distinto de seleccionar solamente un caso por su ID.

### Ver resultados y conservar evidencias

Después de ejecutar toda la suite (para una selección individual, archivar con `summary:equipo`, que conservará solo los casos de esa corrida):

```powershell
# Guardar todos los casos de la corrida actual
npm run test:e2e:summary:equipo

# Extraer los subconjuntos si participaron en esa corrida
npm run test:e2e:summary:administracion
npm run test:e2e:summary:pagos

# Abrir el reporte HTML de la última corrida
npm run test:e2e:pw:report

# Abrir la interfaz interactiva para seleccionar y ejecutar casos
npm run test:e2e:pw:ui
```

Destinos de los resúmenes, relativos a `FrontCanchasDeportivas`:

| Comando | Documento generado | Selección |
| --- | --- | --- |
| `test:e2e:summary:equipo` | `../docs/ec3/equipo/resultado-ultima-ejecucion.md` | Todos los casos de la corrida fuente |
| `test:e2e:summary:administracion` | `docs/ec3/marcelo/resultado-ultima-ejecucion.md` | Solo `@altas` o `@decision` |
| `test:e2e:summary:pagos` | `docs/ec3/ostin/resultado-ultima-ejecucion.md` | Solo `@ostin` |

El archivo completo queda en `ec3-artifacts/<fecha>/`. Su HTML conserva el reporte fuente completo. Los metadatos `resumen.json`, `resumen-administracion.json` y `resumen-pagos.json` guardan los conteos correspondientes sin reemplazarse entre sí. El comando antiguo `test:e2e:summary` escribe en la carpeta de Mateo y no filtra sus casos; para la entrega conjunta usar los comandos explícitos de esta tabla.

Si se ejecuta un solo caso, el reporte y el resumen muestran únicamente ese caso. No presentarlo como una ejecución de toda la suite. Archivar cada corrida que se quiera conservar antes de iniciar la siguiente.

Para desarrollo rápido en PowerShell: `npx playwright test --grep '@reservas' --grep-invert '@lento'`. Esa ejecución **no** demuestra expiración. La corrida final debe incluir `@lento`, que espera cinco minutos reales más el ciclo del cron. No altera el reloj del backend.

## Datos y limpieza

La fixture crea, mediante API administrativa, un complejo y cancha exclusivos `EC3-Reservas-<marca temporal>-<worker>`, tarifa Bs 100/h y horario 08:00–23:00 todos los días. Son preparación del entorno; **no cuentan como pruebas de Crear de Marcelo**. Utiliza fecha actual de Bolivia + 2 días. Si el login responde 429, espera 61 segundos y reintenta una sola vez esa precondición; no se desactiva el límite ni se reintenta un caso fallido.

Cada test registra las reservas creadas por su página. Al finalizar rechaza comprobantes sintéticos aún pendientes y cancela únicamente sus reservas aún activas, sin borrar historial. Al terminar el worker deshabilita su cancha. Conserva complejo, pagos sintéticos, reservas y eventos para auditoría; pueden aparecer en reportes del entorno. No usar producción. Si el proceso se interrumpe, revisar `test-results/datos-EC3-*.json` y liberar únicamente los registros identificados de esa ejecución.

El comprobante PNG es sintético, no representa dinero transferido. Los tests de estados que validan pagos generan movimientos de prueba. La limpieza cancela reservas pero no inventa devoluciones financieras.

Cada worker usa sus propios datos; un único worker evita conflictos iniciales. Las sesiones quedan en memoria y no se guardan en el repositorio. Las trazas pueden incluir tokens de sesión: conservarlas localmente y revisar su contenido antes de compartirlas.

## Clasificación y evidencia

- `@ui`: acciones del navegador contra el sistema real. Algunas verificaciones auxiliares consultan la API para confirmar persistencia.
- `@api`: pruebas funcionales complementarias de entradas o eventos inaccesibles en UI; no se presentan como E2E de navegador.
- `@ostin`: comprobantes, validación de anticipos, pago final y anulación.
- `@lento`: vencimiento real y comprobación de no expiración de Pendiente.
- Login y altas de fixture son precondiciones, no casos adicionales contabilizados.

Los screenshots de éxito se adjuntan explícitamente; fallos guardan captura y traza. Reporte HTML: `playwright-report/index.html`; resultados estructurados: `test-results/results.json`. `npm run test:e2e:summary:equipo` archiva ambas carpetas bajo `ec3-artifacts/<fecha>/` y escribe el resumen del equipo en la ubicación indicada arriba. Ejecutarlo después de cada corrida que deba conservarse y antes de otra ejecución.

`e2e/tsconfig.json` comprueba únicamente la suite. El runner de Angular incluye `src/**/*.ts`, por lo que no recoge estos tests externos a `src`.

## Alcance compartido

Mateo cubre el selector de reserva y estados. El recorrido activo va de `/court-detail/:id` directamente a `/payment`; `/booking-flow` es una ruta heredada que no se usa en ese recorrido. Los formularios y límites de comprobantes, pago total y anulación detallada corresponden a Ostin; Crear Cancha/Complejo y decisión, a Marcelo.

Los tests TE-01 a TE-05 reutilizan acciones de pago/anulación para verificar transiciones, sin sustituir la matriz EP/BVA de Ostin. Diseño de Ostin: [documento de diseño](../docs/ec3/ostin/diseno-y-cobertura.md). Diseño de Mateo: [documento de Mateo](../../docs/ec3/mateo/diseno-y-cobertura.md).

## Pagos y anulación actualizados

[Guía completa de pagos y anulación](../docs/ec3/ostin/README.md): 36 casos, con EP/BVA 3 de comprobantes, motivos, monto y método. Ejecutar `npm run test:e2e:pagos-anulacion`; archivar con `npm run test:e2e:summary:pagos`. Para toda la suite usar `npm run test:e2e:pw` y `npm run test:e2e:summary:equipo`.
