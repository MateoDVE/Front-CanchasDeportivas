# Hallazgos de las pruebas de altas y decisión

## D01 Cierre indebido de Nueva Cancha

En la ejecución diagnóstica, EP-F08-011 dejó el nombre vacío y pulsó Registrar Cancha. Se mostró el mensaje de campos requeridos, pero el formulario desapareció. El contenedor completo del modal era un botón con manejador de cierre; el clic del botón de guardar se propagaba a ese contenedor.

Se sustituyó el contenedor por un `div` con `role=dialog`, etiqueta accesible y clase `modal-box`, preservando el botón explícito de cierre. No se cambiaron validaciones ni reglas de precio. La reprueba EP-F08-011 comprobó que el error aparece y el formulario permanece abierto. Evidencia diagnóstica local: `FrontCanchasDeportivas/ec3-artifacts/diagnostico-interrumpido-altas-2026-11-18/test-results/`. Esa corrida se interrumpió al detectar los primeros problemas y no tiene conteo integral válido.

## D02 Expectativa incorrecta del documento para números en campos de texto

El Word esperaba rechazo de números en nombre, ubicación, contacto y QR. La API tiene `ValidationPipe` con conversión implícita; los números se transforman a texto antes de validar el DTO. Se reprodujo HTTP 201 para EP-F08-013 y EP-F07-006. No hay una regla de negocio que prohíba un nombre o contacto numérico.

Se corrigió el oráculo de esos casos para exigir conversión y persistencia del texto, manteniendo su entrada numérica y su ID. No se debilitó la validación de la aplicación para hacer pasar un test. Las entradas null, ausencia, arreglo y exceso se mantienen como casos distintos. También se identificó conversión de objeto a `[object Object]`; EP-F07-008 se etiqueta como caracterización del contrato actual, no como garantía de una política de tipos estrictos. Es una observación de calidad pendiente de decisión de producto. Si el equipo decide exigir tipos JSON estrictos, deberá formalizar ese contrato y cambiar pruebas y servidor conjuntamente.

## D03 Atributos visuales y contrato HTTP

Persisten diferencias conocidas: nombre de cancha de 30 caracteres en UI y 50 en API; precio HTML con min=1 frente a backend positivo desde 0.01. BVA-F08-016 reprodujo creación por UI con 0.99. Esto demuestra que el atributo no bloquea por sí solo el envío en el flujo Angular actual. Se comprueba la regla contractual de precio positivo, sin afirmar que min=1 se cumple.

Son discrepancias documentadas que requieren una decisión de producto si se desea uniformar la interfaz. No impiden diseñar casos con expectativas explícitas por canal.

## D04 Correcciones del diseño

- QR: longitud cero se diferencia de propiedad omitida; BVA inferior 0/1/2.
- Referencia de complejo: no se presupone que los IDs 1 y 2 existan ni se crean canchas en complejos de terceros. Los casos heredados BVA-F08-023/024 pasan a EP de referencia existente/inexistente.
- Portada: se agregan fronteras de tamaño del archivo y longitud del dato API, junto a decodificación de imagen corrupta y tipos permitidos.
- Decisión: se reemplaza la propuesta de autorización de ingreso por el flujo de confirmación con anticipo validado. No se simula una evaluación simultánea que no existe.

## Ejecuciones

La [reprueba inicial](resultado-reprueba-inicial.md) tiene 11 casos aprobados, incluidos los cuatro TD. La [corrida más reciente](resultado-ultima-ejecucion.md) es la fuente del conteo final. No sumar ambas corridas como casos diferentes. Fallos de preparación, interrupciones y fallos del producto se interpretan por separado.

El primer intento dentro del entorno restringido falló por `ERR_NETWORK_ACCESS_DENIED` al abrir localhost. Se ejecutó posteriormente con acceso autorizado al sistema local. Eso no es un defecto del software ni evidencia de una partición inválida.

## D05 Acumulación de portadas sintéticas

Una corrida diagnóstica acumuló imágenes cercanas al máximo y el listado administrativo llegó a devolver vacío o a agotar 30 segundos. Esto mostró una limitación de la verificación global y del listado masivo; no se probó la causa interna del servidor. Se conservó el diagnóstico en `ec3-artifacts/diagnostico-listado-altas-2026-11-18`. No tiene conteo final consolidado.

Se recuperaron exclusivamente los IDs de canchas y complejos propios de esas trazas. Se retiraron 15 portadas sintéticas y se verificó/desactivó el conjunto de 7 complejos de preparación identificados. La suite ahora consulta persistencia por ID o por complejo propio y retira cada portada después de comprobarla. Esto evita contaminación de datos entre casos; no constituye una corrección del listado masivo de producción.

La auditoría de cierre localizó una preparación adicional de una corrida interrumpida (complejo 74, sin canchas activas). Se verificó su nombre EC3 propio y se desactivó. La fixture de la corrida integral informó limpieza completada para su complejo 75.
