import { readFileSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const source = resolve('test-results/results.json');
const report = JSON.parse(readFileSync(source, 'utf8'));
const run = report.stats.startTime.replace(/[:.]/g, '-');
const evidenceDirectory = resolve('../docs/ec3/mateo/evidencias', run);
mkdirSync(evidenceDirectory, { recursive: true });
const rows = [];
function collect(suites) {
  for (const suite of suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const result = test.results?.at(-1);
        const images = [];
        for (const [index, attachment] of (result?.attachments || []).entries()) {
          if (attachment.contentType !== 'image/png') continue;
          const filename = `${spec.title.split(' ')[0]}-${index + 1}.png`;
          const target = resolve(evidenceDirectory, filename);
          if (attachment.body) writeFileSync(target, Buffer.from(attachment.body, 'base64'));
          else if (attachment.path) cpSync(attachment.path, target);
          else continue;
          images.push(`evidencias/${run}/${filename}`);
        }
        rows.push({ id: spec.title.split(' ')[0], title: spec.title,
          type: spec.title.includes('@api') ? 'API funcional' : 'UI / sistema real',
          status: result?.status || 'no ejecutado',
          seconds: ((result?.duration || 0) / 1000).toFixed(1),
          error: result?.error?.message?.replace(/\u001b\[[0-9;]*m/g, '') || '',
          images,
        });
      }
    }
    collect(suite.suites);
  }
}
collect(report.suites);
const archive = resolve('ec3-artifacts', run);
mkdirSync(archive, { recursive: true });
cpSync('playwright-report', resolve(archive, 'playwright-report'), { recursive: true });
cpSync('test-results', resolve(archive, 'test-results'), { recursive: true });
const counts = {
  selected: rows.length,
  passed: rows.filter(r => r.status === 'passed').length,
  failed: rows.filter(r => ['failed', 'timedOut', 'interrupted'].includes(r.status)).length,
  skipped: rows.filter(r => ['skipped', 'no ejecutado'].includes(r.status)).length,
};
function git(args, cwd = '.') {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim(); }
  catch { return 'No disponible'; }
}
const metadata = {
  run, started: report.stats.startTime,
  dateBolivia: new Date(report.stats.startTime).toLocaleString('es-BO', { timeZone: 'America/La_Paz' }),
  counts, durationSeconds: report.stats.duration / 1000,
  frontendCommit: git(['rev-parse', 'HEAD']), backendCommit: git(['rev-parse', 'HEAD'], '../back-canchas-deportivas'),
  frontendWorkingTree: git(['status', '--short']),
  suiteSha256: Object.fromEntries([
    'playwright.config.ts', 'e2e/helpers/app.ts', 'e2e/fixtures/reservas.ts',
    'e2e/reservas-formularios.spec.ts', 'e2e/reservas-estados.spec.ts',
  ].map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')])),
  archive, rows,
};
writeFileSync(resolve(archive, 'resumen.json'), JSON.stringify(metadata, null, 2));
const lines = [
  '# Reservas — Resultado de ejecución EC3', '',
  `Fecha Bolivia: ${metadata.dateBolivia}. Ejecución: ${run}.`, '',
  `Selección: ${counts.selected}; aprobados: ${counts.passed}; fallidos/interrumpidos: ${counts.failed}; omitidos/no ejecutados: ${counts.skipped}.`, '',
  'Estos conteos describen la corrida seleccionada. Un fallo de preparación no prueba un defecto funcional del producto. No sumar corridas previas como casos nuevos.', '',
  `Frontend base: ${metadata.frontendCommit}; backend: ${metadata.backendCommit}. Suite local con cambios sin commit.`, '',
  `Archivo de evidencia local: ${archive}. HTML: playwright-report/index.html. Las trazas pueden contener sesión; revisar antes de compartir.`, '',
  '| Caso | Interfaz | Resultado Playwright | Segundos | Capturas |', '| --- | --- | --- | --- | --- |',
  ...rows.map(r => `| ${r.id} | ${r.type} | ${r.status} | ${r.seconds} | ${r.images.map((p, i) => `[${i + 1}](${p})`).join(' ')} |`), '',
  '## Fallos que requieren interpretación', '',
  ...rows.filter(r => r.error).map(r => `### ${r.id}\n\n\`\`\`text\n${r.error}\n\`\`\`\n`),
];
const destination = resolve('../docs/ec3/mateo');
mkdirSync(destination, { recursive: true });
writeFileSync(resolve(destination, 'resultado-ultima-ejecucion.md'), lines.join('\n') + '\n');
console.log(JSON.stringify({ ...counts, archive }, null, 2));
