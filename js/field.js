// ---------------------------------------------------------------- 필드(숲/바다/사막)
const FIELD_TITLES = {forest:'🌲 숲속', ocean:'🌊 바닷속', desert:'🏜️ 사막'};

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
  </svg>`,
};

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
  sceneEl.className = 'scene ' + field;
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
  const usableTop = 6;
  const usableBottom = Math.max(usableTop, sceneH - spriteBox - 8);
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
    const top = Math.max(usableTop, Math.min(usableBottom, rawTop));
    wrap.style.top = top + 'px';

    const xLaneFrac = X_LANE_FRACS[i % X_LANE_FRACS.length];
    const anchorLeft = usableLeft + usableWidthTotal * xLaneFrac;
    wrap.style.left = anchorLeft + 'px';

    const name = escapeHtml(snap.name);
    // .sprite(위치 이동) > .sprite-hop(인사 점프) > .sprite-inner(좌우 반전/변신 연출)로 나눠서,
    // 각자의 transform 애니메이션이 서로를 덮어쓰지 않게 합니다.
    wrap.innerHTML = `<div class="sprite-hop" style="width:100%;height:100%;">` + (snap.vehicleImage
      ? `<div class="sprite-inner"><img class="form-a" src="${snap.image}" alt="${name}"><img class="form-b" style="opacity:0" src="${snap.vehicleImage}" alt="${name} 변신"></div>`
      : `<div class="sprite-inner"><img src="${snap.image}" alt="${name}"></div>`) + `</div>`;
    sceneEl.appendChild(wrap);

    const variant = FIELD_WANDER_VARIANTS[i % FIELD_WANDER_VARIANTS.length];
    const spriteState = {
      uid: snap.uid, name: snap.name, wrap, inner: wrap.querySelector('.sprite-inner'), hop: wrap.querySelector('.sprite-hop'),
      amplitude: wanderAmplitude, anchorLeft, top, boxW,
      usableLeft, usableRight: Math.max(usableLeft, sceneW - boxW - 4), usableTop, usableBottom,
      minX: usableLeft - anchorLeft, maxX: Math.max(usableLeft, sceneW - boxW - 4) - anchorLeft,
      period: variant.period, phase: variant.phase + i*0.13,
      facing: 1, showingVehicle: false, stepSeed: i*1.7, held: false, lastX: 0,
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
    attachSpriteInteraction(spriteState, sceneEl);
  });
  startFieldAnim();
}

// 친구를 톡 누르면: 폴짝 뛰며 이름으로 인사(말풍선+음성), 변신 가능한 친구는 변신도 합니다.
// 꾹 눌러 끌면: 원하는 자리로 옮기고, 놓은 자리에서 다시 돌아다닙니다.
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
    const top = Math.max(sp.usableTop, Math.min(sp.usableBottom, start.top + dy));
    wrap.style.left = left + 'px';
    wrap.style.top = top + 'px';
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
      sp.minX = sp.usableLeft - visualLeft;
      sp.maxX = sp.usableRight - visualLeft;
      const t = (performance.now() - fieldAnimT0)/1000;
      sp.phase = 0.25 - t/sp.period;
      sp.lastX = 0;
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
  bubble.textContent = `안녕! 나는 ${sp.name}${koYa(sp.name)}`;
  hop.appendChild(bubble);
  setTimeout(()=> bubble.remove(), 1800);
  playChime('pop');
  speak(`안녕! 나는 ${sp.name}${koYa(sp.name)}`);
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
      if(sp.showingVehicle){
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
    fieldRAF = requestAnimationFrame(tick);
  }
  fieldRAF = requestAnimationFrame(tick);
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
  speak(snap.name);
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
      ['forest','ocean','desert'].forEach(f=>{ fieldFriends[f] = fieldFriends[f].filter(x=>x.uid!==uid); });
      savedCharacters = savedCharacters.filter(s=>s.uid!==uid);
      persistState();
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
  return {
    savedCharacters,
    fieldFriendUids: {
      forest: fieldFriends.forest.map(f=>f.uid),
      ocean: fieldFriends.ocean.map(f=>f.uid),
      desert: fieldFriends.desert.map(f=>f.uid),
    }
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
  const uidMap = new Map(savedCharacters.map(s=>[s.uid, s]));
  ['forest','ocean','desert'].forEach(f=>{
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
