// Собирает материалы для карточки игры в promo/out: иконку, обложку и скриншоты.
// Запуск: node promo/make.mjs  (нужен установленный Microsoft Edge).
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'promo', 'out');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9377;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = createServer(async (req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const profile = await mkdtemp(path.join(tmpdir(), 'glazomer-promo-'));
const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', 'about:blank']);
let info;
for (let i = 0; i < 50 && !info; i++) {
  await sleep(200);
  try { info = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch { /* браузер ещё запускается */ }
}
const ws = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let seq = 0;
const waiting = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && waiting.has(m.id)) {
    waiting.get(m.id)(m);
    waiting.delete(m.id);
  }
};
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++seq;
  waiting.set(id, (m) => (m.error ? reject(new Error(method + ': ' + m.error.message)) : resolve(m.result)));
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});

// seed — сохранение, с которым открывается игра.
async function page(url, w, h, dpr, seed) {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const call = (m, p) => send(m, p, sessionId);
  await call('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: false });
  await call('Page.enable');
  if (seed) {
    const source = `localStorage.setItem('glazomer-save', ${JSON.stringify(JSON.stringify(seed))});`;
    await call('Page.addScriptToEvaluateOnNewDocument', { source });
  }
  await call('Page.navigate', { url });
  await sleep(1200);
  return {
    run: (code) => call('Runtime.evaluate', { expression: `(async () => { ${code} })()`, awaitPromise: true }),
    shot: async (name) => {
      const { data } = await call('Page.captureScreenshot', { format: 'png' });
      await writeFile(path.join(OUT, name + '.png'), Buffer.from(data, 'base64'));
      console.log(name);
    },
    close: () => send('Target.closeTarget', { targetId }),
  };
}

const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const SEED = {
  tutorial: true, sizeTip: true, hints: 4, owned: 112, best: { easy: 431, mid: 388, 'size-easy': 402 },
  streak: { count: 5, last: key(new Date(Date.now() - 864e5)) }, day: key(new Date()), daily: {}, level: 'easy', t: 1,
};
const GAME = `
  const $ = (id) => document.getElementById(id), wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const settle = async () => { while ($('main').disabled) await wait(200); await wait(900); };
  const guess = (v) => { $('slider').value = v; $('slider').dispatchEvent(new Event('input')); };
`;
// Положение ползунка в каждом из шести раундов: сначала в «Весе», потом в «Размере».
const GUESSES = [430, 520, 380, 560, 470, 500];
const SIZE_GUESSES = [640, 380, 560, 700, 300, 450];

await mkdir(OUT, { recursive: true });

let p = await page(`${base}/promo/icon.html`, 512, 512, 1);
await p.shot('icon-512');
await p.close();
p = await page(`${base}/promo/cover.html`, 800, 470, 1);
await p.shot('cover-800x470');
await p.close();

// Телефон 9:16 и компьютер 16:9: меню, все раунды партии дня, итоги, коллекция, потом партия «Размера».
for (const [tag, w, h, dpr] of [['mobile', 405, 720, 2], ['desktop', 1280, 720, 1.5]]) {
  p = await page(`${base}/`, w, h, dpr, SEED);
  await p.shot(`${tag}-menu`);
  await p.run(`${GAME} $('play-daily').click(); await wait(600);`);
  for (let i = 0; i < GUESSES.length; i++) {
    await p.run(`${GAME} guess(${GUESSES[i]}); await wait(300);`);
    await p.shot(`${tag}-round${i + 1}-guess`);
    await p.run(`${GAME} $('main').click(); await settle();`);
    await p.shot(`${tag}-round${i + 1}-reveal`);
    await p.run(`${GAME} $('main').click(); await wait(500);`);
  }
  await p.shot(`${tag}-summary`);
  await p.run(`${GAME} $('change').click(); await wait(500); $('open-album').click(); await wait(500);`);
  await p.shot(`${tag}-album`);
  await p.run(`${GAME} $('album-back').click(); await wait(500); document.querySelectorAll('#modes button')[1].click(); await wait(300);`);
  await p.shot(`${tag}-size-menu`);
  await p.run(`${GAME} $('play-daily').click(); await wait(600);`);
  for (let i = 0; i < SIZE_GUESSES.length; i++) {
    await p.run(`${GAME} guess(${SIZE_GUESSES[i]}); await wait(300);`);
    await p.shot(`${tag}-size${i + 1}-guess`);
    await p.run(`${GAME} $('main').click(); await settle();`);
    await p.shot(`${tag}-size${i + 1}-reveal`);
    await p.run(`${GAME} $('main').click(); await wait(500);`);
  }
  await p.close();
}

ws.close();
edge.kill();
server.close();
await sleep(500);
await rm(profile, { recursive: true, force: true }).catch(() => {});
