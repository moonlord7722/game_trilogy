// Площадка «приложение для Android». Тот же набор, что в platform.js из корня репозитория,
// но без SDK Яндекса: рекламы и облака нет, сохранение живёт в localStorage приложения.
// GlazomerApp — мост в MainActivity.
const Platform = (() => {
  const app = window.GlazomerApp;

  return {
    init: async () => null,
    ready() {},
    play() {},
    store() {},
    interstitial: async () => {},
    rewarded: async () => false,
    // Итог партии уходит в системное окно «Поделиться».
    share(text) { app.share(text); },
    hasAds: false,
    paused: false,
  };
})();
