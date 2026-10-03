// Продолжение базы предметов, формат тот же, что в data.js.
// Контуры волка, моржа и гориллы сняты с силуэтов PhyloPic (phylopic.org), лицензия CC0:
// волк — Tracy A. Heath, морж и горилла — Margot Michaud.
OBJECTS.push(
  // ---------- животные ----------
  {
    name: 'бурый медведь', acc: 'бурого медведя', forms: ['бурый медведь', 'бурых медведя', 'бурых медведей'], kg: 300,
    art: `<ellipse cx="54" cy="56" rx="32" ry="22"/><circle cx="40" cy="42" r="14"/><circle cx="18" cy="54" r="13"/>
      <rect x="2" y="54" width="14" height="9" rx="4"/><circle cx="14" cy="42" r="4.5"/><circle cx="25" cy="41" r="4.5"/>
      <rect x="26" y="68" width="13" height="32" rx="4"/><rect x="42" y="72" width="12" height="28" rx="4"/>
      <rect x="62" y="72" width="12" height="28" rx="4"/><rect x="74" y="66" width="13" height="34" rx="4"/>
      <circle class="cut" cx="14" cy="52" r="1.6"/>`,
  },
  {
    name: 'белый медведь', acc: 'белого медведя', forms: ['белый медведь', 'белых медведя', 'белых медведей'], kg: 450,
    art: `<ellipse cx="58" cy="56" rx="32" ry="20"/><path d="M36 42L16 38L14 54L34 68Z"/><ellipse cx="14" cy="46" rx="12" ry="9"/>
      <rect x="0" y="44" width="10" height="8" rx="3"/><circle cx="19" cy="37" r="3.5"/>
      <rect x="30" y="66" width="13" height="34" rx="4"/><rect x="46" y="70" width="12" height="30" rx="4"/>
      <rect x="66" y="70" width="12" height="30" rx="4"/><rect x="78" y="64" width="12" height="36" rx="4"/>
      <circle class="cut" cx="10" cy="43" r="1.5"/>`,
  },
  {
    name: 'лось', acc: 'лося', forms: ['лось', 'лося', 'лосей'], kg: 400,
    art: `<ellipse cx="56" cy="48" rx="26" ry="15"/><circle cx="40" cy="38" r="11"/><path d="M36 40L22 30L20 44L34 54Z"/>
      <path d="M26 28L6 34L4 44L12 46L28 42Z"/><path d="M12 46L14 55L18 45Z"/>
      <path d="M24 28Q10 22 6 8L12 14L14 5L19 14L22 5L26 16Q30 22 30 28Z"/>
      <rect x="34" y="58" width="5" height="42"/><rect x="43" y="60" width="5" height="40"/>
      <rect x="68" y="60" width="5" height="40"/><rect x="76" y="56" width="5" height="44"/>
      <circle class="cut" cx="18" cy="35" r="1.5"/>`,
  },
  {
    name: 'волк', acc: 'волка', forms: ['волк', 'волка', 'волков'], kg: 45,
    art: `<path d="M2.9 8.5L3.1 15.8L1.1 14.7L0 16.9L2.9 23L2.7 36.2L6.4 43.6L8.2 54L11.3 57.5L12.8 65.3L17.2 72.2L19.2 81.4L18.6 89.4L15.3 94.2L12.7 95.8L13 97.5L22.9 98.9L24.6 97.9L31 71.4L50.7 71.6L62.2 68.5L63.4 72.7L69 78.8L75.3 84.1L77.1 86.9L77.6 89.7L76.4 95.9L73.1 97.4L72.8 98.8L75.4 99.9L80.2 99.9L87.2 99.6L91.2 89.5L90.8 84L86.4 79.2L84.1 74.4L83.6 70.4L84.8 67.1L86.7 68.3L91.3 75.7L92.2 80.5L96.5 87.1L97.3 87.5L99.9 79.7L99.9 74L98.5 67.1L87.3 48.2L81.2 41.8L77.3 40.3L58.4 40.4L48.9 39.7L44.2 40.4L34.4 37.9L27.3 32.4L27.6 31.1L30.8 28L30.3 25.6L23.2 22L16.7 16.4L12.3 14.9L10.7 12L8.1 9.7L5.2 8.4L2.9 8.5Z"/>`,
  },
  {
    name: 'лиса', acc: 'лису', forms: ['лиса', 'лисы', 'лис'], kg: 6,
    art: `<ellipse cx="46" cy="66" rx="22" ry="12"/><path d="M26 52L4 62L8 68L28 70L32 58Z"/>
      <path d="M20 54L20 38L28 52ZM27 54L31 40L35 56Z"/><path d="M64 62Q84 42 98 58Q92 76 66 72Z"/>
      <rect x="30" y="74" width="5" height="26"/><rect x="38" y="76" width="5" height="24"/>
      <rect x="54" y="76" width="5" height="24"/><rect x="61" y="72" width="5" height="28"/>
      <path class="cut" d="M90 52Q98 56 96 64Q90 62 88 56Z"/><circle class="cut" cx="18" cy="60" r="1.5"/>`,
  },
  {
    name: 'заяц', acc: 'зайца', forms: ['заяц', 'зайца', 'зайцев'], kg: 4,
    art: `<ellipse cx="54" cy="74" rx="24" ry="24"/><circle cx="30" cy="46" r="14"/>
      <path d="M26 36L20 4Q26 0 30 6L34 34ZM34 36L36 6Q42 2 44 10L40 36Z"/><circle cx="80" cy="84" r="7"/>
      <rect x="30" y="82" width="8" height="16" rx="4"/><rect x="44" y="92" width="30" height="8" rx="4"/>
      <circle class="cut" cx="26" cy="44" r="2"/>`,
  },
  {
    name: 'белка', acc: 'белку', forms: ['белка', 'белки', 'белок'], kg: 0.3,
    art: `<ellipse cx="40" cy="72" rx="16" ry="26"/><circle cx="30" cy="36" r="12"/>
      <path d="M24 28L22 14L30 24ZM32 26L36 13L40 28Z"/>
      <path d="M52 94Q94 94 86 44Q82 20 62 26Q76 40 68 60Q62 76 50 80Z"/>
      <rect x="20" y="58" width="13" height="6" rx="3"/><circle class="cut" cx="26" cy="34" r="1.8"/>`,
  },
  {
    name: 'морж', acc: 'моржа', forms: ['морж', 'моржа', 'моржей'], kg: 1000,
    art: `<path d="M19.7 42.1L32.5 45.1L39.2 50.6L51 56.4L58.9 61.5L74.4 67.1L77 67.3L85.9 71.4L90.7 74.6L95.1 78.9L99.4 86.9L99.6 91.7L97 94.1L92.1 96.5L86.6 97.4L78.6 97.2L76.6 96.4L73 97L69.6 96.4L68.1 94.7L65.6 95.1L54.5 93.9L51.8 94.1L56.4 97.1L56.7 98.4L55.3 99.7L50.2 100L41.5 98.8L39.9 98L37.5 94.9L26.1 95.6L19.8 93.2L14.5 94.4L8.2 93.3L9.3 92.2L14 90.9L14.8 88.9L12.4 70.9L16.4 59.4L14.4 56.8L3.7 71.6L6.7 62.7L11.8 54.3L6.7 60L0.7 68.9L0.1 69L0 68.1L3.3 60.8L10.2 51.2L9.9 47.4L11.4 44.2L15.1 42.4L19.7 42.1Z"/>`,
  },
  {
    name: 'носорог', acc: 'носорога', forms: ['носорог', 'носорога', 'носорогов'], kg: 2000,
    art: `<ellipse cx="58" cy="56" rx="32" ry="22"/><path d="M32 42L8 50L4 66L14 72L34 70Z"/>
      <path d="M8 52L2 30L16 48Z"/><path d="M18 46L18 36L24 45Z"/><path d="M28 44L30 32L36 44Z"/>
      <rect x="32" y="70" width="13" height="30" rx="3"/><rect x="48" y="74" width="12" height="26" rx="3"/>
      <rect x="66" y="74" width="12" height="26" rx="3"/><rect x="78" y="68" width="12" height="32" rx="3"/>
      <circle class="cut" cx="18" cy="56" r="1.6"/>`,
  },
  {
    name: 'кенгуру', acc: 'кенгуру', forms: ['кенгуру', 'кенгуру', 'кенгуру'], kg: 60,
    art: `<path d="M40 28Q28 50 40 78Q54 92 66 80Q72 54 56 28Z"/><ellipse cx="42" cy="19" rx="11" ry="8"/>
      <path d="M44 13L44 1L50 11ZM50 14L54 3L57 16Z"/><rect x="28" y="46" width="14" height="5" rx="2.5"/>
      <path d="M48 76L36 95L24 95L24 100L46 100L62 84Z"/><path d="M62 78Q82 95 98 95L98 100Q74 100 54 88Z"/>
      <circle class="cut" cx="38" cy="17" r="1.5"/>`,
  },
  {
    name: 'пингвин', acc: 'пингвина', forms: ['пингвин', 'пингвина', 'пингвинов'], kg: 30,
    art: `<ellipse cx="50" cy="60" rx="24" ry="37"/><circle cx="50" cy="20" r="14"/><path d="M37 19L24 24L38 27Z"/>
      <path d="M27 44L15 78L23 78L30 58ZM73 44L85 78L77 78L70 58Z"/>
      <path d="M34 95h14v5h-18ZM52 95h14l4 5h-18Z"/>
      <ellipse class="cut" cx="48" cy="64" rx="13" ry="27"/><circle class="cut" cx="44" cy="18" r="2"/>`,
  },
  {
    name: 'гусь', acc: 'гуся', forms: ['гусь', 'гуся', 'гусей'], kg: 4,
    art: `<ellipse cx="58" cy="66" rx="28" ry="18"/><path d="M36 64Q20 42 25 22L34 22Q32 42 48 56Z"/><circle cx="30" cy="18" r="9"/>
      <path d="M22 15L7 20L22 24Z"/><path d="M82 58L98 52L86 72Z"/>
      <rect x="52" y="82" width="3" height="15"/><rect x="62" y="82" width="3" height="15"/>
      <path class="ln" stroke-width="3" d="M46 98h12M56 98h12"/><circle class="cut" cx="28" cy="16" r="1.5"/>`,
  },
  {
    name: 'голубь', acc: 'голубя', forms: ['голубь', 'голубя', 'голубей'], kg: 0.3,
    art: `<ellipse cx="50" cy="63" rx="27" ry="22"/><path d="M24 34Q20 54 30 66L54 52L44 28Z"/><circle cx="34" cy="31" r="11.5"/>
      <path d="M24 27L14 31L24 35Z"/><path d="M64 58L99 78L95 87L60 82Z"/>
      <rect x="42" y="82" width="4" height="13"/><rect x="53" y="83" width="4" height="12"/>
      <path class="ln" stroke-width="3" d="M36 97h13M48 97h13"/>
      <path class="cl" stroke-width="2" d="M44 54Q66 54 86 76M26 46Q36 50 46 42"/>
      <path class="cl" stroke-width="3" d="M60 64L68 75M69 67L77 78"/><circle class="cut" cx="31" cy="29" r="1.9"/>`,
  },
  {
    name: 'страус', acc: 'страуса', forms: ['страус', 'страуса', 'страусов'], kg: 110,
    art: `<ellipse cx="56" cy="46" rx="22" ry="15"/><path d="M38 46L27 13L33 11L47 38Z"/><ellipse cx="28" cy="9" rx="7" ry="5"/>
      <path d="M22 7L11 10L22 12Z"/><path d="M76 40L93 33L91 55L76 54Z"/>
      <rect x="48" y="58" width="4" height="40"/><rect x="60" y="58" width="4" height="40"/>
      <path class="ln" stroke-width="3" d="M40 98h12M54 98h12"/><circle class="cut" cx="27" cy="8" r="1.3"/>`,
  },
  {
    name: 'овца', acc: 'овцу', forms: ['овца', 'овцы', 'овец'], kg: 70,
    art: `<circle cx="36" cy="54" r="14"/><circle cx="52" cy="48" r="15"/><circle cx="68" cy="54" r="14"/>
      <circle cx="44" cy="64" r="13"/><circle cx="62" cy="64" r="13"/><ellipse cx="18" cy="52" rx="10" ry="8"/>
      <path d="M22 46L31 43L26 53Z"/>
      <rect x="34" y="72" width="6" height="28"/><rect x="44" y="74" width="5" height="26"/>
      <rect x="60" y="74" width="5" height="26"/><rect x="68" y="72" width="6" height="28"/>
      <circle class="cut" cx="14" cy="50" r="1.5"/>`,
  },
  {
    name: 'коза', acc: 'козу', forms: ['коза', 'козы', 'коз'], kg: 50,
    art: `<rect x="28" y="44" width="50" height="22" rx="9"/><path d="M30 46L20 28L32 26L42 44Z"/>
      <path d="M30 24L10 30L8 38L28 40Z"/><path d="M26 24Q30 8 42 8L40 12Q32 14 31 25Z"/><path d="M12 38L14 49L18 39Z"/>
      <path d="M78 46L87 37L84 51Z"/>
      <rect x="31" y="60" width="5" height="40"/><rect x="40" y="62" width="5" height="38"/>
      <rect x="64" y="62" width="5" height="38"/><rect x="72" y="58" width="5" height="42"/>
      <circle class="cut" cx="20" cy="31" r="1.4"/>`,
  },
  {
    name: 'крокодил', acc: 'крокодила', forms: ['крокодил', 'крокодила', 'крокодилов'], kg: 400,
    art: `<path d="M2 84L30 76Q50 68 70 76L98 92L98 96L70 92L30 94L2 92Z"/>
      <path d="M34 75L38 66L42 73L46 64L50 71L54 64L58 73L62 68L66 77Z"/><circle cx="26" cy="75" r="4.5"/>
      <rect x="30" y="90" width="10" height="10" rx="2"/><rect x="62" y="90" width="10" height="10" rx="2"/>
      <circle class="cut" cx="26" cy="75" r="1.6"/><path class="cl" stroke-width="2" d="M4 88L26 86"/>`,
  },
  {
    name: 'белая акула', acc: 'белую акулу', forms: ['белая акула', 'белые акулы', 'белых акул'], kg: 800,
    art: `<path d="M2 72Q30 52 62 64L84 68L98 50L94 72L98 88L84 76Q50 92 2 72Z"/><path d="M40 60L52 36L58 62Z"/>
      <path d="M40 80L46 98L54 80Z"/><circle class="cut" cx="14" cy="70" r="1.8"/>
      <path class="cl" stroke-width="1.6" d="M26 68v8M30 68v8M34 68v8M4 76L16 78"/>`,
  },
  {
    name: 'дельфин', acc: 'дельфина', forms: ['дельфин', 'дельфина', 'дельфинов'], kg: 200,
    art: `<path d="M2 76L14 72Q30 50 62 60Q80 64 86 74L98 66L94 78L98 90L84 80Q50 94 14 80Z"/>
      <path d="M46 56L58 38L60 60Z"/><path d="M36 82L40 97L48 83Z"/><circle class="cut" cx="22" cy="70" r="1.6"/>`,
  },
  {
    name: 'мышь', acc: 'мышь', forms: ['мышь', 'мыши', 'мышей'], kg: 0.02,
    art: `<ellipse cx="52" cy="80" rx="28" ry="18"/><path d="M32 68L4 86L8 93L36 94Z"/><circle cx="32" cy="62" r="10"/>
      <circle class="cut" cx="32" cy="62" r="5"/><path class="ln" stroke-width="3" d="M80 86Q98 86 94 64"/>
      <circle class="cut" cx="18" cy="82" r="1.8"/>`,
  },
  {
    name: 'горилла', acc: 'гориллу', forms: ['горилла', 'гориллы', 'горилл'], kg: 160,
    art: `<path d="M25.7 0.2L36.2 8.7L42.9 16.3L43.4 18.8L49.1 22.6L60.7 27.5L64.3 27.5L69.2 26.2L82 26.7L87.9 29.7L91.2 32.8L95.3 41.1L96.9 53.3L95.4 70.4L94.2 73.3L94.8 81.4L94.5 89.8L92.9 96.6L88.7 98.4L80.6 99.9L74.8 99.7L72.7 97.9L72.5 95.8L75.8 91.6L76.1 90.1L74.5 78L74.8 72.8L70.6 58.4L65 60L54.5 61.3L47.6 60.9L33.5 50.3L32.6 56.2L36.4 63.6L36.7 65.6L33.3 81.2L30.2 89.1L30.8 92.2L29.5 95.1L26.3 96.3L18.7 95.9L17.5 94.9L16.8 92.9L17.5 89L15 80.5L13.9 73.3L15 54.5L14 47.4L14.2 32.8L12.5 33.8L9.2 34L5.9 33L4.7 31.8L3.1 27.5L4.5 23.1L7.7 20.2L7.8 17L6.9 15L10.9 9L20.8 1.8L23.8 0.1L25.7 0.2Z"/>`,
  },
  {
    name: 'лев', acc: 'льва', forms: ['лев', 'льва', 'львов'], kg: 190,
    art: `<rect x="30" y="44" width="52" height="24" rx="11"/><circle cx="22" cy="42" r="20"/>
      <rect x="34" y="62" width="9" height="38" rx="3"/><rect x="46" y="64" width="8" height="36" rx="3"/>
      <rect x="64" y="64" width="8" height="36" rx="3"/><rect x="74" y="62" width="9" height="38" rx="3"/>
      <path class="ln" stroke-width="3" d="M82 50Q96 56 92 76"/><circle cx="92" cy="79" r="4.5"/>
      <circle class="cut" cx="19" cy="44" r="10"/><circle cx="15" cy="42" r="1.7"/><circle cx="23" cy="42" r="1.7"/><path d="M16.5 47L21.5 47L19 50.5Z"/>`,
  },
  {
    name: 'зебра', acc: 'зебру', forms: ['зебра', 'зебры', 'зебр'], kg: 300,
    art: `<ellipse cx="56" cy="50" rx="28" ry="16"/><path d="M32 46L20 18L33 13L48 40Z"/>
      <path d="M24 13L5 28L9 35L31 25Z"/><path d="M25 14L27 5L33 13Z"/>
      <path d="M82 44L92 62L88 78L85 76L87 62L80 52Z"/>
      <rect x="33" y="56" width="7" height="44"/><rect x="43" y="60" width="6" height="40"/>
      <rect x="67" y="58" width="7" height="42"/><rect x="77" y="54" width="6" height="46"/>
      <path class="cl" stroke-width="3" d="M42 34L38 62M50 34L48 66M58 34V66M66 35L68 66M74 37L78 62M27 22L37 18M30 31L41 27"/>
      <circle class="cut" cx="19" cy="20" r="1.8"/>`,
  },
  // ---------- техника ----------
  {
    name: '«Буханка»', acc: '«Буханку»', forms: ['«Буханка»', '«Буханки»', '«Буханок»'], kg: 2000,
    art: `<rect x="4" y="30" width="92" height="56" rx="14"/>
      <path class="cut" d="M10 42Q12 37 18 37L27 37L27 55L10 55Z"/><rect class="cut" x="33" y="38" width="18" height="17" rx="2"/>
      <rect class="cut" x="55" y="38" width="18" height="17" rx="2"/><rect class="cut" x="77" y="38" width="13" height="17" rx="2"/>
      <path class="cl" stroke-width="2" d="M4 63H96"/>
      <circle class="cut" cx="26" cy="87" r="14"/><circle class="cut" cx="74" cy="87" r="14"/>
      <circle cx="26" cy="88" r="11"/><circle cx="74" cy="88" r="11"/>
      <circle class="cut" cx="26" cy="88" r="4"/><circle class="cut" cx="74" cy="88" r="4"/>`,
  },
  {
    name: 'КамАЗ', acc: 'КамАЗ', forms: ['КамАЗ', 'КамАЗа', 'КамАЗов'], kg: 7000,
    art: `<rect x="4" y="34" width="30" height="46" rx="4"/><rect class="cut" x="9" y="40" width="18" height="16" rx="1"/>
      <rect x="38" y="24" width="58" height="52" rx="2"/><rect x="4" y="74" width="92" height="9"/>
      <circle class="cut" cx="20" cy="88" r="13"/><circle class="cut" cx="62" cy="88" r="13"/><circle class="cut" cx="84" cy="88" r="13"/>
      <circle cx="20" cy="89" r="11"/><circle cx="62" cy="89" r="11"/><circle cx="84" cy="89" r="11"/>
      <circle class="cut" cx="20" cy="89" r="4"/><circle class="cut" cx="62" cy="89" r="4"/><circle class="cut" cx="84" cy="89" r="4"/>`,
  },
  {
    name: '«Газель»', acc: '«Газель»', forms: ['«Газель»', '«Газели»', '«Газелей»'], kg: 2800,
    art: `<path d="M4 86L4 54L20 30L92 30Q96 30 96 34L96 86Z"/>
      <path class="cut" d="M23 36L37 36L37 53L11 53Z"/><rect class="cut" x="41" y="36" width="16" height="17" rx="1"/>
      <rect class="cut" x="61" y="36" width="16" height="17" rx="1"/><rect class="cut" x="81" y="36" width="10" height="17" rx="1"/>
      <circle class="cut" cx="24" cy="88" r="13"/><circle class="cut" cx="76" cy="88" r="13"/>
      <circle cx="24" cy="89" r="11"/><circle cx="76" cy="89" r="11"/>
      <circle class="cut" cx="24" cy="89" r="4"/><circle class="cut" cx="76" cy="89" r="4"/>`,
  },
  {
    name: 'мотоцикл', acc: 'мотоцикл', forms: ['мотоцикл', 'мотоцикла', 'мотоциклов'], kg: 200,
    art: `<circle class="ln" stroke-width="6" cx="20" cy="79" r="17"/><circle class="ln" stroke-width="6" cx="80" cy="79" r="17"/>
      <path d="M28 64L44 46L66 46L74 58L60 72L38 72Z"/><rect x="22" y="48" width="28" height="8" rx="4"/>
      <path class="ln" stroke-width="4.5" d="M80 79L66 40M58 38H72"/><rect x="30" y="74" width="30" height="5" rx="2.5"/>`,
  },
  {
    name: 'электросамокат', acc: 'электросамокат', forms: ['электросамокат', 'электросамоката', 'электросамокатов'], kg: 15,
    art: `<rect x="22" y="84" width="54" height="6" rx="3"/><circle cx="20" cy="90" r="10"/><circle cx="80" cy="90" r="10"/>
      <circle class="cut" cx="20" cy="90" r="3.5"/><circle class="cut" cx="80" cy="90" r="3.5"/>
      <path class="ln" stroke-width="5" d="M78 86L70 16M60 16H82"/>`,
  },
  {
    name: 'трамвай', acc: 'трамвай', forms: ['трамвай', 'трамвая', 'трамваев'], kg: 20000,
    art: `<rect x="4" y="28" width="92" height="60" rx="8"/><path class="ln" stroke-width="3" d="M40 28L50 12L60 28M36 12H64"/>
      <rect class="cut" x="10" y="38" width="14" height="20" rx="1"/><rect class="cut" x="28" y="38" width="14" height="20" rx="1"/>
      <rect class="cut" x="46" y="38" width="14" height="20" rx="1"/><rect class="cut" x="64" y="38" width="14" height="20" rx="1"/>
      <rect class="cut" x="82" y="38" width="9" height="20" rx="1"/><path class="cl" stroke-width="2" d="M4 68H96"/>
      <circle cx="22" cy="91" r="9"/><circle cx="78" cy="91" r="9"/>`,
  },
  {
    name: 'вагон метро', acc: 'вагон метро', forms: ['вагон метро', 'вагона метро', 'вагонов метро'], kg: 34000,
    art: `<rect x="2" y="34" width="96" height="54" rx="5"/>
      <rect class="cut" x="7" y="42" width="11" height="17" rx="1"/><rect class="cut" x="23" y="42" width="8" height="34"/>
      <rect class="cut" x="33" y="42" width="8" height="34"/><rect class="cut" x="46" y="42" width="16" height="17" rx="1"/>
      <rect class="cut" x="67" y="42" width="8" height="34"/><rect class="cut" x="77" y="42" width="8" height="34"/>
      <rect class="cut" x="89" y="42" width="6" height="17" rx="1"/>
      <circle cx="16" cy="92" r="8"/><circle cx="32" cy="92" r="8"/><circle cx="68" cy="92" r="8"/><circle cx="84" cy="92" r="8"/>`,
  },
  {
    name: 'танк Т-34-85', acc: 'танк Т-34-85', forms: ['танк Т-34-85', 'танка Т-34-85', 'танков Т-34-85'], kg: 32000,
    art: `<path d="M6 68L18 54L84 54L96 68Z"/><path d="M36 55L42 36L68 36L74 55Z"/><rect x="2" y="42" width="42" height="5.5"/>
      <rect x="4" y="68" width="92" height="28" rx="14"/>
      <circle class="cut" cx="20" cy="82" r="8"/><circle class="cut" cx="36" cy="82" r="8"/><circle class="cut" cx="52" cy="82" r="8"/>
      <circle class="cut" cx="68" cy="82" r="8"/><circle class="cut" cx="82" cy="82" r="8"/>
      <circle cx="20" cy="82" r="5"/><circle cx="36" cy="82" r="5"/><circle cx="52" cy="82" r="5"/><circle cx="68" cy="82" r="5"/><circle cx="82" cy="82" r="5"/>`,
  },
  {
    name: 'экскаватор', acc: 'экскаватор', forms: ['экскаватор', 'экскаватора', 'экскаваторов'], kg: 21000,
    art: `<rect x="30" y="80" width="66" height="18" rx="9"/><rect x="50" y="44" width="40" height="38" rx="3"/>
      <rect class="cut" x="56" y="50" width="17" height="15" rx="1"/>
      <path class="ln" stroke-width="7" d="M56 66L30 22L11 48"/><path d="M2 46L19 46L15 65L4 61Z"/>
      <circle class="cut" cx="40" cy="89" r="4"/><circle class="cut" cx="52" cy="89" r="4"/><circle class="cut" cx="64" cy="89" r="4"/>
      <circle class="cut" cx="76" cy="89" r="4"/><circle class="cut" cx="88" cy="89" r="4"/>`,
  },
  {
    name: 'детская коляска', acc: 'детскую коляску', forms: ['коляска', 'коляски', 'колясок'], kg: 12,
    art: `<path d="M22 44L82 44Q82 70 52 70Q22 70 22 44Z"/><path d="M50 44A32 32 0 0 1 82 14L82 44Z"/>
      <path class="ln" stroke-width="4" d="M22 44L8 28"/><path class="ln" stroke-width="3" d="M36 68L28 86M68 68L76 86"/>
      <circle class="ln" stroke-width="4" cx="28" cy="88" r="10"/><circle class="ln" stroke-width="4" cx="76" cy="88" r="10"/>`,
  },
  {
    name: 'ракета «Союз»', acc: 'ракету «Союз»', forms: ['ракета «Союз»', 'ракеты «Союз»', 'ракет «Союз»'], kg: 312000,
    art: `<rect x="42" y="20" width="16" height="70"/><path d="M42 21Q50 -4 58 21Z"/>
      <path d="M30 90L34 46L42 56L42 90ZM70 90L66 46L58 56L58 90Z"/>
      <path d="M31 90L27 100L44 100L42 90ZM44 90L42 100L58 100L56 90ZM58 90L56 100L73 100L69 90Z"/>
      <rect class="cut" x="42" y="38" width="16" height="3"/>`,
  },
  {
    name: 'поезд «Сапсан»', acc: 'поезд «Сапсан»', forms: ['«Сапсан»', '«Сапсана»', '«Сапсанов»'], kg: 670000,
    art: `<path d="M2 88Q4 72 30 62L98 62L98 88Z"/><path class="cut" d="M22 70L34 66L34 74L16 76Z"/>
      <rect class="cut" x="40" y="67" width="10" height="7" rx="1"/><rect class="cut" x="54" y="67" width="10" height="7" rx="1"/>
      <rect class="cut" x="68" y="67" width="10" height="7" rx="1"/><rect class="cut" x="82" y="67" width="10" height="7" rx="1"/>
      <path class="cl" stroke-width="2" d="M4 82H98"/>
      <circle cx="24" cy="92" r="6"/><circle cx="40" cy="92" r="6"/><circle cx="74" cy="92" r="6"/><circle cx="90" cy="92" r="6"/>`,
  },
  {
    name: 'морской контейнер', acc: 'морской контейнер', forms: ['контейнер', 'контейнера', 'контейнеров'], kg: 2200,
    art: `<rect x="3" y="46" width="94" height="54" rx="1"/>
      <path class="cl" stroke-width="2" d="M13 51v44M23 51v44M33 51v44M43 51v44M53 51v44M63 51v44M73 51v44M83 51v44"/>`,
  },
  // ---------- еда ----------
  {
    name: 'картофелина', acc: 'картофелину', forms: ['картофелина', 'картофелины', 'картофелин'], kg: 0.1,
    art: `<path d="M10 76Q8 54 34 52Q56 44 78 54Q96 64 90 82Q82 100 50 98Q14 98 10 76Z"/>
      <circle class="cut" cx="34" cy="70" r="2"/><circle class="cut" cx="58" cy="64" r="2"/>
      <circle class="cut" cx="70" cy="82" r="2"/><circle class="cut" cx="46" cy="86" r="1.8"/>`,
  },
  {
    name: 'куриное яйцо', acc: 'куриное яйцо', forms: ['яйцо', 'яйца', 'яиц'], kg: 0.06,
    art: `<path d="M50 24Q78 34 80 68Q80 99 50 99Q20 99 20 68Q22 34 50 24Z"/>`,
  },
  {
    name: 'тыква', acc: 'тыкву', forms: ['тыква', 'тыквы', 'тыкв'], kg: 5,
    art: `<ellipse cx="50" cy="69" rx="45" ry="30"/><path d="M44 41L47 24L58 26L56 41Z"/>
      <path class="cl" stroke-width="3" d="M50 41Q44 69 50 98M30 45Q16 69 30 94M70 45Q84 69 70 94"/>`,
  },
  {
    name: 'кочан капусты', acc: 'кочан капусты', forms: ['кочан капусты', 'кочана капусты', 'кочанов капусты'], kg: 2,
    art: `<circle cx="50" cy="60" r="36"/><path d="M4 62Q4 98 40 99L24 70ZM96 62Q96 98 60 99L76 70Z"/>
      <path class="cl" stroke-width="2.5" d="M20 66Q26 32 60 27M80 66Q76 40 50 34M30 96Q50 58 70 96M16 70Q22 90 40 97M84 70Q78 90 60 97"/>`,
  },
  {
    name: 'банан', acc: 'банан', forms: ['банан', 'банана', 'бананов'], kg: 0.15,
    art: `<path d="M8 66Q30 104 76 88L94 70L88 64Q62 84 30 72L16 58Z"/><path d="M88 64L91 54L97 58L94 70Z"/>`,
  },
  {
    name: 'лимон', acc: 'лимон', forms: ['лимон', 'лимона', 'лимонов'], kg: 0.12,
    art: `<path d="M6 70Q14 64 20 56Q36 38 62 42Q80 46 88 62L97 68L88 76Q78 98 50 98Q24 96 18 78Z"/>`,
  },
  {
    name: 'морковка', acc: 'морковку', forms: ['морковка', 'морковки', 'морковок'], kg: 0.1,
    art: `<path d="M4 96L60 56Q74 52 78 64Q80 74 68 78Z"/><path d="M70 56L78 30L82 50L92 34L88 56L98 50L82 68Z"/>
      <path class="cl" stroke-width="2" d="M30 79l5 6M44 69l5 7M56 62l5 7"/>`,
  },
  {
    name: 'пачка масла', acc: 'пачку масла', forms: ['пачка масла', 'пачки масла', 'пачек масла'], kg: 0.18,
    art: `<rect x="6" y="60" width="88" height="40" rx="4"/><rect class="cut" x="22" y="70" width="56" height="20" rx="2"/>
      <path class="ln" stroke-width="2.5" d="M30 77h40M30 84h26"/>`,
  },
  {
    name: 'бутылка воды 1,5 л', acc: 'бутылку воды 1,5 л', forms: ['бутылка воды', 'бутылки воды', 'бутылок воды'], kg: 1.5,
    art: `<rect x="32" y="36" width="36" height="64" rx="8"/><path d="M32 46Q32 26 42 22L58 22Q68 26 68 46Z"/>
      <rect x="43" y="9" width="14" height="14"/><rect x="41" y="2" width="18" height="9" rx="2"/>
      <rect class="cut" x="32" y="54" width="36" height="18"/>`,
  },
  {
    name: 'ведро воды', acc: 'ведро воды', forms: ['ведро воды', 'ведра воды', 'вёдер воды'], kg: 10,
    art: `<path d="M18 42L82 42L72 100L28 100Z"/><rect x="14" y="37" width="72" height="8" rx="3"/>
      <path class="ln" stroke-width="3" d="M18 40Q50 -6 82 40"/><path class="cl" stroke-width="2" d="M24 54H76"/>`,
  },
  {
    name: 'банка сгущёнки', acc: 'банку сгущёнки', forms: ['банка сгущёнки', 'банки сгущёнки', 'банок сгущёнки'], kg: 0.4,
    art: `<rect x="20" y="48" width="60" height="50" rx="3"/><rect x="17" y="46" width="66" height="7" rx="2"/><rect x="17" y="93" width="66" height="7" rx="2"/>
      <rect class="cut" x="20" y="60" width="60" height="26"/>
      <path d="M26 73L34 64L42 73L34 82ZM42 73L50 64L58 73L50 82ZM58 73L66 64L74 73L66 82Z"/>`,
  },
  {
    name: 'ананас', acc: 'ананас', forms: ['ананас', 'ананаса', 'ананасов'], kg: 1.5,
    art: `<ellipse cx="50" cy="69" rx="24" ry="30"/>
      <path d="M50 42L38 14L46 26L50 3L54 26L62 14ZM42 42L26 22L45 35ZM58 42L74 22L55 35Z"/>
      <path class="cl" stroke-width="2" d="M30 58L62 96M38 46L72 84M70 58L38 96M62 46L28 84"/>`,
  },
  // ---------- вещи ----------
  {
    name: 'пудовая гиря', acc: 'пудовую гирю', forms: ['пудовая гиря', 'пудовые гири', 'пудовых гирь'], kg: 16,
    art: `<circle cx="50" cy="68" r="31"/><path class="ln" stroke-width="9" d="M34 46Q34 14 50 14Q66 14 66 46"/>
      <text class="cut" x="50" y="78" text-anchor="middle" font-size="26" font-weight="700" font-family="system-ui, sans-serif">16</text>`,
  },
  {
    name: 'мешок цемента', acc: 'мешок цемента', forms: ['мешок цемента', 'мешка цемента', 'мешков цемента'], kg: 50,
    art: `<path d="M14 100Q8 60 16 36L84 36Q92 60 86 100Z"/><path d="M16 37L10 24L30 30L50 24L70 30L90 24L84 37Z"/>
      <rect class="cut" x="30" y="54" width="40" height="24" rx="1"/><path class="ln" stroke-width="2.5" d="M36 62h28M36 70h18"/>`,
  },
  {
    name: 'холодильник', acc: 'холодильник', forms: ['холодильник', 'холодильника', 'холодильников'], kg: 70,
    art: `<rect x="24" y="3" width="52" height="93" rx="4"/><rect x="28" y="95" width="8" height="5"/><rect x="64" y="95" width="8" height="5"/>
      <path class="cl" stroke-width="2.5" d="M24 36H76"/><path class="cl" stroke-width="3" d="M32 16v12M32 44v20"/>`,
  },
  {
    name: 'стиральная машина', acc: 'стиральную машину', forms: ['стиральная машина', 'стиральные машины', 'стиральных машин'], kg: 60,
    art: `<rect x="14" y="22" width="72" height="78" rx="4"/><path class="cl" stroke-width="2.5" d="M14 38H86"/>
      <circle class="cut" cx="50" cy="69" r="21"/><circle cx="50" cy="69" r="15"/><circle class="cut" cx="74" cy="30" r="4"/>
      <path class="cl" stroke-width="2.5" d="M22 30h22"/>`,
  },
  {
    name: 'телевизор', acc: 'телевизор', forms: ['телевизор', 'телевизора', 'телевизоров'], kg: 15,
    art: `<rect x="3" y="30" width="94" height="56" rx="3"/><rect class="cut" x="8" y="35" width="84" height="46" rx="1"/>
      <rect x="46" y="86" width="8" height="9"/><rect x="28" y="94" width="44" height="6" rx="2"/>`,
  },
  {
    name: 'диван', acc: 'диван', forms: ['диван', 'дивана', 'диванов'], kg: 60,
    art: `<rect x="12" y="44" width="76" height="32" rx="6"/><rect x="3" y="56" width="17" height="36" rx="6"/><rect x="80" y="56" width="17" height="36" rx="6"/>
      <rect x="12" y="68" width="76" height="22" rx="3"/><rect x="10" y="90" width="6" height="10"/><rect x="84" y="90" width="6" height="10"/>
      <path class="cl" stroke-width="2" d="M50 48v20M20 68H80"/>`,
  },
  {
    name: 'стул', acc: 'стул', forms: ['стул', 'стула', 'стульев'], kg: 5,
    art: `<path d="M24 4L32 4L34 100L26 100Z"/><rect x="26" y="52" width="50" height="8" rx="2"/><rect x="69" y="56" width="7" height="44"/>
      <rect x="30" y="78" width="42" height="4"/><rect x="28" y="12" width="12" height="6"/><rect x="28" y="28" width="12" height="6"/>`,
  },
  {
    name: 'табуретка', acc: 'табуретку', forms: ['табуретка', 'табуретки', 'табуреток'], kg: 3,
    art: `<rect x="10" y="44" width="80" height="11" rx="2"/><path d="M18 55L27 55L21 100L12 100ZM73 55L82 55L88 100L79 100Z"/>
      <rect x="20" y="74" width="60" height="5"/>`,
  },
  {
    name: 'рояль', acc: 'рояль', forms: ['рояль', 'рояля', 'роялей'], kg: 400,
    art: `<rect x="5" y="42" width="90" height="16" rx="2"/><path d="M12 42L92 8L95 13L24 42Z"/>
      <path class="ln" stroke-width="2.5" d="M68 42L74 21"/>
      <rect x="12" y="58" width="6" height="38"/><rect x="82" y="58" width="6" height="38"/><rect x="48" y="58" width="5" height="34"/>
      <circle cx="15" cy="97" r="3"/><circle cx="85" cy="97" r="3"/><rect class="cut" x="5" y="51" width="24" height="3"/>`,
  },
  {
    name: 'гитара', acc: 'гитару', forms: ['гитара', 'гитары', 'гитар'], kg: 2,
    art: `<circle cx="50" cy="79" r="21"/><circle cx="50" cy="52" r="15"/><rect x="46" y="8" width="8" height="38"/>
      <rect x="43" y="0" width="14" height="12" rx="2"/><circle class="cut" cx="50" cy="62" r="6.5"/><rect class="cut" x="41" y="83" width="18" height="3"/>`,
  },
  {
    name: 'самовар', acc: 'самовар', forms: ['самовар', 'самовара', 'самоваров'], kg: 6,
    art: `<path d="M30 34Q20 56 32 80L68 80Q80 56 70 34Z"/><rect x="33" y="27" width="34" height="8" rx="3"/><rect x="44" y="12" width="12" height="16"/>
      <circle cx="50" cy="9" r="6"/><path class="ln" stroke-width="4" d="M27 44Q10 50 27 64M73 44Q90 50 73 64"/>
      <path d="M40 80L36 93L64 93L60 80Z"/><rect x="29" y="92" width="42" height="7" rx="2"/>
      <path class="cl" stroke-width="2" d="M30 46H70"/>`,
  },
  {
    name: 'утюг', acc: 'утюг', forms: ['утюг', 'утюга', 'утюгов'], kg: 1.5,
    art: `<path d="M3 90Q20 52 60 52L92 52Q97 52 97 58L97 90Z"/><rect x="3" y="92" width="94" height="7" rx="2"/>
      <rect class="cut" x="40" y="61" width="46" height="13" rx="6.5"/>`,
  },
  {
    name: 'ноутбук', acc: 'ноутбук', forms: ['ноутбук', 'ноутбука', 'ноутбуков'], kg: 2,
    art: `<rect x="18" y="36" width="64" height="48" rx="3"/><rect class="cut" x="23" y="41" width="54" height="38" rx="1"/>
      <path d="M8 86L92 86L99 99L1 99Z"/>`,
  },
  {
    name: 'смартфон', acc: 'смартфон', forms: ['смартфон', 'смартфона', 'смартфонов'], kg: 0.2,
    art: `<rect x="28" y="2" width="44" height="98" rx="8"/><rect class="cut" x="33" y="11" width="34" height="74" rx="2"/>
      <circle class="cut" cx="50" cy="92" r="3"/>`,
  },
  {
    name: 'книга', acc: 'книгу', forms: ['книга', 'книги', 'книг'], kg: 0.5,
    art: `<rect x="16" y="26" width="68" height="74" rx="3"/><path class="cl" stroke-width="2.5" d="M27 26v74"/>
      <rect class="cut" x="38" y="42" width="34" height="6"/><rect class="cut" x="38" y="54" width="22" height="4"/>`,
  },
  {
    name: 'микроволновка', acc: 'микроволновку', forms: ['микроволновка', 'микроволновки', 'микроволновок'], kg: 12,
    art: `<rect x="3" y="40" width="94" height="56" rx="4"/><rect class="cut" x="9" y="47" width="58" height="42" rx="2"/>
      <circle class="cut" cx="82" cy="55" r="3.5"/><circle class="cut" cx="82" cy="68" r="3.5"/><rect class="cut" x="75" y="78" width="14" height="8" rx="1"/>
      <rect x="10" y="95" width="8" height="5"/><rect x="82" y="95" width="8" height="5"/>`,
  },
  {
    name: 'лопата', acc: 'лопату', forms: ['лопата', 'лопаты', 'лопат'], kg: 2,
    art: `<rect x="47" y="4" width="6" height="64"/><path class="ln" stroke-width="5" d="M38 5H62"/>
      <path d="M33 62L67 62L67 84Q50 108 33 84Z"/>`,
  },
  {
    name: 'молоток', acc: 'молоток', forms: ['молоток', 'молотка', 'молотков'], kg: 0.5,
    art: `<rect x="46" y="24" width="9" height="76" rx="3"/><path d="M20 8L80 8L80 29L34 29L20 22Z"/>`,
  },
  {
    name: 'чугунная ванна', acc: 'чугунную ванну', forms: ['чугунная ванна', 'чугунные ванны', 'чугунных ванн'], kg: 100,
    art: `<path d="M4 46L96 46Q96 86 76 86L24 86Q4 86 4 46Z"/><rect x="1" y="41" width="98" height="8" rx="3"/>
      <path d="M22 86L17 100L28 100L31 86ZM69 86L72 100L83 100L78 86Z"/><path class="ln" stroke-width="4" d="M86 41V26H74"/>`,
  },
  {
    name: 'унитаз', acc: 'унитаз', forms: ['унитаз', 'унитаза', 'унитазов'], kg: 25,
    art: `<rect x="60" y="8" width="30" height="48" rx="3"/><path d="M14 56L90 56Q86 80 62 84L64 100L34 100L36 82Q16 78 14 56Z"/>
      <rect x="9" y="49" width="62" height="8" rx="3"/><rect class="cut" x="70" y="14" width="10" height="3" rx="1.5"/>`,
  },
  {
    name: 'автомобильная шина', acc: 'автомобильную шину', forms: ['шина', 'шины', 'шин'], kg: 9,
    art: `<circle cx="50" cy="57" r="43"/><circle class="cut" cx="50" cy="57" r="25"/><circle cx="50" cy="57" r="19"/>
      <circle class="cut" cx="50" cy="57" r="5"/><circle class="cut" cx="50" cy="45" r="3"/><circle class="cut" cx="50" cy="69" r="3"/>
      <circle class="cut" cx="38" cy="57" r="3"/><circle class="cut" cx="62" cy="57" r="3"/>`,
  },
  {
    name: 'матрёшка', acc: 'матрёшку', forms: ['матрёшка', 'матрёшки', 'матрёшек'], kg: 0.3,
    art: `<path d="M50 3Q69 3 69 24Q69 34 62 40Q84 52 80 82Q78 100 50 100Q22 100 20 82Q16 52 38 40Q31 34 31 24Q31 3 50 3Z"/>
      <circle class="cut" cx="50" cy="24" r="11.5"/><circle cx="46" cy="23" r="1.6"/><circle cx="54" cy="23" r="1.6"/>
      <ellipse class="cut" cx="50" cy="72" rx="14" ry="17"/><circle cx="50" cy="72" r="5.5"/>`,
  },
  {
    name: 'баскетбольный мяч', acc: 'баскетбольный мяч', forms: ['баскетбольный мяч', 'баскетбольных мяча', 'баскетбольных мячей'], kg: 0.6,
    art: `<circle cx="50" cy="59" r="41"/>
      <path class="cl" stroke-width="3" d="M50 18V100M9 59H91M22 30Q44 59 22 88M78 30Q56 59 78 88"/>`,
  },
  {
    name: 'теннисный мяч', acc: 'теннисный мяч', forms: ['теннисный мяч', 'теннисных мяча', 'теннисных мячей'], kg: 0.057,
    art: `<circle cx="50" cy="63" r="37"/><path class="cl" stroke-width="3.5" d="M24 38Q52 63 24 88M76 38Q48 63 76 88"/>`,
  },
  {
    name: 'хоккейная шайба', acc: 'хоккейную шайбу', forms: ['шайба', 'шайбы', 'шайб'], kg: 0.165,
    art: `<rect x="6" y="70" width="88" height="30" rx="6"/><path class="cl" stroke-width="2" d="M6 79H94M6 91H94"/>`,
  },
  {
    name: 'шар для боулинга', acc: 'шар для боулинга', forms: ['шар для боулинга', 'шара для боулинга', 'шаров для боулинга'], kg: 6,
    art: `<circle cx="50" cy="61" r="39"/><circle class="cut" cx="42" cy="40" r="4.5"/><circle class="cut" cx="56" cy="38" r="4.5"/><circle class="cut" cx="52" cy="52" r="4.5"/>`,
  },
);
