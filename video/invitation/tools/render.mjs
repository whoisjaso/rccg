// Frame-exact renderer: Chromium draws each frame at t = f/60 at native output size; frames pipe into ffmpeg.
// stills: node render.mjs stills <v|h> <outDir> t1,t2,...
// video : node render.mjs video <v|h> <out.mp4> [workers]
import { chromium } from '../../../skills/luxury-site-studio/scripts/_pw.mjs';
import { spawn } from 'child_process';
import { mkdirSync, writeFileSync, unlinkSync } from 'fs';
const [mode, o, out, arg] = process.argv.slice(2);
const W = o === 'v' ? 720 : 1280, H = o === 'v' ? 1280 : 720;
const URL = `http://localhost:8766/video/invitation/film.html?o=${o}`;
const browser = await chromium.launch();
async function open() {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate(() => window.__ready);
  return page;
}
const shot = (page) => page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
if (mode === 'stills') {
  mkdirSync(out, { recursive: true });
  const page = await open();
  for (const t of arg.split(',').map(Number)) { await page.evaluate((t) => window.renderAt(t), t); writeFileSync(`${out}/${o}-${t.toFixed(2)}.png`, await shot(page)); }
  writeFileSync(`${out}/cues-${o}.json`, JSON.stringify(await page.evaluate(() => window.__cues()), null, 1));
} else {
  const page0 = await open();
  const dur = await page0.evaluate(() => window.__dur);
  writeFileSync(out.replace(/\.mp4$/, '.cues.json'), JSON.stringify(await page0.evaluate(() => window.__cues()), null, 1));
  await page0.close();
  const N = Math.round(dur * 60), K = parseInt(arg || '4');
  const F0 = Math.round(parseFloat(process.env.FROM || '0') * 60), F1 = process.env.TO ? Math.round(parseFloat(process.env.TO) * 60) : N;
  const parts = [];
  await Promise.all([...Array(K).keys()].map(async (k) => {
    const a = F0 + Math.floor(((F1 - F0) * k) / K), b = F0 + Math.floor(((F1 - F0) * (k + 1)) / K);
    const part = `${out}.part${k}.mkv`; parts[k] = part;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-qp', '0', '-pix_fmt', 'yuv444p', '-r', '60', part]);
    const page = await open();
    for (let f = a; f < b; f++) {
      await page.evaluate((t) => window.renderAt(t), f / 60);
      const buf = await shot(page);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (k === 0 && f % 120 === 0) console.log('frame', f, '/', b);
    }
    ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await page.close();
  }));
  writeFileSync(out + '.list', parts.map((p) => `file '${p.split('/').pop()}'`).join('\n'));
  await new Promise((r) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', out + '.list', '-c', 'copy', process.env.FROM ? out.replace(/\.mp4$/, '.range.mkv') : out.replace(/\.mp4$/, '.master.mkv')], { stdio: 'inherit' }).on('close', r));
  parts.forEach((p) => unlinkSync(p)); unlinkSync(out + '.list');
  console.log('done', N, 'frames');
}
await browser.close();
