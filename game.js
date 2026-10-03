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
  const SAVE_KEY = 'glazomer-save';

  const $ = (id) => document.getElementById(id);
  const el = {
    level: $('level'), round: $('round'), total: $('total'), question: $('question'),
    beam: $('beam'), left: $('left-pan'), right: $('right-pan'),
    ref: $('ref'), pile: $('pile'), lock: $('lock'), refTag: $('ref-tag'), unitTag: $('unit-tag'),
    result: $('result'), verdict: $('verdict'), fact: $('fact'),
    controls: $('controls'), count: $('count'), slider: $('slider'),
    minus: $('minus'), plus: $('plus'), main: $('main'),
    start: $('start'), levels: $('levels'), streak: $('streak'), sumMeta: $('sum-meta'),
    summary: $('summary'), sumTotal: $('sum-total'), sumSquares: $('sum-squares'),
    sumList: $('sum-list'), share: $('share'), change: $('change'), again: $('again'),
  };

  let level = LEVELS[1];
  let isDaily = false;
  let rounds = [], idx = 0, total = 0, results = [];
  let count = 1, shown = 1, phase = 'idle';
  let angle = 0, vel = 0, lastT = 0;
  let newBest = false;

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

  // ---------- сохранение ----------

  // best — рекорд по уровням, streak — серия дней с доигранной партией дня,
  // daily — партии дня за дату day: { done, total, guesses } по id уровня.
  function loadSave() {
    const blank = { best: {}, streak: { count: 0, last: '' }, day: '', daily: {} };
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      return s && typeof s === 'object' ? { ...blank, ...s } : blank;
    } catch { return blank; }
  }

  function storeSave() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* без хранилища играем как есть */ }
  }

  function dayKey(shift = 0) {
    const d = new Date();
    d.setDate(d.getDate() + shift);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Партии дня хранятся только за сегодня: с новой датой вчерашние сбрасываются.
  function dailyToday() {
    if (save.day !== dayKey()) { save.day = dayKey(); save.daily = {}; }
    return save.daily;
  }

  function streakNow() {
    const { count, last } = save.streak;
    return last === dayKey() || last === dayKey(-1) ? count : 0;
  }

  const save = loadSave();

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

  function judge(r, guess) {
    const f = guess / r.ratio;
    const score = Math.round(100 * Math.max(0, 1 - Math.abs(Math.log(f)) / Math.log(level.zeroAt)));
    return { r, guess, f, score, need: Math.max(1, Math.round(r.ratio)) };
  }

  // Первая партия дня на каждом уровне одинакова у всех, дальше случайные.
  // Недоигранная партия дня продолжается с того же раунда.
  function startGame() {
    const daily = dailyToday();
    const entry = daily[level.id];
    isDaily = !(entry && entry.done);
    if (isDaily) {
      rounds = makeRounds(mulberry32(dailySeed()), new Set());
      if (!entry) daily[level.id] = { done: false, total: 0, guesses: [] };
      results = daily[level.id].guesses.slice(0, ROUNDS - 1).map((g, i) => judge(rounds[i], g));
      storeSave();
    } else {
      rounds = makeRounds(mulberry32(Math.floor(Math.random() * 1e9)), new Set(loadRecent()));
      results = [];
    }
    saveRecent(loadRecent().concat(rounds.map((r) => r.h.name)));
    idx = results.length;
    total = results.reduce((sum, x) => sum + x.score, 0);
    el.level.textContent = level.title + (isDaily ? ' · день' : '');
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
    showStart();
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

  function showStart() {
    const daily = dailyToday();
    const n = streakNow();
    el.streak.textContent = n ? `Серия: ${n} ${plural(n, ['день', 'дня', 'дней'])} подряд` : '';
    el.levels.textContent = '';
    LEVELS.forEach((lv) => {
      const entry = daily[lv.id];
      const day = !entry ? 'Партия дня ждёт'
        : entry.done ? `Партия дня: ${entry.total} из ${ROUNDS * 100}`
        : `Партия дня: раунд ${entry.guesses.length + 1} из ${ROUNDS}`;
      const best = save.best[lv.id] ? ` · рекорд ${save.best[lv.id]}` : '';
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = `${lv.title}<small>${lv.hint}</small><small class="state">${day}${best}</small>`;
      b.addEventListener('click', () => { level = lv; startGame(); });
      el.levels.appendChild(b);
    });
    el.start.hidden = false;
  }

  // Записывает итог доигранной партии: рекорд уровня, партию дня и серию дней.
  function finishGame() {
    newBest = total > (save.best[level.id] || 0);
    if (newBest) save.best[level.id] = total;
    if (isDaily) {
      const entry = dailyToday()[level.id];
      entry.done = true;
      entry.total = total;
      if (save.streak.last !== dayKey()) save.streak = { count: streakNow() + 1, last: dayKey() };
    }
    storeSave();
  }

  // ---------- раскрытие ----------

  function release() {
    const r = rounds[idx];
    phase = 'swing';
    el.controls.classList.add('off');
    el.main.disabled = true;
    el.lock.classList.add('open');

    const res = judge(r, count);
    const { f, score, need } = res;
    results.push(res);
    total += score;
    // Ответ сохраняется сразу, чтобы обновление страницы не давало переиграть раунд.
    if (isDaily) {
      dailyToday()[level.id].guesses.push(count);
      storeSave();
    }
    if (results.length === ROUNDS) finishGame();

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
    const n = streakNow();
    el.sumMeta.textContent = [
      isDaily ? 'Партия дня' : 'Свободная игра',
      newBest ? 'новый рекорд' : `рекорд ${save.best[level.id]}`,
      n ? `серия ${n} ${plural(n, ['день', 'дня', 'дней'])}` : '',
    ].filter(Boolean).join(' · ');
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

  showStart();
  requestAnimationFrame(frame);
})();
