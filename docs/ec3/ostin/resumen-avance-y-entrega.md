# Resumen de pagos y anulación para el entregable

El bloque contiene 36 casos automatizados con Playwright: 26 de navegador contra el sistema real y 10 complementarios de API. Se cubren el envío de comprobantes, validación/rechazo del anticipo, pago del saldo exacto en efectivo o QR y anulación. La matriz identifica EP y BVA 3 por formulario.

## Archivos para Robert

- [Diseño y trazabilidad](diseno-y-cobertura.md): entradas, particiones, límites y resultados esperados.
- [Resultado por caso](resultado-ultima-ejecucion.md): aprobados, fallidos, duración y capturas.
- [Informe de ejecución](informe-final-ejecucion.md): interpretación de la corrida final.
- [Auditoría](auditoria-y-cierre.md): defecto del selector y correcciones.
- [Guía de ejecución](README.md): comandos por caso, bloque y equipo.

Para el informe PDF, incorporar las matrices y capturas de la corrida elegida, conservar su identificador y distinguir casos diseñados de casos realmente ejecutados. No sumar corridas históricas ni presentar las pruebas API como E2E de navegador. El histórico original de ocho casos se conserva como antecedente, no como resultado actual.

La integración del contenido en el PDF, portada, diagramas y conclusiones conjuntas corresponde al documento general del equipo. Esta carpeta aporta la sección de pruebas de pagos y anulación y sus evidencias.

Resultado para el informe: corrida `2026-11-19T04-10-41-965Z`, pagos y anulación **36 aprobadas de 36**, equipo **216 de 216**, sin fallos ni omitidas. Es una sola corrida; no sumar ambos totales. [Evidencia estable](resultado-corrida-integral.md).
