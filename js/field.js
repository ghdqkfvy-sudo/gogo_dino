// ---------------------------------------------------------------- 필드(숲/바다/사막 + 우주/눈나라/공룡섬)
// 숲·바다·사막 배경은 여기, 우주·눈나라·공룡섬 배경은 fields_extra.js에 있습니다.
const FIELD_TITLES = {forest:'🌲 숲속', ocean:'🌊 바닷속', desert:'🏜️ 사막', space:'🚀 우주', snow:'❄️ 눈나라', island:'🌋 공룡섬'};

const FIELD_DECOR = {
  forest: `<svg viewBox="0 0 800 440" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="skyF" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#a9def9"/><stop offset="65%" stop-color="#d9f3ff"/><stop offset="100%" stop-color="#fff3d6"/>
      </linearGradient>
      <radialGradient id="sunF" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff8de" stop-opacity="1"/><stop offset="55%" stop-color="#ffe9a8" stop-opacity=".75"/><stop offset="100%" stop-color="#ffe9a8" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="groundF" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8ed67f"/><stop offset="40%" stop-color="#4fae5f"/><stop offset="100%" stop-color="#245c31"/>
      </linearGradient>
      <symbol id="pineTree" viewBox="0 0 60 100">
        <ellipse cx="30" cy="97" rx="20" ry="5" fill="#1f4d2a" opacity=".35"/>
        <rect x="25" y="74" width="10" height="24" rx="2" fill="#8a5a32"/>
        <path d="M30,0 L52,42 L8,42 Z" fill="#2f8a4a"/>
        <path d="M30,18 L56,60 L4,60 Z" fill="#358f4f"/>
        <path d="M30,36 L60,82 L0,82 Z" fill="#3c9958"/>
      </symbol>
      <symbol id="roundTree" viewBox="0 0 70 100">
        <ellipse cx="35" cy="97" rx="22" ry="5" fill="#1f4d2a" opacity=".35"/>
        <rect x="31" y="66" width="8" height="28" rx="2" fill="#8a5a32"/>
        <circle cx="35" cy="42" r="27" fill="#3c9958"/>
        <circle cx="16" cy="52" r="18" fill="#358f4f"/>
        <circle cx="54" cy="52" r="18" fill="#358f4f"/>
        <circle cx="27" cy="32" r="10" fill="#5fbf76" opacity=".7"/>
      </symbol>
    </defs>
    <rect x="0" y="0" width="800" height="440" fill="url(#skyF)"/>
    <circle cx="676" cy="70" r="58" fill="url(#sunF)"/>
    <circle cx="676" cy="70" r="27" fill="#ffe9a8"/>
    <g class="cloud" style="animation:driftCloud 42s linear infinite alternate;">
      <ellipse cx="150" cy="58" rx="46" ry="19" fill="#fff" opacity=".9"/>
      <ellipse cx="188" cy="48" rx="32" ry="15" fill="#fff" opacity=".9"/>
    </g>
    <g class="cloud" style="animation:driftCloud 58s linear infinite alternate; animation-delay:-22s;">
      <ellipse cx="430" cy="42" rx="36" ry="15" fill="#fff" opacity=".8"/>
    </g>
    <!-- 예전에는 지평선 위로 반투명한 연두색 "물결" 모양이 하늘색과 섞여서 마치 바다처럼
         보이는 문제가 있었습니다. 그래서 땅을 하나의 완만한(물결치지 않는) 곡선으로 된
         불투명한 초록 덩어리로 먼저 그리고, 밝고 어두운 초록 띠는 그 안쪽에서만(지평선보다
         한참 아래에서 시작하도록) 겹쳐서 하늘색이 비쳐 보이지 않도록 고쳤습니다. -->
    <!-- 비 갠 하늘의 무지개(땅이 아랫부분을 가림) -->
    <g fill="none" stroke-width="9" opacity=".3"><path d="M14,300 A236,236 0 0 1 486,300" stroke="#ff6b81"/><path d="M23,300 A227,227 0 0 1 477,300" stroke="#ffb347"/><path d="M32,300 A218,218 0 0 1 468,300" stroke="#ffe15a"/><path d="M41,300 A209,209 0 0 1 459,300" stroke="#8be24a"/><path d="M50,300 A200,200 0 0 1 450,300" stroke="#4a7bf7"/><path d="M59,300 A191,191 0 0 1 441,300" stroke="#a855f7"/></g>
    <path d="M0,266 Q200,250 400,262 T800,258 L800,440 L0,440 Z" fill="url(#groundF)"/>
    <path d="M0,300 Q200,286 400,296 T800,292 L800,440 L0,440 Z" fill="#6bc178" opacity=".4"/>
    <path d="M0,332 Q200,320 400,328 T800,324 L800,440 L0,440 Z" fill="#2c5f37" opacity=".3"/>
    <g opacity=".55" stroke="#1f6b34" stroke-width="3" stroke-linecap="round">
      <path d="M40,310 q4,-14 8,0"/><path d="M70,320 q4,-16 8,0"/><path d="M540,318 q4,-15 8,0"/>
      <path d="M760,312 q4,-14 8,0"/><path d="M300,326 q4,-14 8,0"/><path d="M460,332 q4,-15 8,0"/>
    </g>
    <use href="#pineTree" x="4" y="176" width="66" height="110"/>
    <use href="#roundTree" x="68" y="196" width="60" height="96"/>
    <use href="#pineTree" x="128" y="210" width="52" height="88"/>
    <use href="#pineTree" x="612" y="192" width="58" height="102"/>
    <use href="#roundTree" x="666" y="206" width="56" height="92"/>
    <use href="#pineTree" x="726" y="184" width="66" height="110"/>
    <g class="firefly" style="animation:twinkleFly 2.6s ease-in-out infinite;"><circle cx="250" cy="230" r="3.4" fill="#fff6b0"/></g>
    <g class="firefly" style="animation:twinkleFly 3.2s ease-in-out infinite; animation-delay:-1.1s;"><circle cx="470" cy="250" r="3" fill="#fff6b0"/></g>
    <g class="firefly" style="animation:twinkleFly 2.9s ease-in-out infinite; animation-delay:-.5s;"><circle cx="360" cy="210" r="2.6" fill="#fff6b0"/></g>
    <g transform="translate(0,60)"><g style="animation:flyAcrossR 14s linear infinite;">
      <path class="bird" style="animation:wingFlap .45s ease-in-out infinite;" d="M-11,0 Q-5,-7 0,0 Q5,-7 11,0" stroke="#3a2f1a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    </g></g>
    <g transform="translate(0,92)"><g style="animation:flyAcrossL 19s linear infinite; animation-delay:-6s;">
      <path class="bird" style="animation:wingFlap .5s ease-in-out infinite; animation-delay:-.2s;" d="M-9,0 Q-4,-6 0,0 Q4,-6 9,0" stroke="#3a2f1a" stroke-width="2.3" fill="none" stroke-linecap="round"/>
    </g></g>
    <!-- 토끼는 굴(구멍) 바로 위에 정확히 겹치도록 같은 x,y에 그려서, 굴 속에서 통통 튀어나오는
         것처럼 보이게 했습니다(예전엔 굴과 토끼 좌표가 서로 달라서 따로 노는 것처럼 보였음). -->
    <g transform="translate(112,304)">
      <ellipse cx="0" cy="4" rx="16" ry="6" fill="#2a5b34" opacity=".55"/>
      <g class="critter" style="animation:hopCritter 1.15s ease-in-out infinite;">
        <ellipse cx="0" cy="2" rx="11" ry="7.5" fill="#f2e9da"/>
        <ellipse cx="-5" cy="-11" rx="2.6" ry="9" fill="#f2e9da"/><ellipse cx="4" cy="-12" rx="2.6" ry="9" fill="#f2e9da"/>
        <ellipse cx="-5" cy="-10" rx="1.1" ry="5.5" fill="#ffb3c6"/><ellipse cx="4" cy="-11" rx="1.1" ry="5.5" fill="#ffb3c6"/>
        <circle cx="4" cy="0" r="1.3" fill="#2e2350"/>
      </g>
    </g>
    <g transform="translate(588,308)">
      <ellipse cx="0" cy="4" rx="14" ry="5.5" fill="#2a5b34" opacity=".55"/>
      <g class="critter" style="animation:hopCritter 1.4s ease-in-out infinite; animation-delay:-.5s;">
        <ellipse cx="0" cy="2" rx="9" ry="6.2" fill="#c9a876"/>
        <ellipse cx="-4" cy="-9" rx="2.2" ry="7" fill="#c9a876"/><ellipse cx="3" cy="-10" rx="2.2" ry="7" fill="#c9a876"/>
        <circle cx="3" cy="0" r="1.1" fill="#2e2350"/>
      </g>
    </g>
    <!-- 다람쥐: 나무 밑동에 앉아 살짝살짝 까닥거림 -->
    <g transform="translate(430,304)"><g class="critter" style="animation:idleBob 1.6s ease-in-out infinite;">
      <ellipse cx="0" cy="0" rx="8" ry="7" fill="#b5732f"/>
      <path d="M6,-2 Q20,-12 12,6 Q22,4 16,14 Q6,10 6,-2 Z" fill="#c98a45"/>
      <ellipse cx="-4" cy="-8" rx="2" ry="4" fill="#b5732f"/>
      <circle cx="-3" cy="-2" r="1.1" fill="#2e2350"/>
    </g></g>
    <!-- 아기 사슴: 숲 가장자리에 조용히 서있는 디테일 -->
    <g transform="translate(500,296)">
      <g stroke="#a9743f" stroke-width="3" stroke-linecap="round">
        <path d="M-8,18 L-8,4"/><path d="M8,18 L8,4"/><path d="M-4,18 L-4,6"/><path d="M4,18 L4,6"/>
      </g>
      <ellipse cx="0" cy="0" rx="15" ry="10" fill="#c9986a"/>
      <ellipse cx="-4" cy="4" rx="2.6" ry="2" fill="#fff6e8"/><ellipse cx="6" cy="-2" rx="2.4" ry="1.8" fill="#fff6e8"/>
      <path d="M-14,-4 Q-22,-14 -16,-18" stroke="#a9743f" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="-19" cy="-19" rx="6" ry="5" fill="#c9986a"/>
      <ellipse cx="-24" cy="-24" rx="1.6" ry="3" fill="#c9986a"/><ellipse cx="-15" cy="-25" rx="1.6" ry="3" fill="#c9986a"/>
      <circle cx="-21" cy="-19" r="1" fill="#2e2350"/>
    </g>

    <!-- ===== 숲 디테일: 연못·들꽃·버섯·나비·떨어지는 낙엽 ===== -->
    <g transform="translate(292,344)">
      <ellipse cx="0" cy="3" rx="74" ry="17" fill="#4f8f5c" opacity=".55"/>
      <ellipse cx="0" cy="0" rx="64" ry="12.5" fill="#6ec6e8"/>
      <ellipse cx="-20" cy="-3" rx="22" ry="3" fill="#fff" opacity=".55"/><ellipse cx="22" cy="3" rx="14" ry="2.2" fill="#fff" opacity=".35"/>
      <ellipse cx="22" cy="1" rx="10" ry="4.4" fill="#3f9f55"/><circle cx="25" cy="-1" r="3" fill="#ff8fb3"/>
      <ellipse cx="-34" cy="3" rx="8" ry="3.6" fill="#4aa860"/>
      <ellipse class="ripple" style="animation:rippleOut 3.4s ease-out infinite;" cx="-6" cy="1" rx="14" ry="3.5" fill="none" stroke="#fff" stroke-width="1.6"/>
      <ellipse class="ripple" style="animation:rippleOut 3.4s ease-out infinite; animation-delay:-1.7s;" cx="30" cy="4" rx="14" ry="3.5" fill="none" stroke="#fff" stroke-width="1.6"/>
      <g stroke="#2f8a4a" stroke-width="2.4" stroke-linecap="round"><path d="M64,2 Q62,-16 66,-26"/><path d="M69,3 Q72,-12 70,-22"/><path d="M-66,3 Q-70,-12 -66,-22"/></g>
      <ellipse cx="66" cy="-27" rx="2.6" ry="6" fill="#7a5230"/><ellipse cx="-66" cy="-23" rx="2.6" ry="6" fill="#7a5230"/>
    </g>
    <g><path d="M58,366 L58,354.3" stroke="#2f8a4a" stroke-width="2.3" stroke-linecap="round"/><circle cx="63.5" cy="354.3" r="4.3" fill="#ff7a9c"/><circle cx="59.7" cy="359.5" r="4.3" fill="#ff7a9c"/><circle cx="53.6" cy="357.5" r="4.3" fill="#ff7a9c"/><circle cx="53.6" cy="351.1" r="4.3" fill="#ff7a9c"/><circle cx="59.7" cy="349.1" r="4.3" fill="#ff7a9c"/><circle cx="58" cy="354.3" r="3.0" fill="#ffe15a"/></g><g><path d="M76,372 L76,362.1" stroke="#2f8a4a" stroke-width="2.0" stroke-linecap="round"/><circle cx="80.6" cy="362.1" r="3.6" fill="#ffd54f"/><circle cx="77.4" cy="366.5" r="3.6" fill="#ffd54f"/><circle cx="72.3" cy="364.8" r="3.6" fill="#ffd54f"/><circle cx="72.3" cy="359.4" r="3.6" fill="#ffd54f"/><circle cx="77.4" cy="357.7" r="3.6" fill="#ffd54f"/><circle cx="76" cy="362.1" r="2.5" fill="#ffe15a"/></g><g><path d="M204,384 L204,372.3" stroke="#2f8a4a" stroke-width="2.3" stroke-linecap="round"/><circle cx="209.5" cy="372.3" r="4.3" fill="#c99bff"/><circle cx="205.7" cy="377.5" r="4.3" fill="#c99bff"/><circle cx="199.6" cy="375.5" r="4.3" fill="#c99bff"/><circle cx="199.6" cy="369.1" r="4.3" fill="#c99bff"/><circle cx="205.7" cy="367.1" r="4.3" fill="#c99bff"/><circle cx="204" cy="372.3" r="3.0" fill="#ffe15a"/></g><g><path d="M222,378 L222,369.0" stroke="#2f8a4a" stroke-width="1.8" stroke-linecap="round"/><circle cx="226.2" cy="369.0" r="3.3" fill="#ff7a9c"/><circle cx="223.3" cy="373.0" r="3.3" fill="#ff7a9c"/><circle cx="218.6" cy="371.5" r="3.3" fill="#ff7a9c"/><circle cx="218.6" cy="366.5" r="3.3" fill="#ff7a9c"/><circle cx="223.3" cy="365.0" r="3.3" fill="#ff7a9c"/><circle cx="222" cy="369.0" r="2.3" fill="#ffe15a"/></g>
    <g><path d="M520,372 L520,361.2" stroke="#2f8a4a" stroke-width="2.2" stroke-linecap="round"/><circle cx="525.0" cy="361.2" r="4.0" fill="#ffffff"/><circle cx="521.6" cy="366.0" r="4.0" fill="#ffffff"/><circle cx="515.9" cy="364.2" r="4.0" fill="#ffffff"/><circle cx="515.9" cy="358.2" r="4.0" fill="#ffffff"/><circle cx="521.6" cy="356.4" r="4.0" fill="#ffffff"/><circle cx="520" cy="361.2" r="2.8" fill="#ffe15a"/></g><g><path d="M538,380 L538,370.1" stroke="#2f8a4a" stroke-width="2.0" stroke-linecap="round"/><circle cx="542.6" cy="370.1" r="3.6" fill="#ffb347"/><circle cx="539.4" cy="374.5" r="3.6" fill="#ffb347"/><circle cx="534.3" cy="372.8" r="3.6" fill="#ffb347"/><circle cx="534.3" cy="367.4" r="3.6" fill="#ffb347"/><circle cx="539.4" cy="365.7" r="3.6" fill="#ffb347"/><circle cx="538" cy="370.1" r="2.5" fill="#ffe15a"/></g><g><path d="M690,370 L690,358.3" stroke="#2f8a4a" stroke-width="2.3" stroke-linecap="round"/><circle cx="695.5" cy="358.3" r="4.3" fill="#ff7a9c"/><circle cx="691.7" cy="363.5" r="4.3" fill="#ff7a9c"/><circle cx="685.6" cy="361.5" r="4.3" fill="#ff7a9c"/><circle cx="685.6" cy="355.1" r="4.3" fill="#ff7a9c"/><circle cx="691.7" cy="353.1" r="4.3" fill="#ff7a9c"/><circle cx="690" cy="358.3" r="3.0" fill="#ffe15a"/></g><g><path d="M708,378 L708,368.1" stroke="#2f8a4a" stroke-width="2.0" stroke-linecap="round"/><circle cx="712.6" cy="368.1" r="3.6" fill="#c99bff"/><circle cx="709.4" cy="372.5" r="3.6" fill="#c99bff"/><circle cx="704.3" cy="370.8" r="3.6" fill="#c99bff"/><circle cx="704.3" cy="365.4" r="3.6" fill="#c99bff"/><circle cx="709.4" cy="363.7" r="3.6" fill="#c99bff"/><circle cx="708" cy="368.1" r="2.5" fill="#ffe15a"/></g><g><path d="M756,344 L756,333.2" stroke="#2f8a4a" stroke-width="2.2" stroke-linecap="round"/><circle cx="761.0" cy="333.2" r="4.0" fill="#ffd54f"/><circle cx="757.6" cy="338.0" r="4.0" fill="#ffd54f"/><circle cx="751.9" cy="336.2" r="4.0" fill="#ffd54f"/><circle cx="751.9" cy="330.2" r="4.0" fill="#ffd54f"/><circle cx="757.6" cy="328.4" r="4.0" fill="#ffd54f"/><circle cx="756" cy="333.2" r="2.8" fill="#ffe15a"/></g>
    <g><path d="M392,392 L392,381.2" stroke="#2f8a4a" stroke-width="2.2" stroke-linecap="round"/><circle cx="397.0" cy="381.2" r="4.0" fill="#ff8fb3"/><circle cx="393.6" cy="386.0" r="4.0" fill="#ff8fb3"/><circle cx="387.9" cy="384.2" r="4.0" fill="#ff8fb3"/><circle cx="387.9" cy="378.2" r="4.0" fill="#ff8fb3"/><circle cx="393.6" cy="376.4" r="4.0" fill="#ff8fb3"/><circle cx="392" cy="381.2" r="2.8" fill="#ffe15a"/></g><g><path d="M150,330 L150,321.0" stroke="#2f8a4a" stroke-width="1.8" stroke-linecap="round"/><circle cx="154.2" cy="321.0" r="3.3" fill="#ffffff"/><circle cx="151.3" cy="325.0" r="3.3" fill="#ffffff"/><circle cx="146.6" cy="323.5" r="3.3" fill="#ffffff"/><circle cx="146.6" cy="318.5" r="3.3" fill="#ffffff"/><circle cx="151.3" cy="317.0" r="3.3" fill="#ffffff"/><circle cx="150" cy="321.0" r="2.3" fill="#ffe15a"/></g><g><path d="M630,338 L630,329.0" stroke="#2f8a4a" stroke-width="1.8" stroke-linecap="round"/><circle cx="634.2" cy="329.0" r="3.3" fill="#ffd54f"/><circle cx="631.3" cy="333.0" r="3.3" fill="#ffd54f"/><circle cx="626.6" cy="331.5" r="3.3" fill="#ffd54f"/><circle cx="626.6" cy="326.5" r="3.3" fill="#ffd54f"/><circle cx="631.3" cy="325.0" r="3.3" fill="#ffd54f"/><circle cx="630" cy="329.0" r="2.3" fill="#ffe15a"/></g>
    <g transform="translate(244,352) scale(1.2)"><rect x="-3" y="-8" width="6" height="9" rx="2.5" fill="#f6ecd8"/><path d="M-11,-7 Q0,-22 11,-7 Z" fill="#e8493f"/><circle cx="-4" cy="-12" r="1.8" fill="#fff"/><circle cx="3" cy="-14" r="1.5" fill="#fff"/><circle cx="6" cy="-10" r="1.3" fill="#fff"/></g><g transform="translate(262,356) scale(0.8)"><rect x="-3" y="-8" width="6" height="9" rx="2.5" fill="#f6ecd8"/><path d="M-11,-7 Q0,-22 11,-7 Z" fill="#f0a53d"/><circle cx="-4" cy="-12" r="1.8" fill="#fff"/><circle cx="3" cy="-14" r="1.5" fill="#fff"/><circle cx="6" cy="-10" r="1.3" fill="#fff"/></g><g transform="translate(660,336) scale(1.1)"><rect x="-3" y="-8" width="6" height="9" rx="2.5" fill="#f6ecd8"/><path d="M-11,-7 Q0,-22 11,-7 Z" fill="#e8493f"/><circle cx="-4" cy="-12" r="1.8" fill="#fff"/><circle cx="3" cy="-14" r="1.5" fill="#fff"/><circle cx="6" cy="-10" r="1.3" fill="#fff"/></g><g transform="translate(742,368) scale(0.9)"><rect x="-3" y="-8" width="6" height="9" rx="2.5" fill="#f6ecd8"/><path d="M-11,-7 Q0,-22 11,-7 Z" fill="#c99bff"/><circle cx="-4" cy="-12" r="1.8" fill="#fff"/><circle cx="3" cy="-14" r="1.5" fill="#fff"/><circle cx="6" cy="-10" r="1.3" fill="#fff"/></g>
    <!-- 오두막 느낌의 표지판 -->
    <g transform="translate(40,328)"><rect x="-2" y="-2" width="5" height="30" rx="1.5" fill="#8a5a32"/><path d="M-22,-16 L24,-16 L30,-8 L24,0 L-22,0 Z" fill="#d6a45f"/><circle cx="-12" cy="-8" r="1.4" fill="#8a5a32"/><path d="M-4,-8 L16,-8" stroke="#8a5a32" stroke-width="2" stroke-linecap="round"/></g>
    <g transform="translate(0,176)"><g style="animation:flyAcrossR 26s linear infinite; animation-delay:-4s;"><g class="flutter" style="animation:flutterWings .32s ease-in-out infinite;"><ellipse cx="-4" cy="-2" rx="5.5" ry="4.2" fill="#ff8fb3"/><ellipse cx="4" cy="-2" rx="5.5" ry="4.2" fill="#ff8fb3"/><ellipse cx="-3" cy="3" rx="4" ry="3" fill="#ffd54f"/><ellipse cx="3" cy="3" rx="4" ry="3" fill="#ffd54f"/><rect x="-0.9" y="-5" width="1.8" height="11" rx="0.9" fill="#4a3a2a"/></g></g></g><g transform="translate(0,214)"><g style="animation:flyAcrossL 32s linear infinite; animation-delay:-15s;"><g class="flutter" style="animation:flutterWings .32s ease-in-out infinite;"><ellipse cx="-4" cy="-2" rx="5.5" ry="4.2" fill="#7fb8ff"/><ellipse cx="4" cy="-2" rx="5.5" ry="4.2" fill="#7fb8ff"/><ellipse cx="-3" cy="3" rx="4" ry="3" fill="#ffffff"/><ellipse cx="3" cy="3" rx="4" ry="3" fill="#ffffff"/><rect x="-0.9" y="-5" width="1.8" height="11" rx="0.9" fill="#4a3a2a"/></g></g></g><g transform="translate(0,150)"><g style="animation:flyAcrossR 38s linear infinite; animation-delay:-22s;"><g class="flutter" style="animation:flutterWings .32s ease-in-out infinite;"><ellipse cx="-4" cy="-2" rx="5.5" ry="4.2" fill="#ffb347"/><ellipse cx="4" cy="-2" rx="5.5" ry="4.2" fill="#ffb347"/><ellipse cx="-3" cy="3" rx="4" ry="3" fill="#ff7a9c"/><ellipse cx="3" cy="3" rx="4" ry="3" fill="#ff7a9c"/><rect x="-0.9" y="-5" width="1.8" height="11" rx="0.9" fill="#4a3a2a"/></g></g></g>
    <g transform="translate(120,-20)"><g class="leaf" style="animation:fallLeaf 11s linear infinite; animation-delay:-3s;"><path d="M0,0 q6,-8 12,0 q-6,8 -12,0 z" fill="#e0a53d"/><path d="M0,0 L12,0" stroke="#fff" stroke-width=".8" opacity=".5"/></g></g><g transform="translate(330,-20)"><g class="leaf" style="animation:fallLeaf 14s linear infinite; animation-delay:-8s;"><path d="M0,0 q6,-8 12,0 q-6,8 -12,0 z" fill="#d9633f"/><path d="M0,0 L12,0" stroke="#fff" stroke-width=".8" opacity=".5"/></g></g><g transform="translate(560,-20)"><g class="leaf" style="animation:fallLeaf 12s linear infinite; animation-delay:-1s;"><path d="M0,0 q6,-8 12,0 q-6,8 -12,0 z" fill="#e0a53d"/><path d="M0,0 L12,0" stroke="#fff" stroke-width=".8" opacity=".5"/></g></g><g transform="translate(700,-20)"><g class="leaf" style="animation:fallLeaf 16s linear infinite; animation-delay:-11s;"><path d="M0,0 q6,-8 12,0 q-6,8 -12,0 z" fill="#c8452e"/><path d="M0,0 L12,0" stroke="#fff" stroke-width=".8" opacity=".5"/></g></g><g transform="translate(440,-20)"><g class="leaf" style="animation:fallLeaf 13s linear infinite; animation-delay:-6s;"><path d="M0,0 q6,-8 12,0 q-6,8 -12,0 z" fill="#f0c24a"/><path d="M0,0 L12,0" stroke="#fff" stroke-width=".8" opacity=".5"/></g></g>
  </svg>`,
  ocean: `<svg viewBox="0 0 800 440" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="skyO" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#dff5ff"/><stop offset="35%" stop-color="#7fd0e6"/><stop offset="70%" stop-color="#2fb8cf"/><stop offset="100%" stop-color="#0f4f63"/>
      </linearGradient>
      <linearGradient id="floorO" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e7d3a0"/><stop offset="100%" stop-color="#c7a866"/>
      </linearGradient>
      <symbol id="coral" viewBox="0 0 60 70">
        <path d="M30,70 L30,44" stroke="#e0517a" stroke-width="10" stroke-linecap="round"/>
        <path d="M30,50 Q10,40 6,18" stroke="#ff7a9c" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M30,50 Q50,40 54,18" stroke="#ff7a9c" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M30,44 Q30,20 30,4" stroke="#ffa2b8" stroke-width="8" stroke-linecap="round" fill="none"/>
      </symbol>
    </defs>
    <rect x="0" y="0" width="800" height="440" fill="url(#skyO)"/>
    <g fill="#fff" opacity=".18">
      <polygon points="120,0 200,0 90,440 40,440"/><polygon points="520,0 610,0 470,440 400,440"/>
    </g>
    <g fill="#fff" opacity=".45">
      <circle class="bubble" style="animation:riseBubble 9s linear infinite;" cx="120" cy="380" r="7"/>
      <circle class="bubble" style="animation:riseBubble 12s linear infinite; animation-delay:-4s;" cx="300" cy="400" r="5"/>
      <circle class="bubble" style="animation:riseBubble 10s linear infinite; animation-delay:-7s;" cx="560" cy="390" r="9"/>
      <circle class="bubble" style="animation:riseBubble 14s linear infinite; animation-delay:-2s;" cx="690" cy="410" r="6"/>
      <circle class="bubble" style="animation:riseBubble 11s linear infinite; animation-delay:-9s;" cx="420" cy="405" r="5"/>
    </g>
    <g transform="translate(0,120)"><g style="animation:swimAcrossR 15s linear infinite;"><g class="fish" style="animation:swimFish 1.5s ease-in-out infinite;">
      <ellipse cx="0" cy="0" rx="17" ry="9" fill="#ffb85e"/><polygon points="-17,-6 -29,0 -17,6" fill="#ffb85e"/><circle cx="8" cy="-2" r="1.8" fill="#2e2350"/>
    </g></g></g>
    <g transform="translate(0,168)"><g style="animation:swimAcrossL 18s linear infinite; animation-delay:-3s;"><g class="fish" style="animation:swimFish 1.7s ease-in-out infinite; animation-delay:-.4s;">
      <ellipse cx="0" cy="0" rx="13" ry="7" fill="#ff8fa3"/><polygon points="13,-5 24,0 13,5" fill="#ff8fa3"/><circle cx="-6" cy="-2" r="1.5" fill="#2e2350"/>
    </g></g></g>
    <g transform="translate(0,208)"><g style="animation:swimAcrossR 21s linear infinite; animation-delay:-8s;"><g class="fish" style="animation:swimFish 1.9s ease-in-out infinite; animation-delay:-.9s;">
      <ellipse cx="0" cy="0" rx="10" ry="6" fill="#a855f7"/><polygon points="-10,-4 -18,0 -10,4" fill="#a855f7"/><circle cx="5" cy="-1.5" r="1.3" fill="#2e2350"/>
    </g></g></g>
    <g transform="translate(0,148)"><g style="animation:swimAcrossL 17s linear infinite; animation-delay:-11s;"><g class="fish" style="animation:swimFish 1.4s ease-in-out infinite; animation-delay:-1.2s;">
      <ellipse cx="0" cy="0" rx="15" ry="8" fill="#3ec6e0"/><polygon points="15,-6 26,0 15,6" fill="#3ec6e0"/><circle cx="-7" cy="-2" r="1.6" fill="#2e2350"/>
    </g></g></g>
    <g transform="translate(0,244)"><g style="animation:swimAcrossR 24s linear infinite; animation-delay:-5s;"><g class="fish" style="animation:swimFish 1.6s ease-in-out infinite; animation-delay:-.6s;">
      <ellipse cx="0" cy="0" rx="9" ry="5" fill="#ffe15a"/><polygon points="-9,-3.5 -16,0 -9,3.5" fill="#ffe15a"/><circle cx="4.5" cy="-1.2" r="1.1" fill="#2e2350"/>
    </g></g></g>
    <g transform="translate(0,192)"><g style="animation:swimAcrossL 20s linear infinite; animation-delay:-14s;"><g class="fish" style="animation:swimFish 1.8s ease-in-out infinite; animation-delay:-1.5s;">
      <ellipse cx="0" cy="0" rx="12" ry="6.5" fill="#00c896"/><polygon points="12,-5 22,0 12,5" fill="#00c896"/><circle cx="-6" cy="-1.8" r="1.4" fill="#2e2350"/>
    </g></g></g>
    <path d="M0,280 Q200,260 400,278 T800,272 L800,320 L0,320 Z" fill="#1f8a95" opacity=".45"/>
    <rect x="0" y="292" width="800" height="148" fill="url(#floorO)"/>
    <g fill="#b8975a" opacity=".7"><ellipse cx="90" cy="320" rx="34" ry="12"/><ellipse cx="700" cy="326" rx="40" ry="13"/></g>
    <use href="#coral" x="40" y="252" width="56" height="66"/>
    <use href="#coral" x="700" y="248" width="60" height="70"/>
    <g fill="#ffce54" opacity=".9"><path d="M150,300 Q158,270 166,300 Z"/><path d="M614,300 Q624,264 634,300 Z"/></g>
    <g stroke="#1f8a5a" stroke-width="8" fill="none" stroke-linecap="round">
      <path class="weed" style="animation:swayWeed 4s ease-in-out infinite;" d="M400,300 Q410,260 400,220"/>
      <path class="weed" style="animation:swayWeed 4.6s ease-in-out infinite; animation-delay:-1s;" d="M430,300 Q440,250 428,205"/>
      <path class="weed" style="animation:swayWeed 3.6s ease-in-out infinite; animation-delay:-2s;" d="M370,300 Q364,255 375,215"/>
      <path class="weed" style="animation:swayWeed 4.2s ease-in-out infinite; animation-delay:-1.6s;" d="M240,300 Q250,262 238,222"/>
      <path class="weed" style="animation:swayWeed 3.9s ease-in-out infinite; animation-delay:-.8s;" d="M582,300 Q592,260 580,220"/>
    </g>

    <!-- ===== 바다 디테일: 난파선·보물상자·바다거북·해파리·해마·불가사리·먼 곳의 고래 ===== -->
    <g transform="translate(0,84)"><g style="animation:swimAcrossR 70s linear infinite; animation-delay:-18s;" opacity=".28">
      <ellipse cx="0" cy="0" rx="62" ry="22" fill="#0f4f63"/><path d="M-58,-4 Q-92,-26 -86,-34 Q-70,-18 -52,-12 Z" fill="#0f4f63"/><circle cx="40" cy="-6" r="2.4" fill="#cfeeff"/>
      <path d="M10,-20 q2,-14 8,-18 M10,-20 q-6,-12 -4,-20" stroke="#9fe3f5" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g></g>
    <g transform="translate(26,318) rotate(-9)">
      <path d="M0,28 L128,26 L108,74 L22,76 Z" fill="#7a4a2e"/><path d="M0,28 L128,26" stroke="#5e3920" stroke-width="5"/><path d="M26,44 L112,42 M30,58 L106,56" stroke="#5e3920" stroke-width="2.4" opacity=".7"/>
      <circle cx="40" cy="52" r="7" fill="#2fb8cf" stroke="#5e3920" stroke-width="2.5"/><circle cx="68" cy="52" r="7" fill="#2fb8cf" stroke="#5e3920" stroke-width="2.5"/><circle cx="96" cy="50" r="7" fill="#2fb8cf" stroke="#5e3920" stroke-width="2.5"/>
      <rect x="58" y="-52" width="7" height="82" rx="2" fill="#6b4226"/><path d="M65,-48 L104,-20 L65,-6 Z" fill="#e8dcc2" opacity=".85"/><path d="M58,-40 L26,-14 L58,-4 Z" fill="#e8dcc2" opacity=".75"/>
      <path d="M20,76 q-6,-14 2,-22 M118,70 q8,-12 0,-22" stroke="#2f8a5a" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
    <g transform="translate(664,392)">
      <ellipse cx="0" cy="14" rx="40" ry="8" fill="#a98a52" opacity=".6"/>
      <rect x="-30" y="-6" width="60" height="22" rx="4" fill="#8a5a32" stroke="#5e3920" stroke-width="2"/><path d="M-30,-6 Q0,-34 30,-6 Z" fill="#a8703c" stroke="#5e3920" stroke-width="2" transform="translate(0,-6) rotate(-14 -30 0)"/>
      <rect x="-5" y="2" width="10" height="9" rx="2" fill="#ffd54f" stroke="#5e3920" stroke-width="1.5"/>
      <circle cx="-14" cy="-8" r="5" fill="#ffd54f"/><circle cx="-4" cy="-11" r="5" fill="#ffe15a"/><circle cx="8" cy="-9" r="5" fill="#ffd54f"/><circle cx="18" cy="-6" r="4.4" fill="#ffe15a"/>
      <g class="firefly" style="animation:twinkleFly 2.2s ease-in-out infinite;"><path d="M-2,-24 l2,-7 l2,7 l7,2 l-7,2 l-2,7 l-2,-7 l-7,-2 z" fill="#fff6b0"/></g>
    </g>
    <g transform="translate(332,398) rotate(-14)"><polygon points="0,-16 4.5,-5 16,-5 7,2 10.5,14 0,7 -10.5,14 -7,2 -16,-5 -4.5,-5" fill="#ff9a4d" stroke="#e0713a" stroke-width="1.5" stroke-linejoin="round"/><circle cx="0" cy="-4" r="1.4" fill="#fff3c9"/><circle cx="-5" cy="2" r="1.1" fill="#fff3c9"/><circle cx="5" cy="2" r="1.1" fill="#fff3c9"/></g>
    <g transform="translate(236,404)"><circle r="9" fill="#7a4a8c"/><g stroke="#7a4a8c" stroke-width="2" stroke-linecap="round"><path d="M0,-9 L0,-16 M7,-6 L12,-12 M-7,-6 L-12,-12 M9,0 L16,0 M-9,0 L-16,0"/></g></g>
    <g transform="translate(404,408)"><path d="M-12,4 Q-12,-10 0,-12 Q12,-10 12,4 Z" fill="#ffd8b8" stroke="#e0a07a" stroke-width="1.6"/><path d="M0,-12 L0,4 M-6,-10 L-6,4 M6,-10 L6,4" stroke="#e0a07a" stroke-width="1.2"/></g>
    <g transform="translate(528,330)"><g class="critter" style="animation:idleBob 2.4s ease-in-out infinite;">
      <path d="M0,30 Q-14,22 -8,10 Q2,2 -2,-10 Q-4,-20 6,-24" stroke="#ff9a4d" stroke-width="9" fill="none" stroke-linecap="round"/>
      <ellipse cx="10" cy="-26" rx="8" ry="6" fill="#ff9a4d"/><path d="M16,-26 L28,-24" stroke="#ff9a4d" stroke-width="4" stroke-linecap="round"/><circle cx="11" cy="-28" r="1.6" fill="#2e2350"/>
      <path d="M-4,-8 q-10,-2 -8,6" stroke="#ffd0a0" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g></g>
    <g transform="translate(0,232)"><g style="animation:swimAcrossL 36s linear infinite; animation-delay:-9s;"><g class="fish" style="animation:swimFish 2.2s ease-in-out infinite;">
      <ellipse cx="0" cy="0" rx="22" ry="15" fill="#4aa860"/><ellipse cx="-2" cy="1" rx="13" ry="9" fill="#7fd08a" opacity=".7"/>
      <path d="M-8,-12 l6,-6 l4,8 M-6,12 l-6,8 l8,2" fill="#3a8a4e"/><ellipse cx="-24" cy="2" rx="9" ry="6" fill="#4aa860"/><circle cx="-29" cy="0" r="1.5" fill="#2e2350"/>
      <path d="M-12,-3 l7,-1 M-12,3 l7,1 M-2,-7 l5,3 M0,7 l5,-3" stroke="#2f7040" stroke-width="1.4" stroke-linecap="round"/>
    </g></g></g>
    <g transform="translate(150,150) scale(1.0)"><g class="jelly" style="animation:jellyBob 5.5s ease-in-out infinite; animation-delay:-1s;"><path d="M-20,8 Q-20,-20 0,-20 Q20,-20 20,8 Q10,4 0,8 Q-10,4 -20,8 Z" fill="#ff9ac8" opacity=".8"/><ellipse cx="-6" cy="-10" rx="7" ry="3.5" fill="#fff" opacity=".45"/><path d="M-14,8 q-4,10 0,18 q4,8 0,16" stroke="#ff9ac8" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M-7,8 q-4,10 0,18 q4,8 0,16" stroke="#ff9ac8" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M0,8 q-4,10 0,18 q4,8 0,16" stroke="#ff9ac8" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M7,8 q-4,10 0,18 q4,8 0,16" stroke="#ff9ac8" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M14,8 q-4,10 0,18 q4,8 0,16" stroke="#ff9ac8" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/></g></g><g transform="translate(610,120) scale(1.2)"><g class="jelly" style="animation:jellyBob 6.8s ease-in-out infinite; animation-delay:-3s;"><path d="M-20,8 Q-20,-20 0,-20 Q20,-20 20,8 Q10,4 0,8 Q-10,4 -20,8 Z" fill="#c99bff" opacity=".8"/><ellipse cx="-6" cy="-10" rx="7" ry="3.5" fill="#fff" opacity=".45"/><path d="M-14,8 q-4,10 0,18 q4,8 0,16" stroke="#c99bff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M-7,8 q-4,10 0,18 q4,8 0,16" stroke="#c99bff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M0,8 q-4,10 0,18 q4,8 0,16" stroke="#c99bff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M7,8 q-4,10 0,18 q4,8 0,16" stroke="#c99bff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M14,8 q-4,10 0,18 q4,8 0,16" stroke="#c99bff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/></g></g><g transform="translate(430,205) scale(0.8)"><g class="jelly" style="animation:jellyBob 5.9s ease-in-out infinite; animation-delay:-2s;"><path d="M-20,8 Q-20,-20 0,-20 Q20,-20 20,8 Q10,4 0,8 Q-10,4 -20,8 Z" fill="#9fe8ff" opacity=".8"/><ellipse cx="-6" cy="-10" rx="7" ry="3.5" fill="#fff" opacity=".45"/><path d="M-14,8 q-4,10 0,18 q4,8 0,16" stroke="#9fe8ff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M-7,8 q-4,10 0,18 q4,8 0,16" stroke="#9fe8ff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M0,8 q-4,10 0,18 q4,8 0,16" stroke="#9fe8ff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M7,8 q-4,10 0,18 q4,8 0,16" stroke="#9fe8ff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M14,8 q-4,10 0,18 q4,8 0,16" stroke="#9fe8ff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/></g></g>
    <g class="firefly" style="animation:twinkleFly 3s ease-in-out infinite;"><circle cx="60" cy="236" r="2.4" fill="#fff"/></g>
    <g class="firefly" style="animation:twinkleFly 2.6s ease-in-out infinite; animation-delay:-1.2s;"><circle cx="730" cy="266" r="2.4" fill="#fff"/></g>
    <g fill="#ff7a9c"><ellipse cx="716" cy="338" rx="10" ry="16" transform="rotate(10 716 338)" opacity=".95"/><ellipse cx="736" cy="336" rx="9" ry="17" transform="rotate(-8 736 336)" fill="#ffa2b8"/></g>
  </svg>`,
  desert: `<svg viewBox="0 0 800 440" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="skyD" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe9b8"/><stop offset="70%" stop-color="#ffdca0"/><stop offset="100%" stop-color="#fff3d6"/>
      </linearGradient>
      <radialGradient id="sunD" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff8de" stop-opacity="1"/><stop offset="60%" stop-color="#ffdd8a" stop-opacity=".7"/><stop offset="100%" stop-color="#ffdd8a" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="groundD" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f0c982"/><stop offset="45%" stop-color="#e0ad63"/><stop offset="100%" stop-color="#a9713a"/>
      </linearGradient>
      <symbol id="cactus" viewBox="0 0 60 100">
        <ellipse cx="30" cy="97" rx="18" ry="5" fill="#7a4a26" opacity=".3"/>
        <rect x="22" y="26" width="16" height="72" rx="8" fill="#3d8f52"/>
        <path d="M22,52 q-16,0 -16,-18 q0,-8 8,-8 q8,0 8,8 z" fill="#3d8f52"/>
        <path d="M38,40 q16,0 16,-16 q0,-8 -8,-8 q-8,0 -8,8 z" fill="#4aa860"/>
        <g stroke="#2c7440" stroke-width="2" opacity=".6">
          <path d="M27,32 L27,94"/><path d="M33,32 L33,94"/>
        </g>
      </symbol>
    </defs>
    <rect x="0" y="0" width="800" height="440" fill="url(#skyD)"/>
    <circle cx="126" cy="78" r="56" fill="url(#sunD)"/>
    <circle cx="126" cy="78" r="30" fill="#fff1c4"/>
    <path d="M0,230 L80,230 L150,190 L230,230 L330,230 L400,196 L470,230 L620,230 L690,198 L760,230 L800,230 L800,270 L0,270 Z" fill="#e3ab6c" opacity=".55"/>
    <path d="M0,258 Q150,220 300,253 T600,248 T800,238 L800,300 L0,300 Z" fill="#e0ad63" opacity=".85"/>
    <rect x="0" y="270" width="800" height="170" fill="url(#groundD)"/>
    <g stroke="#c9924f" stroke-width="3" fill="none" opacity=".55">
      <path d="M0,320 Q200,308 400,322 T800,314"/>
      <path d="M0,360 Q220,348 440,362 T800,352"/>
    </g>
    <use href="#cactus" x="94" y="196" width="52" height="98"/>
    <use href="#cactus" x="636" y="204" width="48" height="92"/>
    <g fill="#c88a4a" opacity=".85"><ellipse cx="250" cy="304" rx="28" ry="12"/><ellipse cx="560" cy="308" rx="36" ry="14"/></g>
    <g fill="#b97a2a" opacity=".7"><ellipse cx="60" cy="316" rx="18" ry="8"/><ellipse cx="740" cy="320" rx="20" ry="9"/></g>
    <g transform="translate(430,300)"><g style="animation:swayWeed 2.6s ease-in-out infinite;">
      <ellipse cx="0" cy="0" rx="15" ry="5.5" fill="#6fae5a"/><circle cx="13" cy="-1.5" r="4.5" fill="#6fae5a"/>
      <path d="M-15,0 Q-25,-5 -32,1" stroke="#6fae5a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="15" cy="-3" r="0.9" fill="#2e2350"/>
    </g></g>
    <g transform="translate(0,64)"><g style="animation:flyAcrossR 20s linear infinite; animation-delay:-4s;">
      <path class="bird" style="animation:wingFlap .5s ease-in-out infinite;" d="M-10,0 Q-4,-6 0,0 Q4,-6 10,0" stroke="#8a5a32" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </g></g>
    <g transform="translate(0,318)"><g class="tumbleweed" style="animation:rollTumbleweed 8s linear infinite;">
      <circle cx="0" cy="0" r="11" fill="none" stroke="#8a6a3a" stroke-width="2.4"/>
      <path d="M-9,-5 L9,5 M-9,5 L9,-5 M-11,0 L11,0" stroke="#8a6a3a" stroke-width="1.8"/>
    </g></g>

    <!-- ===== 사막 디테일: 피라미드·오아시스·낙타·열기구·꽃 핀 선인장·모래바람 ===== -->
    <g opacity=".95">
      <polygon points="496,272 584,196 672,272" fill="#e9c27e"/><polygon points="584,196 672,272 584,272" fill="#c99a52"/>
      <polygon points="652,272 700,228 748,272" fill="#e3b86e"/><polygon points="700,228 748,272 700,272" fill="#bf8f48"/>
      <path d="M560,236 L610,236 M540,252 L640,252" stroke="#b98a46" stroke-width="1.6" opacity=".55"/>
    </g>
    <g transform="translate(0,96)"><g style="animation:flyAcrossR 70s linear infinite; animation-delay:-30s;"><g class="critter" style="animation:idleBob 3.4s ease-in-out infinite;">
      <path d="M-14,16 L-12,30 L12,30 L14,16 Z" fill="#8a5a32" opacity=".9"/>
      <ellipse cx="0" cy="0" rx="16" ry="19" fill="#ff7a9c"/><path d="M-16,0 q16,-6 32,0" stroke="#fff" stroke-width="3" fill="none"/><path d="M-15,8 q15,-6 30,0" stroke="#ffd54f" stroke-width="3" fill="none"/><path d="M-12,-8 q12,-6 24,0" stroke="#4a7bf7" stroke-width="3" fill="none"/>
      <rect x="-9" y="18" width="18" height="9" rx="2" fill="#a8703c"/><path d="M-9,18 L-6,16 M9,18 L6,16" stroke="#6b4226" stroke-width="1.4"/>
    </g></g></g>
    <g>
      <ellipse cx="400" cy="320" rx="82" ry="17" fill="#a9843f" opacity=".5"/><ellipse cx="400" cy="318" rx="72" ry="13" fill="#3fc6d2"/>
      <ellipse cx="380" cy="315" rx="22" ry="3" fill="#fff" opacity=".5"/><ellipse class="ripple" style="animation:rippleOut 3.6s ease-out infinite;" cx="420" cy="320" rx="14" ry="3.5" fill="none" stroke="#fff" stroke-width="1.6"/>
    </g>
    <g transform="translate(334,314) scale(1.0,1.0)"><path d="M0,0 Q-8,-32 3,-62" stroke="#8a5a32" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-3,-14 l6,-1 M-5,-28 l7,-1 M-3,-42 l6,-1" stroke="#6b4226" stroke-width="1.6"/><g transform="translate(3,0)"><ellipse cx="-16.4" cy="-64.3" rx="22" ry="5.6" transform="rotate(-165 -16.4 -64.3)" fill="#3f9f55"/><ellipse cx="-10.9" cy="-68.9" rx="22" ry="5.6" transform="rotate(-130 -10.9 -68.9)" fill="#4aa860"/><ellipse cx="10.9" cy="-68.9" rx="22" ry="5.6" transform="rotate(-50 10.9 -68.9)" fill="#4aa860"/><ellipse cx="16.4" cy="-64.3" rx="22" ry="5.6" transform="rotate(-15 16.4 -64.3)" fill="#3f9f55"/><ellipse cx="16.0" cy="-58.9" rx="22" ry="5.6" transform="rotate(20 16.0 -58.9)" fill="#3a8a4e"/><ellipse cx="-16.0" cy="-58.9" rx="22" ry="5.6" transform="rotate(160 -16.0 -58.9)" fill="#3a8a4e"/><ellipse cx="0.0" cy="-71.0" rx="22" ry="5.6" transform="rotate(-90 0.0 -71.0)" fill="#5fbf76"/><circle cx="-3" cy="-58" r="3.3" fill="#7a4a2e"/><circle cx="4" cy="-57" r="3.3" fill="#7a4a2e"/></g></g><g transform="translate(470,312) scale(-0.9,0.9)"><path d="M0,0 Q-8,-32 3,-62" stroke="#8a5a32" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-3,-14 l6,-1 M-5,-28 l7,-1 M-3,-42 l6,-1" stroke="#6b4226" stroke-width="1.6"/><g transform="translate(3,0)"><ellipse cx="-16.4" cy="-64.3" rx="22" ry="5.6" transform="rotate(-165 -16.4 -64.3)" fill="#3f9f55"/><ellipse cx="-10.9" cy="-68.9" rx="22" ry="5.6" transform="rotate(-130 -10.9 -68.9)" fill="#4aa860"/><ellipse cx="10.9" cy="-68.9" rx="22" ry="5.6" transform="rotate(-50 10.9 -68.9)" fill="#4aa860"/><ellipse cx="16.4" cy="-64.3" rx="22" ry="5.6" transform="rotate(-15 16.4 -64.3)" fill="#3f9f55"/><ellipse cx="16.0" cy="-58.9" rx="22" ry="5.6" transform="rotate(20 16.0 -58.9)" fill="#3a8a4e"/><ellipse cx="-16.0" cy="-58.9" rx="22" ry="5.6" transform="rotate(160 -16.0 -58.9)" fill="#3a8a4e"/><ellipse cx="0.0" cy="-71.0" rx="22" ry="5.6" transform="rotate(-90 0.0 -71.0)" fill="#5fbf76"/><circle cx="-3" cy="-58" r="3.3" fill="#7a4a2e"/><circle cx="4" cy="-57" r="3.3" fill="#7a4a2e"/></g></g>
    <g stroke="#3a8a4e" stroke-width="3" stroke-linecap="round" fill="none"><path d="M352,326 q-3,-12 -1,-18 M358,328 q2,-10 5,-14"/><path d="M448,326 q3,-12 1,-18"/></g>
    <g transform="translate(205,338) scale(1.0)"><ellipse cx="0" cy="6" rx="16" ry="4.5" fill="#7a4a26" opacity=".3"/><ellipse cx="0" cy="-8" rx="15" ry="16" fill="#4aa860"/><path d="M-6,-22 q-2,14 -1,28 M6,-22 q2,14 1,28 M0,-23 L0,7" stroke="#2c7440" stroke-width="1.6" opacity=".6" fill="none"/><circle cx="0" cy="-25" r="4.2" fill="#ff7a9c"/><circle cx="0" cy="-25" r="1.6" fill="#ffe15a"/><path d="M-10,-12 l-3,-2 M10,-12 l3,-2 M-8,-1 l-3,1 M8,-1 l3,1" stroke="#fff" stroke-width="1.2" opacity=".8"/></g><g transform="translate(562,350) scale(1.15)"><ellipse cx="0" cy="6" rx="16" ry="4.5" fill="#7a4a26" opacity=".3"/><ellipse cx="0" cy="-8" rx="15" ry="16" fill="#4aa860"/><path d="M-6,-22 q-2,14 -1,28 M6,-22 q2,14 1,28 M0,-23 L0,7" stroke="#2c7440" stroke-width="1.6" opacity=".6" fill="none"/><circle cx="0" cy="-25" r="4.2" fill="#ff7a9c"/><circle cx="0" cy="-25" r="1.6" fill="#ffe15a"/><path d="M-10,-12 l-3,-2 M10,-12 l3,-2 M-8,-1 l-3,1 M8,-1 l3,1" stroke="#fff" stroke-width="1.2" opacity=".8"/></g><g transform="translate(742,336) scale(0.8)"><ellipse cx="0" cy="6" rx="16" ry="4.5" fill="#7a4a26" opacity=".3"/><ellipse cx="0" cy="-8" rx="15" ry="16" fill="#4aa860"/><path d="M-6,-22 q-2,14 -1,28 M6,-22 q2,14 1,28 M0,-23 L0,7" stroke="#2c7440" stroke-width="1.6" opacity=".6" fill="none"/><circle cx="0" cy="-25" r="4.2" fill="#ff7a9c"/><circle cx="0" cy="-25" r="1.6" fill="#ffe15a"/><path d="M-10,-12 l-3,-2 M10,-12 l3,-2 M-8,-1 l-3,1 M8,-1 l3,1" stroke="#fff" stroke-width="1.2" opacity=".8"/></g>
    <circle cx="120" cy="199" r="4.4" fill="#ff7a9c"/><circle cx="120" cy="199" r="1.7" fill="#ffe15a"/><circle cx="660" cy="207" r="4.4" fill="#ff7a9c"/><circle cx="660" cy="207" r="1.7" fill="#ffe15a"/>
    <g fill="#b98a46" opacity=".75"><ellipse cx="288" cy="350" rx="13" ry="7"/><ellipse cx="302" cy="354" rx="8" ry="5"/><ellipse cx="650" cy="388" rx="16" ry="8"/><ellipse cx="40" cy="372" rx="14" ry="7"/></g>
    <g stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55">
      <path class="wind" style="animation:swimAcrossR 9s linear infinite;" d="M0,330 h46"/>
      <path class="wind" style="animation:swimAcrossR 12s linear infinite; animation-delay:-5s;" d="M0,372 h60"/>
      <path class="wind" style="animation:swimAcrossR 10s linear infinite; animation-delay:-2s;" d="M0,410 h38"/>
    </g>
    <path d="M30,415 q22,-8 44,0 M60,425 q24,-8 50,0" stroke="#c9924f" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round"/>
  </svg>`,
};

// 필드별 배치: 친구를 끌어다 놓은 자리(pos)와 꾸미기 소품(props). 화면 크기가 달라져도 같은 자리에
// 오도록 장면 크기에 대한 비율(0~1)로 저장합니다.
function emptyFieldLayout(){ return newFieldMap(()=> ({ pos:{}, props:[] })); }
let fieldLayout = emptyFieldLayout();
// 땅이 시작되는 높이(배경 SVG 440 기준). 숲/사막에서는 친구 발이 이 아래(땅 위)에 오게 하고,
// 바닷속은 헤엄치는 곳이라 어디든 갈 수 있습니다.
const FIELD_GROUND_Y = { forest:270, desert:275, space:305, snow:285, island:275 };   // 바닷속은 헤엄치는 곳이라 없음
const FIELD_NIGHT_KEY = 'gogodino_field_night_v1';
let fieldNight = false;
try{ fieldNight = localStorage.getItem(FIELD_NIGHT_KEY) === '1'; }catch(e){}
let spriteIntervals = {}; // 친구별 자동 변신 타이머 (필드를 떠나면 전부 정리)

// 같은 배경 SVG를 선택 화면 썸네일과 실제 필드에 동시에 넣으면 그라데이션/심볼 id가 겹칩니다.
// 그러면 브라우저가 "숨겨진 썸네일 쪽" id를 참조해서 하늘/땅 그라데이션이 빠진 채로 보였습니다.
// 넣을 때마다 id에 고유 접미사를 붙여 서로 겹치지 않게 합니다.
function fieldDecorFor(field, suffix){
  return FIELD_DECOR[field]
    .replace(/id="([^"]+)"/g, `id="$1-${suffix}"`)
    .replace(/url\(#([^)]+)\)/g, `url(#$1-${suffix})`)
    .replace(/href="#([^"]+)"/g, `href="#$1-${suffix}"`);
}

// 필드 선택 화면에 각 필드의 실제 배경(작게 축소된 라이브 미리보기)을 썸네일로 보여줍니다.
function renderFieldSelect(){
  const grid = document.getElementById('fieldSelectGrid');
  if(!grid) return;
  grid.innerHTML = Object.keys(FIELD_TITLES).map(f=>`
    <div class="field-card" role="button" tabindex="0" aria-label="${FIELD_TITLES[f]}" data-field="${f}">
      <div class="thumb">${fieldDecorFor(f, 'thumb')}</div>
      <div class="label">${FIELD_TITLES[f]}</div>
    </div>`).join('');
  grid.querySelectorAll('.field-card').forEach(el=>{
    el.addEventListener('click', ()=> openField(el.dataset.field));
  });
}

function isInField(field, uid){ return fieldFriends[field].some(f=>f.uid===uid); }

function openField(field){
  currentField = field;
  document.getElementById('fieldTitle').textContent = FIELD_TITLES[field];
  const sceneEl = document.getElementById('sceneEl');
  // 우주는 이미 밤하늘이라 낮/밤 전환이 없습니다.
  sceneEl.className = 'scene ' + field + (fieldNight && field !== 'space' ? ' night' : '');
  updateNightBtn();
  sceneEl.innerHTML = `<div class="scene-deco">${fieldDecorFor(field, 'scene')}</div><button class="add-friend-btn" onclick="openCharPick({type:'field', field:currentField})">+ 친구 추가</button>`;
  // renderScene()이 화면 크기(sceneEl.clientHeight)를 재서 캐릭터 위치를 정하기 때문에,
  // 화면을 먼저 보이게(go) 한 다음에 재야 실제 크기를 정확히 잴 수 있습니다.
  go('screen-field');
  playFieldBGM(field);
  speak(FIELD_TITLES[field].replace(/^\S+\s/, ''));
  // 저장 직후 "필드에 데려가기"를 골랐다면, 지금 연 필드에 그 친구를 바로 넣어줍니다.
  if(pendingFieldAddUid){
    const uid = pendingFieldAddUid;
    pendingFieldAddUid = null;
    if(!isInField(field, uid)){ addFriendToField(uid); return; }
  }
  renderScene();
  renderGalleryStrip();
}

// 필드 애니메이션: requestAnimationFrame으로 직접 위치를 계산해서, 이동(translateX/Y/rotate)은
// 부드러운 사인 곡선(양 끝에서 자연스럽게 느려졌다 방향을 바꿈)으로, 좌우 반전은 방향이
// 실제로 바뀌는 순간에만 "즉시" 스냅으로 적용해 보간 없이 자연스럽게 뒤돌아보게 합니다.
// 변신 전(로봇)에는 걷는 듯한 통통 튀는 바운스를, 변신 후(차량)에는 더 빠르고 작은
// 흔들림(서스펜션 느낌)을 얹어 두 모드가 다르게 움직이는 것처럼 보이게 합니다.
let fieldRAF = null;
let fieldSprites = [];
let fieldAnimT0 = 0;

function fieldWaveTheta(tSec, period, phase){ return (tSec/period + phase) * Math.PI*2 - Math.PI/2; }
function fieldWaveFrac(theta){ return (Math.sin(theta)+1)/2; }
function fieldWaveDir(theta){ return Math.cos(theta) >= 0 ? 1 : -1; }

// 좌우로 움직이는 폭(range)은 renderScene에서 실제 화면 가로 폭 기준으로 공통 계산하고,
// 여기서는 속도(period)와 시작 위상(phase)만 캐릭터마다 다르게 둡니다.
const FIELD_WANDER_VARIANTS = [
  { period:9,  phase:0 },
  { period:11, phase:0.5 },
  { period:13, phase:0.22 },
];

// 한국어 반말 어미 "야/이야"도 받침 유무로 갈립니다(예: "렉스야", "토모야" / "엠버야").
function koYa(word){ return nsHasBatchim(word) ? '이야' : '야'; }

function clearSpriteIntervals(){
  Object.values(spriteIntervals).forEach(clearInterval);
  spriteIntervals = {};
}

function renderScene(){
  const sceneEl = document.getElementById('sceneEl');
  sceneEl.querySelectorAll('.sprite').forEach(s=>s.remove());
  clearSpriteIntervals();
  fieldSprites = [];

  const sceneW = sceneEl.clientWidth || 700;
  const sceneH = sceneEl.clientHeight || 320;
  // 예전엔 스프라이트가 화면 크기와 상관없이 164px 고정이라 폰에서는 친구들이 겹쳐
  // 보였습니다. 장면 높이에 비례해서(92~164px) 크기를 정합니다.
  const spriteBox = Math.round(Math.max(92, Math.min(164, sceneH * 0.34)));
  // 숲/사막: 친구 발이 땅 위에 오도록 세로 범위를 땅 영역으로 제한합니다(예전엔 하늘에 떠 있었음).
  const groundSvgY = FIELD_GROUND_Y[currentField];
  const svgScale = Math.max(sceneW/800, sceneH/440);
  const groundTopPx = groundSvgY ? sceneH - (440 - groundSvgY)*svgScale : 0;
  const usableBottom = Math.max(6, sceneH - spriteBox - 8);
  const usableTop = groundSvgY ? Math.max(6, Math.min(usableBottom, groundTopPx - spriteBox*0.82)) : 6;
  const savedPos = fieldLayout[currentField].pos;
  const Y_LANE_FRACS = [0.04, 0.28, 0.52, 0.76, 1.0, 0.16, 0.64];
  // 생성될 때부터 가로(X)로도 골고루 흩어놓습니다.
  const X_LANE_FRACS = [0.4, 0.6, 0.5, 0.25, 0.75, 0.15, 0.85];
  const usableLeft = 4;
  const usableRight = Math.max(usableLeft, sceneW - spriteBox - 4);
  const usableWidthTotal = usableRight - usableLeft;
  // X축 이동 폭: 시작 위치를 중심으로 좌우로 흔들되, 폭은 화면 가로 공간의 90%. 화면 밖으로
  // 나가지 않도록 각 캐릭터의 실제 위치는 매 프레임 화면 안쪽으로 잘라서(clamp) 씁니다.
  const wanderAmplitude = usableWidthTotal * 0.9;

  // 사용자가 저장한 친구들 앞에 "항상 있는" 기본 친구 두 명을 매번 새로 합쳐서 그립니다.
  const sceneFriends = [...DEFAULT_FIELD_FRIENDS, ...fieldFriends[currentField]];

  sceneFriends.forEach((snap, i)=>{
    const wrap = document.createElement('div');
    wrap.className = 'sprite';
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', snap.name);
    wrap.style.height = spriteBox + 'px';
    // 기본 친구 사진은 원본 비율 그대로라, 세로 높이는 두고 폭만 비율에 맞게 좁혀서 안 눌리게 합니다.
    const boxW = snap.aspectRatio ? Math.round(spriteBox * snap.aspectRatio) : spriteBox;
    wrap.style.width = boxW + 'px';
    const laneFrac = Y_LANE_FRACS[i % Y_LANE_FRACS.length];
    const cycleJitter = Math.floor(i / Y_LANE_FRACS.length) * 18;
    const rawTop = usableTop + (usableBottom - usableTop) * laneFrac + cycleJitter;
    let top = Math.max(usableTop, Math.min(usableBottom, rawTop));
    const xLaneFrac = X_LANE_FRACS[i % X_LANE_FRACS.length];
    let anchorLeft = usableLeft + usableWidthTotal * xLaneFrac;
    // 끌어다 놓은 자리가 저장돼 있으면 그 자리에서 시작합니다.
    const sp0 = savedPos[snap.uid];
    if(sp0){
      // 하늘에 놓아둔 친구도 그 자리 그대로(땅 위로 끌어내리지 않음)
      top = Math.max(FIELD_SKY_TOP, Math.min(usableBottom, sp0.y * sceneH));
      anchorLeft = Math.max(usableLeft, Math.min(Math.max(usableLeft, sceneW - boxW - 4), sp0.x * sceneW));
    }
    wrap.style.top = top + 'px';
    wrap.style.left = anchorLeft + 'px';
    wrap.style.zIndex = 2 + Math.round(top / Math.max(1, sceneH) * 20); // 아래쪽(가까운) 친구가 앞에 보이게

    const name = escapeHtml(snap.name);
    // .sprite(위치 이동) > .sprite-hop(인사 점프) > .sprite-inner(좌우 반전/변신 연출)로 나눠서,
    // 각자의 transform 애니메이션이 서로를 덮어쓰지 않게 합니다.
    wrap.innerHTML = (groundSvgY ? '<div class="sprite-shadow"></div>' : '') + `<div class="sprite-hop" style="width:100%;height:100%;">` + (snap.vehicleImage
      ? `<div class="sprite-inner"><img class="form-a" src="${snap.image}" alt="${name}"><img class="form-b" style="opacity:0" src="${snap.vehicleImage}" alt="${name} 변신"></div>`
      : `<div class="sprite-inner"><img src="${snap.image}" alt="${name}"></div>`) + `</div>`;
    sceneEl.appendChild(wrap);

    const variant = FIELD_WANDER_VARIANTS[i % FIELD_WANDER_VARIANTS.length];
    const spriteState = {
      uid: snap.uid, name: snap.name, wrap, inner: wrap.querySelector('.sprite-inner'), hop: wrap.querySelector('.sprite-hop'),
      amplitude: wanderAmplitude, anchorLeft, top, boxW, flying: !!(groundSvgY && top < usableTop - 4),
      usableLeft, usableRight: Math.max(usableLeft, sceneW - boxW - 4), usableTop, usableBottom,
      minX: usableLeft - anchorLeft, maxX: Math.max(usableLeft, sceneW - boxW - 4) - anchorLeft,
      period: variant.period, phase: sp0 ? 0.25 : variant.phase + i*0.13, // 저장된 자리가 있으면 그 자리(이동 0)에서 걷기 시작
      sceneW, sceneH, lastGreet: 0,
      facing: 1, showingVehicle: false, stepSeed: i*1.7, held: false, lastX: 0,
      voice: voiceFor(snap.defId || snap.uid), // 친구마다 다른 목소리로 인사
      lines: linesFor(snap.defId || snap.uid, snap.name), greeted: false, lastLine: -1,
      doTransform: null,
    };
    fieldSprites.push(spriteState);

    if(snap.vehicleImage){
      let isA = true;
      spriteState.doTransform = ()=>{
        isA = !isA;
        const inner = spriteState.inner;
        const a = wrap.querySelector('.form-a'), b = wrap.querySelector('.form-b');
        if(!inner || !a || !b) return;
        // 변신 연출: 반짝임 + 펀치 스케일/회전 + 확산 링, 화려하게 폼을 교체합니다.
        inner.classList.remove('transforming');
        void inner.offsetWidth;
        inner.classList.add('transforming');
        const ring = document.createElement('div');
        ring.className = 'shock-ring';
        inner.appendChild(ring);
        setTimeout(()=> ring.remove(), 700);
        setTimeout(()=>{
          a.style.opacity = isA ? 1 : 0;
          b.style.opacity = isA ? 0 : 1;
          spriteState.showingVehicle = !isA;
        }, 360);
      };
      spriteIntervals[snap.uid] = setInterval(()=>{ if(!spriteState.held) spriteState.doTransform(); }, 4500 + i*733);
    }
    if(spriteState.flying) wrap.classList.add('flying');
    attachSpriteInteraction(spriteState, sceneEl);
  });
  renderProps(sceneEl, sceneW, sceneH, spriteBox);
  startFieldAnim();
}

// 친구를 톡 누르면: 폴짝 뛰며 이름으로 인사(말풍선+음성), 변신 가능한 친구는 변신도 합니다.
// 꾹 눌러 끌면: 원하는 자리로 옮기고, 놓은 자리에서 다시 돌아다닙니다.
// 하늘 배치: 땅이 있는 필드에서 친구를 땅보다 위로 올려 놓으면 "나는 친구"가 됩니다(그림자 없이 둥실둥실).
const FIELD_SKY_TOP = 6;
function setSpriteFlying(sp, top){
  const flying = !!(FIELD_GROUND_Y[currentField] && top < sp.usableTop - 4);
  sp.flying = flying;
  sp.wrap.classList.toggle('flying', flying);
}
function attachSpriteInteraction(sp, sceneEl){
  const wrap = sp.wrap;
  let start = null;
  wrap.addEventListener('pointerdown', (e)=>{
    e.preventDefault();
    try{ wrap.setPointerCapture(e.pointerId); }catch(err){}
    start = { x:e.clientX, y:e.clientY, t:performance.now(), left: parseFloat(wrap.style.left)||0, top: parseFloat(wrap.style.top)||0, moved:false, id:e.pointerId };
    sp.held = true;
  });
  wrap.addEventListener('pointermove', (e)=>{
    if(!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if(!start.moved && Math.hypot(dx, dy) < 8) return;
    if(!start.moved){ start.moved = true; wrap.classList.add('dragging'); }
    const sceneW = sceneEl.clientWidth;
    // 끄는 동안은 지금 보이는 위치(left + translateX)를 기준으로 손가락을 따라오게 합니다.
    const left = Math.max(sp.usableLeft - sp.lastX, Math.min(sceneW - sp.boxW - 4 - sp.lastX, start.left + dx));
    // 땅 위뿐 아니라 하늘(장면 맨 위)까지 옮길 수 있습니다. 땅보다 위로 올리면 하늘을 나는 친구가 됩니다.
    const top = Math.max(FIELD_SKY_TOP, Math.min(sp.usableBottom, start.top + dy));
    wrap.style.left = left + 'px';
    wrap.style.top = top + 'px';
    setSpriteFlying(sp, top);
  });
  const end = (e)=>{
    if(!start || e.pointerId !== start.id) return;
    const wasMoved = start.moved;
    start = null;
    wrap.classList.remove('dragging');
    if(wasMoved){
      // 놓은 자리를 새 기준점(anchor)으로 삼고, 그 자리(translateX=0)에서부터 다시 걷기 시작하도록
      // 위상을 맞춥니다(안 그러면 손을 떼는 순간 다른 자리로 순간이동해 보임).
      const visualLeft = (parseFloat(wrap.style.left)||0) + sp.lastX;
      sp.anchorLeft = visualLeft;
      wrap.style.left = visualLeft + 'px';
      sp.top = parseFloat(wrap.style.top)||sp.top;
      setSpriteFlying(sp, sp.top);
      sp.minX = sp.usableLeft - visualLeft;
      sp.maxX = sp.usableRight - visualLeft;
      const t = (performance.now() - fieldAnimT0)/1000;
      sp.phase = 0.25 - t/sp.period;
      sp.lastX = 0;
      wrap.style.zIndex = 2 + Math.round(sp.top / Math.max(1, sceneEl.clientHeight) * 20);
      // 옮긴 자리를 기억해서 필드를 다시 열어도 그 자리에 있게 합니다.
      fieldLayout[currentField].pos[sp.uid] = { x: visualLeft / Math.max(1, sceneEl.clientWidth), y: sp.top / Math.max(1, sceneEl.clientHeight) };
      persistState();
    } else {
      greetSprite(sp);
    }
    sp.held = false;
  };
  wrap.addEventListener('pointerup', end);
  wrap.addEventListener('pointercancel', end);
}

function greetSprite(sp){
  const hop = sp.hop;
  hop.classList.remove('hello'); void hop.offsetWidth; hop.classList.add('hello');
  hop.querySelectorAll('.sprite-bubble').forEach(b=>b.remove());
  const bubble = document.createElement('div');
  bubble.className = 'sprite-bubble';
  // 처음 누르면 자기소개, 그다음부터는 대사를 돌아가며(같은 대사가 연속으로 나오지 않게) 말합니다.
  let idx = 0;
  if(sp.greeted && sp.lines.length > 1){
    do{ idx = 1 + Math.floor(Math.random() * (sp.lines.length - 1)); }while(idx === sp.lastLine && sp.lines.length > 2);
  }
  sp.greeted = true; sp.lastLine = idx;
  const line = sp.lines[idx];
  bubble.textContent = line;
  hop.appendChild(bubble);
  setTimeout(()=> bubble.remove(), 2600);
  playChime('pop');
  speak(line, sp.voice);
  if(sp.doTransform) setTimeout(sp.doTransform, 450);
}

function startFieldAnim(){
  if(fieldRAF) cancelAnimationFrame(fieldRAF);
  fieldAnimT0 = performance.now();
  function tick(now){
    const t = (now - fieldAnimT0) / 1000;
    fieldSprites.forEach(sp=>{
      if(sp.held) return; // 손가락으로 잡고 있는 동안은 제자리에 멈춤
      const theta = fieldWaveTheta(t, sp.period, sp.phase);
      const rawX = (fieldWaveFrac(theta) - 0.5) * sp.amplitude;
      const x = Math.max(sp.minX, Math.min(sp.maxX, rawX));
      sp.lastX = x;
      const dir = fieldWaveDir(theta);
      let bobY, rot;
      if(sp.flying){
        // 하늘에 있는 친구: 천천히 둥실둥실 떠다니며 살짝 기울어짐
        bobY = Math.sin(t*1.7 + sp.stepSeed) * 9;
        rot = Math.sin(t*1.1 + sp.stepSeed) * 5;
      } else if(sp.showingVehicle){
        bobY = Math.sin(t*10 + sp.stepSeed) * 2;
        rot = Math.sin(t*20 + sp.stepSeed) * 1.6;
      } else {
        bobY = Math.abs(Math.sin(t*6 + sp.stepSeed)) * -4;
        rot = Math.sin(t*6 + sp.stepSeed) * 3;
      }
      sp.wrap.style.transform = `translateX(${x.toFixed(1)}px) translateY(${bobY.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      if(dir !== sp.facing){
        sp.facing = dir;
        sp.inner.style.transform = dir < 0 ? 'scaleX(-1)' : 'scaleX(1)';
      }
    });
    if(++frameNo % 30 === 0) checkFriendMeetings(now);
    fieldRAF = requestAnimationFrame(tick);
  }
  let frameNo = 0;
  fieldRAF = requestAnimationFrame(tick);
}

// 돌아다니다 서로 가까이 만난 친구들은 폴짝 뛰며 "안녕!" 하고 인사합니다(소리 없이 말풍선만).
function checkFriendMeetings(now){
  for(let a=0; a<fieldSprites.length; a++){
    for(let b=a+1; b<fieldSprites.length; b++){
      const A = fieldSprites[a], B = fieldSprites[b];
      if(A.held || B.held) continue;
      if(now - A.lastGreet < 14000 || now - B.lastGreet < 14000) continue;
      const ax = A.anchorLeft + A.lastX + A.boxW/2, bx = B.anchorLeft + B.lastX + B.boxW/2;
      if(Math.abs(ax - bx) > (A.boxW + B.boxW)*0.45 || Math.abs(A.top - B.top) > 70) continue;
      A.lastGreet = B.lastGreet = now;
      [A, B].forEach((sp, k)=>{
        sp.hop.classList.remove('hello'); void sp.hop.offsetWidth; sp.hop.classList.add('hello');
        sp.hop.querySelectorAll('.sprite-bubble').forEach(x=>x.remove());
        const bubble = document.createElement('div');
        bubble.className = 'sprite-bubble';
        bubble.textContent = k === 0 ? ['안녕!', '어, 만났다!', '같이 놀자!'][Math.floor(Math.random()*3)] : ['반가워!', '안녕, 안녕!', '좋아, 놀자!'][Math.floor(Math.random()*3)];
        sp.hop.appendChild(bubble);
        setTimeout(()=> bubble.remove(), 1500);
      });
    }
  }
}

// ---- 낮/밤 ----
function updateNightBtn(){
  const b = document.getElementById('fieldNightBtn');
  if(b){ b.textContent = fieldNight ? '☀️' : '🌙'; b.style.display = currentField === 'space' ? 'none' : ''; }
}
function toggleFieldNight(){
  fieldNight = !fieldNight;
  try{ localStorage.setItem(FIELD_NIGHT_KEY, fieldNight ? '1' : '0'); }catch(e){}
  const sceneEl = document.getElementById('sceneEl');
  if(sceneEl) sceneEl.classList.toggle('night', fieldNight);
  updateNightBtn();
  playChime('pop');
  speak(fieldNight ? '밤이 됐어요' : '아침이에요');
}

// ---- 꾸미기 소품 ----
// 소품 움직임: idle = 가만히 있을 때의 작은 움직임, tap = 톡 눌렀을 때의 반응, say = 반응할 때 하는 말(효과음처럼)
const PROP_MOTION = {
  'prop-flower':   { idle:'sway',    tap:'spin',   say:'살랑살랑' },
  'prop-ball':     { idle:'hop',     tap:'kick',   say:'뻥!' },
  'prop-mushroom': { idle:'squish',  tap:'boing',  say:'뽀잉!' },
  'prop-house':    { idle:'breathe', tap:'shake',  say:'똑똑, 누구 있어요?' },
  'prop-balloon':  { idle:'float',   tap:'floatAway', say:'두둥실!' },
  'prop-rainbow':  { idle:'shimmer', tap:'boing',  say:'반짝반짝 무지개!' },
  'prop-shell':    { idle:'wiggle',  tap:'boing',  say:'바다 소리가 들려!' },
  'prop-palm':     { idle:'sway',    tap:'shake',  say:'코코넛이 툭!' },
  'prop-star':     { idle:'twinkle', tap:'spin',   say:'반짝!' },
  'prop-rocket':   { idle:'hover',   tap:'launch', say:'3, 2, 1, 발사!' },
  'prop-ufo':      { idle:'drift',   tap:'zip',    say:'슝슝!' },
  'prop-snowman':  { idle:'wobble',  tap:'boing',  say:'안녕, 나는 눈사람이야!' },
  'prop-xtree':    { idle:'twinkle', tap:'shake',  say:'반짝반짝 트리!' },
  'prop-egg':      { idle:'wiggle',  tap:'hatch',  say:'뿅! 아기 공룡이 나왔어요!' },
  'prop-bone':     { idle:'wiggle',  tap:'spin',   say:'멍멍이 간식!' },
};
const PROP_LONG_PRESS_MS = 650;   // 꾹 누르면 "필드에서 빼기" 창
function propBurst(el, emoji){
  // 소품 둘레로 작은 반짝이가 퍼져 나갑니다.
  for(let i=0;i<7;i++){
    const b = document.createElement('span');
    b.className = 'prop-burst';
    const ang = (i / 7) * Math.PI * 2 + Math.random()*0.4;
    b.style.setProperty('--bx', (Math.cos(ang) * (40 + Math.random()*24)).toFixed(0) + 'px');
    b.style.setProperty('--by', (Math.sin(ang) * (40 + Math.random()*24) - 14).toFixed(0) + 'px');
    b.textContent = emoji || ['✨','⭐','💫'][i % 3];
    el.appendChild(b);
    setTimeout(()=> b.remove(), 900);
  }
}
function propAct(el, inner, pr, it, sceneEl){
  const m = PROP_MOTION[pr.id] || { tap:'boing' };
  if(el._busy) return;
  el._busy = true;
  const done = (ms)=> setTimeout(()=>{ inner.classList.remove('act-' + m.tap); el._busy = false; }, ms);
  playChime(m.tap === 'launch' || m.tap === 'hatch' ? 'fanfare' : 'pop');
  if(m.say) speak(m.say);
  if(m.tap === 'kick'){
    // 공 차기: 옆으로 데굴데굴 굴러가며 통통 튀고, 멈춘 자리를 기억합니다.
    const dir = pr.x > 0.75 ? -1 : pr.x < 0.25 ? 1 : (Math.random() < 0.5 ? -1 : 1);
    const toX = Math.max(0.05, Math.min(0.95, pr.x + dir * (0.18 + Math.random()*0.12)));
    inner.style.setProperty('--roll', (dir * 720) + 'deg');
    inner.classList.add('act-kick');
    el.style.transition = 'left .9s cubic-bezier(.2,.7,.3,1)';
    pr.x = toX;
    el.style.left = (toX * sceneEl.clientWidth) + 'px';
    setTimeout(()=>{ el.style.transition = ''; persistState(); }, 950);
    done(950);
    return;
  }
  if(m.tap === 'hatch'){
    // 공룡알 부화: 🥚 → 🐣 → 🦖 → 다시 🥚
    inner.classList.add('act-hatch');
    setTimeout(()=>{ inner.textContent = '🐣'; propBurst(el, '✨'); }, 500);
    setTimeout(()=>{ inner.textContent = '🦖'; propBurst(el, '💚'); }, 1300);
    setTimeout(()=>{ inner.textContent = it.emoji; }, 3200);
    done(3300);
    return;
  }
  inner.classList.add('act-' + m.tap);
  if(m.tap !== 'launch' && m.tap !== 'floatAway') propBurst(el);
  done({ launch:2400, floatAway:2600, zip:1500, shake:700, spin:800, boing:700 }[m.tap] || 800);
}
function renderProps(sceneEl, sceneW, sceneH, spriteBox){
  sceneEl.querySelectorAll('.prop').forEach(p=>p.remove());
  fieldLayout[currentField].props.forEach((pr, idx)=>{
    const it = shopItem(pr.id);
    if(!it) return;
    const m = PROP_MOTION[pr.id] || {};
    const el = document.createElement('div');
    el.className = 'prop';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', it.label + ' (톡 누르면 움직이고, 꾹 누르면 빼기)');
    const inner = document.createElement('span');
    inner.className = 'prop-inner idle-' + (m.idle || 'none');
    inner.style.animationDelay = (-(idx * 0.37) % 2).toFixed(2) + 's';   // 같은 소품끼리 똑같이 움직이지 않게
    inner.textContent = it.emoji;
    el.appendChild(inner);
    el.style.fontSize = Math.round(spriteBox * 0.42) + 'px';
    el.style.left = (pr.x * sceneW) + 'px';
    el.style.top = (pr.y * sceneH) + 'px';
    el.style.zIndex = 2 + Math.round(pr.y * 20);
    sceneEl.appendChild(el);
    let start = null, pressTimer = null;
    const clearPress = ()=>{ if(pressTimer){ clearTimeout(pressTimer); pressTimer = null; } };
    el.addEventListener('pointerdown', (e)=>{
      e.preventDefault();
      try{ el.setPointerCapture(e.pointerId); }catch(err){}
      start = { x:e.clientX, y:e.clientY, px:pr.x, py:pr.y, moved:false, longPressed:false, id:e.pointerId };
      clearPress();
      pressTimer = setTimeout(()=>{
        pressTimer = null;
        if(!start || start.moved) return;
        start.longPressed = true;
        el.classList.add('pressed');
        speak(it.label);
        showChoiceDialog(`<div style="font-size:48px;line-height:1.2;">${it.emoji}</div><div>${it.label}</div>`, [
          { label:'✕ 필드에서 빼기', cls:'ghost', value:'remove' },
          { label:'닫기', cls:'alt', value:null },
        ], (v)=>{
          el.classList.remove('pressed');
          if(v !== 'remove') return;
          const list = fieldLayout[currentField].props;
          const k = list.indexOf(pr);
          if(k >= 0) list.splice(k, 1);
          persistState();
          renderScene();
        }, { vertical:true });
      }, PROP_LONG_PRESS_MS);
    });
    el.addEventListener('pointermove', (e)=>{
      if(!start || e.pointerId !== start.id || start.longPressed) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if(!start.moved && Math.hypot(dx, dy) < 8) return;
      clearPress();
      start.moved = true; el.classList.add('dragging');
      pr.x = Math.max(0.04, Math.min(0.96, start.px + dx / sceneEl.clientWidth));
      pr.y = Math.max(0.06, Math.min(0.95, start.py + dy / sceneEl.clientHeight));
      el.style.left = (pr.x * sceneEl.clientWidth) + 'px';
      el.style.top = (pr.y * sceneEl.clientHeight) + 'px';
    });
    const end = (e)=>{
      if(!start || e.pointerId !== start.id) return;
      clearPress();
      const { moved, longPressed } = start; start = null;
      el.classList.remove('dragging');
      if(longPressed) return;
      if(moved){ el.style.zIndex = 2 + Math.round(pr.y * 20); persistState(); return; }
      propAct(el, inner, pr, it, sceneEl);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', (e)=>{ clearPress(); if(start && e.pointerId === start.id){ start = null; el.classList.remove('dragging'); } });
  });
}
const FIELD_PROP_LIMIT = 12;
function openPropPicker(){
  const items = SHOP_ITEMS.filter(i=>i.kind==='prop');
  const el = showChoiceDialog(`
    <div>🎀 필드 꾸미기 <span class="egg-pill">🥚 <b class="egg-count">${wallet.eggs}</b></span></div>
    <small>누르면 필드에 놓여요. 끌어서 옮기고, 톡 누르면 움직이고, 꾹 누르면 뺄 수 있어요.</small>
    <div class="shop-grid">${items.map(it=>{
      const open = isUnlocked(it.id);
      return `<button class="shop-cell${open?' open':''}" data-prop="${it.id}" aria-label="${it.label}${open?'':' (잠김)'}">
        <span class="em">${it.emoji}</span><span class="nm">${it.label}</span><span class="ct">${open?'놓기':'🔒 🥚 '+it.cost}</span></button>`;
    }).join('')}</div>`,
    [{ label:'닫기', cls:'alt', value:true }], null, { wide:true });
  el.querySelectorAll('[data-prop]').forEach(b=> b.addEventListener('click', ()=>{
    const id = b.dataset.prop;
    if(!isUnlocked(id)){ tryUnlock(id, ()=> setTimeout(openPropPicker, 250)); return; }
    const list = fieldLayout[currentField].props;
    if(list.length >= FIELD_PROP_LIMIT){ toast(`소품은 ${FIELD_PROP_LIMIT}개까지 놓을 수 있어요.`); return; }
    const groundY = FIELD_GROUND_Y[currentField];
    const y0 = groundY ? 0.66 : 0.3;
    list.push({ id, x: 0.15 + Math.random()*0.7, y: y0 + Math.random()*0.28 });
    persistState();
    closeDialog();
    renderScene();
    playChime('pop');
    speak(shopItem(id).label);
  }));
}

// ---- 필드 사진 찍기: 지금 장면(배경+소품+친구들)을 한 장의 그림으로 만들어 내보냅니다 ----
async function captureFieldPhoto(){
  const sceneEl = document.getElementById('sceneEl');
  const svg = sceneEl && sceneEl.querySelector('.scene-deco svg');
  if(!svg) return;
  playChime('pop');
  sceneEl.classList.remove('flash'); void sceneEl.offsetWidth; sceneEl.classList.add('flash');
  const W = sceneEl.clientWidth, H = sceneEl.clientHeight, SC = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W*SC; canvas.height = H*SC;
  const ctx = canvas.getContext('2d');
  ctx.scale(SC, SC);
  try{
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', W); clone.setAttribute('height', H);
    const bg = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone)));
    ctx.drawImage(bg, 0, 0, W, H);
  }catch(e){
    ctx.fillStyle = getComputedStyle(sceneEl).backgroundColor || '#bfe9ff'; ctx.fillRect(0,0,W,H);
  }
  if(fieldNight && currentField !== 'space'){ ctx.fillStyle = 'rgba(14,22,74,.52)'; ctx.fillRect(0,0,W,H); }
  const sceneRect = sceneEl.getBoundingClientRect();
  const drawables = [];
  sceneEl.querySelectorAll('.prop').forEach(el=>{
    const r = el.getBoundingClientRect();
    drawables.push({ z: r.bottom, draw: ()=>{
      ctx.font = `${parseFloat(el.style.fontSize)||40}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.textContent, r.left + r.width/2 - sceneRect.left, r.top + r.height/2 - sceneRect.top);
    }});
  });
  fieldSprites.forEach(sp=>{
    const r = sp.wrap.getBoundingClientRect();
    const imgs = Array.from(sp.wrap.querySelectorAll('img'));
    const img = imgs.find(i=> i.style.opacity !== '0') || imgs[0];
    if(!img || !img.naturalWidth) return;
    drawables.push({ z: r.bottom, draw: ()=>{
      const x = sp.anchorLeft + sp.lastX, y = sp.top, bw = sp.boxW, bh = sp.wrap.offsetHeight;
      const k = Math.min(bw/img.naturalWidth, bh/img.naturalHeight);
      const dw = img.naturalWidth*k, dh = img.naturalHeight*k;
      ctx.save();
      ctx.translate(x + bw/2, y + bh/2);
      if(sp.facing < 0) ctx.scale(-1, 1);
      ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
      ctx.restore();
    }});
  });
  drawables.sort((a,b)=> a.z - b.z).forEach(d=> d.draw());
  const blob = await new Promise(res=> canvas.toBlob(res, 'image/png'));
  if(!blob){ toast('사진을 만들지 못했어요.'); return; }
  await shareOrDownloadBlob(blob, `gogodino_field_${currentField}_${Date.now()}.png`, FIELD_TITLES[currentField].replace(/^\S+\s/, '') + ' 사진');
}

// 홈 화면 "필드로 가기" 카드 구석에 가장 최근에 저장한 친구를 살짝 보여줍니다.
function renderHomePeek(){
  const el = document.getElementById('homePeekField');
  if(!el) return;
  const last = savedCharacters[savedCharacters.length - 1];
  el.innerHTML = last ? `<img src="${last.image}" alt="">` : '';
}

// 필드를 떠나면 애니메이션 루프뿐 아니라 친구들의 자동 변신 타이머도 함께 멈춥니다
// (예전엔 타이머가 숨겨진 화면에서 계속 돌았습니다).
function stopFieldAnim(){
  if(fieldRAF){ cancelAnimationFrame(fieldRAF); fieldRAF = null; }
  clearSpriteIntervals();
}

// 갤러리: 예전엔 카드마다 버튼이 3개(+필드/편집/삭제)씩 붙어 복잡했습니다. 이제 카드를 톡
// 누르면 할 일을 고르는 큰 버튼 창이 뜹니다. 필드에 들어가 있는 친구는 초록 테두리로 표시.
function renderGalleryStrip(){
  const strip = document.getElementById('galleryStrip');
  if(savedCharacters.length===0){
    strip.innerHTML = `<div class="empty-cta"><div>아직 저장한 친구가 없어요.</div><button class="pill alt" onclick="openCharPick({type:'field', field:currentField})">🖍️ 친구 색칠하러 가기</button></div>`;
    return;
  }
  strip.innerHTML = savedCharacters.map(snap=>{
    const inField = isInField(currentField, snap.uid);
    const def = getDef(snap.defId);
    const fr = def ? FRANCHISES[def.franchise] : null;
    const name = escapeHtml(snap.name);
    return `
    <div class="gallery-item${fr?' has-fr':''}${inField?' in-field':''}" role="button" tabindex="0" aria-label="${name}${inField?' (필드에 있음)':''}" data-uid="${snap.uid}" ${fr?`style="--fr-color:${fr.color};"`:''}>
      ${fr?`<span class="fr-chip" title="${fr.label}">${fr.emoji}</span>`:''}
      ${inField?'<span class="in-badge">필드에 있어요</span>':''}
      <img src="${snap.image}" alt="${name}">
      <div class="name">${name}</div>
    </div>`;
  }).join('');
  strip.querySelectorAll('.gallery-item[data-uid]').forEach(el=>{
    el.addEventListener('click', ()=> openGalleryActions(el.dataset.uid));
  });
}

function openGalleryActions(uid){
  const snap = savedCharacters.find(s=>s.uid===uid);
  if(!snap) return;
  const inField = isInField(currentField, uid);
  speak(snap.name, voiceFor(snap.defId));
  showChoiceDialog(`<div><img src="${snap.image}" alt="" style="width:110px;height:110px;object-fit:contain;display:block;margin:0 auto 6px;">${escapeHtml(snap.name)}</div>`, [
    inField ? { label:'✕ 필드에서 빼기', cls:'ghost', value:'remove' } : { label:'＋ 필드에 넣기', cls:'alt', value:'add' },
    { label:'✏️ 이어서 칠하기', cls:'ghost', value:'edit' },
    { label:'🗑️ 완전히 삭제', cls:'danger', value:'delete' },
    { label:'닫기', cls:'ghost', value:null },
  ], (v)=>{
    if(v === 'add') addFriendToField(uid);
    else if(v === 'remove') removeFriendFromField(uid);
    else if(v === 'edit'){
      const def = getDef(snap.defId);
      if(!def){ toast('원본 도안을 찾을 수 없어요.'); return; }
      coloringOrigin = { type:'field', field: currentField };
      startColoring(def, snap);
    }
    else if(v === 'delete') setTimeout(()=> deleteCharacter(uid), 220);
  });
}

// 저장된 친구를 완전히 삭제(복구 불가) - 필드에 추가돼 있었다면 모든 필드(숲/바다/사막)에서도
// 함께 지워집니다. 되돌릴 수 없는 동작이라 삭제 전 확인창을 한 번 띄웁니다.
function deleteCharacter(uid){
  const snap = savedCharacters.find(s=>s.uid===uid);
  if(!snap) return;
  showConfirmDialog(
    `<div>${escapeHtml(snap.name)} 그림을<br>정말 삭제할까요?</div><small>삭제하면 되돌릴 수 없어요.</small>`,
    ()=>{
      FIELD_IDS.forEach(f=>{ fieldFriends[f] = fieldFriends[f].filter(x=>x.uid!==uid); });
      savedCharacters = savedCharacters.filter(s=>s.uid!==uid);
      FIELD_IDS.forEach(f=>{ delete fieldLayout[f].pos[uid]; });
      persistState();
      renderHomePeek();
      renderGalleryStrip();
      renderScene();
      toast(snap.name + ' 삭제했어요.');
    }
  );
}

function addFriendToField(uid){
  if(isInField(currentField, uid)){ toast('이미 이 필드에 있어요!'); return; }
  const snap = savedCharacters.find(s=>s.uid===uid);
  if(!snap) return;
  fieldFriends[currentField].push(snap);
  renderScene();
  renderGalleryStrip();
  persistState();
  playChime('pop');
  toast(snap.name + ' 필드에 추가했어요!');
}

function removeFriendFromField(uid){
  const snap = fieldFriends[currentField].find(f=>f.uid===uid);
  fieldFriends[currentField] = fieldFriends[currentField].filter(f=>f.uid!==uid);
  renderScene();
  renderGalleryStrip();
  persistState();
  if(snap) toast(snap.name + ' 필드에서 뺐어요.');
}

// ---------------------------------------------------------------- 저장(로컬 보관)
// 색칠해서 저장한 친구들은 이 기기 안에 남아있어서, 앱을 다시 열어도 그대로 이어집니다.
// 예전엔 localStorage(약 5MB)에 그림을 base64로 넣어서 친구가 10~20명쯤 쌓이면 용량이 꽉 차고,
// 그 실패를 조용히 무시해 "저장 완료!" 후에도 그림이 사라질 수 있었습니다. 이제 용량이 훨씬
// 큰 IndexedDB에 저장하고, 브라우저에 "지우지 말아 주세요(persist)"도 요청합니다. 저장에
// 실패하면 persistState()가 false를 돌려줘서 화면에서 분명히 알려줍니다.
const GOGODINO_STORAGE_KEY = 'gogodino_saved_v1'; // 예전 localStorage 키(이전 데이터 옮겨오기용)
const IDB_NAME = 'gogodino', IDB_STORE = 'kv', IDB_STATE_KEY = 'state';
let idbPromise = null;
function openIDB(){
  if(idbPromise) return idbPromise;
  idbPromise = new Promise((resolve, reject)=>{
    if(!('indexedDB' in window)){ reject(new Error('no-idb')); return; }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = ()=>{ req.result.createObjectStore(IDB_STORE); };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
    req.onblocked = ()=> reject(new Error('idb-blocked'));
  }).catch(e=>{ idbPromise = null; throw e; });
  return idbPromise;
}
function idbGet(key){
  return openIDB().then(db=> new Promise((resolve, reject)=>{
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  }));
}
function idbSet(key, value){
  return openIDB().then(db=> new Promise((resolve, reject)=>{
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = ()=> resolve(true);
    tx.onerror = ()=> reject(tx.error);
    tx.onabort = ()=> reject(tx.error);
  }));
}
function buildStatePayload(){
  const fieldFriendUids = newFieldMap(()=> null);
  FIELD_IDS.forEach(f=>{ fieldFriendUids[f] = fieldFriends[f].map(x=>x.uid); });
  return {
    savedCharacters,
    customTemplates,
    fieldLayout,
    fieldFriendUids
  };
}
// 저장 요청이 겹쳐도 순서대로 하나씩 씁니다(나중 요청이 항상 마지막 상태를 씀).
let persistChain = Promise.resolve(true);
function persistState(){
  persistChain = persistChain.catch(()=>{}).then(async ()=>{
    const payload = buildStatePayload();
    try{
      await idbSet(IDB_STATE_KEY, payload);
      try{ localStorage.removeItem(GOGODINO_STORAGE_KEY); }catch(e){}
      return true;
    }catch(e){
      // IndexedDB를 못 쓰는 환경이면 예전처럼 localStorage에라도 시도합니다.
      try{ localStorage.setItem(GOGODINO_STORAGE_KEY, JSON.stringify(payload)); return true; }
      catch(e2){ console.warn('저장 실패:', e, e2); return false; }
    }
  });
  return persistChain;
}
function applyStatePayload(payload){
  if(!payload) return;
  if(Array.isArray(payload.savedCharacters)) savedCharacters = payload.savedCharacters;
  if(Array.isArray(payload.customTemplates)) customTemplates = payload.customTemplates.filter(t=> t && t.id && t.src);
  if(payload.fieldLayout){
    const base = emptyFieldLayout();
    FIELD_IDS.forEach(f=>{
      const src = payload.fieldLayout[f] || {};
      base[f].pos = (src.pos && typeof src.pos === 'object') ? src.pos : {};
      base[f].props = Array.isArray(src.props) ? src.props.filter(p=> p && shopItem(p.id)) : [];
    });
    fieldLayout = base;
  }
  const uidMap = new Map(savedCharacters.map(s=>[s.uid, s]));
  FIELD_IDS.forEach(f=>{
    const uids = (payload.fieldFriendUids && payload.fieldFriendUids[f]) || [];
    fieldFriends[f] = uids.map(u=>uidMap.get(u)).filter(Boolean);
  });
}
async function loadPersistedState(){
  let payload = null;
  try{ payload = await idbGet(IDB_STATE_KEY); }catch(e){}
  if(!payload){
    // 예전 버전(localStorage)에 저장해둔 친구들이 있으면 그대로 옮겨옵니다.
    try{
      const raw = localStorage.getItem(GOGODINO_STORAGE_KEY);
      if(raw){
        payload = JSON.parse(raw);
        applyStatePayload(payload);
        persistState();
        return;
      }
    }catch(e){ /* 손상된 데이터면 빈 상태로 시작 */ }
  }
  applyStatePayload(payload);
}
function requestPersistentStorage(){
  try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(()=>{}); }catch(e){}
}
