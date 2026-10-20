// Capture a reference site: desktop + mobile scroll frames, menu, and computed type metrics.
// Usage: node capture_reference.mjs <url> <outdir> [--consent "Allow all"]
import { chromium } from './_pw.mjs';
import { mkdirSync, writeFileSync } from 'fs';
const [, , url, out = 'ref-capture'] = process.argv;
const ci = process.argv.indexOf('--consent');
const consent = ci > 0 ? [process.argv[ci + 1]] : [];
const buttons = [...consent, 'Allow all', 'Accept all', 'Accept All', 'Accept', 'I agree', 'Agree', 'OK'];
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' });
  const p = await ctx.newPage();
  try { await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch (e) { console.log('goto', e.message); }
  await p.waitForTimeout(5000);
  for (const t of buttons) { const btn = p.getByRole('button', { name: t }); if (await btn.count()) { await btn.first().click().catch(() => {}); break; } }
  await p.waitForTimeout(1500);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = 0; y < H && i < 16; y += h * 0.9, i++) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(1200); await p.screenshot({ path: `${out}/${tag}-${String(i).padStart(2, '0')}.png` }); }
  if (tag === 'd') {
    const metrics = await p.evaluate(() => {
      const g = (s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { font: c.fontFamily, size: c.fontSize, weight: c.fontWeight, tracking: c.letterSpacing, color: c.color, transform: c.textTransform, lineHeight: c.lineHeight }; };
      return { h1: g('h1'), h2: g('h2'), h3: g('h3'), p: g('p'), nav: g('nav a, header a'), button: g('button, .btn, a[class*=button]'), body: getComputedStyle(document.body).backgroundColor, fonts: [...new Set([...document.fonts].map(f => `${f.family} ${f.weight} ${f.style}`))] };
    });
    writeFileSync(`${out}/metrics.json`, JSON.stringify(metrics, null, 2));
    const menu = p.locator('button[aria-label*="enu" i], button:has-text("Menu"), [class*=burger], [class*=hamburger]').first();
    if (await menu.count()) { await p.evaluate(() => scrollTo(0, 0)); await menu.click().catch(() => {}); await p.waitForTimeout(1500); await p.screenshot({ path: `${out}/d-menu.png` }); }
  }
  await ctx.close();
}
await b.close();
console.log('captured to', out);
