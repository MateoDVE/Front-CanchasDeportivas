# Pagos y anulación — Resultado de ejecución EC3

Fecha Bolivia: 19/11/2026, 12:07:11 a. m.. Ejecución: 2026-11-19T04-07-11-082Z.

Selección: 7; aprobados: 6; fallidos/interrumpidos: 1; omitidos/no ejecutados: 0.

Estos conteos describen la corrida seleccionada. Un fallo de preparación no prueba un defecto funcional del producto. No sumar corridas previas como casos nuevos.

Frontend base: 9b4625593f2d81280ffdcbd82a7aaa58a2d2a443; backend: e7845b512ebc817f389ba8b0b3ff266a135a18bd. Suite local con cambios sin commit.

Archivo de evidencia local: C:\Users\Mateo\Documents\Mateo Tareas\Calidad\FrontCanchasDeportivas\ec3-artifacts\2026-11-19T04-07-11-082Z. HTML: playwright-report/index.html. Las trazas pueden contener sesión; revisar antes de compartir.

| Caso | Interfaz | Resultado Playwright | Segundos | Capturas |
| --- | --- | --- | --- | --- |
| REC-BVA-01 | UI / sistema real | passed | 17.9 | [1](evidencias/2026-11-19T04-07-11-082Z/REC-BVA-01-2.png) |
| REC-BVA-02 | UI / sistema real | passed | 17.2 | [1](evidencias/2026-11-19T04-07-11-082Z/REC-BVA-02-2.png) |
| REC-BVA-03 | UI / sistema real | failed | 11.4 | [1](evidencias/2026-11-19T04-07-11-082Z/REC-BVA-03-2.png) [2](evidencias/2026-11-19T04-07-11-082Z/REC-BVA-03-3.png) [3](evidencias/2026-11-19T04-07-11-082Z/REC-BVA-03-4.png) [4](evidencias/2026-11-19T04-07-11-082Z/REC-BVA-03-5.png) |
| REJ-BVA-02 | UI / sistema real | passed | 19.3 | [1](evidencias/2026-11-19T04-07-11-082Z/REJ-BVA-02-1.png) |
| SAL-UI-01 | UI / sistema real | passed | 18.4 | [1](evidencias/2026-11-19T04-07-11-082Z/SAL-UI-01-2.png) |
| PAY-EP-03 | UI / sistema real | passed | 19.7 | [1](evidencias/2026-11-19T04-07-11-082Z/PAY-EP-03-1.png) |
| PAY-EP-04 | UI / sistema real | passed | 19.8 | [1](evidencias/2026-11-19T04-07-11-082Z/PAY-EP-04-1.png) |

## Fallos que requieren interpretación

### REC-BVA-03

```text
Error: expect(locator).toBeVisible() failed

Locator: getByText('Adjunta una imagen JPG, PNG o WebP de hasta 5 MB.', { exact: true })
Expected: visible
Error: strict mode violation: getByText('Adjunta una imagen JPG, PNG o WebP de hasta 5 MB.', { exact: true }) resolved to 2 elements:
    1) <div _ngcontent-ng-c409129820="" class="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-xl mb-4"> Adjunta una imagen JPG, PNG o WebP de hasta 5 MB…</div> aka getByText('Adjunta una imagen JPG, PNG o').first()
    2) <span class="font-medium" _ngcontent-ng-c409129820="">Adjunta una imagen JPG, PNG o WebP de hasta 5 MB.</span> aka locator('span').filter({ hasText: 'Adjunta una imagen JPG, PNG o' })

Call log:
  - Expect "toBeVisible" getByText('Adjunta una imagen JPG, PNG o WebP de hasta 5 MB.', { exact: true }) with timeout 15000ms
  - waiting for getByText('Adjunta una imagen JPG, PNG o WebP de hasta 5 MB.', { exact: true })

```

