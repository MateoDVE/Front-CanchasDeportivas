# Insumos de Mateo para Robert

## Qué corresponde a Mateo

- Configuración de Playwright y ejecución en Chrome con frontend/backend reales.
- Diseño EP/BVA del selector de reserva del cliente.
- Automatización del selector y transiciones del modelo acotado de reserva.
- Reporte, capturas e interpretación de sus ejecuciones.

No representa la entrega de todo EC3. Faltan los bloques propios de Ostin y Marcelo y el PDF consolidado de Robert.

## Archivos para utilizar

Comenzar por el [resumen de entrega y resultados interpretados](README.md): distingue la corrida integral de 27 casos y la reprueba de cuatro tras corregir el defecto detectado.

1. [Diseño y cobertura](diseno-y-cobertura.md): requisitos, particiones, datos, secuencias y resultados esperados.
2. [Última ejecución](resultado-ultima-ejecucion.md): conteos reales, resultados individuales y enlaces a capturas. Verificar siempre su fecha y selección.
3. [Instrucciones de ejecución](../../../FrontCanchasDeportivas/e2e/README.md): preparación y comandos. La ruta correcta desde el workspace es `FrontCanchasDeportivas/e2e/README.md`.
4. Reportes originales conservados localmente en `FrontCanchasDeportivas/ec3-artifacts/<ejecución>/`.

## Texto base: enfoque

Se diseñaron pruebas funcionales mediante técnicas de caja negra, tomando como base las reglas del proceso de reserva y el comportamiento esperado. Se utilizó partición de equivalencias para identificar clases de entradas y BVA de tres valores para examinar las fronteras del selector. Se modelaron cinco estados de reserva y los eventos que producen cambios o rechazos. Los casos se automatizaron con Playwright; se distinguieron interacciones de navegador contra el sistema real y comprobaciones funcionales complementarias de API.

La autenticación y las altas administrativas de preparación no se contabilizaron como casos del entregable. Cada ejecución utilizó un complejo y una cancha de prueba identificables. Las reservas activas de cada caso se liberaron durante la limpieza, conservando historial y evidencias.

## Texto base: interpretación de cobertura

La cobertura se refiere al modelo y a las particiones declaradas, no a todas las líneas del programa. Los casos BVA pueden cubrir también particiones EP. La visita a todos los estados no implica comprobar todas las transiciones. Las respuestas ante eventos inválidos se registran aparte de los cambios válidos de estado. Los conteos de casos, intentos, particiones y transiciones no se suman entre sí.

Completar los porcentajes con la corrida final y el análisis de resultados; no deducir cobertura solo del número de pruebas verdes. Si un fallo de presentación ocurre después de ejercitar una frontera, la frontera puede estar cubierta aunque el caso falle.

## Puntos que deben explicarse en el informe

- El flujo vigente del cliente va del selector directamente al pago, sin atravesar el formulario heredado de datos de contacto.
- Se incluye Temporal para representar correctamente la expiración; no se inventa Pendiente → Expirado.
- Confirmar un anticipo y alcanzar el pago total son comportamientos diferentes.
- La interfaz ofrece intervalos de 30 minutos y máximo 3 horas. El máximo de 3 horas no está definido como límite general en RN-01: documentar esa discrepancia y no extrapolarlo a toda la API.
- La BVA de duración del selector usa vecinos a 30 minutos: 0/30/60 y 150/180/210. No afirmar que se enviaron 29 o 31 minutos ni que el servidor recibió las selecciones que la UI bloqueó.
- Las cuentas de demostración y los pagos sintéticos pertenecen al entorno de pruebas. No se verifica una transferencia bancaria real.
- Las trazas técnicas pueden contener sesión. Para el informe usar capturas y resultados revisados; no publicar automáticamente todas las trazas.

## Cómo presentar una evidencia

Pie sugerido: **Figura N. Caso [ID].** Entrada o evento ejecutado, resultado esperado y resultado observado. Indicar si es UI o API y la ejecución de origen.

No presentar un screenshot de un estado aislado como demostración de la transición: acompañarlo de los pasos, el estado inicial y las aserciones del caso.

## Reparto de revisión final

- Mateo valida que diseño, tests, resultados y capturas correspondan a su versión.
- Ostin revisa las reglas de pago usadas como precondición o evento en los casos de estados.
- Marcelo incorpora su tabla de decisión y sus pruebas de creación sin volver a contar las altas de fixture de Mateo.
- Robert integra la redacción, verifica consistencia de números, exporta el PDF y revisa su legibilidad.
