// 使い方: node scripts/capture.mjs home=https://example.com/ detail=https://example.com/item/1 [--width=1200] [--max-height=1700]
// ダークテーマで画面を撮り、要素ごとの座標を取る。出力は public/<名前>.png と src/data/<名前>.json、src/data/index.ts。
import {chromium} from 'playwright-core';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const targets = args.filter(a => !a.startsWith('--')).map(a => a.split(/=(.*)/s).slice(0, 2));
if (!targets.length) { console.error('例: node scripts/capture.mjs home=https://example.com/'); process.exit(1); }
const W = Number(opt.width ?? 1200), MAXH = Number(opt['max-height'] ?? 1700);

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = path.join(process.env.HOME ?? '', '.cache/ms-playwright');
  if (fs.existsSync(cache)) {
    for (const d of fs.readdirSync(cache).filter(d => d.startsWith('chromium-')).sort().reverse()) {
      const p = path.join(cache, d, 'chrome-linux64/chrome');
      if (fs.existsSync(p)) return p;
    }
  }
  for (const p of ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']) if (fs.existsSync(p)) return p;
  throw new Error('ブラウザが見つかりません。CHROME_PATH を指定してください。');
}

fs.mkdirSync('public', {recursive: true});
fs.mkdirSync('src/data', {recursive: true});
const browser = await chromium.launch({executablePath: findBrowser(), args: ['--no-sandbox']});
for (const [name, url] of targets) {
  const ctx = await browser.newContext({viewport: {width: W, height: 900}, deviceScaleFactor: 2, colorScheme: 'dark'});
  await ctx.addInitScript(() => localStorage.setItem('theme', 'dark'));
  const page = await ctx.newPage();
  await page.goto(url, {waitUntil: 'networkidle'});
  await page.waitForTimeout(2500);
  const full = await page.evaluate(() => document.documentElement.scrollHeight);
  const H = Math.min(full, MAXH);
  await page.setViewportSize({width: W, height: H});
  await page.waitForTimeout(500);
  await page.screenshot({path: `public/${name}.png`});
  const boxes = await page.evaluate(() => {
    const sel = 'h1,h2,h3,p,a,button,input,select,tr,li,svg,canvas,img,label,[role=tab],[class*=card],[class*=badge]';
    const els = [...document.querySelectorAll(sel)].map(e => ({e, r: e.getBoundingClientRect()}))
      .filter(({r}) => r.width > 24 && r.height > 12 && r.top >= 0 && r.bottom <= innerHeight && r.width < innerWidth * 0.98);
    // 他の選んだ要素を含む親は外し、いちばん内側の要素を残す（tr は残す）
    return els.filter(a => !els.some(b => b !== a && a.e !== b.e && a.e.contains(b.e) && a.e.tagName !== 'TR'))
      .map(({r}) => ({x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height)}));
  });
  fs.writeFileSync(`src/data/${name}.json`, JSON.stringify({w: W, h: H, boxes}));
  console.log(`${name}: ${W}x${H}, ${boxes.length} 要素`);
  await ctx.close();
}
await browser.close();

// 取り込み用の index.ts を作り直す
const names = fs.readdirSync('src/data').filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
const lines = names.map(n => `import ${n.replace(/\W/g, '_')} from './${n}.json';`);
lines.push('', 'export const pages: Record<string, {data: any; img: string}> = {');
for (const n of names) lines.push(`  '${n}': {data: ${n.replace(/\W/g, '_')}, img: '${n}.png'},`);
lines.push('};', '');
fs.writeFileSync('src/data/index.ts', lines.join('\n'));
