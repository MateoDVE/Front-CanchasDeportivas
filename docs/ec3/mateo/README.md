# Entrega de Mateo — EC3

**Fecha:** 17/11/2026, America/La_Paz.  
**Alcance:** reserva del cliente y transición de estados.  
**Herramienta:** Playwright Test 1.65.1, Chrome, Angular y backend reales.

## Trabajo realizado

- Configuración de Playwright en el frontend, scripts y comprobación TypeScript separada de Angular/Karma.
- 27 casos diseñados e implementados: 19 con interacción UI/sistema real y 8 funcionales de API complementarios.
- EP y BVA de tres valores para el selector, con resultados esperados e IDs trazables.
- Cinco estados y cinco cambios de estado válidos modelados, además de tres respuestas sin cambio.
- Datos exclusivos EC3, limpieza de reservas/comprobantes pendientes y deshabilitación de complejos/canchas creados por la suite, conservando historial.
- Reportes HTML/JSON archivados y capturas identificadas por caso para Robert.
- Corrección del redondeo monetario del resumen, detectado por las pruebas.

## Ejecuciones reales

| Ejecución | Selección | Aprobadas | Fallidas | Omitidas | Interpretación |
| --- | --- | --- | --- | --- | --- |
| Preliminar, 15:39 | 26 sin prueba lenta, antes de agregar aserción de anticipo visible | 26 | 0 | 0 | Verificación inicial; no acredita expiración ni la nueva comprobación visual |
| Integral, 15:43 | 27, incluida expiración y anticipo visible | 25 | 2 | 0 | Dos casos detectaron un único defecto de formato monetario |
| Reprueba, 15:54 | BVA-DUR-02, 03, 04 y 05 tras corregir el formato | 4 | 0 | 0 | Anticipo y saldo visibles conservan centavos; creación y persistencia correctas |

Las horas son de inicio. La corrida integral duró aproximadamente 10,4 minutos, incluida la espera real de expiración y una espera de preparación por el límite de login. La reprueba duró 48,8 segundos.

**No se realizó otra corrida integral de 27 después del cambio de formato.** Se repitieron los cuatro casos impactados; las transiciones y otros casos conservan su evidencia de la corrida integral. No presentar 31 ejecuciones (27+4) como 31 casos distintos ni reportar una corrida única de 27/27 posterior a la corrección.

## Defecto encontrado y corregido

El resumen mostraba Bs 13 cuando correspondían Bs 12,50, y Bs 63 cuando correspondían Bs 62,50. El cálculo y la persistencia eran correctos; la plantilla utilizaba un formato sin decimales. Se cambió a dos decimales en anticipo y saldo estimado.

- [Registro del defecto y observaciones](defectos-y-observaciones.md).
- [Evidencia anterior: Bs 13](evidencias/2026-11-17T19-43-37-710Z/BVA-DUR-02-1.png).
- [Evidencia posterior: Bs 12,50 y saldo Bs 37,50](evidencias/2026-11-17T19-54-26-671Z/BVA-DUR-02-1.png).

## Cobertura del modelo declarado

| Criterio | Ejercitado / modelado | Alcance de la afirmación |
| --- | --- | --- |
| Particiones EP de la tabla de diseño | 15 / 15 | Contar por separado inicio/fin vacíos y fecha vacía/formato inválido; una partición válida de fecha incluye hoy/futuro |
| Valores BVA requeridos | 9 / 9 | 0/30/60, 150/180/210 minutos del selector; ayer/hoy/mañana |
| Estados | 5 / 5 | Temporal, Pendiente, Confirmado, Cancelado, Expirado |
| Cambios válidos entre estados del modelo | 5 / 5 | Ver flechas del diagrama; no incluye alta inicial ni limpieza |
| Respuestas sin cambio | 3 / 3 | Pendiente tras plazo; Cancelado/Expirado ante comprobante no permitido |

Los dos casos que fallaron por el importe visible continuaron sus verificaciones mediante aserción suave: ejercitaron sus valores y comprobaron creación/persistencia. Cobertura no equivale a aprobación. La cobertura del 100% corresponde únicamente a este modelo acotado; no a todo SportReserva.

## Documentos y evidencias para Robert

1. [Diseño y cobertura](diseno-y-cobertura.md).
2. [Resultados de la corrida integral](resultado-corrida-integral.md).
3. [Resultados de la reprueba](resultado-reprueba.md).
4. [Texto e instrucciones para el informe](entrega-para-robert.md).
5. [README técnico de ejecución](../../../FrontCanchasDeportivas/e2e/README.md).

Reportes HTML originales:

- [Corrida integral de 27](../../../FrontCanchasDeportivas/ec3-artifacts/2026-11-17T19-43-37-710Z/playwright-report/index.html).
- [Reprueba de 4](../../../FrontCanchasDeportivas/ec3-artifacts/2026-11-17T19-54-26-671Z/playwright-report/index.html).

Los reportes y las trazas son locales e ignorados por Git. Las capturas seleccionadas están en `evidencias/`. No subir trazas sin revisarlas: pueden contener sesión. Los datos sintéticos permanecen en el historial del entorno de demostración; sus canchas/complejos se deshabilitaron y no son reservas reales.

## Verificaciones técnicas

- `npm run test:e2e:typecheck`: aprobado.
- `npx playwright test --list`: descubre 27 casos.
- `npm run build`: aprobado tras permitir descarga de fuentes externas. Conserva el aviso previo de deprecación Sass `@import`.
- `git diff --check`: aprobado.

No se modificaron esquemas ni código del backend. En el producto frontend solo se cambiaron los formatos monetarios del resumen; el resto son archivos de automatización y documentación.

## Cómo volver a ejecutar

Desde `FrontCanchasDeportivas`, con frontend y backend levantados y `.env.e2e` configurado:

```powershell
npm run test:e2e:reservas
npm run test:e2e:summary
npm run test:e2e:pw:report
```

Para cerrar EC3 aún deben incorporarse los diseños y pruebas de Ostin/Marcelo, resolver documentalmente la discrepancia del máximo de tres horas y consolidar el PDF con Robert. Este paquete completa la implementación y ejecución del bloque de Mateo, con el alcance y límites aquí declarados.

Los comandos usan nombres funcionales (`reservas`), no nombres de integrantes. Para ejecutar un caso individual, cada bloque o toda la suite, consultar las [instrucciones detalladas](../../../FrontCanchasDeportivas/e2e/README.md#ejecutar). Los reportes archivados conservan sus etiquetas originales como evidencia histórica.
