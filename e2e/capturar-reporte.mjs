import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { chromium, expect } from '@playwright/test';
import { loadEnvFile } from 'node:process';
if(existsSync('.env.e2e')) loadEnvFile('.env.e2e');
const report=JSON.parse(readFileSync('test-results/results.json','utf8'));
const scope=process.argv[2]||'marcelo';
if(!['marcelo','ostin','equipo'].includes(scope)) throw new Error('Destino inválido');
const destination=['ostin','marcelo'].includes(scope)?resolve('docs/ec3',scope):resolve('../docs/ec3',scope);
const run=report.stats.startTime.replace(/[:.]/g,'-');
const root=resolve('playwright-report');
const server=createServer((req,res)=>{
  const name=decodeURIComponent((req.url||'/').split('?')[0]);
  const path=resolve(root,`.${name==='/'?'/index.html':name}`);
  if(!path.startsWith(root+sep)||!existsSync(path)){res.writeHead(404);res.end();return;}
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'}[extname(path)]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime});res.end(readFileSync(path));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try {
  browser=await chromium.launch({channel:process.env.E2E_CHANNEL||'chrome'});
  const page=await browser.newPage({viewport:{width:1440,height:950}});
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await expect(page.getByPlaceholder('Search tests')).toBeVisible();
  const dir=resolve(destination,'evidencias',run);mkdirSync(dir,{recursive:true});
  await page.screenshot({path:resolve(dir,'reporte-resumen.png')});
  console.log(`Captura del reporte: ${dir}/reporte-resumen.png`);
} finally {await browser?.close();await new Promise(r=>server.close(r));}
