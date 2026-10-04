// Площадка, на которой открыта игра. На Яндекс Играх работает их SDK: реклама, облачные сохранения
// и разметка игрового процесса. На своём сайте файла /sdk.js нет — игра идёт без рекламы,
// с сохранением только в браузере.
const Platform = (() => {
  // Сколько ждать SDK, прежде чем начать игру без него.
  const WAIT = 5000;
  // Языки, на которые переведена игра. Язык берётся из SDK; остальным достаётся первый из списка.
  const LANGS = ['ru'];
  let ysdk = null, player = null;
  let playing = false, paused = false;

  function loadScript() {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/sdk.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function connect() {
    await loadScript();
    const sdk = await YaGames.init();
    let p = null, data = {};
    try {
      p = await sdk.getPlayer();
      data = await p.getData(['save']);
    } catch { /* без облака сохраняемся в браузере */ }
    return { sdk, p, cloud: data.save || null };
  }

  // Возвращает сохранение из облака или null, если облака нет.
  async function init() {
    const timeout = new Promise((resolve) => setTimeout(resolve, WAIT, null));
    const got = await Promise.race([connect().catch(() => null), timeout]);
    if (!got) return null;
    ysdk = got.sdk;
    player = got.p;
    const lang = ysdk.environment.i18n.lang;
    document.documentElement.lang = LANGS.includes(lang) ? lang : LANGS[0];
    ysdk.on('game_api_pause', () => { paused = true; });
    ysdk.on('game_api_resume', () => { paused = false; });
    return got.cloud;
  }

  function ready() {
    ysdk?.features.LoadingAPI?.ready();
  }

  // Разметка игрового процесса: идёт раунд или игрок в меню, итогах, рекламе.
  function mark(on) {
    const api = ysdk?.features.GameplayAPI;
    if (on) api?.start(); else api?.stop();
  }

  function play(on) {
    if (on === playing) return;
    playing = on;
    mark(on);
  }

  function store(save) {
    player?.setData({ save }).catch(() => { /* копия в браузере уже записана */ });
  }

  // Реклама между партиями. Завершается, когда игру можно продолжать.
  function interstitial() {
    return new Promise((resolve) => {
      if (!ysdk) return resolve();
      ysdk.adv.showFullscreenAdv({ callbacks: { onClose: () => resolve(), onError: () => resolve() } });
    });
  }

  // Видео за награду. Завершается значением true, если ролик досмотрен.
  function rewarded() {
    return new Promise((resolve) => {
      if (!ysdk) return resolve(false);
      let earned = false, closed = false;
      const done = () => {
        if (closed) return;
        closed = true;
        if (playing) mark(true);
        resolve(earned);
      };
      if (playing) mark(false);
      ysdk.adv.showRewardedVideo({
        callbacks: { onRewarded: () => { earned = true; }, onClose: done, onError: done },
      });
    });
  }

  return {
    init, ready, play, store, interstitial, rewarded,
    get hasAds() { return Boolean(ysdk); },
    get paused() { return paused; },
  };
})();
