// Веса приблизительные, в килограммах.
// forms — для 1 / 2 / 5 штук, acc — винительный падеж («уравновесят кого/что»).
// art — силуэт в рамке 100×100, предмет стоит на нижней границе.
//   .cut — вырез цветом бумаги, .ln — линия цветом предмета, .cl — линия цветом бумаги.
const OBJECTS = [
  {
    name: 'слон', acc: 'слона', forms: ['слон', 'слона', 'слонов'], kg: 5000,
    art: `<ellipse cx="54" cy="52" rx="34" ry="26"/><circle cx="22" cy="44" r="17"/>
      <path d="M8 48Q2 70 9 92L17 92Q12 72 20 58Z"/><path d="M86 46Q95 60 90 74L87 73Q90 60 83 52Z"/>
      <rect x="30" y="66" width="14" height="34" rx="3"/><rect x="47" y="70" width="12" height="30" rx="3"/>
      <rect x="62" y="70" width="12" height="30" rx="3"/><rect x="74" y="64" width="13" height="36" rx="3"/>
      <circle class="cut" cx="17" cy="40" r="2"/><path class="cl" stroke-width="2" d="M34 34Q42 46 34 58"/>`,
  },
  {
    name: 'корова', acc: 'корову', forms: ['корова', 'коровы', 'коров'], kg: 600,
    art: `<rect x="22" y="36" width="62" height="34" rx="10"/><rect x="5" y="30" width="24" height="20" rx="6"/>
      <path d="M10 31L6 21L14 28ZM24 31L28 21L20 28Z"/><path d="M84 40Q93 50 89 72L86 72Q88 52 81 46Z"/>
      <rect x="27" y="62" width="8" height="38"/><rect x="39" y="62" width="8" height="38"/>
      <rect x="63" y="62" width="8" height="38"/><rect x="74" y="62" width="8" height="38"/>
      <ellipse cx="56" cy="71" rx="8" ry="5"/>
      <ellipse class="cut" cx="46" cy="48" rx="10" ry="6"/><ellipse class="cut" cx="68" cy="56" rx="6" ry="5"/>
      <circle class="cut" cx="12" cy="37" r="1.8"/>`,
  },
  {
    name: 'лошадь', acc: 'лошадь', forms: ['лошадь', 'лошади', 'лошадей'], kg: 500,
    art: `<ellipse cx="56" cy="50" rx="28" ry="16"/><path d="M32 46L20 18L33 13L48 40Z"/>
      <path d="M24 13L5 28L9 35L31 25Z"/><path d="M25 14L27 5L33 13Z"/>
      <path d="M82 42Q97 50 91 84L85 80Q89 58 79 52Z"/>
      <rect x="33" y="56" width="7" height="44"/><rect x="43" y="60" width="6" height="40"/>
      <rect x="67" y="58" width="7" height="42"/><rect x="77" y="54" width="6" height="46"/>
      <circle class="cut" cx="19" cy="20" r="1.8"/>`,
  },
  {
    name: 'амурский тигр', acc: 'амурского тигра', forms: ['амурский тигр', 'амурских тигра', 'амурских тигров'], kg: 200,
    art: `<rect x="24" y="44" width="58" height="26" rx="12"/><circle cx="18" cy="48" r="14"/>
      <circle cx="9" cy="36" r="5"/><circle cx="26" cy="35" r="5"/>
      <path d="M79 48Q98 42 94 20L90 21Q92 38 77 54Z"/>
      <rect x="28" y="62" width="10" height="38" rx="3"/><rect x="41" y="64" width="9" height="36" rx="3"/>
      <rect x="62" y="64" width="9" height="36" rx="3"/><rect x="73" y="62" width="9" height="38" rx="3"/>
      <path class="cl" stroke-width="3" d="M40 44v11M50 44v13M60 44v11M70 44v13"/>
      <circle class="cut" cx="13" cy="46" r="1.8"/><circle class="cut" cx="22" cy="46" r="1.8"/>`,
  },
  {
    name: 'жираф', acc: 'жирафа', forms: ['жираф', 'жирафа', 'жирафов'], kg: 1200,
    art: `<ellipse cx="60" cy="58" rx="20" ry="12"/><path d="M45 58L28 12L38 9L60 50Z"/>
      <path d="M38 9L21 13L17 20L34 23Z"/><rect x="31" y="1" width="2.5" height="9"/><rect x="36" y="1" width="2.5" height="9"/>
      <rect x="43" y="62" width="5" height="38"/><rect x="51" y="64" width="5" height="36"/>
      <rect x="67" y="64" width="5" height="36"/><rect x="74" y="60" width="5" height="40"/>
      <rect x="79" y="56" width="2.5" height="22"/>
      <circle class="cut" cx="40" cy="30" r="2.5"/><circle class="cut" cx="46" cy="42" r="3"/>
      <circle class="cut" cx="58" cy="56" r="3.5"/><circle class="cut" cx="69" cy="60" r="3"/><circle class="cut" cx="26" cy="15" r="1.5"/>`,
  },
  {
    name: 'бегемот', acc: 'бегемота', forms: ['бегемот', 'бегемота', 'бегемотов'], kg: 1500,
    art: `<ellipse cx="58" cy="60" rx="34" ry="24"/><rect x="3" y="46" width="36" height="28" rx="12"/>
      <circle cx="25" cy="44" r="4"/><circle cx="34" cy="43" r="4"/>
      <rect x="30" y="76" width="13" height="24" rx="3"/><rect x="46" y="78" width="12" height="22" rx="3"/>
      <rect x="62" y="78" width="12" height="22" rx="3"/><rect x="76" y="74" width="12" height="26" rx="3"/>
      <circle class="cut" cx="22" cy="53" r="2"/><circle class="cut" cx="8" cy="54" r="1.5"/>`,
  },
  {
    name: 'синий кит', acc: 'синего кита', forms: ['синий кит', 'синих кита', 'синих китов'], kg: 120000,
    art: `<path d="M3 76Q8 50 50 50Q80 50 88 64L98 50L96 72L98 90L86 78Q70 94 40 94Q10 94 3 76Z"/>
      <path d="M46 92L58 100L62 90Z"/><path class="ln" stroke-width="3" d="M30 46Q27 36 20 36M30 46Q33 36 40 36"/>
      <circle class="cut" cx="15" cy="72" r="2"/><path class="cl" stroke-width="2" d="M6 82Q24 88 42 84"/>`,
  },
  {
    name: 'свинья', acc: 'свинью', forms: ['свинья', 'свиньи', 'свиней'], kg: 150,
    art: `<ellipse cx="54" cy="62" rx="32" ry="22"/><circle cx="21" cy="62" r="15"/>
      <rect x="2" y="60" width="11" height="11" rx="4"/><path d="M17 51L21 36L30 50Z"/>
      <rect x="30" y="78" width="9" height="22"/><rect x="42" y="80" width="9" height="20"/>
      <rect x="62" y="80" width="9" height="20"/><rect x="73" y="78" width="9" height="22"/>
      <path class="ln" stroke-width="3" d="M85 56q8-4 6 4q-2 6 5 4"/><circle class="cut" cx="17" cy="57" r="1.8"/>`,
  },
  {
    name: 'верблюд', acc: 'верблюда', forms: ['верблюд', 'верблюда', 'верблюдов'], kg: 500,
    art: `<ellipse cx="58" cy="56" rx="26" ry="14"/><circle cx="48" cy="42" r="10"/><circle cx="68" cy="42" r="10"/>
      <path d="M35 58L18 22L27 17L46 48Z"/><path d="M27 17L8 19L5 28L24 31Z"/>
      <rect x="37" y="62" width="6" height="38"/><rect x="46" y="64" width="6" height="36"/>
      <rect x="67" y="64" width="6" height="36"/><rect x="76" y="60" width="6" height="40"/>
      <rect x="83" y="52" width="2.5" height="20"/><circle class="cut" cx="14" cy="23" r="1.6"/>`,
  },
  {
    name: '«Нива»', acc: '«Ниву»', forms: ['«Нива»', '«Нивы»', '«Нив»'], kg: 1300,
    art: `<rect x="4" y="56" width="92" height="30" rx="4"/><path d="M20 58L27 32L74 32L84 58Z"/>
      <path class="cut" d="M31 37L48 37L48 54L26 54Z"/><path class="cut" d="M53 37L71 37L78 54L53 54Z"/>
      <circle class="cut" cx="25" cy="86" r="16"/><circle class="cut" cx="75" cy="86" r="16"/>
      <circle cx="25" cy="87" r="13"/><circle cx="75" cy="87" r="13"/>
      <circle class="cut" cx="25" cy="87" r="5"/><circle class="cut" cx="75" cy="87" r="5"/>`,
  },
  {
    name: 'городской автобус', acc: 'городской автобус', forms: ['автобус', 'автобуса', 'автобусов'], kg: 10500,
    art: `<rect x="2" y="40" width="96" height="50" rx="6"/>
      <rect class="cut" x="8" y="47" width="14" height="17" rx="1"/><rect class="cut" x="26" y="47" width="14" height="17" rx="1"/>
      <rect class="cut" x="44" y="47" width="14" height="17" rx="1"/><rect class="cut" x="62" y="47" width="14" height="17" rx="1"/>
      <rect class="cut" x="80" y="47" width="12" height="17" rx="1"/>
      <circle class="cut" cx="24" cy="90" r="13"/><circle class="cut" cx="76" cy="90" r="13"/>
      <circle cx="24" cy="90" r="10"/><circle cx="76" cy="90" r="10"/>
      <circle class="cut" cx="24" cy="90" r="4"/><circle class="cut" cx="76" cy="90" r="4"/>`,
  },
  {
    name: 'трактор «Беларус»', acc: 'трактор «Беларус»', forms: ['трактор', 'трактора', 'тракторов'], kg: 4000,
    art: `<rect x="6" y="50" width="44" height="22" rx="3"/><rect x="44" y="16" width="36" height="46" rx="3"/>
      <rect class="cut" x="49" y="21" width="26" height="22" rx="1"/><rect x="18" y="28" width="4" height="24"/>
      <circle class="cut" cx="68" cy="72" r="31"/><circle cx="68" cy="72" r="28"/><circle class="cut" cx="68" cy="72" r="10"/>
      <circle class="cut" cx="20" cy="84" r="19"/><circle cx="20" cy="84" r="16"/><circle class="cut" cx="20" cy="84" r="6"/>`,
  },
  {
    name: 'пианино', acc: 'пианино', forms: ['пианино', 'пианино', 'пианино'], kg: 250,
    art: `<rect x="8" y="18" width="84" height="7" rx="2"/><rect x="11" y="25" width="78" height="66" rx="2"/>
      <rect x="5" y="54" width="90" height="12" rx="2"/><rect x="12" y="91" width="9" height="9"/><rect x="79" y="91" width="9" height="9"/>
      <rect class="cut" x="8" y="56" width="84" height="8"/>
      <path class="ln" stroke-width="3.2" stroke-linecap="butt" d="M15 56v5M23 56v5M35 56v5M43 56v5M51 56v5M63 56v5M71 56v5M83 56v5"/>
      <path class="cl" stroke-width="2" d="M30 34h40M30 40h40"/>`,
  },
  {
    name: 'вертолёт Ми-8', acc: 'вертолёт Ми-8', forms: ['вертолёт Ми-8', 'вертолёта Ми-8', 'вертолётов Ми-8'], kg: 7000,
    art: `<ellipse cx="38" cy="68" rx="32" ry="19"/><path d="M60 58L97 50L97 57L62 74Z"/><path d="M89 54L96 30L99 30L99 54Z"/>
      <rect x="35" y="40" width="5" height="12"/><rect x="1" y="37" width="80" height="4" rx="2"/>
      <rect x="22" y="84" width="2.5" height="9"/><rect x="50" y="84" width="2.5" height="9"/>
      <circle cx="23" cy="95" r="5"/><circle cx="51" cy="95" r="5"/>
      <path class="cut" d="M9 66Q11 54 26 54L26 68Z"/><circle class="cut" cx="38" cy="62" r="4"/><circle class="cut" cx="51" cy="62" r="4"/>`,
  },
  {
    name: '«Боинг-737»', acc: '«Боинг-737»', forms: ['«Боинг-737»', '«Боинга-737»', '«Боингов-737»'], kg: 41000,
    art: `<rect x="2" y="54" width="90" height="17" rx="8.5"/><path d="M78 56L91 26L98 26L95 56Z"/><path d="M80 62L99 57L99 64Z"/>
      <path d="M38 66L60 66L72 88L62 88Z"/><rect x="38" y="74" width="17" height="9" rx="4"/>
      <rect x="18" y="70" width="2" height="20"/><rect x="62" y="70" width="2" height="20"/>
      <circle cx="19" cy="95" r="5"/><circle cx="63" cy="95" r="5"/>
      <path class="cut" d="M6 60L13 57L13 62Z"/>
      <path class="cl" stroke-width="2.6" stroke-dasharray="0.1 6" d="M20 60H76"/>`,
  },
  {
    name: 'арбуз', acc: 'арбуз', forms: ['арбуз', 'арбуза', 'арбузов'], kg: 8,
    art: `<ellipse cx="50" cy="63" rx="42" ry="37"/><path class="ln" stroke-width="4" d="M50 27q1-11 11-12"/>
      <path class="cl" stroke-width="3" d="M50 29Q40 63 50 98M30 33Q14 63 30 93M70 33Q86 63 70 93"/>`,
  },
  {
    name: 'кот', acc: 'кота', forms: ['кот', 'кота', 'котов'], kg: 4.5,
    art: `<ellipse cx="50" cy="72" rx="23" ry="28"/><circle cx="43" cy="34" r="18"/>
      <path d="M27 28L29 8L43 20ZM44 20L58 8L59 30Z"/><path d="M68 88Q97 88 91 56L85 58Q89 80 68 80Z"/>
      <circle class="cut" cx="36" cy="33" r="2.4"/><circle class="cut" cx="50" cy="33" r="2.4"/>`,
  },
  {
    name: 'батон', acc: 'батон', forms: ['батон', 'батона', 'батонов'], kg: 0.4,
    art: `<rect x="4" y="58" width="92" height="40" rx="20"/>
      <path class="cl" stroke-width="4" d="M26 66l9 16M42 64l9 16M58 64l9 16M74 66l9 16"/>`,
  },
  {
    name: 'кирпич', acc: 'кирпич', forms: ['кирпич', 'кирпича', 'кирпичей'], kg: 3.5,
    art: `<rect x="6" y="56" width="88" height="44" rx="2"/>
      <rect class="cut" x="16" y="65" width="18" height="7" rx="3.5"/><rect class="cut" x="41" y="65" width="18" height="7" rx="3.5"/>
      <rect class="cut" x="66" y="65" width="18" height="7" rx="3.5"/><rect class="cut" x="16" y="83" width="18" height="7" rx="3.5"/>
      <rect class="cut" x="41" y="83" width="18" height="7" rx="3.5"/><rect class="cut" x="66" y="83" width="18" height="7" rx="3.5"/>`,
  },
  {
    name: 'яблоко', acc: 'яблоко', forms: ['яблоко', 'яблока', 'яблок'], kg: 0.18,
    art: `<circle cx="36" cy="62" r="27"/><circle cx="64" cy="62" r="27"/><ellipse cx="50" cy="74" rx="30" ry="25"/>
      <path class="ln" stroke-width="4" d="M50 40Q49 28 53 20"/><path d="M53 30Q66 12 78 22Q66 38 53 30Z"/>`,
  },
  {
    name: 'футбольный мяч', acc: 'футбольный мяч', forms: ['футбольный мяч', 'футбольных мяча', 'футбольных мячей'], kg: 0.43,
    art: `<circle cx="50" cy="59" r="40"/><path class="cut" d="M50 43L65 54L59 71L41 71L35 54Z"/>
      <path class="cl" stroke-width="3" d="M50 43V21M65 54L86 47M59 71L72 91M41 71L28 91M35 54L14 47"/>`,
  },
  {
    name: 'курица', acc: 'курицу', forms: ['курица', 'курицы', 'куриц'], kg: 2.5,
    art: `<ellipse cx="54" cy="60" rx="26" ry="20"/><path d="M72 52L95 28L90 62Z"/><circle cx="28" cy="34" r="11"/>
      <path d="M20 40L37 34L46 54L30 62Z"/><path d="M18 33L7 37L18 41Z"/><circle cx="25" cy="22" r="4.5"/><circle cx="32" cy="22" r="4.5"/>
      <rect x="46" y="76" width="3" height="21"/><rect x="58" y="76" width="3" height="21"/>
      <path class="ln" stroke-width="3" d="M40 98h12M52 98h12"/><circle class="cut" cx="26" cy="32" r="1.8"/>`,
  },
  {
    name: 'велосипед', acc: 'велосипед', forms: ['велосипед', 'велосипеда', 'велосипедов'], kg: 14,
    art: `<circle class="ln" stroke-width="5" cx="22" cy="76" r="20"/><circle class="ln" stroke-width="5" cx="78" cy="76" r="20"/>
      <path class="ln" stroke-width="4.5" d="M22 76L40 46L66 46L50 76ZM40 46L50 76M66 46L78 76M66 46L62 33M55 33H70M40 46V40M33 40H47"/>`,
  },
  {
    name: 'ёж', acc: 'ежа', forms: ['ёж', 'ежа', 'ежей'], kg: 0.8,
    art: `<path d="M14 92Q14 48 54 48Q92 48 92 92Z"/>
      <path d="M20 66L15 50L28 56L27 40L40 50L44 34L54 46L62 32L68 48L81 38L81 54L94 52L88 68Z"/>
      <path d="M16 92L2 84L16 68Z"/><circle cx="4" cy="84" r="3"/>
      <rect x="26" y="88" width="9" height="12" rx="2"/><rect x="66" y="88" width="9" height="12" rx="2"/>
      <circle class="cut" cx="17" cy="79" r="2"/>`,
  },
  {
    name: 'овчарка', acc: 'овчарку', forms: ['овчарка', 'овчарки', 'овчарок'], kg: 35,
    art: `<path d="M28 46L74 54Q82 56 80 66L34 70Q24 66 24 54Z"/><ellipse cx="36" cy="58" rx="12" ry="14"/>
      <path d="M26 54L22 30L38 28L48 50Z"/><circle cx="30" cy="27" r="10"/><path d="M26 21L5 29L5 36L27 38Z"/><circle cx="6" cy="32" r="3"/>
      <path d="M26 20L27 3L35 18ZM33 20L38 5L42 22Z"/>
      <rect x="30" y="64" width="6" height="36"/><rect x="39" y="66" width="5" height="34"/>
      <path d="M68 58L82 64L76 82L80 100L73 100L67 84L62 68Z"/><path d="M60 64L69 68L65 84L68 100L62 100L57 84Z"/>
      <path d="M79 57Q95 68 92 94L86 90Q88 72 75 63Z"/><circle class="cut" cx="27" cy="25" r="1.6"/>`,
  },
  {
    name: 'человек', acc: 'человека', forms: ['человек', 'человека', 'человек'], kg: 75,
    art: `<circle cx="50" cy="11" r="9"/><rect x="38" y="23" width="24" height="38" rx="7"/>
      <rect x="28" y="24" width="8" height="36" rx="4"/><rect x="64" y="24" width="8" height="36" rx="4"/>
      <rect x="39" y="56" width="10" height="44" rx="4"/><rect x="51" y="56" width="10" height="44" rx="4"/>`,
  },
];
