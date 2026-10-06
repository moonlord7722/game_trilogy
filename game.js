(() => {
  const ROUNDS = 6;
  // min/max — границы правильного ответа, zeroAt — во сколько раз надо промахнуться для 0 очков,
  // slider — предел ползунка, showRef — подсказывать вес эталона до ответа,
  // need — сколько предметов должно быть в коллекции, чтобы уровень открылся,
  // wow — в каждой паре есть «удивительный» предмет из тех, что идут сверх первой сотни.
  const WEIGHT_LEVELS = [
    { id: 'easy', title: 'Лёгкий', hint: 'Вес левого предмета подсказан', min: 3, max: 40, zeroAt: 8, slider: 150, showRef: true, need: 0 },
    { id: 'mid', title: 'Средний', hint: 'Без подсказок', min: 3, max: 150, zeroAt: 8, slider: 500, showRef: false, need: 40 },
    { id: 'hard', title: 'Сложный', hint: 'Большие числа, строгие очки', min: 10, max: 1000, zeroAt: 3, slider: 3000, showRef: false, need: 80 },
    { id: 'expert', title: 'Эксперт', hint: 'Пары с удивительными предметами', min: 3, max: 1000, zeroAt: 3, slider: 3000, showRef: false, need: 100, wow: true },
  ];
  // Режим «Размер»: min/max — во сколько раз предметы пары отличаются по размеру,
  // span — во сколько раз ползунок уводит оранжевый предмет в каждую сторону от размера синего.
  const SIZE_LEVELS = [
    { id: 'easy', title: 'Лёгкий', hint: 'Размеры подписаны', min: 1.2, max: 4, zeroAt: 3, span: 8, showRef: true, need: 0 },
    { id: 'mid', title: 'Средний', hint: 'Без подсказок', min: 1.2, max: 8, zeroAt: 2.5, span: 16, showRef: false, need: 40 },
    { id: 'hard', title: 'Сложный', hint: 'Большая разница, строгие очки', min: 3, max: 12, zeroAt: 2, span: 25, showRef: false, need: 80 },
    { id: 'expert', title: 'Эксперт', hint: 'Пары с удивительными предметами', min: 1.2, max: 12, zeroAt: 1.8, span: 25, showRef: false, need: 100, wow: true },
  ];
  // Режим «Скорость»: min/max — во сколько раз отличаются скорости пары,
  // span — во сколько раз ползунок уводит скорость нижнего предмета в каждую сторону от скорости верхнего.
  const SPEED_LEVELS = [
    { id: 'easy', title: 'Лёгкий', hint: 'Скорость верхнего предмета подсказана', min: 1.2, max: 3, zeroAt: 2.5, span: 6, showRef: true, need: 0 },
    { id: 'mid', title: 'Средний', hint: 'Без подсказок', min: 1.2, max: 5, zeroAt: 2.2, span: 8, showRef: false, need: 40 },
    { id: 'hard', title: 'Сложный', hint: 'Большая разница, строгие очки', min: 2, max: 10, zeroAt: 2, span: 16, showRef: false, need: 80 },
    { id: 'expert', title: 'Эксперт', hint: 'Пары с удивительными предметами', min: 1.2, max: 10, zeroAt: 1.8, span: 16, showRef: false, need: 100, wow: true },
  ];
  const MODES = {
    weight: {
      title: 'Вес', levels: WEIGHT_LEVELS, go: 'Отпустить весы', hint: 'Вес',
      lead: 'Сколько одного весит другое? Прикинь на глаз и отпусти весы.',
    },
    size: {
      title: 'Размер', levels: SIZE_LEVELS, go: 'Замерить', hint: 'Размер',
      lead: 'Какого размера одно рядом с другим? Растяни силуэт на глаз и замерь.',
    },
    speed: {
      title: 'Скорость', levels: SPEED_LEVELS, go: 'Дать старт', hint: 'Скорость',
      lead: 'Кто кого обгонит и насколько? Выставь скорость на глаз и дай старт.',
    },
  };
  // Ответ в «Размере» засчитывается как точный, если промах меньше этой доли.
  const SIZE_EXACT = 1.03;
  const BY = { h: 'в высоту', w: 'в длину', d: 'в поперечнике', s: 'в размахе' };
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
  const RANGE_HINT = 4, SIZE_RANGE_HINT = 2.5;
  // Сверхтяжёлое (башни, пирамида, «Титаник») в «Весе» сравнивается только между собой:
  // тысячи слонов на чаше уже ничего не говорят глазу.
  const HEAVY_KG = 1e6;
  const heavy = (o) => o.kg >= HEAVY_KG;
  // Предметы от 100 т (кит, МКС, БелАЗ) кладутся на весы только против крупного — от тонны:
  // «90 слонов» ещё можно представить, «двадцать тысяч яблок» — нет.
  const BIG_KG = 1e5, BIG_UNIT_KG = 1000;
  const TUTORIAL = ['человек', 'кот'];
  // Цвета левого и правого предмета игрок выбирает сам: в сохранении лежат два тона цветового круга.
  // Пока выбора нет, остаются исходные синий и оранжевый.
  const CLASSIC = { ref: '#2e6eb5', guess: '#d85a30', truth: '#1d8c66', hues: [211, 15] };
  // Тон затемняется, пока силуэт не станет достаточно контрастным на бумаге.
  const PAPER_LUM = 0.895, CONTRAST = 3.2, SATURATION = 0.68;
  // Зелёный цвет правильного ответа уступает место другому, если предмет выкрашен в похожий.
  const TRUTH_HUES = [158, 280, 25], TRUTH_GAP = 50;
  // Готовые пары; первая — исходные цвета.
  const PAIRS = [null, [215, 330], [275, 40], [190, 355], [130, 300], [345, 200]];
  // Кружки стоят на середине кольца: доля от размера круга. Ближе WHEEL_HOLE к центру круг не реагирует.
  const KNOB_R = 43.5, WHEEL_HOLE = 0.6;

  const $ = (id) => document.getElementById(id);
  const el = {
    level: $('level'), round: $('round'), total: $('total'), question: $('question'),
    beam: $('beam'), left: $('left-pan'), right: $('right-pan'),
    app: $('app'), modes: $('modes'), lead: $('lead'), modeNames: [...document.querySelectorAll('.mode-name')],
    tRef: $('t-ref'), tGuess: $('t-guess'), tRefPre: $('t-ref-pre'), tGhost: $('t-ghost'),
    tRefTag: $('t-ref-tag'), tGuessTag: $('t-guess-tag'), tTicks: $('t-ticks'),
    sRef: $('s-ref'), sGuess: $('s-guess'), sGhost: $('s-ghost'), sRefTag: $('s-ref-tag'), sGuessTag: $('s-guess-tag'),
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
    openSettings: $('open-settings'), settings: $('settings'), settingsBack: $('settings-back'),
    wheel: $('wheel'), wheelRing: $('wheel-ring'), wheelView: $('wheel-view'),
    knobs: [$('knob-ref'), $('knob-guess')], pairs: $('pairs'),
  };

  let mode = 'weight', LEVELS = WEIGHT_LEVELS;
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
    if (kg >= 1e9) return '≈ ' + num(Math.round(kg / 1e8) / 10) + ' млн т';
    if (kg >= 1e6) return '≈ ' + num(Math.round(kg / 1e5) / 10) + ' тыс. т';
    if (kg >= 1000) return '≈ ' + num(Math.round(kg / 100) / 10) + ' т';
    if (kg >= 1) return '≈ ' + num(kg) + ' кг';
    return '≈ ' + num(Math.round(kg * 10000) / 10) + ' г';
  }

  function fmtTimes(x) {
    if (x < 10) return num(Math.round(x * 10) / 10) + ' раза';
    const r = Math.round(x);
    return num(r) + ' ' + plural(r, ['раз', 'раза', 'раз']);
  }

  // Размеры тоже приблизительные: метры, сантиметры, а мелочь — с десятыми сантиметра.
  function fmtM(m) {
    if (m >= 10) return '≈ ' + num(Math.round(m)) + ' м';
    if (m >= 1) return '≈ ' + num(Math.round(m * 10) / 10) + ' м';
    if (m >= 0.1) return '≈ ' + num(Math.round(m * 100)) + ' см';
    return '≈ ' + num(Math.round(m * 1000) / 10) + ' см';
  }

  const fmtKmh = (v) => '≈ ' + num(v >= 10 ? Math.round(v) : Math.round(v * 10) / 10) + ' км/ч';

  const ALL = OBJECTS.concat(EXTRA);
  EXTRA.forEach((o) => { o.wow = true; });
  // size: by — мера (высота, длина, диаметр), m — метры, ext — протяжённость силуэта по этой мере.
  ALL.forEach((o) => {
    const s = SIZES[o.name];
    if (s) o.size = { by: s[0], m: s[1], ext: s[2] };
    // speed: v — км/ч, flip — силуэт смотрит влево, hop — бежит вприпрыжку.
    const v = SPEEDS[o.name];
    if (v) o.speed = { v: v[0], flip: v[1], hop: v[2] };
  });
  // Величина предмета в текущем режиме; предметы без неё в режиме не участвуют.
  const val = (o) => (mode === 'size' ? o.size && o.size.m : mode === 'speed' ? o.speed && o.speed.v : o.kg);
  const fmtVal = (o) => (mode === 'size' ? fmtM(o.size.m) : mode === 'speed' ? fmtKmh(o.speed.v) : fmtKg(o.kg));
  const usable = (list) => list.filter(val);
  // Ячейка сохранения для партии дня и рекорда: у веса — как было до появления режимов.
  const slot = () => (mode === 'weight' ? level.id : `${mode}-${level.id}`);

  const cap = (s) => s.replace(/^«?./, (m) => m.toUpperCase());
  const byName = (name) => ALL.find((o) => o.name === name);
  const figure = (o) =>
    `<figure><svg viewBox="-4 -4 108 108"><g class="art ref">${o.art}</g></svg><figcaption>${o.name}<small>${val(o) ? fmtVal(o) : o.kg ? fmtKg(o.kg) : fmtM(o.size.m)}</small></figcaption></figure>`;

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
  // colors — тона левого и правого предмета, если игрок их менял,
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
    return STARTERS.map(byName).concat(rest, EXTRA);
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
    const hard = LEVELS[2].need, expert = LEVELS[3].need;
    const goal = save.owned < hard ? `До сложного уровня — ещё ${left(hard - save.owned)}.`
      : save.owned < expert ? `До уровня «Эксперт» — ещё ${left(expert - save.owned)}.`
      : `Осталось открыть ${left(ORDER.length - save.owned)}.`;
    return `${goal} Предмет даётся за каждый раунд от ${GOOD} очков без подсказки на среднем уровне и выше.`;
  }

  function showAlbum() {
    el.albumCount.textContent = `· ${save.owned} из ${ORDER.length}`;
    el.albumNext.textContent = nextGoal();
    el.albumGrid.innerHTML = collection().map(figure).join('')
      + '<figure class="locked"><div>?</div></figure>'.repeat(ORDER.length - save.owned);
    el.album.hidden = false;
    enter();
  }

  // ---------- цвета предметов ----------

  function luminance(h, s, l) {
    const a = s * Math.min(l, 1 - l);
    const ch = (n) => {
      const k = (n + h / 30) % 12;
      const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * ch(0) + 0.7152 * ch(8) + 0.0722 * ch(4);
  }

  function tone(h) {
    let l = 52;
    while (l > 20 && (PAPER_LUM + 0.05) / (luminance(h, SATURATION, l / 100) + 0.05) < CONTRAST) l -= 2;
    return `hsl(${h}, ${SATURATION * 100}%, ${l}%)`;
  }

  const hueGap = (a, b) => {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  };
  const hues = () => (Array.isArray(save.colors) && save.colors.length === 2 && save.colors.every(Number.isFinite)
    ? save.colors : CLASSIC.hues);

  function applyColors() {
    const [a, b] = hues(), own = hues() !== CLASSIC.hues;
    const far = (t) => Math.min(hueGap(t, a), hueGap(t, b));
    const t = TRUTH_HUES.find((x) => far(x) >= TRUTH_GAP) ?? TRUTH_HUES.reduce((x, y) => (far(y) > far(x) ? y : x));
    const st = document.documentElement.style;
    st.setProperty('--ref', own ? tone(a) : CLASSIC.ref);
    st.setProperty('--guess', own ? tone(b) : CLASSIC.guess);
    st.setProperty('--true', t === TRUTH_HUES[0] ? CLASSIC.truth : tone(t));
  }

  function drawWheel() {
    const now = hues(), own = now !== CLASSIC.hues;
    el.knobs.forEach((k, i) => {
      const a = now[i] * Math.PI / 180;
      k.style.left = `${50 + KNOB_R * Math.sin(a)}%`;
      k.style.top = `${50 - KNOB_R * Math.cos(a)}%`;
    });
    [...el.pairs.children].forEach((b, i) => {
      const p = PAIRS[i];
      b.classList.toggle('on', p ? own && p[0] === now[0] && p[1] === now[1] : !own);
    });
  }

  function setHue(i, h) {
    const next = hues().slice();
    next[i] = ((Math.round(h) % 360) + 360) % 360;
    save.colors = next;
    applyColors();
    drawWheel();
  }

  function setPair(pair) {
    save.colors = pair && pair.slice();
    applyColors();
    drawWheel();
    storeSave();
  }

  function showSettings() {
    drawWheel();
    el.settings.hidden = false;
    enter();
  }

  // Круг собирается один раз: кольцо из тех же тонов, какими станут предметы, в середине — образец пары.
  (() => {
    el.wheelRing.style.background = `conic-gradient(${Array.from({ length: 37 }, (_, i) => tone(i * 10)).join(',')})`;
    el.wheelView.innerHTML = `<g class="art ref">${byName('слон').art}</g><g class="art guess" transform="translate(110 0)">${byName('кот').art}</g>`;
    PAIRS.forEach((pair) => {
      const [a, b] = pair ? pair.map(tone) : [CLASSIC.ref, CLASSIC.guess];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.background = `linear-gradient(90deg, ${a} 50%, ${b} 50%)`;
      btn.setAttribute('aria-label', pair ? 'Готовая пара цветов' : 'Исходные цвета');
      btn.addEventListener('click', () => setPair(pair));
      el.pairs.appendChild(btn);
    });

    let grabbed = -1;
    // Тон под пальцем и расстояние от центра в долях радиуса.
    const at = (e) => {
      const box = el.wheel.getBoundingClientRect();
      const dx = e.clientX - box.left - box.width / 2, dy = e.clientY - box.top - box.height / 2;
      return { h: Math.atan2(dx, -dy) * 180 / Math.PI, r: Math.hypot(dx, dy) / (box.width / 2) };
    };
    el.wheel.addEventListener('pointerdown', (e) => {
      const { h, r } = at(e);
      if (r < WHEEL_HOLE) return;
      // Нажатие мимо кружков двигает тот, что ближе по кругу.
      const knob = el.knobs.indexOf(e.target), now = hues();
      grabbed = knob >= 0 ? knob : hueGap(h, now[0]) <= hueGap(h, now[1]) ? 0 : 1;
      el.wheel.setPointerCapture(e.pointerId);
      setHue(grabbed, h);
    });
    el.wheel.addEventListener('pointermove', (e) => { if (grabbed >= 0) setHue(grabbed, at(e).h); });
    ['pointerup', 'pointercancel'].forEach((ev) => el.wheel.addEventListener(ev, () => {
      if (grabbed < 0) return;
      grabbed = -1;
      storeSave();
    }));
    el.knobs.forEach((k, i) => k.addEventListener('keydown', (e) => {
      const dir = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      setHue(i, hues()[i] + dir * 5);
      storeSave();
    }));
  })();

  applyColors();

  // ---------- партия ----------

  function makeRounds(rng, avoid, pool, n = ROUNDS) {
    const out = [], used = new Set();
    for (let guard = 0; out.length < n && guard < 4000; guard++) {
      const h = pool[Math.floor(rng() * pool.length)];
      const u = pool[Math.floor(rng() * pool.length)];
      // В весе ответ — сколько штук, в размере — во сколько раз оранжевый предмет больше синего.
      const ratio = mode === 'weight' ? h.kg / u.kg : val(u) / val(h);
      const gap = mode === 'weight' ? ratio : Math.max(ratio, 1 / ratio);
      if (gap < level.min || gap > level.max) continue;
      // Предмет встречается в партии один раз. Если предметов с нужной величиной мало, он повторяется, но не пара.
      if (guard < 3500 ? used.has(h) || used.has(u) : out.some((x) => x.h === h && x.u === u)) continue;
      if (mode === 'weight' && heavy(h) !== heavy(u)) continue;
      if (mode === 'weight' && h.kg >= BIG_KG && u.kg < BIG_UNIT_KG) continue;
      // Недавние эталоны пропускаем, пока есть из чего выбирать.
      if (guard < 2000 && avoid.has(h.name)) continue;
      // В свободной игре удивительных предметов может ещё не быть в коллекции: тогда пары идут обычные.
      if (level.wow && guard < 3000 && !h.wow && !u.wow) continue;
      used.add(h); used.add(u);
      out.push({ h, u, ratio });
    }
    return out;
  }

  function dailySeed() {
    const d = new Date();
    const base = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) * 10 + LEVELS.indexOf(level);
    return mode === 'speed' ? base * 31 + 7 : base + (mode === 'size' ? 5 : 0);
  }

  function judge(r, guess, i) {
    const f = guess / r.ratio;
    if (mode !== 'weight') {
      const off = Math.abs(Math.log(f));
      const score = off < Math.log(SIZE_EXACT) ? 100 : Math.round(100 * Math.max(0, 1 - off / Math.log(level.zeroAt)));
      return { r, guess, f, score, need: r.ratio, hinted: Boolean(hintLog[i]), swapped: i === swapAt };
    }
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
    const key = slot();
    const entry = daily[key];
    isDaily = asDaily;
    isTutorial = false;
    run++;
    save.level = level.id;
    save.mode = mode;
    spare = null; swapAt = null; finished = false;
    if (isDaily) {
      rounds = makeRounds(mulberry32(dailySeed()), new Set(), usable(ALL), ROUNDS + 1);
      if (rounds.length > ROUNDS) spare = rounds.pop();
      if (!entry) daily[key] = { done: false, total: 0, guesses: [], hints: {} };
      hintLog = daily[key].hints || (daily[key].hints = {});
      if (spare && daily[key].swap != null) {
        swapAt = daily[key].swap;
        rounds[swapAt] = spare;
      }
      results = daily[key].guesses.slice(0, ROUNDS).map((g, i) => judge(rounds[i], g, i));
      storeSave();
    } else {
      rounds = makeRounds(mulberry32(Math.floor(Math.random() * 1e9)), new Set(loadRecent()), usable(collection()));
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
    setMode('weight');
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
    const panel = [el.album, el.settings].find((p) => !p.hidden);
    if (panel) {
      panel.hidden = true;
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
    race = null;
    if (mode !== 'weight') { lo = 1 / level.span; hi = level.span; }
    el.round.textContent = isTutorial ? '' : `${idx + 1} / ${ROUNDS}`;
    el.total.textContent = total;
    el.question.innerHTML = mode === 'speed'
      ? `<span class="ref">${cap(r.h.forms[0])}</span> на полном ходу. С какой скоростью мчится <span class="guess">${r.u.forms[0]}</span>?`
      : mode === 'size'
      ? `<span class="ref">${cap(r.h.forms[0])}</span> в масштабе. Какого размера <span class="guess">${r.u.forms[0]}</span>?`
      : `Сколько <span class="guess">${r.u.forms[2]}</span> уравновесят <span class="ref">${r.h.acc}</span>?`;
    if (mode === 'size') setScene(r);
    if (mode === 'speed') setTrack(r);
    el.ref.innerHTML = r.h.art;
    if (mode === 'weight') setTag(el.refTag, fmtKg(r.h.kg));
    el.refTag.classList.toggle('off', !level.showRef);
    if (mode === 'weight') setTag(el.unitTag, '1 шт ' + fmtKg(r.u.kg));
    el.unitTag.classList.add('off');
    el.pile.setAttribute('class', 'art guess');
    el.count.classList.remove('true');
    el.lock.classList.remove('open');
    el.result.classList.add('empty');
    el.swap.hidden = true;
    el.verdict.textContent = '';
    el.fact.textContent = '';
    el.controls.classList.remove('off');
    el.main.textContent = MODES[mode].go;
    el.main.disabled = false;
    coachStep = 0;
    setCount(1);
    if (hintLog[idx]) applyHint(hintLog[idx]);
    refreshHints();
    if (mode === 'size' && !save.sizeTip && !hintLog[idx]) {
      note('Левый предмет в масштабе. Ползунком подгони правый до настоящего размера и замерь.');
    }
    if (mode === 'speed' && !save.speedTip && !hintLog[idx]) {
      note('Бледные тени — прогноз финиша. Выставь скорость нижнего и дай старт.');
    }
    if (isTutorial) {
      coachStep = 1;
      note(`На левой чаше ${r.h.forms[0]}. Набери ползунком или кнопками, сколько ${r.u.forms[2]} нужно на правую для равновесия.`);
      el.controls.classList.add('pulse');
    }
  }

  // Подпись на сцене: рамка растягивается под текст. cx — середина подписи.
  function setTag(tag, text, cx = 0) {
    const w = Math.max(60, text.length * 6.9 + 14);
    tag.lastElementChild.textContent = text;
    tag.firstElementChild.setAttribute('x', cx - w / 2);
    tag.firstElementChild.setAttribute('width', w);
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
    for (const pool of [collection(), ALL]) {
      let best = null;
      usable(pool).forEach((t) => {
        if (t === r.h || t === r.u) return;
        if (mode === 'weight' && heavy(t) !== heavy(r.u)) return;
        const [a, b] = val(t) > val(r.u) ? [t, r.u] : [r.u, t];
        const x = val(a) / val(b), n = Math.round(x);
        if (n < 2 || n > 20) return;
        const err = Math.abs(x - n) / x;
        if (!best || err < best.err) best = { a, b, n, err };
      });
      const as = mode === 'size' ? 'по размеру как' : 'весит как';
      if (best && mode === 'speed') {
        return `Зал считает: ${best.a.forms[0]} ≈ в ${best.n} ${plural(best.n, ['раз', 'раза', 'раз'])} быстрее, чем ${best.b.forms[0]}`;
      }
      if (best) return `Зал считает: ${best.a.forms[0]} ${as} ≈ ${best.n} ${plural(best.n, best.b.forms)}`;
    }
    return '';
  }

  function applyHint(type) {
    const r = rounds[idx];
    if (type === 'weight' && mode === 'size') {
      el.sRefTag.classList.remove('off');
      note(`${cap(r.h.forms[0])} — ${fmtM(r.h.size.m)} ${BY[r.h.size.by]}`);
      show(count);
    } else if (type === 'weight' && mode === 'speed') {
      el.tRefTag.classList.remove('off');
      note(`${cap(r.h.forms[0])} — ${fmtKmh(r.h.speed.v)}`);
      show(count);
    } else if (type === 'weight') {
      el.refTag.classList.remove('off');
      note(`${cap(r.h.forms[0])} весит ${fmtKg(r.h.kg)}`);
    } else if (type === 'range' && mode !== 'weight') {
      const p = mulberry32(Math.round(r.ratio * 1000) + idx)();
      lo = Math.max(1 / level.span, r.ratio / Math.pow(SIZE_RANGE_HINT, p));
      hi = Math.min(level.span, lo * SIZE_RANGE_HINT);
      const unit = (x) => (mode === 'size' ? fmtM(x * r.u.size.m / r.ratio) : fmtKmh(x * r.h.speed.v));
      note(`Ответ — от ${unit(lo)} до ${unit(hi)}`.replace(/≈ /g, ''));
      setCount(count);
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
      if (b.dataset.hint === 'weight') b.textContent = MODES[mode].hint;
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
    const entry = dailyToday()[slot()];
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

  const sliderToCount = (v) => {
    const c = Math.exp(Math.log(lo) + v / 1000 * Math.log(hi / lo));
    return mode !== 'weight' ? c : Math.round(c);
  };
  const countToSlider = (c) => Math.round(Math.log(c / lo) / Math.log(hi / lo) * 1000);

  function setCount(c, fromSlider) {
    const prev = count;
    // В размере ответ — дробное отношение, три знака хватает с запасом.
    count = Math.max(lo, Math.min(hi, mode !== 'weight' ? Math.round(c * 1000) / 1000 : Math.round(c)));
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
    if (mode === 'speed') {
      const open = level.showRef || hintLog[idx] === 'weight' || phase === 'truth' || phase === 'done';
      el.count.innerHTML = open ? `<b>${fmtKmh(c * r.h.speed.v)}</b>${r.u.forms[0]}` : `<b>?</b>${r.u.forms[0]}`;
      return drawTrack(c);
    }
    if (mode === 'size') {
      // Число видно, только когда размер синего предмета известен или раунд раскрыт.
      const open = level.showRef || hintLog[idx] === 'weight' || phase === 'truth' || phase === 'done';
      el.count.innerHTML = open ? `<b>${fmtM(c * r.u.size.m / r.ratio)}</b>${BY[r.u.size.by]}` : `<b>?</b>${r.u.forms[0]}`;
      return drawScene(c);
    }
    el.count.innerHTML = `<b>× ${num(c)}</b>${plural(c, r.u.forms)}`;
    drawPile(c, r.u);
  }

  // Удержание кнопки: сначала по одному, потом шаг растёт вместе с числом.
  function hold(btn, dir) {
    let timer = 0, ticks = 0;
    const step = () => {
      ticks++;
      const s = ticks < 8 ? 1 : Math.max(1, Math.round(count * 0.06));
      if (mode !== 'weight') setCount(count * Math.pow(ticks < 8 ? 1.02 : 1.05, dir));
      else setCount(count + dir * s);
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
  el.openSettings.addEventListener('click', showSettings);
  el.settingsBack.addEventListener('click', () => history.back());
  el.share.addEventListener('click', async () => {
    // Раунды с подсказкой и переигранный раунд отмечены кружком вместо квадрата.
    const squares = results.map((r) => {
      const i = r.score >= GOOD ? 0 : r.score >= OK ? 1 : 2;
      return (r.hinted || r.swapped ? ['🟢', '🟡', '🔴'] : ['🟩', '🟨', '🟥'])[i];
    }).join('');
    const text = `Глазомер · ${MODES[mode].title.toLowerCase()} · ${level.title.toLowerCase()} — ${total} из ${ROUNDS * 100}\n${squares}`;
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
    el.lead.textContent = MODES[mode].lead;
    el.modes.textContent = '';
    Object.keys(MODES).forEach((m) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = MODES[m].title;
      b.className = m === mode ? 'on' : '';
      b.addEventListener('click', () => { setMode(m); showStart(); });
      el.modes.appendChild(b);
    });
    el.levels.textContent = '';
    LEVELS.forEach((lv) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = lv.title;
      b.className = (lv === level ? 'on ' : '') + (unlocked(lv) ? '' : 'locked');
      b.addEventListener('click', () => { level = lv; showStart(); });
      el.levels.appendChild(b);
    });
    const open = unlocked(level), entry = daily[slot()];
    const best = save.best[slot()] ? ` · рекорд ${save.best[slot()]}` : '';
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
    newBest = total > (save.best[slot()] || 0);
    if (newBest) save.best[slot()] = total;
    if (isDaily) {
      const entry = dailyToday()[slot()];
      entry.done = true;
      entry.total = total;
      if (save.streak.last !== dayKey()) save.streak = { count: streakNow() + 1, last: dayKey() };
    }
    reward();
    if (++played % AD_EVERY === 0 && !newcomer) adDue = true;
    storeSave();
  }

  // ---------- раскрытие ----------

  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  // Фраза вердикта должна помещаться в одну строку на телефоне вместе с очками.
  const VERDICT_MAX = 24;
  const PHRASES = {
    exact: ['Точно!', 'Глаз-алмаз!', 'В яблочко!', 'Глаз как у орла!', 'Снайпер!', 'Как в аптеке!'],
    near: ['Почти!', 'На волосок!', 'Чуть-чуть мимо!'],
    close: ['Неплохо!', 'Глаз намётан!', 'Тепло!', 'Рядом, но мимо'],
    over: ['Многовато!', 'Перебор!', 'Куда столько?', 'Полегче!', 'Притормози!'],
    under: ['Маловато!', 'Слишком мало!', 'Жадничаешь!', 'Докладывай ещё!', 'Не скупись!'],
    far: ['Ого! Мимо!', 'Пальцем в небо!', 'Весы в шоке!', 'Мимо кассы!', 'Глаз замылился!'],
    farOver: ['Куда столько?!'],
    farUnder: ['Это всё?'],
  };

  // В «Размере» вместо фраз про весы и штуки — свои.
  const SIZE_PHRASES = {
    ...PHRASES,
    over: ['Великовато!', 'Перебор!', 'Раздуто!', 'Полегче!', 'Притормози!'],
    under: ['Маловато!', 'Мелковато!', 'Расти ещё!', 'Не скупись!'],
    far: ['Ого! Мимо!', 'Пальцем в небо!', 'Линейка в шоке!', 'Мимо кассы!', 'Глаз замылился!'],
    farOver: ['Куда такой?!'],
  };

  // В «Скорости» — про езду и бег; совсем дикий ответ получает свою фразу.
  const SPEED_PHRASES = {
    ...PHRASES,
    over: ['Перебор!', 'Полегче!', 'Притормози!', 'Куда так гнать?', 'Слишком резво!'],
    under: ['Маловато!', 'Плетётся!', 'Поддай газу!', 'Слишком вяло!'],
    far: ['Ого! Мимо!', 'Пальцем в небо!', 'Спидометр в шоке!', 'Мимо кассы!', 'Глаз замылился!'],
    farOver: ['Быстрее пули!'],
    farUnder: ['Медленнее черепахи!'],
  };

  function sizeVerdict({ f, score }) {
    const over = f > 1, P = mode === 'speed' ? SPEED_PHRASES : SIZE_PHRASES;
    if (score === 100) return pick(P.exact);
    if (mode === 'speed' && score === 0) return pick(over ? P.farOver : P.farUnder);
    if (score >= 90) return pick(P.near);
    if (score >= 70) return pick(P.close);
    if (score >= 30) return pick(over ? P.over : P.under);
    return pick([...P.far, ...(over ? P.farOver : P.farUnder)]);
  }

  // Промах в «Размере»: вблизи ответа — в процентах, вдали — в разах.
  function sizeMiss({ f, score }) {
    if (score === 100) return '';
    const over = f > 1, x = over ? f : 1 / f;
    const word = mode === 'speed' ? (over ? 'Быстрее' : 'Медленнее') : over ? 'Больше' : 'Меньше';
    if (x < 1.5) return `${word} на ${Math.max(1, Math.round((over ? f - 1 : 1 - f) * 100))} %`;
    return `${word} в ${fmtTimes(x)}`;
  }

  // Броская фраза о том, насколько близок ответ; цифры промаха идут отдельно, в missText.
  function verdictText({ f, score, need }, count, unit) {
    if (mode !== 'weight') return sizeVerdict({ f, score });
    if (count === need) return pick(PHRASES.exact);
    const over = f > 1, d = Math.abs(count - need);
    if (score >= 90) {
      const few = unit.forms[2];
      const pair = over ? `Пара ${few} лишняя!` : `Ещё бы пару ${few}!`;
      return pick(d >= 2 && d <= 3 && pair.length <= VERDICT_MAX ? [...PHRASES.near, pair] : PHRASES.near);
    }
    if (score >= 70) return pick(PHRASES.close);
    if (score >= 30) return pick(over ? PHRASES.over : PHRASES.under);
    return pick([...PHRASES.far, ...(over ? PHRASES.farOver : PHRASES.farUnder)]);
  }

  // Промах цифрой: вблизи ответа — в предметах, вдали или с длинным названием — в разах.
  function missText({ f, score, need }, count, unit) {
    if (mode !== 'weight') return sizeMiss({ f, score });
    if (count === need) return '';
    const over = f > 1, d = Math.abs(count - need), word = over ? 'Перебор' : 'Недобор';
    const items = `${word} на ${d === 1 ? `1 ${unit.acc}` : `${num(d)} ${plural(d, unit.forms)}`}`;
    return (d <= 5 || score >= 60) && items.length <= VERDICT_MAX ? items
      : `${word} в ${fmtTimes(over ? f : 1 / f)}`;
  }

  function release() {
    const r = rounds[idx], my = run;
    phase = 'swing';
    el.controls.classList.add('off');
    el.controls.classList.remove('pulse');
    el.main.classList.remove('pulse');
    el.main.disabled = true;
    el.lock.classList.add('open');

    const res = judge(r, count, idx);
    const { score, need } = res;
    const miss = missText(res, count, r.u);
    results.push(res);
    total += score;
    // Ответ сохраняется сразу, чтобы обновление страницы не давало переиграть раунд.
    if (isDaily) {
      dailyToday()[slot()].guesses.push(count);
      storeSave();
    }
    if (mode === 'size' && !save.sizeTip) {
      save.sizeTip = true;
      storeSave();
    }
    if (mode === 'speed' && !save.speedTip) {
      save.speedTip = true;
      storeSave();
    }
    // В «Размере» качаться нечему, поэтому раскрытие идёт быстрее.
    const [tVerdict, tTruth] = mode === 'size' ? [400, 1500] : [1500, 2700];
    // Пока последний раунд можно переиграть, итог партии записывается при выходе из раунда.
    if (results.length === ROUNDS && !canSwap()) finishGame();
    if (mode === 'speed') return revealSpeed(res, miss, my);

    setTimeout(() => {
      if (my !== run) return;
      el.verdict.textContent = `${verdictText(res, count, r.u)} · +${score}`;
      // Вторая строка под правильный ответ занята заранее, чтобы плашка не прыгала.
      el.fact.innerHTML = miss && `${miss}<br>&nbsp;`;
      el.result.classList.remove('empty');
      el.total.textContent = total;
    }, tVerdict);

    setTimeout(() => {
      if (my !== run) return;
      phase = 'truth';
      el.pile.setAttribute('class', 'art true');
      el.count.classList.add('true');
      el.refTag.classList.remove('off');
      el.unitTag.classList.remove('off');
      if (mode === 'size') {
        // Ответ игрока остаётся бледной тенью, поверх неё зелёный силуэт идёт к настоящему размеру.
        ghost = count;
        el.sGuess.setAttribute('class', 'art true');
        el.sGhost.innerHTML = r.u.art;
        el.sRefTag.classList.remove('off');
        el.sGuessTag.classList.remove('off');
      }
      const from = count, t0 = performance.now(), dur = 900;
      const tick = (t) => {
        if (my !== run) return;
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        const at = Math.exp(Math.log(from) + (Math.log(need) - Math.log(from)) * e);
        show(mode === 'size' ? at : Math.max(1, Math.round(at)));
        if (k < 1) return requestAnimationFrame(tick);
        const truth = mode === 'size'
          ? `${cap(r.u.forms[0])} — <b>${fmtM(r.u.size.m)}</b> ${BY[r.u.size.by]}`
          : `Нужно <b>≈ ${num(need)} ${plural(need, r.u.forms)}</b>`;
        el.fact.innerHTML = `${miss ? miss + '<br>' : ''}${truth}`
          + (isTutorial ? `<br>Чем ближе, тем больше очков: до 100 за раунд, в партии ${ROUNDS} раундов.` : '');
        el.main.textContent = isTutorial ? 'Играть' : idx + 1 < ROUNDS ? 'Дальше' : 'Итоги';
        el.main.disabled = false;
        el.swap.hidden = !canSwap();
        phase = 'done';
      };
      requestAnimationFrame(tick);
    }, tTruth);
  }

  // Раскрытие в «Скорости»: сначала забег со скоростью игрока, потом — как на самом деле:
  // зелёный силуэт бежит с настоящей скоростью, ответ игрока — бледной тенью рядом.
  // Совсем дикий ответ (0 очков) не разыгрывается: сразу вердикт и настоящий забег.
  function revealSpeed(res, miss, my) {
    const r = rounds[idx], { score, need } = res, wild = score === 0;
    const top = { g: el.tRef, o: r.h, lane: 0, v: 1 };
    el.tRefPre.style.display = el.tGhost.style.display = 'none';
    const verdict = () => {
      el.verdict.textContent = `${verdictText(res, count, r.u)} · +${score}`;
      el.fact.innerHTML = miss && `${miss}<br>&nbsp;`;
      el.result.classList.remove('empty');
      el.total.textContent = total;
    };
    const real = () => {
      phase = 'truth';
      el.tGuess.setAttribute('class', 'art true');
      el.count.classList.add('true');
      el.tRefTag.classList.remove('off');
      el.tGuessTag.classList.remove('off');
      show(need);
      const list = [top, { g: el.tGuess, o: r.u, lane: 1, v: need }];
      if (!wild) {
        el.tGhost.style.display = '';
        list.push({ g: el.tGhost, o: r.u, lane: 1, v: count });
      }
      startRace(list, () => {
        if (my !== run) return;
        el.fact.innerHTML = `${miss ? miss + '<br>' : ''}${cap(r.u.forms[0])} — <b>${fmtKmh(r.u.speed.v)}</b>`;
        el.main.textContent = idx + 1 < ROUNDS ? 'Дальше' : 'Итоги';
        el.main.disabled = false;
        el.swap.hidden = !canSwap();
        phase = 'done';
      });
    };
    if (wild) {
      verdict();
      return real();
    }
    startRace([top, { g: el.tGuess, o: r.u, lane: 1, v: count }], () => {
      if (my !== run) return;
      verdict();
      real();
    });
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
      newBest ? 'новый рекорд' : `рекорд ${save.best[slot()]}`,
      n ? `серия ${n} ${plural(n, ['день', 'дня', 'дней'])}` : '',
    ].filter(Boolean).join(' · ');
    el.sumSquares.innerHTML = results
      .map((x) => `<i class="${x.score >= GOOD ? 's-good' : x.score >= OK ? 's-mid' : 's-bad'}${x.hinted || x.swapped ? ' hinted' : ''}"></i>`).join('');
    el.sumList.innerHTML = results
      .map((x) => `<li><span>${mode !== 'weight' ? `${cap(x.r.u.forms[0])} ${fmtVal(x.r.u)}`
        : `${cap(x.r.h.forms[0])} ≈ ${num(x.need)} ${plural(x.need, x.r.u.forms)}`}</span><span>+${x.score}</span></li>`)
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

  // ---------- сцена «Размера» ----------

  // GROUND — линия земли, FIT — место под оба силуэта, REF_BOX — размер синего, пока оранжевый помещается рядом.
  const GROUND = 200, FIT_W = 340, FIT_H = 200, SCENE_GAP = 16, REF_BOX = 110;
  // boxes — рамки синего и оранжевого силуэтов в их собственных единицах,
  // ghost — ответ игрока, оставленный тенью при раскрытии.
  let boxes = null, ghost = null;

  function setScene(r) {
    ghost = null;
    el.sRef.innerHTML = r.h.art;
    el.sGuess.innerHTML = r.u.art;
    el.sGhost.innerHTML = '';
    boxes = [el.sRef.getBBox(), el.sGuess.getBBox()];
    el.sGuess.setAttribute('class', 'art guess');
    setTag(el.sRefTag, `${fmtM(r.h.size.m)} ${BY[r.h.size.by]}`, 90);
    setTag(el.sGuessTag, `${fmtM(r.u.size.m)} ${BY[r.u.size.by]}`, 270);
    el.sRefTag.classList.toggle('off', !level.showRef);
    el.sGuessTag.classList.add('off');
  }

  // Ставит силуэт на землю: scale — единиц сцены на единицу рисунка, x — левый край.
  function stand(g, b, scale, x) {
    g.setAttribute('transform', `translate(${x - b.x * scale} ${GROUND - (b.y + b.height) * scale}) scale(${scale})`);
  }

  // q — во сколько раз оранжевый предмет больше синего, каждый по своей мере.
  // Синий держит размер, пока оба помещаются; дальше сцена отъезжает.
  function drawScene(q) {
    const { h, u } = rounds[idx], [rb, ub] = boxes;
    const kr = h.size.m / h.size.ext;
    const ku = (x) => x * h.size.m / u.size.ext;
    const wr = rb.width * kr, hr = rb.height * kr;
    const widest = ku(Math.max(q, ghost || 0));
    const wMax = ub.width * widest, hMax = ub.height * widest;
    const p = Math.min(REF_BOX / Math.max(wr, hr), (FIT_W - SCENE_GAP) / (wr + wMax), FIT_H / Math.max(hr, hMax));
    const x0 = 180 - (wr * p + SCENE_GAP + wMax * p) / 2;
    const mid = x0 + wr * p + SCENE_GAP + wMax * p / 2;
    stand(el.sRef, rb, kr * p, x0);
    stand(el.sGuess, ub, ku(q) * p, mid - ub.width * ku(q) * p / 2);
    if (ghost) stand(el.sGhost, ub, ku(ghost) * p, mid - ub.width * ku(ghost) * p / 2);
  }

  // ---------- дорожки «Скорости» ----------

  // Дорожка идёт от TRACK_X0 до TRACK_X1, силуэт на ней размером RUNNER. Лидер забега проходит её за T_RUN секунд,
  // после его финиша картинка замирает на T_HOLD.
  const TRACK_X0 = 16, TRACK_X1 = 340, RUNNER = 60, LANE_Y = [92, 196], T_RUN = 2, T_HOLD = 0.9;
  const TRACK = TRACK_X1 - TRACK_X0 - RUNNER;
  // race — идущий забег: list — бегуны { g, o, lane, v }, then — что сделать после него.
  let race = null;

  el.tTicks.innerHTML = LANE_Y.map((y) => Array.from({ length: 11 },
    (_, i) => `<path class="tick" d="M${TRACK_X0 + i * (TRACK_X1 - TRACK_X0) / 10} ${y}v5"/>`).join('')).join('');

  // at — пройденная доля дорожки. Силуэт, который смотрит влево, разворачивается по ходу.
  function placeRunner(g, o, lane, at) {
    const x = TRACK_X0 + at * TRACK, k = RUNNER / 100;
    const hop = o.speed.hop && at > 0 && at < 1 ? -Math.abs(Math.sin(at * TRACK / 9)) * 3 : 0;
    const y = LANE_Y[lane] - RUNNER + hop;
    g.setAttribute('transform', o.speed.flip ? `translate(${x + RUNNER} ${y}) scale(${-k} ${k})` : `translate(${x} ${y}) scale(${k})`);
  }

  function setTrack(r) {
    el.tRef.innerHTML = el.tRefPre.innerHTML = r.h.art;
    el.tGuess.innerHTML = el.tGhost.innerHTML = r.u.art;
    el.tGuess.setAttribute('class', 'art guess');
    el.tRefPre.style.display = el.tGhost.style.display = '';
    setTag(el.tRefTag, fmtKmh(r.h.speed.v), 180);
    setTag(el.tGuessTag, fmtKmh(r.u.speed.v), 180);
    el.tRefTag.classList.toggle('off', !level.showRef);
    el.tGuessTag.classList.add('off');
  }

  // До старта оба стоят на линии, а бледные тени показывают прогноз: где каждый будет, когда первый финиширует.
  // q — во сколько раз нижний быстрее верхнего.
  function drawTrack(q) {
    if (phase !== 'guess') return;
    const { h, u } = rounds[idx];
    placeRunner(el.tRef, h, 0, 0);
    placeRunner(el.tGuess, u, 1, 0);
    placeRunner(el.tRefPre, h, 0, Math.min(1, 1 / q));
    placeRunner(el.tGhost, u, 1, Math.min(1, q));
  }

  function startRace(list, then) {
    race = { list, then, clock: 0 };
  }

  function stepRace(dt) {
    const top = Math.max(...race.list.map((x) => x.v));
    race.clock += dt;
    // Когда лидер финишировал, остальные замирают там, где их застал финиш.
    if (race.clock <= T_RUN + dt) {
      race.list.forEach((x) => placeRunner(x.g, x.o, x.lane, Math.min(1, x.v / top * race.clock / T_RUN)));
    } else if (race.clock > T_RUN + T_HOLD) {
      const { then } = race;
      race = null;
      then();
    }
  }

  function setMode(m) {
    mode = m;
    LEVELS = MODES[m].levels;
    level = LEVELS.find((lv) => lv.id === level.id) || LEVELS[0];
    el.app.className = m;
    el.modeNames.forEach((n) => { n.textContent = '· ' + MODES[m].title.toLowerCase(); });
  }

  function frame(t) {
    // Пока площадка держит игру на паузе (реклама, свёрнутая вкладка), весы стоят.
    const dt = Platform.paused ? 0 : Math.min(0.033, (t - lastT) / 1000 || 0);
    lastT = t;
    if (race) stepRace(dt);
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

  // Широкая раскладка рассчитана на окно около 1200×500 и на большом экране растёт вместе с ним,
  // занимая примерно 0,9 ширины или 0,85 высоты — что наступит раньше.
  const WIDE_W = 1080, WIDE_H = 440, CARD_H = 620, ZOOM_MAX = 2.5;
  function fit() {
    const k = Math.min(innerWidth * 0.9 / WIDE_W, innerHeight * 0.85 / WIDE_H, ZOOM_MAX);
    document.documentElement.style.setProperty('--k', Math.max(1, k).toFixed(3));
    // Карточки меню и итогов выше игровой раскладки, поэтому их рост ограничен ещё и своей высотой.
    document.documentElement.style.setProperty('--kc', Math.max(1, Math.min(k, innerHeight * 0.95 / CARD_H)).toFixed(3));
  }
  window.addEventListener('resize', fit);
  // Во встроенных окнах (рамка площадки) событие resize приходит не всегда.
  if (window.ResizeObserver) new ResizeObserver(fit).observe(document.documentElement);
  fit();

  // Из браузера и облака берётся то сохранение, которое записано позже.
  async function boot() {
    const cloud = await Platform.init();
    if (cloud && (cloud.t || 0) > (save.t || 0)) {
      Object.assign(save, cloud);
      storeLocal();
      applyColors();
    }
    setMode(MODES[save.mode] ? save.mode : 'weight');
    level = LEVELS.find((lv) => lv.id === save.level && unlocked(lv)) || LEVELS[0];
    newcomer = !save.tutorial;
    adDue = !newcomer;
    if (save.tutorial) showStart(); else startTutorial();
    requestAnimationFrame(frame);
    Platform.ready();
  }

  boot();
})();
