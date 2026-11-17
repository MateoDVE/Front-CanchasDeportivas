# EC3 — Guía operativa completa con Playwright

**Proyecto:** SportReserva  
**Herramienta acordada:** Playwright Test + TypeScript  
**Entrega:** 20/11/2026; hora por confirmar  
**Documento relacionado:** [Plan de trabajo y reparto](EC3-plan-de-trabajo-y-reparto.md)

Esta guía detalla el plan de trabajo del equipo. Las casillas son una lista de control, no evidencia de resultados. Los comandos y la configuración de ejemplo representan la propuesta inicial; consultar las actualizaciones y los archivos implementados para conocer el estado vigente.

**Actualización de la parte de Mateo (17/11/2026):** se implementó la configuración y una suite de 27 casos para la reserva del cliente y estados. El avance y las ejecuciones reales se documentan en [diseño y cobertura de Mateo](ec3/mateo/diseno-y-cobertura.md), [resultados de la última corrida](ec3/mateo/resultado-ultima-ejecucion.md) e [insumos para Robert](ec3/mateo/entrega-para-robert.md). Las listas generales siguientes se conservan como guía y no acreditan la ejecución de los bloques de Ostin/Marcelo/Robert. El archivo real `playwright.config.ts` prevalece sobre el ejemplo inicial: utiliza Chrome instalado y permite elegir Edge.

## 1. Resultado que debe producir el equipo

Al terminar deben existir cinco entregables concretos:

| Entregable | Contenido | Cómo comprobar que está completo |
| --- | --- | --- |
| Sistema | Reserva, pago total y anulación; creación de Cancha/Complejo | El recorrido funciona en el entorno declarado |
| Diseño | EP/BVA por formulario, estados y decisión | Todos los requisitos tienen casos y resultados esperados |
| Suite Playwright | Pruebas ejecutables con datos controlados | Otro compañero puede ejecutarlas siguiendo el README |
| Evidencias | Reportes, capturas, resultados y defectos | Cada resultado corresponde a una ejecución identificada |
| Informe PDF | Ocho apartados del enunciado | Archivo revisado visualmente y enlaces accesibles |

No se necesita una suite adicional dedicada a pruebas de integración para satisfacer el enunciado compartido. Las pruebas funcionales de extremo a extremo serán la evidencia central. Las pruebas existentes de otros niveles no se contabilizan automáticamente como casos de EC3.

## 2. Organización del trabajo y dependencias

Equipo confirmado: Mateo, Ostin, Marcelo y Robert. Robert se encarga de la documentación; la implementación y ejecución de pruebas se reparten entre los otros tres.

| Integrante | Bloque principal | También entrega |
| --- | --- | --- |
| Mateo | Reserva, configuración compartida de Playwright y transición de estados | EP/BVA de reserva, casos TE, tests, evidencias y ejecución consolidada |
| Ostin | Comprobantes, validación, pago total y anulación | EP/BVA aplicable, tests, evidencias y reglas financieras |
| Marcelo | Crear Complejo, Crear Cancha y tabla de decisión | EP/BVA, casos TD, tests, evidencias y validación técnica de diagramas |
| Robert | Documentación completa del EC3 | Redacción, diagramas, tablas de casos, trazabilidad, evidencias comentadas, anexos y PDF final |

Mateo, Ostin y Marcelo diseñan y automatizan sus casos y entregan a Robert los datos técnicos y evidencias. Robert redacta y consolida el informe; no tiene asignada programación de tests. Todos revisan la exactitud de su parte antes de entregar.

Orden de dependencias:

1. Todos cierran reglas y alcance.
2. Mateo prepara la suite mínima; Ostin y Marcelo inventarían formularios y diseñan casos. Robert prepara la estructura del informe y las plantillas.
3. Se revisan los diseños cruzados: Mateo y Ostin revisan sus bloques; Mateo revisa el de Marcelo. Robert comprueba trazabilidad y presentación.
4. Mateo, Ostin y Marcelo automatizan sus bloques con las convenciones acordadas.
5. Se ejecuta la suite unificada y se corrigen problemas.
6. Se consolida el PDF con resultados reales.
7. Se verifica la entrega y se ensaya la defensa.

## 3. Fase 1 — Acordar exactamente qué se probará

**Responsables: todos. Producto: alcance y catálogo de reglas.**

- [ ] Elegir el recorrido principal: cliente, reserva manual o ambos.
- [ ] Enumerar todas las pantallas/formularios que atraviesa ese recorrido.
- [ ] Definir si login es una precondición o un formulario incluido en el diseño; no omitirlo silenciosamente si forma parte del proceso elegido.
- [ ] Escribir cómo se obtiene el precio total.
- [ ] Escribir cómo se registra y valida el anticipo.
- [ ] Precisar si el pago total se alcanza con anticipo + saldo o si se comprometió también pago único del 100%.
- [ ] Definir qué rol valida, cobra y anula.
- [ ] Definir en qué estados se permite anular.
- [ ] Definir qué ocurre con el horario y el dinero al anular.
- [ ] Definir el punto exacto de la tabla de decisión y el significado de sus tres condiciones.
- [ ] Contrastar el modelo de estados con el recorrido real.
- [ ] Registrar desacuerdos entre requisitos, documentación y aplicación, y resolverlos antes de fijar expectativas.

La documentación existente indica que Temporal expira si no se presenta comprobante; Pendiente de validación ya no sigue ese vencimiento inicial. También distingue anticipo confirmado y pago total. No diseñar pruebas suponiendo lo contrario sin un cambio de requisito acordado.

Formato del catálogo:

| Regla | Descripción exacta | Fuente | Pantalla/acción | Resultado esperado | Estado de revisión |
| --- | --- | --- | --- | --- | --- |
| RN-EC3-001 | Completar con el acuerdo | Enunciado/regla documentada/acuerdo | Completar | Completar | Pendiente |

**Terminado cuando:** no existen alternativas ambiguas como “confirmar o mantener pendiente” en los resultados de los casos que se van a implementar.

## 4. Fase 2 — Levantar campos y diseñar casos

**Responsables técnicos: Mateo, Ostin y Marcelo según su formulario. Robert prepara el formato e incorpora las matrices al informe. Producto: matriz de campos, particiones, fronteras y casos.**

### 4.1 Inventario obligatorio por formulario

Registrar:

- Nombre, ruta y rol que lo utiliza.
- Campos visibles, campos calculados y controles de selección.
- Obligatoriedad y tratamiento de vacío/espacios.
- Tipo de dato, formato, precisión y unidades.
- Mínimos/máximos de longitud, monto, duración o tamaño, cuando existan.
- Opciones válidas y relaciones entre campos.
- Dependencias: complejo, cancha, horarios, sesión y estado de reserva.
- Acción de envío, mensaje de éxito/error y lugar donde se verifica el registro.

No inventar campos ni límites para completar la matriz. Si un campo no existe, no se diseña una prueba de navegador para él.

### 4.2 EP por campo

- [ ] Separar clases válidas e inválidas según las reglas.
- [ ] Elegir un representante de cada clase.
- [ ] Cubrir vacío si el campo es obligatorio.
- [ ] Cubrir formato inválido si tiene restricción de formato.
- [ ] Cubrir relaciones incompatibles cuando correspondan.
- [ ] Explicar por qué los valores de una clase deben producir el mismo comportamiento.
- [ ] Preparar un caso base válido y cambiar solo el campo evaluado en los casos negativos.

No usar espacios, caracteres especiales o duplicados como inválidos por defecto: primero confirmar que exista esa restricción.

### 4.3 BVA 3 por frontera

- [ ] Identificar cada frontera real.
- [ ] Definir la precisión: carácter, centavo, minuto, byte, etc.
- [ ] Probar anterior, frontera y posterior.
- [ ] Repetir para límite inferior y superior cuando ambos existan.
- [ ] Documentar resultados esperados por cada valor.
- [ ] Marcar BVA como no aplicable para dominios sin límites ordenados.

Ejemplo hipotético: longitud entre 3 y 50 → 2, 3, 4, 49, 50 y 51. No usar estos números en SportReserva hasta verificar la regla del campo.

Si la interfaz impide escribir un valor fuera de rango, comprobar ese bloqueo como comportamiento de interfaz. No afirmar que el backend recibió ese valor. Un caso funcional de API puede complementar esa frontera, identificado como tal; no se exige crear por ello una suite de integración.

### 4.4 Cada caso debe tener

ID, regla, técnica, clase/frontera, rol, precondiciones, datos exactos, pasos, resultado esperado observable, responsable, revisor y referencia de automatización. El resultado obtenido se llena después de ejecutar.

**Terminado cuando:** cada campo tiene cobertura justificada y cada caso se puede ejecutar sin tener que adivinar datos o resultados.

## 5. Fase 3 — Preparar Playwright

**Responsable inicial: Mateo, con revisión técnica de Ostin. Robert incorpora las instrucciones verificadas al informe. Ubicación propuesta: repositorio `FrontCanchasDeportivas`.**

Esta ubicación permite mantener la suite junto a la aplicación web. El backend seguirá siendo una dependencia real del entorno. En la revisión preliminar se localizaron tests E2E de Jest en el backend, pero no una configuración Playwright; esto no constituye una auditoría completa de las pruebas existentes.

### 5.1 Instalación propuesta

Desde la carpeta del frontend, verificar Node/npm y ejecutar:

```powershell
node --version
npm --version
npm install -D @playwright/test
npx playwright install chromium
```

Verificar compatibilidad de la versión de Node instalada con la versión elegida de Playwright y guardar el lockfile. Usar Chromium como navegador inicial reduce variaciones; la consigna no exige tres navegadores. Más navegadores son una ampliación posterior, no sustituyen casos faltantes.

Referencia: [instalación oficial de Playwright](https://playwright.dev/docs/intro).

### 5.2 Archivos por crear

```text
FrontCanchasDeportivas/
  playwright.config.ts
  e2e/
    README.md
    fixtures/
    helpers/
    data/
    complejos.spec.ts
    canchas.spec.ts
    reservas-formularios.spec.ts
    reservas-pagos.spec.ts
    reservas-anulacion.spec.ts
    reservas-estados.spec.ts
    reservas-decision.spec.ts
  playwright-report/        # Generado
  test-results/             # Generado
```

- [ ] Separar la búsqueda de archivos de Playwright de los tests unitarios de Angular.
- [ ] Revisar las inclusiones/exclusiones de TypeScript y del runner unitario para evitar que recojan `e2e/*.spec.ts`.
- [ ] Añadir scripts sin reemplazar los scripts de pruebas existentes.
- [ ] Documentar variables, arranque del sistema y preparación de datos en `e2e/README.md`.
- [ ] Excluir del control de versiones sesiones autenticadas y secretos.
- [ ] Definir dónde archivar reportes de entrega; no sobrescribir la evidencia final con la siguiente corrida.

Scripts propuestos para incorporar al `package.json`:

```json
{
  "test:e2e:pw": "playwright test",
  "test:e2e:pw:ui": "playwright test --ui",
  "test:e2e:pw:headed": "playwright test --headed",
  "test:e2e:pw:report": "playwright show-report"
}
```

### 5.3 Configuración inicial propuesta

Este ejemplo presupone que la aplicación ya está levantada. Confirmar URL, puertos y conectividad antes de ejecutar. `E2E_BASE_URL` debe apuntar al frontend del entorno de prueba.

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4200',
    timezoneId: 'America/La_Paz',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

Un solo worker reduce colisiones iniciales, pero no elimina la necesidad de datos independientes. `timezoneId` configura el navegador, no el reloj ni la zona horaria del backend. Las pruebas de expiración pueden requerir un timeout específico mayor que el general.

Fuentes: [configuración](https://playwright.dev/docs/test-configuration) y [reporters](https://playwright.dev/docs/test-reporters).

### 5.4 Sesiones y roles

- [ ] Preparar cuentas de prueba por rol y confirmar que pueden entrar.
- [ ] Mantener credenciales fuera de archivos versionados.
- [ ] Elegir login por prueba o estados de autenticación reutilizables.
- [ ] Si se usa `storageState`, crear un estado por rol y renovarlo cuando expire.
- [ ] Revisar cómo almacena realmente la sesión la aplicación; no asumir que todas las formas de almacenamiento se restauran automáticamente.
- [ ] Abrir contextos separados para cliente y secretaria en un mismo recorrido.
- [ ] No confundir una sesión válida con datos de negocio aislados: varias sesiones pueden modificar la misma reserva.

Los archivos de sesión pueden contener información que permite actuar como el usuario. No incluirlos en el repositorio ni en anexos públicos. Referencia: [autenticación en Playwright](https://playwright.dev/docs/auth).

### 5.5 Primer test técnico

Crear una prueba pequeña que abra la aplicación, entre con el rol elegido y compruebe un elemento estable de la pantalla inicial. Su función es validar el entorno; solo cuenta como caso EC3 si está vinculado a un requisito del alcance.

**Terminado cuando:** un compañero distinto puede ejecutar esa prueba y abrir el reporte siguiendo exclusivamente el README.

## 6. Fase 4 — Preparar datos reproducibles

**Responsables: Mateo, Ostin y Marcelo; Mateo coordina convenciones y Robert documenta el procedimiento.**

- [ ] Crear un identificador de ejecución, por ejemplo `EC3-20261119-01`.
- [ ] Usarlo en nombres de complejos/canchas de prueba cuando sea posible.
- [ ] Asignar horarios distintos a casos independientes.
- [ ] Preparar datos base: usuarios, complejo, cancha habilitada y horarios operativos.
- [ ] Preparar imágenes/comprobantes sintéticos válidos e inválidos según reglas reales.
- [ ] Definir cómo se preparan reservas en estados requeridos.
- [ ] Definir limpieza de los datos creados por la suite sin afectar otros registros.
- [ ] Evitar depender de datos que un compañero modifica durante la ejecución.
- [ ] Comprobar que la fecha elegida permite operar según la regla de negocio.

Preparar una reserva confirmada puede ser válido como precondición de una prueba de anulación. Pero para probar la transición a Confirmado, la prueba debe ejecutar la validación correspondiente; crear directamente el estado final no demuestra la transición.

**Terminado cuando:** cada prueba puede ejecutarse sola, repetir su ejecución y explicar el origen de sus datos.

## 7. Fase 5 — Automatizar cada bloque funcional

Las siguientes listas son criterios de trabajo. La cantidad definitiva de casos depende de los campos y reglas levantados; no se declara cobertura completa solo por implementar un ejemplo de cada lista.

### 7.1 Crear Complejo — integrante Marcelo

- [ ] Abrir el formulario con el rol autorizado.
- [ ] Crear con todos los datos válidos requeridos.
- [ ] Verificar mensaje de éxito y presencia del nuevo registro.
- [ ] Recargar o volver a consultar para comprobar persistencia.
- [ ] Ejecutar cada clase inválida y cada frontera aplicable de sus campos.
- [ ] Verificar el mensaje o bloqueo asociado al campo correcto.
- [ ] Comprobar que no se creó el registro ante entradas rechazadas.
- [ ] Cubrir archivos, contacto, ubicación y demás campos solo si existen en ese formulario.
- [ ] Adjuntar evidencia representativa de éxito y rechazo.

**Entregar:** matriz EP/BVA, `complejos.spec.ts`, evidencia y texto del informe.

### 7.2 Crear Cancha — integrante Marcelo

- [ ] Preparar un complejo válido como precondición.
- [ ] Abrir el formulario y completar los campos reales.
- [ ] Verificar asociación al complejo seleccionado.
- [ ] Crear y comprobar persistencia de los valores relevantes.
- [ ] Cubrir ausencia de selecciones obligatorias.
- [ ] Cubrir límites de nombre, tarifa y otros campos cuando estén definidos.
- [ ] Cubrir opciones del tipo de cancha y estado inicial conforme a la interfaz.
- [ ] Comprobar que errores de entrada no crean registros parciales.
- [ ] Si el alta incluye horarios u otros subformularios, incorporarlos al inventario.

**Entregar:** matriz EP/BVA, `canchas.spec.ts`, evidencia y actualización de diagramas si se detecta desalineación documental.

### 7.3 Formulario de reserva — integrante Mateo

- [ ] Seleccionar complejo/cancha y fecha de prueba.
- [ ] Consultar un horario realmente disponible.
- [ ] Seleccionar el intervalo permitido.
- [ ] Comprobar duración y total esperado con un cálculo independiente de los datos mostrados por la aplicación.
- [ ] Completar los datos solicitados para la modalidad elegida.
- [ ] Registrar y comprobar identificador, cancha, fecha, horario, importe y estado inicial.
- [ ] Ejecutar clases inválidas y BVA de todos los campos aplicables.
- [ ] Verificar cómo se impiden horarios ocupados, rangos incompatibles y selecciones incompletas.
- [ ] Evitar duplicados si el requisito contempla protección ante doble envío.
- [ ] Documentar por separado cualquier caso adicional de concurrencia; no declararlo cubierto con una ejecución secuencial.

**Entregar:** casos, `reservas-formularios.spec.ts`, datos preparados y explicación del proceso.

### 7.4 Comprobante y validación — integrante Ostin

- [ ] Partir de una reserva elegible.
- [ ] Presentar un comprobante sintético válido.
- [ ] Comprobar paso a Pendiente de validación cuando corresponda.
- [ ] Acceder como secretaria y localizar esa misma reserva.
- [ ] Validar y comprobar el efecto sobre el pago y la reserva.
- [ ] Ejecutar los casos de rechazo con motivo cuando sea obligatorio.
- [ ] Cubrir EP/BVA de importe, archivo y campos realmente editables.
- [ ] Distinguir registrar/subir un pago de validarlo.
- [ ] Verificar saldo y estado sin inferir un pago solo por existir un comprobante.

**Entregar:** casos y automatización con IDs que Mateo pueda reutilizar para transiciones y Marcelo para decisiones. Robert registra esas correspondencias.

### 7.5 Pago total — integrante Ostin

- [ ] Preparar una reserva con importe total conocido.
- [ ] Registrar/validar el anticipo conforme al flujo real.
- [ ] Verificar el saldo resultante.
- [ ] Registrar el saldo final con un método permitido.
- [ ] Comprobar que el importe reconocido como pagado alcanza el total y el saldo queda en cero.
- [ ] Cubrir monto insuficiente, exceso, vacío o formato incorrecto solo según campos y reglas existentes.
- [ ] Si se acordó pago único del 100%, diseñar y ejecutar ese recorrido adicional.
- [ ] No exigir que pagar cambie el estado de reserva si la regla separa cobro y autorización de ingreso.

Ejemplo de datos de prueba sujeto a tarifa configurada: total Bs 200, anticipo Bs 50, saldo Bs 150. El test debe comprobar esos valores calculados, no copiar el total de la interfaz y compararlo consigo mismo.

**Entregar:** recorrido completo de pago en `reservas-pagos.spec.ts`, evidencias y explicación de cálculos.

### 7.6 Anulación — integrante Ostin

- [ ] Preparar una reserva en cada estado desde el que esté permitido anular.
- [ ] Ejecutar la acción con un rol autorizado.
- [ ] Completar motivo o confirmación si se requieren.
- [ ] Comprobar estado Cancelado.
- [ ] Comprobar liberación del horario si así lo establece la regla.
- [ ] Comprobar el tratamiento de pagos según política; no suponer devolución automática.
- [ ] Comprobar que cerrar el diálogo sin confirmar no anula.
- [ ] Cubrir intentos no permitidos en estados o roles relevantes.
- [ ] Verificar que repetir una anulación no duplica efectos si ese intento es posible.

**Entregar:** `reservas-anulacion.spec.ts`, casos, evidencias y política aplicada.

### 7.7 Transición de estados — Mateo, con apoyo de Ostin

- [ ] Cerrar el diagrama con estados, eventos y condiciones reales.
- [ ] Incluir Temporal como origen de expiración si se mantiene el flujo documentado.
- [ ] Identificar transiciones válidas y acciones inválidas relevantes.
- [ ] Reutilizar los tests de Ostin que ya prueban validación/rechazo/anulación.
- [ ] Implementar los casos de estados que todavía no estén cubiertos.
- [ ] Para expiración, probar el vencimiento real del mecanismo que decide el estado.
- [ ] Verificar efectos observables como liberación del horario.
- [ ] Documentar el alcance si una acción inválida no puede intentarse desde la interfaz; comprobar su ausencia/bloqueo sin afirmar haber probado el rechazo del servidor.

**Entregar:** diagrama, tabla de transiciones, casos y `reservas-estados.spec.ts` para pruebas adicionales.

### 7.8 Tabla de decisión — Marcelo, con apoyo de Ostin

- [ ] Elegir una única operación y momento de evaluación.
- [ ] Definir cancha habilitada, disponibilidad y pago confirmado sin ambigüedad.
- [ ] Evaluar las ocho combinaciones teóricas de tres condiciones booleanas.
- [ ] Justificar combinaciones imposibles o irrelevantes.
- [ ] Reducir reglas equivalentes si procede.
- [ ] Conservar al menos tres combinaciones relevantes.
- [ ] Definir una acción exacta por regla.
- [ ] Preparar cada combinación de manera alcanzable.
- [ ] Automatizar cada regla relevante o vincular un test ya existente que la cubra completamente.

**Entregar:** tabla final, justificación, casos y `reservas-decision.spec.ts` para los que falten. La tabla provisional del plan anterior no debe copiarse como diseño final sin resolver sus acciones.

## 8. Cómo escribir cada prueba

Estructura recomendada:

1. Preparar datos y rol.
2. Abrir la pantalla.
3. Ejecutar la acción evaluada.
4. Comprobar el resultado esperado con aserciones.
5. Capturar la evidencia necesaria.
6. Limpiar los datos propios o registrar su conservación controlada.

Convenciones del equipo:

- ID al inicio del título: `EP-F07-001`, `BVA-F08-003`, `TE-002`, `TD-R1`.
- Preferir localizadores por rol, etiqueta o identificador estable.
- Evitar selectores dependientes del orden visual si hay una alternativa estable.
- Usar esperas por condiciones observables; no acumular pausas fijas para ocultar problemas.
- Usar `test.step` para pasos importantes de recorridos largos.
- Crear un test individual por fila de datos cuando se requiera contabilizar cada caso de forma separada.
- No colocar todos los casos en un único test gigante: un fallo impediría observar los posteriores.
- Compartir helpers para acciones repetidas, manteniendo visibles las aserciones específicas del caso.

Las capturas automáticas de la configuración propuesta se guardan solo ante fallos. Para el PDF también se necesitan capturas explícitas de éxitos representativos. Se pueden adjuntar al reporte mediante `testInfo.attach` usando una captura de `page.screenshot()`.

## 9. Fase 6 — Ejecutar y revisar resultados

**Responsable de la corrida unificada: Mateo. Ostin y Marcelo ejecutan y corrigen sus bloques. Robert consolida los resultados en la documentación.**

Una vez creados los scripts propuestos:

```powershell
# Ejecutar todo
npm run test:e2e:pw

# Ejecutar un archivo durante su desarrollo
npx playwright test e2e/complejos.spec.ts --project=chromium

# Localizar un caso por ID
npx playwright test --grep "EP-F07-001"

# Ver ejecución y abrir reporte
npm run test:e2e:pw:ui
npm run test:e2e:pw:report
```

### 9.1 Antes de la corrida completa

- [ ] Backend y frontend corresponden a versiones identificadas.
- [ ] Entorno y URL son correctos.
- [ ] Cuentas y datos de prueba están disponibles.
- [ ] No hay cambios simultáneos que alteren el escenario.
- [ ] La suite descubre todos los tests previstos.
- [ ] Los casos pendientes/omitidos están identificados.

### 9.2 Después de la corrida

- [ ] Guardar reportes y evidencias bajo un ID de ejecución.
- [ ] Registrar fecha/hora de Bolivia, versiones y comando.
- [ ] Contar casos ejecutados, aprobados, fallidos y omitidos/bloqueados por separado.
- [ ] Distinguir casos de intentos, reintentos y proyectos/navegadores.
- [ ] Clasificar cada fallo: producto, prueba, datos o entorno.
- [ ] Abrir defectos reproducibles con esperado, obtenido y evidencia.
- [ ] Corregir y repetir el caso afectado y los recorridos impactados.
- [ ] Conservar evidencia anterior y posterior cuando se informe una corrección.
- [ ] Ejecutar una corrida final coherente con la versión de entrega.

Un test que rechaza correctamente una entrada inválida es aprobado. No es necesario introducir fallos artificiales. Si se declara cero fallos, debe corresponder a una ejecución real y no ocultar casos omitidos.

Para investigar fallos, utilizar las trazas guardadas; permiten revisar acciones y estado de la página. Referencia: [Trace Viewer](https://playwright.dev/docs/trace-viewer).

**Terminado cuando:** los números del informe coinciden con los artefactos de la corrida y cada fallo tiene explicación.

## 10. Fase 7 — Redactar y construir el PDF

Mateo, Ostin y Marcelo entregan a Robert un paquete por bloque con:

1. Explicación técnica de su bloque para que Robert redacte la sección.
2. Tablas de diseño con IDs.
3. Referencias a tests y reglas.
4. Capturas seleccionadas y sus pies.
5. Resultados e interpretación.
6. Defectos, correcciones y limitaciones reales.

Robert es responsable de redactar y mantener todos los apartados, preparar los diagramas con validación técnica de Marcelo, incorporar evidencias y revisar el PDF. Puede comenzar portada, introducción, estructura y plantillas mientras se desarrollan las pruebas. Los resultados se completan únicamente al recibir evidencias reales.

### 10.1 Tareas específicas de Robert

- [ ] Reunir datos de portada y confirmar la hora de entrega.
- [ ] Crear la fuente editable del informe con los ocho apartados obligatorios.
- [ ] Definir una plantilla uniforme para EP, BVA, estados, decisiones y casos.
- [ ] Redactar introducción, objetivo y alcance acordado.
- [ ] Preparar el modelo relacional y diagramas de clases; pedir validación a Marcelo.
- [ ] Describir el proceso con los insumos de Mateo y Ostin.
- [ ] Incorporar las matrices EP/BVA de los tres responsables técnicos.
- [ ] Documentar el modelo y casos de estados proporcionados por Mateo.
- [ ] Documentar la tabla y casos de decisión proporcionados por Marcelo.
- [ ] Mantener la matriz requisito → caso → test → ejecución → evidencia.
- [ ] Revisar que los conteos del texto coincidan con el reporte de Mateo.
- [ ] Seleccionar capturas y agregar pies con ID, acción y resultado.
- [ ] Redactar la interpretación de resultados y solicitar explicación de cada fallo.
- [ ] Reunir aprendizajes de todos y redactar conclusiones basadas en evidencias.
- [ ] Preparar anexos y enlaces a repositorios, reportes e instrucciones.
- [ ] Exportar el PDF y revisar tablas, saltos, diagramas y enlaces.
- [ ] Enviar el borrador a los tres responsables para validar sus secciones.
- [ ] Corregir observaciones y preparar el PDF final para entrega.

Robert no necesita programar Playwright, modificar reglas del sistema ni resolver defectos. Si falta una prueba o evidencia, registra el pendiente y lo devuelve al responsable técnico.

### 10.2 Contenido por apartado

| Apartado | Trabajo concreto |
| --- | --- |
| Portada | Completar nombres, docente, asignatura, proyecto y fecha |
| Introducción | Explicar problema, usuarios y objetivo de calidad |
| Diseño inicial | Insertar modelo relacional y clases; explicar cambios si los hubo |
| Desarrollo | Describir roles, pasos, pago total y anulación con capturas útiles |
| Diseño de casos | Presentar EP/BVA por formulario, estados y decisión con justificaciones |
| Ejecución | Explicar entorno, herramienta, comando, versión, conteos, capturas y resultados |
| Conclusiones | Relacionar hallazgos reales con calidad, dificultades y aprendizajes |
| Anexos | Enlazar repositorios, reportes y matriz completa; agregar instrucciones |

Revisión del PDF:

- [ ] Tablas legibles y sin columnas cortadas.
- [ ] Diagramas legibles al tamaño normal de lectura.
- [ ] Capturas con contexto, ID y descripción.
- [ ] Numeración y referencias consistentes.
- [ ] Datos de portada completos.
- [ ] Sin resultados de ejemplo presentados como reales.
- [ ] Enlaces accesibles al docente.
- [ ] Sin credenciales o información personal innecesaria.
- [ ] Los ocho apartados están presentes.

**Terminado cuando:** otro compañero puede relacionar requisito, caso, test y evidencia leyendo el PDF y sus anexos.

## 11. Fase 8 — Entrega y defensa

- [ ] Guardar código, tests y documentación en control de versiones.
- [ ] Confirmar acceso del docente a los repositorios necesarios.
- [ ] Documentar cómo instalar dependencias, arrancar servicios y ejecutar la suite.
- [ ] Identificar la versión presentada y conservar el reporte asociado.
- [ ] Verificar descarga/apertura del PDF y reportes desde otra sesión o equipo cuando sea posible.
- [ ] Ensayar el proceso completo y la explicación de una prueba por técnica.
- [ ] Tener el reporte disponible localmente ante un problema de conexión.
- [ ] Entregar antes de la hora de cierre confirmada.

Cada integrante debe explicar qué probó, qué esperaba, qué ocurrió y cómo lo sabe. Todos deben entender la diferencia entre anticipo, pago total, estado de pago y estado de reserva.

## 12. Tablero resumido para copiar al grupo

| Trabajo | Responsable | Dependencia | Evidencia de finalización |
| --- | --- | --- | --- |
| Cerrar reglas y recorrido | Todos | Ninguna | Catálogo acordado |
| Configurar Playwright | Mateo | Entorno disponible | Primer test y README reproducible |
| Diseñar/automatizar reserva | Mateo | Reglas y suite mínima | Casos + tests + reporte |
| Diseñar/automatizar pagos y anulación | Ostin | Reglas y suite mínima | Casos + tests + reporte |
| Diseñar/automatizar Cancha y Complejo | Marcelo | Campos y suite mínima | Casos + tests + reporte |
| Estados | Mateo, apoyo de Ostin | Reglas cerradas | Modelo + casos TE + cobertura automatizada |
| Tabla de decisión | Marcelo, apoyo de Ostin | Reglas cerradas | Tabla + casos TD + cobertura automatizada |
| Preparar diagramas | Robert; Marcelo valida técnicamente | Versión de entrega | Diagramas legibles y consistentes |
| Corrida conjunta y defectos | Mateo coordina; Ostin y Marcelo apoyan | Bloques implementados | Reporte y registro de defectos |
| Entregar insumos técnicos | Mateo, Ostin y Marcelo | Diseño y ejecución de su bloque | Explicaciones, casos y evidencias para Robert |
| Redactar todos los apartados | Robert | Insumos técnicos disponibles | Borrador completo y revisado por el equipo |
| Consolidar PDF y trazabilidad | Robert | Aportes de todos | PDF revisado |
| Repositorios, entrega y ensayo | Todos | Suite y PDF finales | Acceso verificado y defensa preparada |

La prioridad inmediata es completar las fases 1 y 2 mientras Mateo prepara la fase 3. Después, cada integrante puede avanzar en su bloque sin esperar a que una sola persona termine toda la automatización.
