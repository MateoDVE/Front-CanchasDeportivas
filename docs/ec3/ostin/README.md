# Pruebas de pagos y anulación

Bloque F03–F06 del EC3. El diseño actualizado contiene 36 casos: 26 de navegador con sistema real y 10 complementarios de API. [Diseño y trazabilidad](diseno-y-cobertura.md). El resultado vigente debe consultarse en [resultado-ultima-ejecucion.md](resultado-ultima-ejecucion.md); no inferirlo del número de casos diseñados.

## Preparación

Desde FrontCanchasDeportivas, con frontend y backend levantados, `.env.e2e` configurado y `E2E_RUN=true`. Las cuentas demo se seleccionan mediante la UI. No se documentan credenciales. Se utiliza Chrome/Chromium según la configuración local.

## Un caso por vez

```powershell
npm run test:e2e:pw -- --grep 'PAY-EP-03 '
npm run test:e2e:pw -- --grep 'REC-BVA-03 ' --headed
npm run test:e2e:pw -- --grep 'REJ-BVA-02 '
```

Reemplazar el ID por otro de la matriz. No agregar `^`: Playwright incluye proyecto/archivo al filtrar el título. Cada caso prepara datos propios, sin depender del anterior.

## Un bloque y la suite completa

```powershell
# Comprobantes, montos y métodos de pago
npm run test:e2e:pagos

# Anulación original; sus límites adicionales están en motivos
npm run test:e2e:anulacion

# Motivos de rechazo y anulación
npm run test:e2e:motivos

# Toda la parte de pagos y anulación
npm run test:e2e:pagos-anulacion
npm run test:e2e:summary:pagos

# Todo el equipo
npm run test:e2e:pw
npm run test:e2e:summary:equipo
npm run test:e2e:summary:pagos

# Ver reporte o seleccionar casos en modo interactivo
npm run test:e2e:pw:report
npm run test:e2e:pw:ui
```

`summary:pagos` selecciona exclusivamente los casos con etiqueta histórica `@ostin`, incluso cuando la corrida fuente incluye al equipo completo. El HTML archivado sigue mostrando el reporte fuente; `resumen-pagos.json` y esta documentación indican el subconjunto. El resumen del equipo queda en `resumen.json`, sin ser reemplazado por el de pagos. Archivar antes de una nueva ejecución.

La suite conjunta incluye el vencimiento real de TEMPORAL; no omitir `@lento` al acreditar la corrida final. Para listar sin ejecutar, agregar `-- --list --reporter=list` al comando de un bloque.

## Evidencia y limpieza

Se adjuntan capturas de UI, respuestas de rechazo y verificaciones de persistencia. Los archivos grandes se generan en memoria; se registra su tamaño y MIME. Los comprobantes subidos quedan asociados al historial de reservas de prueba. La limpieza rechaza anticipos pendientes y cancela reservas propias, sin fabricar devoluciones de pagos validados.

Los informes de ocho casos se conservaron en [histórico](historico-2026-11-18). La [revisión previa](revision-codex.md) documenta el selector que fallaba; no describe el estado posterior a la corrección.

## Cierre verificado

La corrida integral `2026-11-19T04-10-41-965Z` aprobó **36/36** de este bloque y **216/216** del equipo, sin fallos ni omitidas. Consultar el [informe final](informe-final-ejecucion.md) y el [resultado estable](resultado-corrida-integral.md), que no se reemplaza al ejecutar después un caso individual.
