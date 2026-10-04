(() => {
  const ROUNDS = 6;
  // min/max — границы правильного ответа, zeroAt — во сколько раз надо промахнуться для 0 очков,
  // slider — предел ползунка, showRef — подсказывать вес эталона до ответа,
  // need — сколько предметов должно быть в коллекции, чтобы уровень открылся.
  const LEVELS = [
    { id: 'easy', title: 'Лёгкий', hint: 'Вес синего предмета подсказан', min: 3, max: 40, zeroAt: 8, slider: 150, showRef: true, need: 0 },
    { id: 'mid', title: 'Средний', hint: 'Без подсказок', min: 3, max: 150, zeroAt: 8, slider: 500, showRef: false, need: 40 },
    { id: 'hard', title: 'Сложный', hint: 'Большие числа, строгие очки', min: 10, max: 1000, zeroAt: 3, slider: 3000, showRef: false, need: 80 },
  ];
  const GOOD = 75, OK = 40;
  // Весы: наклон в градусах на единицу ln(положено / нужно), с упором.
  const TILT_PER_LN = 14, TILT_MAX = 22;
  // PAN_SCALE — во сколько раз чаши с предметами крупнее, чем нарисованы в разметке.
  const PIVOT = { x: 180, y: 30 }, ARM = 110, PAN_SCALE = 1.25;
  // Сколько последних эталонов не повторять в свободной игре.
  const RECENT_KEEP = 12, RECENT_KEY = 'glazomer-recent';
  const SAVE_KEY = 'glazomer-save';
  // Коллекция: стартовый набор открыт сразу, остальные предметы идут в порядке ORDER.
  // До ACTIVE_UNTIL предметы даются за любую доигранную партию, дальше — за точные раунды.
  const STARTERS = [
    'яблоко', 'батон', 'футбольный мяч', 'курица', 'кирпич', 'кот', 'арбуз', 'ведро воды', 'велосипед', 'пудовая гиря',
    'овчарка', 'человек', 'холодильник', 'свинья', 'пианино', 'лошадь', 'корова', '«Нива»', 'слон', 'городской автобус',
  ];
  const ACTIVE_STEP = 5, ACTIVE_UNTIL = 40;
  const START_HINTS = 3;
  // Реклама между партиями — при первом запуске партии за визит и дальше после каждых AD_EVERY доигранных.
  // В первый визит игрока её нет.
  const AD_EVERY = 2;
  // Подсказка «диапазон» оставляет ответы, отличающиеся не больше чем в RANGE_HINT раз.
  const RANGE_HINT = 4;
  const TUTORIAL = ['человек', 'кот'];

  const $ = (id) => document.getElementById(id);
  const el = {
    level: $('level'), round: $('round'), total: $('total'), question: $('question'),
    beam: $('beam'), left: $('left-pan'), right: $('right-pan'),
    ref: $('ref'), pile: $('pile'), lock: $('lock'), refTag: $('ref-tag'), unitTag: $('unit-tag'),
    result: $('result'), verdict: $('verdict'), fact: $('fact'),
    controls: $('controls'), count: $('count'), slider: $('slider'),
    minus: $('minus'), plus: $('plus'), main: $('main'),
    hints: $('hints'), hintCount: $('hint-count'), hintAd: $('hint-ad'), swap: $('swap'),
    hintBtns: [...document.querySelectorAll('#hints button[data-hint]')],
    exit: $('exit'), leave: $('leave'), leaveStay: $('leave-stay'), leaveGo: $('leave-go'),
    levelNote: $('level-note'), playDaily: $('play-daily'), playFree: $('play-free'),
    start: $('start'), levels: $('levels'), streak: $('streak'), sumMeta: $('sum-meta'),
    summary: $('summary'), sumTotal: $('sum-total'), sumSquares: $('sum-squares'),
    sumList: $('sum-list'), sumNew: $('sum-new'), share: $('share'), change: $('change'), again: $('again'),
    openAlbum: $('open-album'), album: $('album'), albumCount: $('album-count'),
    albumNext: $('album-next'), albumGrid: $('album-grid'), albumBack: $('album-back'),
  };

  let level = LEVELS[0];
  let isDaily = false, isTutorial = false, coachStep = 0;
  let rounds = [], idx = 0, total = 0, results = [];
  let count = 1, shown = 1, phase = 'idle';
  let lo = 1, hi = 1;
  // Подсказки, взятые в этой партии: номер раунда → тип.
  let hintLog = {};
  let angle = 0, vel = 0, lastT = 0;
  let newBest = false;
  // run растёт при каждом входе и выходе из партии: по нему отложенные шаги раскрытия понимают, что устарели.
  let run = 0;
  // inside — в истории браузера лежит запись партии или коллекции, «назад» возвращает в меню.
  let inside = false, leaving = false;
  let gained = { items: [], hint: false, level: null };
  // adDue — перед следующей партией показать рекламу, played — партий доиграно за визит,
  // newcomer — первый визит игрока: в нём рекламы между партиями нет совсем.
  let adDue = false, played = 0, newcomer = false;
  // Партия дня: spare — запасной раунд, swapAt — номер раунда, переигранного за видео,
  // finished — итог партии уже записан.
  let spare = null, swapAt = null, finished = false;

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
  const byName = (name) => OBJECTS.find((o) => o.name === name);
  const figure = (o) =>
    `<figure><svg viewBox="-4 -4 108 108"><g class="art ref">${o.art}</g></svg><figcaption>${o.name}<small>${fmtKg(o.kg)}</small></figcaption></figure>`;

  function loadRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
  }

  function saveRecent(names) {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(names.slice(-RECENT_KEEP))); } catch { /* без хранилища играем как есть */ }
  }

  // ---------- сохранение ----------

  // best — рекорд по уровням, streak — серия дней с доигранной партией дня,
  // daily — партии дня за дату day: { done, total, guesses, hints } по id уровня,
  // owned — размер коллекции, hints — запас подсказок, tutorial — обучение пройдено,
  // level — последний выбранный уровень, t — время записи: по нему выбирается между браузером и облаком.
  function loadSave() {
    const blank = {
      best: {}, streak: { count: 0, last: '' }, day: '', daily: {},
      owned: STARTERS.length, hints: START_HINTS, tutorial: false, level: 'easy',
    };
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      return s && typeof s === 'object' ? { ...blank, ...s } : blank;
    } catch { return blank; }
  }

  function storeLocal() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* без хранилища играем как есть */ }
  }

  function storeSave() {
    save.t = Date.now();
    storeLocal();
    Platform.store(save);
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

  // ---------- коллекция ----------

  // Порядок открытия одинаков у всех игроков.
  const ORDER = (() => {
    const rest = OBJECTS.filter((o) => !STARTERS.includes(o.name));
    const rng = mulberry32(2026);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    return STARTERS.map(byName).concat(rest);
  })();

  const collection = () => ORDER.slice(0, save.owned);
  const unlocked = (lv) => save.owned >= lv.need;

  // Начисляет предметы за доигранную партию и запоминает, что показать в итогах.
  function reward() {
    const before = save.owned;
    if (save.owned < ACTIVE_UNTIL) {
      save.owned = Math.min(ACTIVE_UNTIL, save.owned + ACTIVE_STEP);
    } else if (level.need > 0) {
      const sharp = results.filter((x) => x.score >= GOOD && !x.hinted).length;
      save.owned = Math.min(ORDER.length, save.owned + sharp);
    }
    gained = {
      items: ORDER.slice(before, save.owned),
      hint: isDaily && total >= ROUNDS * 100 / 2,
      level: LEVELS.find((lv) => lv.need > before && lv.need <= save.owned) || null,
    };
    if (gained.hint) save.hints++;
  }

  function nextGoal() {
    const left = (n) => `${n} ${plural(n, ['предмет', 'предмета', 'предметов'])}`;
    if (save.owned >= ORDER.length) return 'Коллекция собрана целиком.';
    if (save.owned < ACTIVE_UNTIL) {
      return `До среднего уровня — ещё ${left(ACTIVE_UNTIL - save.owned)}. За каждую доигранную партию открывается ${ACTIVE_STEP}.`;
    }
    const hard = LEVELS[2].need;
    const goal = save.owned < hard ? `До сложного уровня — ещё ${left(hard - save.owned)}.` : `Осталось открыть ${left(ORDER.length - save.owned)}.`;
    return `${goal} Предмет даётся за каждый раунд от ${GOOD} очков без подсказки на среднем и сложном.`;
  }

  function showAlbum() {
    el.albumCount.textContent = `· ${save.owned} из ${ORDER.length}`;
    el.albumNext.textContent = nextGoal();
    el.albumGrid.innerHTML = collection().map(figure).join('')
      + '<figure class="locked"><div>?</div></figure>'.repeat(ORDER.length - save.owned);
    el.album.hidden = false;
    enter();
  }

  // ---------- партия ----------

  function makeRounds(rng, avoid, pool, n = ROUNDS) {
    const out = [], used = new Set();
    for (let guard = 0; out.length < n && guard < 4000; guard++) {
      const h = pool[Math.floor(rng() * pool.length)];
      const u = pool[Math.floor(rng() * pool.length)];
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

  function judge(r, guess, i) {
    const f = guess / r.ratio;
    const need = Math.max(1, Math.round(r.ratio));
    // Ответ считается в целых штуках, поэтому попадание в него — это полные 100 очков.
    const score = guess === need ? 100
      : Math.round(100 * Math.max(0, 1 - Math.abs(Math.log(f)) / Math.log(level.zeroAt)));
    return { r, guess, f, score, need, hinted: Boolean(hintLog[i]), swapped: i === swapAt };
  }

  // Партия дня на каждом уровне одинакова у всех и собрана из всех предметов,
  // свободная игра — из предметов коллекции.
  // Недоигранная партия дня продолжается с того же раунда. Один её раунд можно переиграть
  // за видео: он заменяется запасным, тоже одинаковым у всех.
  function startGame(asDaily) {
    const daily = dailyToday();
    const entry = daily[level.id];
    isDaily = asDaily;
    isTutorial = false;
    run++;
    save.level = level.id;
    spare = null; swapAt = null; finished = false;
    if (isDaily) {
      rounds = makeRounds(mulberry32(dailySeed()), new Set(), OBJECTS, ROUNDS + 1);
      if (rounds.length > ROUNDS) spare = rounds.pop();
      if (!entry) daily[level.id] = { done: false, total: 0, guesses: [], hints: {} };
      hintLog = daily[level.id].hints || (daily[level.id].hints = {});
      if (spare && daily[level.id].swap != null) {
        swapAt = daily[level.id].swap;
        rounds[swapAt] = spare;
      }
      results = daily[level.id].guesses.slice(0, ROUNDS).map((g, i) => judge(rounds[i], g, i));
      storeSave();
    } else {
      rounds = makeRounds(mulberry32(Math.floor(Math.random() * 1e9)), new Set(loadRecent()), collection());
      hintLog = {};
      results = [];
    }
    saveRecent(loadRecent().concat(rounds.map((r) => r.h.name)));
    idx = results.length;
    total = results.reduce((sum, x) => sum + x.score, 0);
    el.level.textContent = level.title + (isDaily ? ' · день' : '');
    el.exit.textContent = '‹ Меню';
    el.start.hidden = true;
    el.summary.hidden = true;
    enter();
    // Все ответы даны, но итоги не открывались: страницу обновили на последнем раунде.
    if (idx === ROUNDS) return showSummary();
    startRound();
  }

  async function launch(asDaily) {
    if (adDue) {
      adDue = false;
      await Platform.interstitial();
    }
    startGame(asDaily);
  }

  // Обучение — один раунд на лёгком уровне без записи в сохранение.
  function startTutorial() {
    const [h, u] = TUTORIAL.map(byName);
    level = LEVELS[0];
    isDaily = false;
    isTutorial = true;
    rounds = [{ h, u, ratio: h.kg / u.kg }];
    hintLog = {};
    results = [];
    idx = 0;
    total = 0;
    el.level.textContent = 'Обучение';
    el.exit.textContent = 'Пропустить';
    el.start.hidden = true;
    startRound();
  }

  function finishTutorial() {
    isTutorial = false;
    save.tutorial = true;
    storeSave();
    toMenu();
  }

  // ---------- навигация ----------

  function enter() {
    if (inside) return;
    inside = true;
    history.pushState({ glazomer: 1 }, '');
  }

  function toMenu() {
    if (isDaily && results.length === ROUNDS && !finished) finishGame();
    run++;
    phase = 'idle';
    Platform.play(false);
    el.controls.classList.remove('pulse');
    el.main.classList.remove('pulse');
    el.leave.hidden = true;
    el.summary.hidden = true;
    showStart();
  }

  // Кнопки «назад» на экране и в телефоне идут одним путём — через историю браузера.
  // Из недоигранной свободной партии выпускаем только после подтверждения.
  window.addEventListener('popstate', () => {
    if (!inside) return;
    if (!el.album.hidden) {
      el.album.hidden = true;
      inside = false;
      return;
    }
    const midFree = !isDaily && el.summary.hidden && results.length < ROUNDS;
    if (midFree && !leaving) {
      history.pushState({ glazomer: 1 }, '');
      el.leave.hidden = false;
      return;
    }
    leaving = false;
    inside = false;
    toMenu();
  });

  function startRound() {
    const r = rounds[idx];
    phase = 'guess';
    Platform.play(true);
    angle = 0; vel = 0;
    lo = 1; hi = level.slider;
    el.round.textContent = isTutorial ? '' : `${idx + 1} / ${ROUNDS}`;
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
    el.swap.hidden = true;
    el.verdict.textContent = '';
    el.fact.textContent = '';
    el.controls.classList.remove('off');
    el.main.textContent = 'Отпустить весы';
    el.main.disabled = false;
    coachStep = 0;
    setCount(1);
    if (hintLog[idx]) applyHint(hintLog[idx]);
    refreshHints();
    if (isTutorial) {
      coachStep = 1;
      note(`На левой чаше ${r.h.forms[0]}. Набери ползунком или кнопками, сколько ${r.u.forms[2]} нужно на правую для равновесия.`);
      el.controls.classList.add('pulse');
    }
  }

  // Строка на плашке под весами, пока раунд не раскрыт: подсказка или шаг обучения.
  function note(text) {
    el.verdict.textContent = text;
    el.fact.textContent = '';
    el.result.classList.remove('empty');
  }

  // ---------- подсказки ----------

  // «Зал» сравнивает предмет на оранжевой чаше с третьим, по возможности из коллекции.
  function hallHint(r) {
    for (const pool of [collection(), OBJECTS]) {
      let best = null;
      pool.forEach((t) => {
        if (t === r.h || t === r.u) return;
        const [a, b] = t.kg > r.u.kg ? [t, r.u] : [r.u, t];
        const x = a.kg / b.kg, n = Math.round(x);
        if (n < 2 || n > 20) return;
        const err = Math.abs(x - n) / x;
        if (!best || err < best.err) best = { a, b, n, err };
      });
      if (best) return `Зал считает: ${best.a.forms[0]} весит как ≈ ${best.n} ${plural(best.n, best.b.forms)}`;
    }
    return '';
  }

  function applyHint(type) {
    const r = rounds[idx];
    if (type === 'weight') {
      el.refTag.classList.remove('off');
      note(`${cap(r.h.forms[0])} весит ${fmtKg(r.h.kg)}`);
    } else if (type === 'range') {
      // Положение ответа внутри диапазона зависит только от раунда: перезагрузка его не меняет.
      const need = Math.max(1, Math.round(r.ratio));
      const p = mulberry32(Math.round(r.ratio * 1000) + idx)();
      lo = Math.max(1, Math.floor(need / Math.pow(RANGE_HINT, p)));
      hi = Math.min(level.slider, Math.max(lo * RANGE_HINT, need));
      note(`Ответ где-то от ${num(lo)} до ${num(hi)}`);
      setCount(count);
    } else {
      note(hallHint(r));
    }
  }

  function refreshHints() {
    const taken = hintLog[idx];
    el.hints.hidden = isTutorial;
    el.hintCount.textContent = `Подсказки: ${save.hints}`;
    // Когда запас кончился, вместо счётчика предлагается подсказка за просмотр видео.
    const offer = Platform.hasAds && save.hints < 1 && !taken;
    el.hintCount.hidden = offer;
    el.hintAd.hidden = !offer;
    el.hintBtns.forEach((b) => {
      b.hidden = b.dataset.hint === 'weight' && level.showRef;
      b.disabled = Boolean(taken) || save.hints < 1;
      b.classList.toggle('on', taken === b.dataset.hint);
    });
  }

  // Одна подсказка на раунд. В партии дня она записывается сразу, как и ответ.
  function useHint(type) {
    if (phase !== 'guess' || hintLog[idx] || save.hints < 1) return;
    if (type === 'hall' && !hallHint(rounds[idx])) return;
    save.hints--;
    hintLog[idx] = type;
    storeSave();
    applyHint(type);
    refreshHints();
  }

  const canSwap = () => isDaily && Platform.hasAds && spare && swapAt === null;

  // Переигровка раскрытого раунда партии дня: ответ уже показан, поэтому раунд заменяется запасным.
  async function swapRound() {
    if (phase !== 'done' || !canSwap()) return;
    const my = run;
    if (!await Platform.rewarded() || my !== run) return;
    const entry = dailyToday()[level.id];
    swapAt = entry.swap = idx;
    entry.guesses.pop();
    delete hintLog[idx];
    total -= results.pop().score;
    rounds[idx] = spare;
    storeSave();
    startRound();
  }

  async function earnHint() {
    if (phase !== 'guess') return;
    const my = run;
    if (!await Platform.rewarded()) return;
    save.hints++;
    storeSave();
    if (my === run) refreshHints();
  }

  // ---------- ввод ----------

  const sliderToCount = (v) => Math.round(Math.exp(Math.log(lo) + v / 1000 * Math.log(hi / lo)));
  const countToSlider = (c) => Math.round(Math.log(c / lo) / Math.log(hi / lo) * 1000);

  function setCount(c, fromSlider) {
    const prev = count;
    count = Math.max(lo, Math.min(hi, Math.round(c)));
    if (!fromSlider) el.slider.value = countToSlider(count);
    show(count);
    if (coachStep === 1 && count !== prev) {
      coachStep = 2;
      note('Когда решишь, отпусти весы — они покажут, насколько ты близко.');
      el.controls.classList.remove('pulse');
      el.main.classList.add('pulse');
    }
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
  el.hintBtns.forEach((b) => b.addEventListener('click', () => useHint(b.dataset.hint)));
  el.hintAd.addEventListener('click', earnHint);
  el.swap.addEventListener('click', swapRound);
  // На площадке долгое нажатие не должно открывать меню браузера.
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  el.main.addEventListener('click', () => {
    if (phase === 'guess') release();
    else if (phase === 'done') next();
  });
  el.again.addEventListener('click', () => launch(false));
  el.change.addEventListener('click', () => history.back());
  el.exit.addEventListener('click', () => (isTutorial ? finishTutorial() : history.back()));
  el.leaveStay.addEventListener('click', () => { el.leave.hidden = true; });
  el.leaveGo.addEventListener('click', () => { leaving = true; history.back(); });
  el.playDaily.addEventListener('click', () => launch(true));
  el.playFree.addEventListener('click', () => launch(false));
  el.openAlbum.addEventListener('click', showAlbum);
  el.albumBack.addEventListener('click', () => history.back());
  el.share.addEventListener('click', async () => {
    // Раунды с подсказкой и переигранный раунд отмечены кружком вместо квадрата.
    const squares = results.map((r) => {
      const i = r.score >= GOOD ? 0 : r.score >= OK ? 1 : 2;
      return (r.hinted || r.swapped ? ['🟢', '🟡', '🔴'] : ['🟩', '🟨', '🟥'])[i];
    }).join('');
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
    el.streak.textContent = [
      n ? `Серия: ${n} ${plural(n, ['день', 'дня', 'дней'])} подряд` : '',
      `Подсказок: ${save.hints}`,
    ].filter(Boolean).join(' · ');
    el.levels.textContent = '';
    LEVELS.forEach((lv) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = lv.title;
      b.className = (lv === level ? 'on ' : '') + (unlocked(lv) ? '' : 'locked');
      b.addEventListener('click', () => { level = lv; showStart(); });
      el.levels.appendChild(b);
    });
    const open = unlocked(level), entry = daily[level.id];
    const best = save.best[level.id] ? ` · рекорд ${save.best[level.id]}` : '';
    el.levelNote.textContent = open ? level.hint + best
      : `Откроется при ${level.need} предметах в коллекции, сейчас ${save.owned}`;
    // Свободная игра открывается на весь день после любой доигранной партии дня.
    const free = Object.values(daily).some((e) => e.done);
    const day = !entry ? `${ROUNDS} раундов, одинаковых у всех`
      : entry.done ? `Сыграна: ${entry.total} из ${ROUNDS * 100}`
      : entry.guesses.length < ROUNDS ? `Продолжить: раунд ${entry.guesses.length + 1} из ${ROUNDS}`
      : 'Доиграна, открыть итоги';
    el.playDaily.innerHTML = `Партия дня<small>${day}</small>`;
    el.playDaily.disabled = !open || Boolean(entry && entry.done);
    el.playFree.innerHTML = `Свободная игра<small>${free ? 'Предметы из твоей коллекции' : 'Откроется после партии дня'}</small>`;
    el.playFree.disabled = !open || !free;
    el.openAlbum.textContent = `Коллекция · ${save.owned} из ${ORDER.length}`;
    el.start.hidden = false;
  }

  // Записывает итог доигранной партии: рекорд уровня, партию дня, серию дней и награды.
  function finishGame() {
    finished = true;
    newBest = total > (save.best[level.id] || 0);
    if (newBest) save.best[level.id] = total;
    if (isDaily) {
      const entry = dailyToday()[level.id];
      entry.done = true;
      entry.total = total;
      if (save.streak.last !== dayKey()) save.streak = { count: streakNow() + 1, last: dayKey() };
    }
    reward();
    if (++played % AD_EVERY === 0 && !newcomer) adDue = true;
    storeSave();
  }

  // ---------- раскрытие ----------

  function release() {
    const r = rounds[idx], my = run;
    phase = 'swing';
    el.controls.classList.add('off');
    el.controls.classList.remove('pulse');
    el.main.classList.remove('pulse');
    el.main.disabled = true;
    el.lock.classList.add('open');

    const res = judge(r, count, idx);
    const { f, score, need } = res;
    results.push(res);
    total += score;
    // Ответ сохраняется сразу, чтобы обновление страницы не давало переиграть раунд.
    if (isDaily) {
      dailyToday()[level.id].guesses.push(count);
      storeSave();
    }
    // Пока последний раунд можно переиграть, итог партии записывается при выходе из раунда.
    if (results.length === ROUNDS && !canSwap()) finishGame();

    setTimeout(() => {
      if (my !== run) return;
      el.verdict.textContent =
        count === need ? `Точно! · +${score}`
        : score >= 90 ? `Почти точно · +${score}`
        : f > 1 ? `Перебор в ${fmtTimes(f)} · +${score}`
        : `Недобор в ${fmtTimes(1 / f)} · +${score}`;
      el.fact.textContent = '';
      el.result.classList.remove('empty');
      el.total.textContent = total;
    }, 1500);

    setTimeout(() => {
      if (my !== run) return;
      phase = 'truth';
      el.pile.setAttribute('class', 'art true');
      el.count.classList.add('true');
      el.refTag.classList.remove('off');
      el.unitTag.classList.remove('off');
      const from = count, t0 = performance.now(), dur = 900;
      const tick = (t) => {
        if (my !== run) return;
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        show(Math.max(1, Math.round(Math.exp(Math.log(from) + (Math.log(need) - Math.log(from)) * e))));
        if (k < 1) return requestAnimationFrame(tick);
        el.fact.innerHTML = `Нужно <b>≈ ${num(need)} ${plural(need, r.u.forms)}</b>`
          + (isTutorial ? `<br>Чем ближе, тем больше очков: до 100 за раунд, в партии ${ROUNDS} раундов.` : '');
        el.main.textContent = isTutorial ? 'Играть' : idx + 1 < ROUNDS ? 'Дальше' : 'Итоги';
        el.main.disabled = false;
        el.swap.hidden = !canSwap();
        phase = 'done';
      };
      requestAnimationFrame(tick);
    }, 2700);
  }

  function next() {
    if (isTutorial) return finishTutorial();
    idx++;
    if (idx < ROUNDS) return startRound();
    showSummary();
  }

  function showSummary() {
    if (!finished) finishGame();
    idx = ROUNDS - 1;
    Platform.play(false);
    el.sumTotal.innerHTML = `${total} <small>из ${ROUNDS * 100} · ${level.title.toLowerCase()}</small>`;
    const n = streakNow();
    el.sumMeta.textContent = [
      isDaily ? 'Партия дня' : 'Свободная игра',
      newBest ? 'новый рекорд' : `рекорд ${save.best[level.id]}`,
      n ? `серия ${n} ${plural(n, ['день', 'дня', 'дней'])}` : '',
    ].filter(Boolean).join(' · ');
    el.sumSquares.innerHTML = results
      .map((x) => `<i class="${x.score >= GOOD ? 's-good' : x.score >= OK ? 's-mid' : 's-bad'}${x.hinted || x.swapped ? ' hinted' : ''}"></i>`).join('');
    el.sumList.innerHTML = results
      .map((x) => `<li><span>${cap(x.r.h.forms[0])} ≈ ${num(x.need)} ${plural(x.need, x.r.u.forms)}</span><span>+${x.score}</span></li>`)
      .join('');
    const notes = [
      gained.level ? `Открыт уровень «${gained.level.title}»` : '',
      gained.hint ? '+1 подсказка за партию дня' : '',
      gained.items.length ? `Новое в коллекции · ${save.owned} из ${ORDER.length}` : nextGoal(),
    ].filter(Boolean);
    el.sumNew.innerHTML = notes.map((t) => `<p>${t}</p>`).join('')
      + (gained.items.length ? `<div class="shelf">${gained.items.map(figure).join('')}</div>` : '');
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
    // Пока площадка держит игру на паузе (реклама, свёрнутая вкладка), весы стоят.
    const dt = Platform.paused ? 0 : Math.min(0.033, (t - lastT) / 1000 || 0);
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
    el.left.setAttribute('transform', `translate(${PIVOT.x - dx} ${PIVOT.y - dy}) scale(${PAN_SCALE})`);
    el.right.setAttribute('transform', `translate(${PIVOT.x + dx} ${PIVOT.y + dy}) scale(${PAN_SCALE})`);
    requestAnimationFrame(frame);
  }

  // Из браузера и облака берётся то сохранение, которое записано позже.
  async function boot() {
    const cloud = await Platform.init();
    if (cloud && (cloud.t || 0) > (save.t || 0)) {
      Object.assign(save, cloud);
      storeLocal();
    }
    level = LEVELS.find((lv) => lv.id === save.level && unlocked(lv)) || LEVELS[0];
    newcomer = !save.tutorial;
    adDue = !newcomer;
    if (save.tutorial) showStart(); else startTutorial();
    requestAnimationFrame(frame);
    Platform.ready();
  }

  boot();
})();
