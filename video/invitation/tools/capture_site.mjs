// Records a frame-exact 60 fps scroll through the real site (no screen recorder: one screenshot per frame).
// usage: node capture_site.mjs <baseUrl> <outDir> <mobile|desktop> <seconds>
import { chromium } from '../../../skills/luxury-site-studio/scripts/_pw.mjs';
import { mkdirSync } from 'fs';
const [base, out, mode = 'mobile', secs = '5.2'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const vp = mode === 'mobile' ? { width: 390, height: 844, dpr: 2 } : { width: 1280, height: 800, dpr: 1.5 };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dpr, isMobile: mode === 'mobile', hasTouch: mode === 'mobile' });
// Block Lenis so window.scrollTo drives the page directly and every frame is deterministic.
await page.addInitScript(() => { Object.defineProperty(window, 'Lenis', { get() { return undefined; }, set() {}, configurable: false }); try { localStorage.setItem('ds-visited', '1'); } catch (e) {} });
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2600); // loader out
await page.evaluate(() => document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }));
await page.waitForTimeout(800);
const H = vp.height;
// path: hold on slide 1, glide through the stacked slides, settle on the first spread
const stops = mode === 'mobile' ? [0, H * 3.35] : [0, H * 3.2];
const N = Math.round(parseFloat(secs) * 60);
const ease = (x) => (x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2); // easeInOutQuint
for (let f = 0; f < N; f++) {
  const t = f / (N - 1);
  const k = Math.min(1, Math.max(0, (t - 0.12) / 0.8));
  const y = stops[0] + (stops[1] - stops[0]) * ease(k);
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: `${out}/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
}
await browser.close();
console.log('frames', N);
