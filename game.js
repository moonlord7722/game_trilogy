(() => {
  const ROUNDS = 6;
  // min/max — границы правильного ответа, zeroAt — во сколько раз надо промахнуться для 0 очков,
  // slider — предел ползунка, showRef — подсказывать вес эталона до ответа.
  const LEVELS = [
    { id: 'easy', title: 'Лёгкий', hint: 'Вес синего предмета подсказан', min: 3, max: 40, zeroAt: 8, slider: 150, showRef: true },
    { id: 'mid', title: 'Средний', hint: 'Без подсказок', min: 3, max: 150, zeroAt: 8, slider: 500, showRef: false },
    { id: 'hard', title: 'Сложный', hint: 'Большие числа, строгие очки', min: 10, max: 1000, zeroAt: 3, slider: 3000, showRef: false },
  ];
  const GOOD = 75, OK = 40;
  // Весы: наклон в градусах на единицу ln(положено / нужно), с упором.
  const TILT_PER_LN = 14, TILT_MAX = 22;
  const PIVOT = { x: 180, y: 60 }, ARM = 115;
  // Сколько последних эталонов не повторять в свободной игре.
  const RECENT_KEEP = 12, RECENT_KEY = 'glazomer-recent';

  const $ = (id) => document.getElementById(id);
  const el = {
    level: $('level'), round: $('round'), total: $('total'), question: $('question'),
    beam: $('beam'), left: $('left-pan'), right: $('right-pan'),
    ref: $('ref'), pile: $('pile'), lock: $('lock'), refTag: $('ref-tag'), unitTag: $('unit-tag'),
    result: $('result'), verdict: $('verdict'), fact: $('fact'),
    controls: $('controls'), count: $('count'), slider: $('slider'),
    minus: $('minus'), plus: $('plus'), main: $('main'),
    start: $('start'), levels: $('levels'),
    summary: $('summary'), sumTotal: $('sum-total'), sumSquares: $('sum-squares'),
    sumList: $('sum-list'), share: $('share'), change: $('change'), again: $('again'),
  };

  let level = LEVELS[1];
  const dailyPlayed = new Set();
  let rounds = [], idx = 0, total = 0, results = [];
  let count = 1, shown = 1, phase = 'idle';
  let angle = 0, vel = 0, lastT = 0;

  // ---------- утилиты ----------

  function mulberry32(a) {
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function plural(n, forms) {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b === 1) return forms[0];
    if (b >= 2 && b <= 4) return forms[1];
    return forms[2];
  }

  const num = (n) => n.toLocaleString('ru-RU');

  // Все веса в игре приблизительные, поэтому всегда со знаком ≈.
  function fmtKg(kg) {
    if (kg >= 1000) return '≈ ' + num(Math.round(kg / 100) / 10) + ' т';
    if (kg >= 1) return '≈ ' + num(kg) + ' кг';
    return '≈ ' + num(Math.round(kg * 1000)) + ' г';
  }

  function fmtTimes(x) {
    if (x < 10) return num(Math.round(x * 10) / 10) + ' раза';
    const r = Math.round(x);
    return num(r) + ' ' + plural(r, ['раз', 'раза', 'раз']);
  }

  const cap = (s) => s.replace(/^«?./, (m) => m.toUpperCase());

  function loadRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
  }

  function saveRecent(names) {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(names.slice(-RECENT_KEEP))); } catch { /* без хранилища играем как есть */ }
  }

  // ---------- партия ----------

  function makeRounds(rng, avoid) {
    const out = [], used = new Set();
    for (let guard = 0; out.length < ROUNDS && guard < 4000; guard++) {
      const h = OBJECTS[Math.floor(rng() * OBJECTS.length)];
      const u = OBJECTS[Math.floor(rng() * OBJECTS.length)];
      const ratio = h.kg / u.kg;
      if (used.has(h) || used.has(u) || ratio < level.min || ratio > level.max) continue;
      // Недавние эталоны пропускаем, пока есть из чего выбирать.
      if (guard < 2000 && avoid.has(h.name)) continue;
      used.add(h); used.add(u);
      out.push({ h, u, ratio });
    }
    return out;
  }

  function dailySeed() {
    const d = new Date();
    return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) * 10 + LEVELS.indexOf(level);
  }

  // Первая партия дня на каждом уровне одинакова у всех, дальше случайные.
  function startGame() {
    if (dailyPlayed.has(level.id)) {
      rounds = makeRounds(mulberry32(Math.floor(Math.random() * 1e9)), new Set(loadRecent()));
    } else {
      dailyPlayed.add(level.id);
      rounds = makeRounds(mulberry32(dailySeed()), new Set());
    }
    saveRecent(loadRecent().concat(rounds.map((r) => r.h.name)));
    idx = 0; total = 0; results = [];
    el.level.textContent = level.title;
    el.start.hidden = true;
    el.summary.hidden = true;
    startRound();
  }

  function startRound() {
    const r = rounds[idx];
    phase = 'guess';
    angle = 0; vel = 0;
    el.round.textContent = `${idx + 1} / ${ROUNDS}`;
    el.total.textContent = total;
    el.question.innerHTML =
      `Сколько <span class="guess">${r.u.forms[2]}</span> уравновесят <span class="ref">${r.h.acc}</span>?`;
    el.ref.innerHTML = r.h.art;
    el.refTag.lastElementChild.textContent = fmtKg(r.h.kg);
    el.refTag.classList.toggle('off', !level.showRef);
    el.unitTag.lastElementChild.textContent = '1 шт ' + fmtKg(r.u.kg);
    el.unitTag.classList.add('off');
    el.pile.setAttribute('class', 'art guess');
    el.count.classList.remove('true');
    el.lock.classList.remove('open');
    el.result.classList.add('empty');
    el.verdict.textContent = '';
    el.fact.textContent = '';
    el.controls.classList.remove('off');
    el.main.textContent = 'Отпустить весы';
    el.main.disabled = false;
    setCount(1);
  }

  // ---------- ввод ----------

  const sliderToCount = (v) => Math.round(Math.exp(v / 1000 * Math.log(level.slider)));
  const countToSlider = (c) => Math.round(Math.log(c) / Math.log(level.slider) * 1000);

  function setCount(c, fromSlider) {
    count = Math.max(1, Math.min(level.slider, Math.round(c)));
    if (!fromSlider) el.slider.value = countToSlider(count);
    show(count);
  }

  function show(c) {
    shown = c;
    const r = rounds[idx];
    el.count.innerHTML = `<b>× ${num(c)}</b>${plural(c, r.u.forms)}`;
    drawPile(c, r.u);
  }

  // Удержание кнопки: сначала по одному, потом шаг растёт вместе с числом.
  function hold(btn, dir) {
    let timer = 0, ticks = 0;
    const step = () => {
      ticks++;
      const s = ticks < 8 ? 1 : Math.max(1, Math.round(count * 0.06));
      setCount(count + dir * s);
      timer = setTimeout(step, ticks < 8 ? 140 : 70);
    };
    const stop = () => { clearTimeout(timer); ticks = 0; };
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (phase !== 'guess') return;
      stop(); step();
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, stop));
  }

  hold(el.minus, -1);
  hold(el.plus, 1);
  el.slider.addEventListener('input', () => {
    if (phase === 'guess') setCount(sliderToCount(+el.slider.value), true);
  });

  el.main.addEventListener('click', () => {
    if (phase === 'guess') release();
    else if (phase === 'done') next();
  });
  el.again.addEventListener('click', startGame);
  el.change.addEventListener('click', () => {
    el.summary.hidden = true;
    el.start.hidden = false;
  });
  el.share.addEventListener('click', async () => {
    const squares = results.map((r) => (r.score >= GOOD ? '🟩' : r.score >= OK ? '🟨' : '🟥')).join('');
    const text = `Глазомер · вес · ${level.title.toLowerCase()} — ${total} из ${ROUNDS * 100}\n${squares}`;
    try {
      await navigator.clipboard.writeText(text);
      el.share.textContent = 'Скопировано';
    } catch {
      el.share.textContent = text;
    }
  });

  LEVELS.forEach((lv) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `${lv.title}<small>${lv.hint}</small>`;
    b.addEventListener('click', () => { level = lv; startGame(); });
    el.levels.appendChild(b);
  });

  // ---------- раскрытие ----------

  function release() {
    const r = rounds[idx];
    phase = 'swing';
    el.controls.classList.add('off');
    el.main.disabled = true;
    el.lock.classList.add('open');

    const f = count / r.ratio;
    const score = Math.round(100 * Math.max(0, 1 - Math.abs(Math.log(f)) / Math.log(level.zeroAt)));
    const need = Math.max(1, Math.round(r.ratio));
    results.push({ r, guess: count, need, score });
    total += score;

    setTimeout(() => {
      el.verdict.textContent =
        score >= 90 ? `Почти точно · +${score}`
        : f > 1 ? `Перебор в ${fmtTimes(f)} · +${score}`
        : `Недобор в ${fmtTimes(1 / f)} · +${score}`;
      el.result.classList.remove('empty');
      el.total.textContent = total;
    }, 1500);

    setTimeout(() => {
      phase = 'truth';
      el.pile.setAttribute('class', 'art true');
      el.count.classList.add('true');
      el.refTag.classList.remove('off');
      el.unitTag.classList.remove('off');
      const from = count, t0 = performance.now(), dur = 900;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        show(Math.max(1, Math.round(Math.exp(Math.log(from) + (Math.log(need) - Math.log(from)) * e))));
        if (k < 1) return requestAnimationFrame(tick);
        el.fact.innerHTML = `Нужно <b>≈ ${num(need)} ${plural(need, r.u.forms)}</b>`;
        el.main.textContent = idx + 1 < ROUNDS ? 'Дальше' : 'Итоги';
        el.main.disabled = false;
        phase = 'done';
      };
      requestAnimationFrame(tick);
    }, 2700);
  }

  function next() {
    idx++;
    if (idx < ROUNDS) return startRound();
    idx = ROUNDS - 1;
    el.sumTotal.innerHTML = `${total} <small>из ${ROUNDS * 100} · ${level.title.toLowerCase()}</small>`;
    el.sumSquares.innerHTML = results
      .map((x) => `<i class="${x.score >= GOOD ? 's-good' : x.score >= OK ? 's-mid' : 's-bad'}"></i>`).join('');
    el.sumList.innerHTML = results
      .map((x) => `<li><span>${cap(x.r.h.forms[0])} ≈ ${num(x.need)} ${plural(x.need, x.r.u.forms)}</span><span>+${x.score}</span></li>`)
      .join('');
    el.share.textContent = 'Скопировать результат';
    el.summary.hidden = false;
  }

  // ---------- отрисовка ----------

  const PILE_ROWS = 7, PILE_W = 92, ICON_MAX = 30;
  const PILE_MAX = PILE_ROWS * (PILE_ROWS + 1) / 2;
  let pileKey = '';

  // Пирамида на чаше. Пока предметов мало, они крупные; больше 28 штук не рисуем.
  function drawPile(n, obj) {
    const m = Math.min(n, PILE_MAX);
    const key = m + obj.name;
    if (key === pileKey) return;
    pileKey = key;
    let base = 1;
    while (base * (base + 1) / 2 < m) base++;
    const icon = Math.min(ICON_MAX, PILE_W / base);
    let svg = '', left = m;
    for (let row = 0; left > 0; row++) {
      const inRow = Math.min(left, base - row);
      for (let i = 0; i < inRow; i++) {
        const x = (i - inRow / 2) * icon;
        const y = 93.5 - (row + 1) * icon;
        svg += `<g transform="translate(${x} ${y}) scale(${icon / 100 * 0.94})">${obj.art}</g>`;
      }
      left -= inRow;
    }
    el.pile.innerHTML = svg;
  }

  function frame(t) {
    const dt = Math.min(0.033, (t - lastT) / 1000 || 0);
    lastT = t;
    let target = 0;
    // После раскрытия весы стоят ровно: остаток от округления до целых штук не показываем.
    if (phase === 'swing' || phase === 'truth') {
      const tilt = TILT_PER_LN * Math.log(shown / rounds[idx].ratio);
      target = Math.max(-TILT_MAX, Math.min(TILT_MAX, tilt));
    }
    vel += (-40 * (angle - target) - 5 * vel) * dt;
    angle += vel * dt;

    const rad = angle * Math.PI / 180;
    const dx = Math.cos(rad) * ARM, dy = Math.sin(rad) * ARM;
    el.beam.setAttribute('transform', `rotate(${angle} ${PIVOT.x} ${PIVOT.y})`);
    el.left.setAttribute('transform', `translate(${PIVOT.x - dx} ${PIVOT.y - dy})`);
    el.right.setAttribute('transform', `translate(${PIVOT.x + dx} ${PIVOT.y + dy})`);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
