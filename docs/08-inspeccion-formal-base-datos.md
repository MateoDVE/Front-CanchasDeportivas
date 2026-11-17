# Inspección de base de datos — correcciones realizadas

Fecha técnica de ejecución: 24/09/2026. Revisión presencial pendiente; los campos de participantes se dejan vacíos por indicación del usuario.

**Los errores fueron corregidos en el backend local y en Supabase real. No se hicieron commits.** La estimación inicial de 66/100 describía la versión anterior; ya no representa el diseño corregido. La nota final corresponde al revisor, no se asigna una calificación ficticia.

## Adecuación a requerimientos y reglas de negocio

| Criterio | Resultado técnico | Evidencia |
|---|---|---|
| A1 Entidades principales | Cubierto | Ocho entidades operativas, catálogo de deportes y eventos de reserva. |
| A2 Relaciones/cardinalidades | Corregido | FK y ERD coherentes con opcionalidad de pagos, actores y padre; sucesora única. |
| A3 Atributos suficientes | Corregido | Origen persistido, processed_at, authorized_by, refund_reason, eventos con actor y fecha. |
| A4 Soporte de funcionalidades | Corregido | Comprobante, procesamiento y reprogramación atómicos; devolución estructurada. |
| A5 Restricciones de negocio | Corregido | Exclusión GiST, CHECK, triggers, saldo real e inmutabilidad de caja. |
| A6 Trazabilidad | Completa para diseño | 76 HU mapeadas a tablas, columnas y mecanismos de control. |

## Calidad técnica

| Criterio | Resultado técnico | Evidencia |
|---|---|---|
| B1 Entidades justificadas | Cubierto | Responsabilidades separadas; catálogo/eventos cumplen funciones concretas. |
| B2 PK | Cubierto | Todas las tablas con PK. |
| B3 FK | Cubierto | Relaciones tipadas y referenciadas, incluyendo origen de pagos y autores. |
| B4 Opcionalidad | Corregido | Diagrama y DDL alineados; horarios con XOR día/fecha. |
| B5 Atributos bien ubicados | Corregido | Devolución en campos propios; eventos en tabla histórica. |
| B6 N:M | Cubierto | reservations representa contrataciones cliente–cancha a lo largo del tiempo. |
| B7 3FN/excepciones | Justificado | Dependencias funcionales y redundancias controladas documentadas. |
| B8 Calculados | Controlado | Precio/importe contractual y fotografía de cierre justificados; saldo derivado de movimientos. |
| B9 Nomenclatura | Cubierto | snake_case SQL y diccionario extraído del motor. |

## Evolución

| Criterio | Resultado técnico | Evidencia |
|---|---|---|
| C1 Crecimiento por registros | Cubierto | PK, índices, entidades de detalle sin columnas repetitivas. |
| C2 Nuevos tipos/estados | Cubierto con control | Deportes por catálogo; estados técnicos evolucionan mediante migración y revisión de transiciones. |
| C3 Valores múltiples | Corregido | Sin eventos concatenados. Portada escalar; images es espejo de máximo un valor, controlado por trigger para compatibilidad. |
| C4 Catálogos | Corregido | court_types consultado por el API y FK en courts. |
| C5 Supuestos rígidos | Justificados | 25%, cinco minutos y caja diaria responden a RN explícitas; estrategia de evolución documentada. |
| C6 Decisiones | Documentadas | Normalización, derivados, historial, instantes UTC y hora comercial Bolivia. |

## Defectos originales

| Defecto | Corrección efectiva |
|---|---|
| D1 Doble reserva concurrente | Exclusión real en PostgreSQL y traducción del conflicto al backend. |
| D2 Opcionalidades del diagrama | ERD corregido; parent_reservation_id nullable y sucesora única. |
| D3 Auditoría incompleta | reservation_events y fecha de procesamiento de pagos. |
| D4 Origen/caja desactualizados | Persistencia de origen y modelo consolidado de caja. |
| D5 Devolución en textos ajenos | Autorizador por FK, motivo y fecha propios; identidad del JWT. |
| D6 Restricciones faltantes | Horarios XOR/únicos, tiempos/importes/estados controlados. |
| D7 Anticipo perdido al reprogramar | Transacción que mueve imputación y conserva reserva original del pago. |
| D8 Documentación/estados | Diagrama de estados y diccionario alineados; decisiones de 3FN explícitas. |

También se corrigió la aceptación de pagos finales de importe incorrecto y la mezcla de cobros de otras secretarias en una caja sin cobros propios.

## Validación ejecutada

- Backend: **67 pruebas aprobadas en 11 suites**, incluyendo arranque de módulos y regresiones nuevas.
- PostgreSQL local: **23 comprobaciones aprobadas**, con exclusión, rollback, auditoría, pagos y RLS reales.
- Compilación del backend correcta y revisión de whitespace correcta con la configuración Git del proyecto.
- Supabase real: migraciones aplicadas, cero restricciones pendientes de validar; adaptadores y función de saldo verificados.
- Supabase Security Advisor: **cero hallazgos** al finalizar.
- Se conservaron 26 reservas, 20 pagos, un cierre, ocho canchas, sumas monetarias y hash de portadas. No se guardaron datos de prueba.

No se ejecutó un recorrido completo por todas las pantallas ni se desplegó un backend nuevo en un proveedor externo. El código local está compilado; reiniciar cualquier proceso que aún ejecute la versión anterior.

Las fechas/autores históricos que antes no se almacenaban no se inventaron. La corrección registra esos hechos correctamente desde ahora. Los índices nuevos pueden figurar como aún no utilizados: es una observación informativa de rendimiento, no una falta de integridad.

## Fuentes del resultado

- [Modelo y diagrama](02-database-supabase.md).
- [Diccionario completo](../back-canchas-deportivas/docs/inspeccion/diccionario-datos.md).
- [Trazabilidad de las 76 HU](../back-canchas-deportivas/docs/inspeccion/trazabilidad-historias.md).
- [Normalización y decisiones](../back-canchas-deportivas/docs/inspeccion/normalizacion-y-decisiones.md).
- [Aplicación real y preservación de datos](../back-canchas-deportivas/docs/inspeccion/aplicacion-y-validacion.md).
