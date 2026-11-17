# Mateo — Defectos y observaciones EC3

## DEF-MAT-001 — El resumen de reserva redondea el anticipo a bolivianos enteros

**Tipo:** defecto funcional de presentación de un importe monetario.  
**Regla:** anticipo = 25% del total, precisión de dos decimales (RN-04).  
**Caso detector:** BVA-DUR-02; también se verifica en BVA-DUR-04.  
**Impacto:** el cliente puede interpretar un monto a pagar distinto del calculado/persistido.

Precondiciones: cliente demo, cancha EC3 con tarifa Bs 100/h y horario disponible.

Pasos:

1. Abrir la cancha EC3 y seleccionar una fecha futura.
2. Seleccionar 10:00–10:30.
3. Observar el resumen antes de continuar.
4. Continuar a pagar y comparar el importe.

Esperado: total Bs 50 y anticipo Bs 12,50 tanto en el resumen como en pago.

Obtenido en la ejecución: resumen **Bs 13**; pago/API **Bs 12,50**. El caso falla por la aserción del valor visible y continúa comprobando la persistencia mediante una aserción suave de Playwright; el fallo no se oculta.

Causa localizada después de detectar el resultado: formato Angular `number:'1.0-0'` en el anticipo y saldo estimado del resumen. Se corrigió a `number:'1.2-2'`, conservando cálculos, reglas y valores almacenados.

**Estado: corregido y verificado.** La corrida integral de 27 casos produjo 25 aprobados y dos fallidos (BVA-DUR-02 y BVA-DUR-04: esperaba 62,50, mostró 63). Después del cambio, los cuatro casos de duración válida BVA-DUR-02…05 pasaron, comprobando también el saldo estimado visible. Consultar [corrida integral](resultado-corrida-integral.md) y [reprueba](resultado-reprueba.md). No equiparar un defecto con el número de casos que lo detectan.

## OBS-MAT-001 — Diferencias entre requisitos documentados

La HU-CLI-10 antigua menciona mínimo de una hora y horas enteras; RN-01/RN-02 actualizadas establecen treinta minutos. El diseño usa las reglas actualizadas y debe explicitarlo en el PDF.

El selector ofrece máximo tres horas; RN-01 no define máximo global. La BVA superior de Mateo corresponde a la interfaz. El equipo debe decidir si documenta ese máximo como regla global o como restricción del selector. Esta observación no equivale a un defecto de backend demostrado por esta suite.

## INC-MAT-001 — Preparación del entorno

- Primer intento: servicios iniciados dentro del aislamiento no eran accesibles desde Chrome. Se reiniciaron fuera de ese aislamiento y respondieron.
- El selector de login inicialmente coincidía con botón de navegación y botón del formulario. Se corrigió el selector del test; no se modificó el producto por ello.
- Varias corridas próximas alcanzaron el límite de cinco logins por minuto. La preparación respeta la ventana mediante una espera de 61 segundos y un único reintento si recibe 429. Los casos no tienen reintentos automáticos.

Estos incidentes corresponden a entorno/automatización, no se contabilizan como defectos de reserva ni como nuevas pruebas funcionales.
