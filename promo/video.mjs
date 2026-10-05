// Записывает вертикальное видео геймплея для карточки игры: promo/out/video-9x16.mp4.
// Запуск: node promo/video.mjs  (нужны Microsoft Edge и Python с пакетом imageio-ffmpeg).
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'promo', 'out');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9378;
// Экран телефона 360×640 с плотностью 3 даёт кадр 1080×1920.
const W = 360, H = 640, DPR = 3, FPS = 30;
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

const profile = await mkdtemp(path.join(tmpdir(), 'glazomer-video-'));
const frames = await mkdtemp(path.join(tmpdir(), 'glazomer-frames-'));
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
// shots — кадры записи: время кадра в секундах и файл.
const shots = [], writes = [];
let recording = false;
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && waiting.has(m.id)) {
    waiting.get(m.id)(m);
    waiting.delete(m.id);
  } else if (m.method === 'Page.screencastFrame') {
    send('Page.screencastFrameAck', { sessionId: m.params.sessionId }, m.sessionId).catch(() => {});
    if (!recording) return;
    const file = path.join(frames, `${String(shots.length).padStart(5, '0')}.jpg`);
    shots.push({ t: m.params.metadata.timestamp, file });
    writes.push(writeFile(file, Buffer.from(m.params.data, 'base64')));
  }
};
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++seq;
  waiting.set(id, (m) => (m.error ? reject(new Error(method + ': ' + m.error.message)) : resolve(m.result)));
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});

const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const SEED = {
  tutorial: true, hints: 4, owned: 46, best: { easy: 431, mid: 388 },
  streak: { count: 5, last: key(new Date(Date.now() - 864e5)) }, day: key(new Date()), daily: {}, level: 'easy', t: 1,
};

// Сценарий выполняется на странице. Кружок-«палец» показывает, куда нажимает игрок.
const SCRIPT = `
  const $ = (id) => document.getElementById(id), wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const finger = document.createElement('div');
  finger.style.cssText = 'position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;'
    + 'background:rgba(40,44,52,.28);border:2px solid rgba(255,255,255,.85);box-shadow:0 2px 8px rgba(0,0,0,.25);'
    + 'z-index:99;pointer-events:none;opacity:0;transition:opacity .25s, scale .12s;';
  document.body.appendChild(finger);
  let fx = ${W / 2}, fy = ${H - 80};
  const place = (x, y) => { fx = x; fy = y; finger.style.translate = x + 'px ' + y + 'px'; };
  place(fx, fy);
  const ease = (k) => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  // Плавное движение: step получает долю пути от 0 до 1 на каждом кадре.
  const glide = (ms, step) => new Promise((done) => {
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      step(ease(k));
      if (k < 1) requestAnimationFrame(tick); else done();
    };
    requestAnimationFrame(tick);
  });
  const moveTo = (x, y, ms = 450) => {
    const x0 = fx, y0 = fy;
    finger.style.opacity = 1;
    return glide(ms, (k) => place(x0 + (x - x0) * k, y0 + (y - y0) * k));
  };
  const tap = async (el) => {
    const r = el.getBoundingClientRect();
    await moveTo(r.left + r.width / 2, r.top + r.height / 2);
    finger.style.scale = 0.8;
    await wait(140);
    el.click();
    finger.style.scale = 1;
    await wait(250);
    finger.style.opacity = 0;
  };
  const thumb = (v) => {
    const r = $('slider').getBoundingClientRect();
    return [r.left + 14 + (r.width - 28) * v / 1000, r.top + r.height / 2];
  };
  const setSlider = (v) => { $('slider').value = v; $('slider').dispatchEvent(new Event('input')); };
  // Игрок ведёт ползунок через точки path, примеряясь.
  const drag = async (path) => {
    let v = Number($('slider').value);
    await moveTo(...thumb(v));
    finger.style.scale = 0.8;
    for (const [to, ms] of path) {
      const from = v;
      await glide(ms, (k) => { const x = from + (to - from) * k; setSlider(Math.round(x)); place(...thumb(x)); });
      v = to;
      await wait(220);
    }
    finger.style.scale = 1;
    await wait(200);
  };
  const settle = async () => { while ($('main').disabled) await wait(100); };
  const round = async (path, hold) => {
    await wait(700);
    await drag(path);
    await tap($('main'));
    await settle();
    await wait(hold);
  };
`;
// Три раунда партии дня: путь ползунка [положение, длительность] и пауза на результате.
const ROUNDS = [
  [[[520, 900], [400, 700], [440, 500]], 1700],
  [[[300, 700], [560, 900], [500, 500]], 1700],
  [[[620, 900], [230, 900]], 2200],
];

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const call = (m, p) => send(m, p, sessionId);
const run = (code) => call('Runtime.evaluate', { expression: `(async () => { ${SCRIPT} ${code} })()`, awaitPromise: true });
await call('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: true });
await call('Page.enable');
await call('Page.addScriptToEvaluateOnNewDocument', {
  source: `localStorage.setItem('glazomer-save', ${JSON.stringify(JSON.stringify(SEED))});`,
});
await call('Page.navigate', { url: `${base}/` });
await sleep(1500);

await call('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: W * DPR, maxHeight: H * DPR, everyNthFrame: 1 });
recording = true;
const steps = ROUNDS.map(([p, hold], i) =>
  `await round(${JSON.stringify(p)}, ${hold});` + (i + 1 < ROUNDS.length ? ` await tap($('main'));` : '')).join('\n');
const res = await run(`await wait(1200); await tap($('play-daily')); ${steps}`);
if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description || 'сценарий упал');
recording = false;
const end = Date.now() / 1000;
await call('Page.stopScreencast');
await Promise.all(writes);

// Кадры приходят неравномерно — только когда картинка меняется, поэтому каждому задаётся длительность.
const list = shots.map((s, i) => {
  const d = (i + 1 < shots.length ? shots[i + 1].t : Math.max(end, s.t + 0.2)) - s.t;
  return `file '${s.file.replace(/\\/g, '/')}'\nduration ${Math.max(d, 0.001).toFixed(4)}`;
}).join('\n') + `\nfile '${shots.at(-1).file.replace(/\\/g, '/')}'\n`;
const listFile = path.join(frames, 'list.txt');
await writeFile(listFile, list);
await mkdir(OUT, { recursive: true });
const ffmpeg = execFileSync('python', ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
const out = path.join(OUT, 'video-9x16.mp4');
execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile,
  '-vf', `fps=${FPS},scale=${W * DPR}:${H * DPR}:flags=lanczos,format=yuv420p`,
  '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', '-an', out]);
console.log(`video-9x16.mp4: ${shots.length} кадров записи, ${(shots.at(-1).t - shots[0].t).toFixed(1)} с`);

ws.close();
edge.kill();
server.close();
await sleep(500);
await rm(profile, { recursive: true, force: true }).catch(() => {});
await rm(frames, { recursive: true, force: true }).catch(() => {});
