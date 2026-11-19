# Crear Complejo Crear Cancha y decisión de reservas

Este bloque entrega el diseño y automatización de F07/F08, y la tabla de decisión del flujo de cliente hasta confirmar la reserva mediante anticipo validado. Responsable del reparto: Marcelo. Los comandos usan nombres funcionales, sin nombres de personas.

**Corrida integral del 18/11/2026: 153 aprobadas, 0 fallidas y 0 omitidas, en aproximadamente 9 minutos.** [Resultados por caso](resultado-corrida-integral.md) · [Captura del reporte](evidencias/2026-11-19T03-44-18-336Z/reporte-resumen.png).

## Resultado más reciente

En la corrida conjunta del 19/11/2026 (`2026-11-19T04-10-41-965Z`), este bloque obtuvo **153 aprobadas, 0 fallidas y 0 omitidas**. Es un subconjunto de las 216 pruebas aprobadas del equipo, no una nueva ejecución. [Resultados y capturas de esta corrida](resultado-corrida-equipo.md).

El comando `npm run test:e2e:summary:administracion` ahora escribe en esta carpeta y selecciona solo altas y decisión, incluso si el reporte fuente incluye todo el equipo. Conserva sus metadatos en `resumen-administracion.json`, sin reemplazar el resumen global. El HTML archivado muestra todos los casos del reporte fuente.

## Inventario de ejecución

| Bloque | Casos diseñados y automatizados |
| --- | --- |
| Crear Complejo | 62 |
| Crear Cancha incluida portada | 87 |
| Decisión de confirmación | 4 |
| Total del bloque | 153 |

Son 67 casos de navegador/sistema real y 86 complementarios de API. Los aprobados y fallidos se toman del reporte identificado, no de esta tabla de inventario.

## Material para Robert

- [Diseño EP y BVA 3 con casos](diseno-y-cobertura.md).
- [Tabla de decisión, reglas alcanzables y casos](tabla-de-decision.md).
- [Resultados reales de la última corrida](resultado-ultima-ejecucion.md).
- [Defectos, correcciones e interpretación](defectos-y-observaciones.md).
- [Diagramas y validación técnica](diagramas.md).
- [Texto y conclusiones para el informe](entrega-para-robert.md).

## Ejecutar desde el frontend

Backend y frontend deben estar encendidos; `.env.e2e` debe apuntar al entorno autorizado y contener `E2E_RUN=true`. Se usan las cuentas demo mediante los botones de inicio de sesión. Preparación general en [guía Playwright](../../../e2e/README.md).

```powershell
cd "C:\Users\Mateo\Documents\Mateo Tareas\Calidad\FrontCanchasDeportivas"

# Un caso: sustituir el ID por otro de la matriz
npm run test:e2e:pw -- --grep 'EP-F07-001 '
npm run test:e2e:pw -- --grep 'BVA-F08-FILE2 ' --headed
npm run test:e2e:pw -- --grep 'TD-RS4 '

# Un bloque
npm run test:e2e:complejos
npm run test:e2e:canchas
npm run test:e2e:decision

# Crear de ambas tablas
npm run test:e2e:altas

# Toda esta parte: altas y decisión
npm run test:e2e:administracion

# Archivar la corrida de esta parte antes de ejecutar otra
npm run test:e2e:summary:administracion
npm run test:e2e:pw:report

# Todas las pruebas Playwright del equipo
npm run test:e2e:pw
npm run test:e2e:summary:equipo
```

El filtro se aplica sobre un título que también incluye archivo y proyecto: no anteponer `^` al ID. Para comprobar la selección sin ejecutar: agregar `-- --list --reporter=list` al comando de un bloque. Hay un worker y no se reintentan automáticamente casos fallidos. El reintento único de login ante 429 es preparación, no una repetición de la prueba.

Un resultado de un caso individual no demuestra el total del bloque. El reporte y JSON de Playwright se reemplazan con la siguiente corrida; el comando de resumen conserva ambos bajo `ec3-artifacts/<fecha>/` y copia las capturas a esta carpeta. Las trazas pueden incluir tokens y se conservan localmente.

## Datos y alcance

Las altas se desactivan por sus IDs, conservando el historial. Después de verificar persistencia y adjuntar evidencia se retiran las portadas sintéticas de las canchas propias, evitando acumular megabytes en los listados. El manifiesto `test-results/datos-EC3-Altas-*.json` identifica el complejo de preparación y si se completó su limpieza. Ante interrupción, revisar esos IDs y los adjuntos `registros-propios`; no limpiar por nombres genéricos ni borrar datos ajenos.

Las pruebas UI recorren navegador, backend y persistencia reales. Las API son complementarias de caja negra para entradas que el formulario no puede producir o límites exclusivos del contrato HTTP. No se presentan como E2E de navegador ni como pruebas unitarias. El informe final del equipo aún debe integrar pagos, transiciones, portada institucional y conclusiones generales.
