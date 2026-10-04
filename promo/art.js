// Рисунок весов для иконки и обложки: слон на синей чаше, коты на оранжевой.
function scaleArt(cx, top, k) {
  const get = (name) => OBJECTS.find((o) => o.name === name).art;
  const arm = 170, a = -10 * Math.PI / 180;
  const dx = Math.cos(a) * arm, dy = Math.sin(a) * arm;
  const pan = (x, y, inner) => `<g transform="translate(${x} ${y})">
    <path d="M0 0L-80 150M0 0L80 150" stroke="#2b2f36" stroke-width="3" fill="none" opacity="0.6"/>
    <path d="M-98 150H98" stroke="#2b2f36" stroke-width="10" stroke-linecap="round"/>${inner}</g>`;
  const cat = (x, y) => `<g transform="translate(${x} ${y}) scale(0.72)">${get('кот')}</g>`;
  return `<g transform="translate(${cx} ${top}) scale(${k})">
    <path d="M0 0V345M-84 345H84" stroke="#2b2f36" stroke-width="10" stroke-linecap="round" fill="none"/>
    ${pan(-dx, -dy, `<g class="art ref" transform="translate(-78 -6) scale(1.56)">${get('слон')}</g>`)}
    ${pan(dx, dy, `<g class="art guess">${cat(-72, 78)}${cat(0, 78)}${cat(-36, 6)}</g>`)}
    <path d="M${-dx} ${-dy}L${dx} ${dy}" stroke="#2b2f36" stroke-width="10" stroke-linecap="round"/>
    <circle r="13" fill="#f6f3ea" stroke="#2b2f36" stroke-width="9"/></g>`;
}
