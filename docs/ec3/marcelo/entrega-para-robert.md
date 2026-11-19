# Entrega técnica para el informe EC3

## Resultado comprobado

El bloque de Crear Complejo, Crear Cancha y decisión de confirmación de reserva se ejecutó con Playwright el 18/11/2026 a las 23:44:18, hora de Bolivia. La corrida 2026-11-19T03-44-18-336Z contiene 153 casos: 153 aprobados, cero fallidos y cero omitidos, con duración aproximada de nueve minutos. No se suman las repruebas ni los diagnósticos a ese total.

| Bloque | Ejecutados | Aprobados | Fallidos |
| --- | --- | --- | --- |
| Crear Complejo | 62 | 62 | 0 |
| Crear Cancha y portada | 87 | 87 | 0 |
| Decisión de confirmación | 4 | 4 | 0 |
| Total | 153 | 153 | 0 |

De estos, 67 recorren navegador y sistema real; 86 son pruebas funcionales complementarias por API. Estas últimas permiten enviar entradas que maxlength o los selectores no producen. No se presentan los 153 como E2E exclusivamente de navegador.

## Diseño y trazabilidad

[La matriz EP/BVA](diseno-y-cobertura.md) incluye base válida, campo sustituido, ID, canal y expectativa; el código conserva los IDs originales del Word y documenta sus correcciones. Los datos se aíslan por complejo e IDs propios. La verificación positiva consulta persistencia; la negativa comprueba ausencia de registros parciales propios. Las portadas se retiran después de verificarlas y los registros se desactivan para no contaminar nuevas pruebas.

[La tabla de decisión](tabla-de-decision.md) conserva cancha activa, horario disponible y anticipo validado, evaluados en etapas del flujo hasta CONFIRMED. Tiene cuatro reglas ejecutables: impedir solicitud por cancha inactiva, impedir por conflicto, mantener comprobante pendiente y confirmar tras validación. La tabla teórica de ocho combinaciones no se confunde con ocho ejecuciones; se explican las combinaciones no alcanzables.

## Evidencia para la sección de ejecución

- [Reporte por ID de la corrida integral](resultado-corrida-integral.md).
- [Captura del resumen de Playwright](evidencias/2026-11-19T03-44-18-336Z/reporte-resumen.png).
- [Carpeta de capturas de la corrida](evidencias/2026-11-19T03-44-18-336Z).
- [HTML archivado](../../../ec3-artifacts/2026-11-19T03-44-18-336Z/playwright-report/index.html).
- [Resultados y metadatos](../../../ec3-artifacts/2026-11-19T03-44-18-336Z/resumen.json).

Abrir el HTML con `npx playwright show-report ec3-artifacts/2026-11-19T03-44-18-336Z/playwright-report` desde el frontend. Si se ejecuta otro subconjunto, el reporte actual cambiará, pero el archivado permanece. Revisar las trazas antes de compartirlas: pueden contener sesiones.

En el título histórico de FILE6/FILE7 de esta corrida aparece “0 bytes”: era el valor centinela para generar imágenes JPEG/WebP mediante canvas, no el tamaño enviado. El código generó archivos reales, verificó previsualización y persistencia; el texto del título ya se corrigió a “generada”. Se conserva el reporte histórico sin editar sus resultados.

## Interpretación

El resultado demuestra cumplimiento de las expectativas explicitadas para los casos seleccionados, no ausencia absoluta de defectos. La ejecución detectó y permitió corregir el cierre indebido del modal de Cancha al guardar entradas inválidas. Se mantienen documentadas diferencias UI/API y conversiones de tipos del servidor; las pruebas de caracterización describen ese contrato sin declararlo una política de validación ideal.

Otro diagnóstico mostró degradación del listado al acumular portadas sintéticas grandes. Se ajustó la limpieza y la consulta de evidencia por registro/complejo propio. No se presenta esa mejora de la suite como reparación del rendimiento del listado de producción. Ver [hallazgos e interpretación](defectos-y-observaciones.md).

## Conclusiones y lecciones aprendidas

Las particiones de equivalencia ayudaron a separar entradas aceptadas, rechazadas y transformadas. BVA 3 permitió verificar puntos cercanos a las fronteras de longitud, precio y tamaño de imagen; un atributo del HTML o un decorador aislado no bastó para predecir el resultado de todo el sistema. La tabla de decisión obligó a definir cuándo se evalúa cada condición y a evitar escenarios de pago que no pueden existir si la reserva fue rechazada antes.

La calidad de la automatización depende de oráculos claros, datos aislados y evidencia reproducible. Registrar IDs propios y limpiar portadas evitó que una prueba alterara el comportamiento de las siguientes. Separar diseños, diagnósticos y corrida final permitió conservar los fallos encontrados sin falsear el conteo de ejecución.

## Integración del informe del equipo

Robert debe integrar este bloque con pagos/anulación y transiciones, incorporar la portada institucional y exportar el PDF obligatorio. [Los diagramas del bloque](diagramas.md) están contrastados con las entidades y el esquema local; no certifican una inspección nueva de toda la base desplegada. La suite completa del repositorio descubre 188 casos; esta entrega ejecutó los 153 de altas/decisión, no vuelve a acreditar los 35 de otros bloques.

Validación técnica adicional: TypeScript de E2E y build Angular aprobados. El build mantiene una advertencia preexistente de Sass @import. Cambios locales, sin commit ni publicación remota en esta tarea.
