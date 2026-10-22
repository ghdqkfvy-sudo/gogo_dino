// ================================================================ 공부모드 (숫자 / 한글 / 영어)
// 흐름: (1) 글자 보여주기+발음 듣기 → (2) 쓰는 법 데모(애니메이션, 다시보기 가능) →
// (3) 안내선 따라쓰기(마이크로 "말하기" 확인 후, 총 3번) → (4) 칭찬 → 다음 글자.
// 정해진 개수를 다 끝내면 보상으로 고고다이노 영상을 하나 보여줍니다.
// 원래 숫자 전용이었던 흐름을 "과목(subject)" 단위로 일반화해서 한글(자음)과 영어(대문자)도
// 같은 화면/같은 흐름으로 배웁니다.
const NS_STORAGE_KEY = 'gogodino_numstudy_v1';
const NS_RECORDS_KEY = 'gogodino_study_records_v1';
// 0은 전통적인 순우리말 수사가 없어서(하나/둘/셋...은 1부터) 비워둡니다 - 화면에는 한자어(영)만 나옵니다.
const NS_NATIVE_NAMES = ['', '하나','둘','셋','넷','다섯','여섯','일곱','여덟','아홉','열'];
const NS_SINO_NAMES   = ['영','일','이','삼','사','오','육','칠','팔','구','십'];
const NS_TRACE_REPEATS = 3;          // 글자 하나당 따라쓰기 반복 횟수
const NS_TRACE_COVERAGE_PASS = 0.5;  // 안내선의 이 비율 이상을 덧그려야 통과
const NS_TRACE_PRECISION_PASS = 0.55; // 그린 선 중 이 비율 이상이 안내선 근처여야 통과(마구 문지르기 방지)
// 보호자가 전달해준 "고고다이노 공룡탐험대 시즌5" 실제 에피소드 10개 (YouTube 공식 embed - 재배포 아님)
const REWARD_VIDEOS = ['gH2z4FE1Jao','-8C64eTSXVs','8wkmZsa8_ho','ekyj8kBMv_E','LMnGbfgxgRA','_12NwGgyL58','YHcvKaIs7lg','NEb0NQP6eA0','NcrKF2bm0ng','1ScmgfmYKqA'];

// ---------------- 숫자 획순 데이터 (캔버스 실제 좌표계 300x420, 숫자 하나당 획 1~2개) ----------------
// 실제로 펜이 지나가는 순서대로 좌표를 찍어두고, Catmull-Rom 스플라인으로 부드럽게 이어서
// "왼쪽에서 오른쪽으로 밀려나오는" 게 아니라 진짜 손으로 쓰듯 획 순서대로 그려지게 합니다.
// 2026-09-13: 예전엔 이 좌표를 100x140짜리 별도 "작업 공간"에 손으로 어림잡아 찍어두고
// SCALE/OFFY로 캔버스에 맞게 변환해서 썼는데, 그러다 보니 실제 따라쓰기 안내선(진짜 'Jua'
// 폰트로 그린 숫자 모양)과 이 획순 좌표의 모양이 서로 잘 안 맞는다는 피드백을 받았습니다.
// 그래서 이번엔 별도 작업 공간 없이, nsRenderGlyphGuide가 그리는 것과 똑같은 300x420 캔버스에
// Jua 폰트로 각 숫자를 실제로 렌더링해서 그 실루엣의 중심선(medial axis/skeleton)을 추출한 뒤,
// 그 중심선을 사람이 쓰는 순서대로 따라가며 좌표를 찍었습니다(획을 어디서 떼는지도 그 결과를
// 보면서 자연스러운 지점으로 새로 정함). 그 결과 이 좌표를 캔버스에 그대로(스케일 변환 없이)
// 그리면 실제 숫자 도안과 정확히 겹치도록 만들었습니다.
const NS_DIGIT_STROKES = {
  // 0: 맨 위에서 시작해 왼쪽으로 내려가며 한 바퀴(시계 반대 방향) - 아이들이 실제로 0을 쓰는 방향.
  0: [[[150,100],[116,113.2],[91.1,149.2],[82,198.5],[91.1,247.8],[116,283.8],[150,297],[184,283.8],[208.9,247.7],[218,198.5],[208.9,149.2],[184,113.2],[150,100]]],
  1: [[[106,114],[162,96],[162,150],[162,220],[162,303]]],
  2: [[[86,141],[109,110],[143,100],[177,104],[205,131],[207,164],[196,198],[164,230],[130,257],[118,290],[147,300],[181,300],[215,301]]],
  // 3: 위쪽 반달을 그린 뒤 펜을 떼고, 가운데 오목한 지점에서 다시 시작해 아래쪽 반달을 씁니다.
  // 2026-09-13: 이 좌표를 처음 뽑을 때 뼈대(skeleton) 추출 알고리즘이 위쪽 반달의 통통한
  // 곡선 부분을 "지름길"로 잘못 가로질러서, 실제로 재생해보면 3이 아니라 꼭 5처럼 보이는
  // 좌표가 나왔었습니다(획이 곡선을 못 그리고 평평하게 잘림). 실제 렌더링 이미지를 보면서
  // 다시 손으로 곡선을 따라가며 좌표를 새로 찍었고, 재생 애니메이션으로 완성된 모양이 진짜
  // 숫자 3과 같은지 확인했습니다.
  3: [
    [[98,143],[78,118],[72,95],[88,78],[145,72],[195,78],[218,100],[223,122],[213,145],[192,165],[172,182],[152,193]],
    [[148,192],[162,200],[179,205],[196,216],[203,233],[205,249],[201,266],[192,283],[175,294],[159,297],[142,299],[125,296],[108,291],[91,279]],
  ],
  // 4: 대각선을 내려긋다가 방향을 꺾어 가로선을 오른쪽까지 긋고(한 획), 펜을 뗀 뒤
  // 세로선을 위에서 아래로 곧게 긋습니다(다른 한 획) - 실제 폰트 도안 그대로.
  4: [
    [[178,132],[158,139],[138,151],[122,172],[109,192],[100,213],[94,234],[75,242],[104,244],[135,244],[165,244],[196,245],[227,245]],
    [[184,100],[185,140],[185,180],[185,220],[185,260],[184,300]],
  ],
  // 5: 2026-09-13: 몸통 곡선을 먼저 쓰고, 펜을 뗀 뒤 위쪽 가로줄을 나중에 긋도록 순서를
  // 바꿨습니다(피드백 반영 - 이전엔 가로줄을 먼저 그렸음).
  5: [
    [[98,112],[96,149],[100,185],[137,184],[173,187],[206,212],[211,249],[194,286],[157,299],[120,299],[83,278]],
    [[202,97],[166,97],[129,98]],
  ],
  6: [[[213,117],[179,101],[145,100],[111,115],[88,149],[83,183],[82,217],[87,251],[100,285],[134,302],[168,302],[202,287],[217,253],[215,219],[187,193],[153,189],[119,196],[84,205]]],
  7: [[[82,98],[108,98],[134,98],[161,98],[187,98],[202,113],[196,140],[185,166],[171,192],[156,219],[143,245],[129,271],[113,298]]],
  // 8: 위쪽 동그라미를 먼저 다 그린 뒤 펜을 떼고, 아래쪽 동그라미를 이어서 씁니다 -
  // 실제로 아이들에게 8을 가르칠 때 흔히 쓰는, 두 개의 원을 겹쳐 그리는 방식입니다.
  // 2026-09-13: 아래쪽 원의 좌표가 뼈대 추출 과정에서 원을 다 닫지 못하고 중간에 끊겨서,
  // 재생해보면 8을 끝까지 못 그리고 멈추는 문제가 있었습니다. 아래쪽 원도 위쪽 원과 같은
  // 방식(타원을 따라 12등분한 좌표)으로 다시 만들어서 항상 완전히 닫히도록 고쳤습니다.
  8: [
    [[150,95],[128,98],[106,108],[96,131],[95,153],[104,176],[117,198],[140,200],[162,200],[185,198],[200,176],[209,153],[208,131],[196,108],[174,97],[151,95]],
    [[149,200],[180.5,206.9],[203.6,225.8],[212,251.5],[203.6,277.2],[180.5,296.1],[149,303],[117.5,296.1],[94.4,277.2],[86,251.5],[94.4,225.8],[117.5,206.9],[149,200]],
  ],
  // 9: 위쪽 동그라미를 한 바퀴 그린 뒤 펜을 떼고, 이어서 오른쪽 아래로 내려오는 꼬리를 씁니다.
  9: [
    [[148,98],[126,101],[104,110],[89,132],[85,154],[87,176],[98,199],[120,211],[142,215],[164,212],[186,210],[208,203],[212,181],[209,159],[206,137],[194,115],[172,102],[149,97]],
    [[208,203],[211,223],[205,256],[185,289],[152,302],[119,300],[87,281]],
  ],
  // 10: 숫자 두 개(1, 0)를 나란히 배치했을 때 폰트가 자동으로 살짝 작아진 실제 렌더링 결과의
  // 중심선을 그대로 따라간 좌표(두 자리 숫자라 별도 폭 변환이 필요 없음).
  10: [
    [[43,140],[82,127],[82,180],[82,230],[83,274]],
    [[200.5,131],[224.8,140.4],[242.5,166.2],[249,201.5],[242.5,236.8],[224.8,262.6],[200.5,272],[176.2,262.6],[158.5,236.8],[152,201.5],[158.5,166.2],[176.2,140.4],[200.5,131]],
  ],
};

// ---------------- 한글/영어 획순 데이터 (같은 300x420 캔버스 좌표계) ----------------
// 숫자는 실제 글꼴(Jua) 모양을 따라 쓰지만, 한글 자음/영어 대문자는 아이들이 처음 배우는
// "또박또박 블록체" 모양을 직접 획으로 정의하고, 안내선도 이 획을 굵게 그려서 만듭니다.
// 그래서 안내선 모양과 쓰는 법 애니메이션이 항상 정확히 겹칩니다.
// 획 표기: L(...점) = 직선으로 잇는 획(꺾이는 모서리 유지), S(...점) = 부드러운 곡선 획,
//          ARC(cx,cy,rx,ry,시작각,끝각) = 타원 호(각도는 도 단위, 화면 기준 시계방향이 +).
function L(...pts){ return { kind:'line', pts }; }
function S(...pts){ return { kind:'smooth', pts }; }
function ARC(cx, cy, rx, ry, a0, a1, tail){
  const pts = [];
  const n = Math.max(12, Math.round(Math.abs(a1-a0)/8));
  for(let i=0;i<=n;i++){
    const a = (a0 + (a1-a0)*i/n) * Math.PI/180;
    pts.push([cx + Math.cos(a)*rx, cy + Math.sin(a)*ry]);
  }
  return { kind:'line', pts: tail ? pts.concat(tail) : pts };
}
const HANGUL_ITEMS = [
  { glyph:'ㄱ', name:'기역', word:'기린', emoji:'🦒', strokes:[ L([80,110],[220,110],[220,330]) ] },
  { glyph:'ㄴ', name:'니은', word:'나비', emoji:'🦋', strokes:[ L([85,100],[85,320],[225,320]) ] },
  { glyph:'ㄷ', name:'디귿', word:'다람쥐', emoji:'🐿️', strokes:[ L([85,110],[220,110]), L([85,110],[85,320],[225,320]) ] },
  { glyph:'ㄹ', name:'리을', word:'라면', emoji:'🍜', strokes:[ L([80,100],[220,100],[220,210]), L([80,210],[220,210]), L([80,210],[80,320],[225,320]) ] },
  { glyph:'ㅁ', name:'미음', word:'모자', emoji:'🧢', strokes:[ L([85,110],[85,320]), L([85,110],[215,110],[215,320]), L([85,320],[215,320]) ] },
  { glyph:'ㅂ', name:'비읍', word:'바나나', emoji:'🍌', strokes:[ L([85,100],[85,320]), L([215,100],[215,320]), L([85,205],[215,205]), L([85,320],[215,320]) ] },
  { glyph:'ㅅ', name:'시옷', word:'사자', emoji:'🦁', strokes:[ S([150,100],[140,180],[112,260],[75,322]), S([146,195],[185,262],[226,322]) ] },
  { glyph:'ㅇ', name:'이응', word:'오리', emoji:'🦆', strokes:[ ARC(150,212,82,105,-90,-450) ] },
  { glyph:'ㅈ', name:'지읒', word:'자동차', emoji:'🚗', strokes:[ L([85,110],[212,110],[160,200],[115,268],[75,322]), S([160,205],[195,265],[230,322]) ] },
  { glyph:'ㅊ', name:'치읓', word:'치즈', emoji:'🧀', strokes:[ L([150,72],[150,104]), L([85,132],[212,132],[160,215],[115,278],[75,332]), S([160,220],[195,278],[230,332]) ] },
  { glyph:'ㅋ', name:'키읔', word:'코끼리', emoji:'🐘', strokes:[ L([80,110],[220,110],[220,330]), L([80,215],[220,215]) ] },
  { glyph:'ㅌ', name:'티읕', word:'토끼', emoji:'🐰', strokes:[ L([85,105],[220,105]), L([85,210],[215,210]), L([85,105],[85,320],[225,320]) ] },
  { glyph:'ㅍ', name:'피읖', word:'포도', emoji:'🍇', strokes:[ L([75,110],[225,110]), L([115,110],[115,310]), L([185,110],[185,310]), L([70,310],[230,310]) ] },
  { glyph:'ㅎ', name:'히읗', word:'하마', emoji:'🦛', strokes:[ L([150,72],[150,104]), L([82,132],[218,132]), ARC(150,245,70,72,-90,-450) ] },
];
const ENGLISH_ITEMS = [
  { glyph:'A', ko:'에이', word:'Apple', emoji:'🍎', strokes:[ L([150,95],[80,325]), L([150,95],[220,325]), L([105,245],[195,245]) ] },
  { glyph:'B', ko:'비', word:'Ball', emoji:'⚽', strokes:[ L([90,95],[90,325]), S([90,95],[165,95],[203,118],[205,172],[170,205],[90,205]), S([90,205],[180,205],[220,235],[220,295],[180,325],[90,325]) ] },
  { glyph:'C', ko:'씨', word:'Cat', emoji:'🐱', strokes:[ ARC(160,210,95,115,-40,-320) ] },
  { glyph:'D', ko:'디', word:'Dog', emoji:'🐶', strokes:[ L([90,95],[90,325]), S([90,95],[150,95],[210,140],[225,210],[210,280],[150,325],[90,325]) ] },
  { glyph:'E', ko:'이', word:'Egg', emoji:'🥚', strokes:[ L([90,95],[90,325]), L([90,95],[215,95]), L([90,210],[195,210]), L([90,325],[215,325]) ] },
  { glyph:'F', ko:'에프', word:'Fish', emoji:'🐟', strokes:[ L([90,95],[90,325]), L([90,95],[215,95]), L([90,210],[195,210]) ] },
  { glyph:'G', ko:'지', word:'Grapes', emoji:'🍇', strokes:[ ARC(155,210,90,115,-40,-340,[[240,215],[165,215]]) ] },
  { glyph:'H', ko:'에이치', word:'Hat', emoji:'🎩', strokes:[ L([85,95],[85,325]), L([215,95],[215,325]), L([85,210],[215,210]) ] },
  { glyph:'I', ko:'아이', word:'Ice cream', emoji:'🍦', strokes:[ L([150,95],[150,325]), L([105,95],[195,95]), L([105,325],[195,325]) ] },
  { glyph:'J', ko:'제이', word:'Juice', emoji:'🧃', strokes:[ S([200,95],[200,270],[185,315],[150,328],[115,315],[98,282]) ] },
  { glyph:'K', ko:'케이', word:'Kite', emoji:'🪁', strokes:[ L([90,95],[90,325]), L([215,95],[90,222]), L([135,178],[220,325]) ] },
  { glyph:'L', ko:'엘', word:'Lion', emoji:'🦁', strokes:[ L([90,95],[90,325],[215,325]) ] },
  { glyph:'M', ko:'엠', word:'Moon', emoji:'🌙', strokes:[ L([75,325],[75,95]), L([75,95],[150,255],[225,95]), L([225,95],[225,325]) ] },
  { glyph:'N', ko:'엔', word:'Nose', emoji:'👃', strokes:[ L([85,325],[85,95]), L([85,95],[215,325]), L([215,325],[215,95]) ] },
  { glyph:'O', ko:'오', word:'Orange', emoji:'🍊', strokes:[ ARC(150,210,90,115,-90,-450) ] },
  { glyph:'P', ko:'피', word:'Pig', emoji:'🐷', strokes:[ L([90,95],[90,325]), S([90,95],[170,95],[210,125],[210,185],[170,215],[90,215]) ] },
  { glyph:'Q', ko:'큐', word:'Queen', emoji:'👑', strokes:[ ARC(150,205,90,112,-90,-450), L([165,262],[228,335]) ] },
  { glyph:'R', ko:'알', word:'Rabbit', emoji:'🐰', strokes:[ L([90,95],[90,325]), S([90,95],[170,95],[210,125],[210,185],[170,215],[90,215]), L([150,215],[220,325]) ] },
  { glyph:'S', ko:'에스', word:'Sun', emoji:'☀️', strokes:[ S([210,130],[185,100],[150,92],[110,102],[90,135],[105,175],[150,200],[195,225],[212,265],[195,310],[150,328],[105,318],[85,290]) ] },
  { glyph:'T', ko:'티', word:'Tree', emoji:'🌳', strokes:[ L([75,95],[225,95]), L([150,95],[150,325]) ] },
  { glyph:'U', ko:'유', word:'Umbrella', emoji:'☂️', strokes:[ S([85,95],[85,250],[100,300],[150,328],[200,300],[215,250],[215,95]) ] },
  { glyph:'V', ko:'브이', word:'Van', emoji:'🚐', strokes:[ L([75,95],[150,325],[225,95]) ] },
  { glyph:'W', ko:'더블유', word:'Whale', emoji:'🐳', strokes:[ L([60,95],[105,325],[150,160],[195,325],[240,95]) ] },
  { glyph:'X', ko:'엑스', word:'Xylophone', emoji:'🎵', strokes:[ L([80,95],[220,325]), L([220,95],[80,325]) ] },
  { glyph:'Y', ko:'와이', word:'Yo-yo', emoji:'🪀', strokes:[ L([80,95],[150,210]), L([220,95],[150,210],[150,325]) ] },
  { glyph:'Z', ko:'지', word:'Zebra', emoji:'🦓', strokes:[ L([80,95],[220,95],[80,325],[220,325]) ] },
];

// 한글 "가나다라" 버전: 자음 획을 왼쪽에 조금 작게 옮겨 그린 뒤 ㅏ(세로획 → 오른쪽 짧은 가로획)를
// 붙여서 만듭니다. 자음 획 순서는 위의 자음 데이터를 그대로 따릅니다.
function nsSyllableStrokes(consonantStrokes){
  const tf = (st)=>({ kind: st.kind, pts: st.pts.map(([x,y])=>[40 + (x-70)*0.78, 110 + (y-90)*0.8]) });
  return consonantStrokes.map(tf).concat([ L([215,90],[215,335]), L([215,212],[262,212]) ]);
}
const HANGUL_SYLLABLE_WORDS = [
  ['가방','🎒'], ['나비','🦋'], ['다람쥐','🐿️'], ['라면','🍜'], ['마늘','🧄'], ['바나나','🍌'], ['사과','🍎'],
  ['아기','👶'], ['자동차','🚗'], ['차','🚙'], ['카메라','📷'], ['타요 버스','🚌'], ['파인애플','🍍'], ['하마','🦛'],
];
const HANGUL_SYLLABLE_ITEMS = HANGUL_ITEMS.map((c, i)=>({
  glyph: String.fromCharCode(0xAC00 + [0,2,3,5,6,7,9,11,12,14,15,16,17,18][i] * 588),
  word: HANGUL_SYLLABLE_WORDS[i][0], emoji: HANGUL_SYLLABLE_WORDS[i][1],
  strokes: nsSyllableStrokes(c.strokes),
}));
// 한글공부에서 배울 글자 묶음: syllable(가나다라, 기본) / consonant(ㄱㄴㄷ)
function nsHangulSet(){ return ns.settings.hangulSet === 'consonant' ? 'consonant' : 'syllable'; }
// 학습 기록/획 캐시 키 - 한글은 묶음마다 따로 기록합니다(예전 ㄱㄴㄷ 기록은 'hangul' 그대로 유지).
function nsRecordKey(){
  if(ns.subject !== 'hangul') return ns.subject;
  return nsHangulSet() === 'consonant' ? 'hangul' : 'hangul_syllable';
}

// 공부모드 보상은 과목과 상관없이 같은 화면·같은 영상을 씁니다.
const NS_REWARD_TITLE = '🎉 오늘 공부 다 했어요! 🎉';

// 과목별 정보. items(key 목록)와 item(key) → {glyph, chips, speakText, speakLang, prompt, strokes}
const STUDY_SUBJECTS = {
  number: {
    title:'🔢 숫자공부',
    keys(){ const out=[]; for(let i=ns.settings.rangeMin;i<=ns.settings.rangeMax;i++) out.push(i); return out.length?out:[0]; },
    // 범위 안의 숫자를 한 번씩은 다 배우도록 목표 개수를 범위 크기에 맞춥니다(너무 적으면 최소 5번).
    target(){ return Math.max(5, this.keys().length); },
    item(n){
      const native = NS_NATIVE_NAMES[n], sino = NS_SINO_NAMES[n];
      return {
        glyph: String(n), useFontGuide: true,
        chips: [native ? `<span class="ns-name-chip">${native}</span>` : '', `<span class="ns-name-chip alt">${sino}</span>`],
        // 숫자 자체는 읽지 않고(기기 TTS가 "2."를 제멋대로 읽는 문제) 이름만 읽어줍니다.
        speakText: native ? `숫자 ${native}, 또는 ${sino}${nsCopula(sino)}.` : `숫자 ${sino}${nsCopula(sino)}.`, speakLang:'ko-KR',
        promptWord: nsPickPromptWord(n),
        strokes: NS_DIGIT_STROKES[n] || NS_DIGIT_STROKES[0], strokeKind:'smooth',
        demoWidth: n === 10 ? 7 : 10,
      };
    },
  },
  hangul: {
    title:'🇰🇷 한글공부',
    keys(){ return HANGUL_ITEMS.map((_,i)=>i); },
    target(){ return 7; }, // 14글자를 두 번에 나눠 배움(순서 모드는 다음에 이어서)
    item(i){
      if(nsHangulSet() === 'syllable'){
        const sy = HANGUL_SYLLABLE_ITEMS[i];
        return {
          glyph: sy.glyph,
          chips: [`<span class="ns-name-chip">${sy.glyph}</span>`, `<span class="ns-name-chip alt">${sy.emoji} ${sy.word}</span>`],
          speakText: `${sy.glyph}. ${sy.word} 할 때 ${sy.glyph}${nsCopula(sy.glyph)}.`, speakLang:'ko-KR',
          promptWord: sy.glyph,
          strokes: sy.strokes, demoWidth: 12,
        };
      }
      const it = HANGUL_ITEMS[i];
      return {
        glyph: it.glyph,
        chips: [`<span class="ns-name-chip">${it.name}</span>`, `<span class="ns-name-chip alt">${it.emoji} ${it.word}</span>`],
        speakText: `${it.name}. ${it.word} 할 때 ${it.name}${nsCopula(it.name)}.`, speakLang:'ko-KR',
        promptWord: it.name,
        strokes: it.strokes, demoWidth: 12,
      };
    },
  },
  english: {
    title:'🔤 영어공부',
    keys(){ return ENGLISH_ITEMS.map((_,i)=>i); },
    target(){ return 7; },
    item(i){
      const it = ENGLISH_ITEMS[i];
      return {
        glyph: it.glyph,
        chips: [`<span class="ns-name-chip">${it.glyph} ${it.glyph.toLowerCase()} · ${it.ko}</span>`, `<span class="ns-name-chip alt">${it.emoji} ${it.word}</span>`],
        speakText: `${it.glyph}. ${it.glyph} is for ${it.word}.`, speakLang:'en-US',
        promptWord: it.ko,
        strokes: it.strokes, demoWidth: 12,
      };
    },
  },
};

// Catmull-Rom 스플라인으로 waypoint 사이를 촘촘한 점들로 채웁니다(직선 연결이 아니라 곡선으로 이어짐).
function nsCatmullRomSample(points, samplesPerSeg){
  samplesPerSeg = samplesPerSeg || 14;
  if(points.length < 2) return points.slice();
  const out = [];
  const n = points.length;
  for(let i=0; i<n-1; i++){
    const p0 = points[i-1] || points[i];
    const p1 = points[i];
    const p2 = points[i+1];
    const p3 = points[i+2] || p2;
    for(let s=0; s<samplesPerSeg; s++){
      const t = s/samplesPerSeg, t2 = t*t, t3 = t2*t;
      const x = 0.5*((2*p1[0]) + (-p0[0]+p2[0])*t + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3);
      const y = 0.5*((2*p1[1]) + (-p0[1]+p2[1])*t + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3);
      out.push([x,y]);
    }
  }
  out.push(points[n-1]);
  return out;
}
// 직선 획은 모서리(꺾이는 곳)가 둥글게 뭉개지지 않도록 구간마다 일정 간격으로 점을 채웁니다.
function nsLinearSample(points, spacing){
  spacing = spacing || 6;
  const out = [];
  for(let i=0;i<points.length-1;i++){
    const a = points[i], b = points[i+1];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0]-a[0], b[1]-a[1]) / spacing));
    for(let k=0;k<n;k++) out.push([a[0]+(b[0]-a[0])*k/n, a[1]+(b[1]-a[1])*k/n]);
  }
  out.push(points[points.length-1]);
  return out;
}
function nsStrokeLength(points){
  let len = 0;
  for(let i=1;i<points.length;i++) len += Math.hypot(points[i][0]-points[i-1][0], points[i][1]-points[i-1][1]);
  return len;
}
const nsStrokePathCache = new Map();
function nsGetStrokes(){
  const cacheKey = nsRecordKey() + ':' + ns.current;
  if(nsStrokePathCache.has(cacheKey)) return nsStrokePathCache.get(cacheKey);
  const it = nsItem();
  const dense = it.strokes.map(st=>{
    if(Array.isArray(st)) return nsCatmullRomSample(st, 14); // 숫자 데이터(점 배열)는 곡선 획
    return st.kind === 'line' ? nsLinearSample(st.pts) : nsCatmullRomSample(st.pts, 14);
  });
  nsStrokePathCache.set(cacheKey, dense);
  return dense;
}

let ns = {
  subject: 'number',
  settings: { rangeMin:0, rangeMax:10, micMode:'every', mode:'sequential', hangulSet:'syllable' },
  session: { completed:0 },
  current: null,
  stage: 'reveal',
  traceRound: 0,
  _traceMask: null,
  _drawCtx: null,
  _micStream: null,
  _micRAF: null,
  _noiseFloorCached: null, // 같은 공부 세션 안에서 재사용하는 바닥소음 값(재계산 생략용)
};
function nsSubject(){ return STUDY_SUBJECTS[ns.subject] || STUDY_SUBJECTS.number; }
function nsItem(){ return nsSubject().item(ns.current); }
function nsSessionTarget(){ return nsSubject().target(); }

function nsLoadSettings(){
  try{
    const raw = localStorage.getItem(NS_STORAGE_KEY);
    if(!raw) return;
    const p = JSON.parse(raw);
    if(p && p.settings){
      Object.assign(ns.settings, p.settings);
      // 예전 설정(micGateOn: true/false)을 새 3단계 설정으로 옮깁니다.
      if(typeof p.settings.micGateOn === 'boolean' && !p.settings.micMode) ns.settings.micMode = p.settings.micGateOn ? 'every' : 'off';
      delete ns.settings.micGateOn;
    }
  }catch(e){ /* 손상된 설정은 무시하고 기본값으로 시작 */ }
}
function nsSaveSettings(){
  try{ localStorage.setItem(NS_STORAGE_KEY, JSON.stringify({settings: ns.settings})); }catch(e){}
}

// ---- 학습 기록: 과목별로 글자마다 몇 번 끝냈는지 + 마지막으로 배운 글자(순서 모드 이어하기) ----
let nsRecords = { number:{}, hangul:{}, hangul_syllable:{}, english:{}, last:{} };
function nsLoadRecords(){
  try{
    const p = JSON.parse(localStorage.getItem(NS_RECORDS_KEY) || 'null');
    if(p) nsRecords = Object.assign({ number:{}, hangul:{}, hangul_syllable:{}, english:{}, last:{} }, p);
  }catch(e){}
}
function nsSaveRecords(){
  try{ localStorage.setItem(NS_RECORDS_KEY, JSON.stringify(nsRecords)); }catch(e){}
}
function nsMarkLearned(){
  const key = nsRecordKey();
  const rec = nsRecords[key] || (nsRecords[key] = {});
  rec[ns.current] = (rec[ns.current] || 0) + 1;
  nsRecords.last[key] = ns.current;
  nsSaveRecords();
}
function renderNsStickers(){
  const row = document.getElementById('nsStickerRow');
  if(!row) return;
  const subj = nsSubject();
  const rec = nsRecords[nsRecordKey()] || {};
  row.innerHTML = subj.keys().map(k=>{
    const glyph = subj.item(k).glyph;
    const cnt = rec[k] || 0;
    return `<span class="ns-sticker${cnt?' done':''}" title="${cnt}번 완료">${glyph}</span>`;
  }).join('');
}

function openStudy(subject){
  ns.subject = STUDY_SUBJECTS[subject] ? subject : 'number';
  ns.session = { completed:0 };
  // 순서 모드는 지난번에 배운 다음 글자부터 이어서 시작합니다.
  const last = nsRecords.last[nsRecordKey()];
  ns.current = (last === undefined) ? null : last;
  ns._noiseFloorCached = null; // 새 학습 세션을 시작할 때마다 그 자리의 소음을 다시 잽니다
  nsRollPromptMajority(); // 이번 세션에서 "하나/둘..."과 "일/이..." 중 어느 쪽을 더 자주 들려줄지 무작위로 정함
  document.getElementById('nsTitle').textContent = nsSubject().title;
  updateNsProgress();
  renderNsStickers();
  go('screen-numstudy');
  nsNextNumber();
}
function exitNumberStudy(){
  nsStopMic();
  nsDemoRunId++;
  const nativeTTS = nsNativeTTS();
  if(nativeTTS){ try{ nativeTTS.stop().catch(()=>{}); }catch(e){} }
  try{ speechSynthesis.cancel(); }catch(e){}
  clearTimeout(nsCelebrateTimer);
  go('screen-home');
}
function nsIsActive(){
  const el = document.getElementById('screen-numstudy');
  return !!(el && el.classList.contains('active'));
}

function updateNsProgress(){
  const fill = document.getElementById('nsProgressFill');
  const label = document.getElementById('nsProgressLabel');
  const target = nsSessionTarget();
  const pct = Math.min(100, (ns.session.completed / target) * 100);
  if(fill) fill.style.width = pct + '%';
  if(label) label.textContent = `${ns.session.completed} / ${target}`;
}

function nsPickNumber(){
  const keys = nsSubject().keys();
  if(ns.settings.mode === 'sequential'){
    // 순서 모드: 차례로 나오고, 끝까지 가면 다시 처음부터.
    const idx = keys.indexOf(ns.current);
    if(idx < 0 || idx >= keys.length-1) return keys[0];
    return keys[idx+1];
  }
  const choices = keys.filter(k=>k!==ns.current);
  const list = choices.length ? choices : keys;
  return list[Math.floor(Math.random()*list.length)];
}

function nsNextNumber(){
  if(!nsIsActive()) return;
  if(ns.session.completed >= nsSessionTarget()){ showNumberReward(); return; }
  ns.current = nsPickNumber();
  ns.traceRound = 0;
  nsGoStage('reveal');
}

function nsGoStage(stage){
  ns.stage = stage;
  nsDemoRunId++; // 다른 단계로 넘어가면 데모 애니메이션이 남아있던 캔버스에 계속 그리지 않도록 확실히 멈춤
  nsStopMic();
  const card = document.getElementById('nsStageCard');
  if(!card) return;
  if(stage==='reveal') card.innerHTML = nsRenderRevealStage();
  else if(stage==='demo') card.innerHTML = nsRenderDemoStage();
  else if(stage==='trace') card.innerHTML = nsRenderTraceStage();
  else if(stage==='celebrate') card.innerHTML = nsRenderCelebrateStage();
  nsWireStage(stage);
}

// ---------------- 1단계: 글자 보여주기 + 발음 듣기 ----------------
function nsRenderRevealStage(){
  const it = nsItem();
  return `
    <div class="ns-number-display">${it.glyph}</div>
    <div class="ns-number-names">${it.chips.join('')}</div>
    <button class="pill alt ns-big-btn" id="nsPlaySound">🔊 소리 듣기 (다시 듣기)</button>
    <button class="pill ns-big-btn" id="nsToDemo">다음: 쓰는 법 보기 ✏️</button>
  `;
}
function nsPickVoice(lang){
  try{
    const prefix = (lang || 'ko-KR').slice(0,2);
    const voices = speechSynthesis.getVoices() || [];
    return voices.find(v => v.lang && v.lang.toLowerCase().startsWith(prefix)) || null;
  }catch(e){ return null; }
}
// 안드로이드 웹뷰는 Web Speech API(speechSynthesis)가 아예 없거나 음성 목록이 비어 소리가 안
// 나는 경우가 흔해서, 앱(APK)으로 실행 중일 땐 안드로이드 시스템 TTS 네이티브 플러그인
// (@capacitor-community/text-to-speech)을 우선 쓰고, 일반 브라우저에서만 Web Speech API로 대체합니다.
function nsNativeTTS(){
  try{ return (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform() && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) || null; }
  catch(e){ return null; }
}
// 기기에 같은 언어 음성이 여러 개면 인터넷 기반(localService:false, 대개 더 자연스러운) 음성을
// 우선 고릅니다. 목록 조회는 한 번만 하고 결과를 캐시해둡니다.
let nsNativeVoicesPromise = null;
function nsGetPreferredNativeVoiceIndex(nativeTTS, lang){
  if(!nsNativeVoicesPromise){
    nsNativeVoicesPromise = nativeTTS.getSupportedVoices()
      .then(res => (res && res.voices) || [])
      .catch(() => []);
  }
  const prefix = (lang || 'ko-KR').slice(0,2).toLowerCase();
  return nsNativeVoicesPromise.then(voices => {
    if(!voices.length) return undefined;
    const matched = voices.map((v,i)=>({...v, idx:i})).filter(v => (v.lang || '').toLowerCase().startsWith(prefix));
    if(!matched.length) return undefined;
    const network = matched.find(v => v.localService === false);
    return (network || matched[0]).idx;
  });
}
// 모바일 브라우저(특히 iOS Safari, 안드로이드 크롬)에서 소리가 안 나던 원인들:
//  ① 음성 목록이 늦게 채워질 때 setTimeout으로 기다렸다가 말해서, "터치한 그 순간"에 말하지 않아
//     브라우저가 소리를 막음 → 이제 목록을 기다리지 않고 즉시 말합니다(언어만 지정하면 기본 음성 사용).
//  ② cancel() 직후 바로 speak()하면 안드로이드 크롬이 새 문장까지 같이 취소해버림
//     (카드 이름 안내 → 곧바로 숫자 발음처럼 연달아 말할 때) → 말하는 중일 때만 취소하고 잠깐 뒤에 말합니다.
//  ③ 문장(utterance) 객체가 말하는 도중 메모리에서 정리되면 소리가 끊김 → 끝날 때까지 붙잡아 둡니다.
//  ④ iOS는 첫 소리를 반드시 터치 안에서 내야 이후에도 소리가 남 → 첫 터치 때 무음 문장으로 "잠금 해제".
let nsActiveUtterance = null;
function nsWebSpeakNow(text, lang){
  const u = new SpeechSynthesisUtterance(text);
  const voice = nsPickVoice(lang);
  if(voice) u.voice = voice;
  u.lang = lang; u.rate = 0.85; u.pitch = 1.05;
  u.onend = ()=>{ if(nsActiveUtterance === u) nsActiveUtterance = null; };
  u.onerror = (e)=>{
    if(nsActiveUtterance === u) nsActiveUtterance = null;
    const reason = e && e.error;
    if(reason === 'interrupted' || reason === 'canceled') return; // 다음 문장으로 넘어가며 끊긴 것은 정상
    if(reason === 'not-allowed') toast('화면을 한 번 누른 뒤 🔊 버튼을 눌러주세요');
    else if(!voice) toast('이 기기에 해당 언어 음성이 설치되어 있지 않은 것 같아요 🔇');
  };
  nsActiveUtterance = u;
  speechSynthesis.speak(u);
  // 일부 안드로이드 브라우저는 speak() 직후 멈춰있는 상태로 남는 버그가 있어 한 번 깨워줍니다.
  setTimeout(()=>{ try{ if(speechSynthesis.paused) speechSynthesis.resume(); }catch(e){} }, 150);
}
function nsWebSpeak(text, lang){
  if(!('speechSynthesis' in window)){
    toast('이 기기에서는 소리를 들려줄 수 없어요 🔇');
    return;
  }
  try{
    if(speechSynthesis.paused) speechSynthesis.resume();
    if(speechSynthesis.speaking || speechSynthesis.pending){
      speechSynthesis.cancel();
      setTimeout(()=>{ try{ nsWebSpeakNow(text, lang); }catch(e){} }, 120);
    } else {
      nsWebSpeakNow(text, lang);
    }
  }catch(e){ toast('소리 재생에 문제가 있었어요 🔇'); }
}
function nsUnlockWebSpeech(){
  try{
    if(!('speechSynthesis' in window) || nsNativeTTS()) return;
    speechSynthesis.getVoices(); // 음성 목록 미리 불러오기
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }catch(e){}
}
document.addEventListener('pointerdown', nsUnlockWebSpeech, { once:true, capture:true });
try{ if('speechSynthesis' in window) speechSynthesis.getVoices(); }catch(e){}

function nsSpeak(text, lang){
  lang = lang || 'ko-KR';
  const nativeTTS = nsNativeTTS();
  if(nativeTTS){
    try{
      nativeTTS.stop().catch(()=>{});
      nsGetPreferredNativeVoiceIndex(nativeTTS, lang).then(voiceIdx=>{
        const opts = { text, lang, rate:0.85, pitch:1.1, volume:1.0, category:'ambient' };
        if(voiceIdx !== undefined) opts.voice = voiceIdx;
        // 지정한 음성으로 실패하면 기본 음성으로, 그것도 안 되면 브라우저 음성으로 한 번 더 시도합니다.
        nativeTTS.speak(opts)
          .catch(()=>{ delete opts.voice; return nativeTTS.speak(opts); })
          .catch(()=>{ if('speechSynthesis' in window) nsWebSpeak(text, lang); else toast('소리 재생에 문제가 있었어요 🔇'); });
      });
    }catch(e){ nsWebSpeak(text, lang); }
    return;
  }
  nsWebSpeak(text, lang);
}
// 앱 곳곳의 음성 안내(카드 이름, 캐릭터 이름, 필드 이름 등). 아직 글을 못 읽는 아이를 위한
// 기능이라 기본으로 켜져 있고, 보호자 설정에서 끌 수 있습니다. 공부모드 발음은 항상 나옵니다.
const VOICE_GUIDE_KEY = 'gogodino_voice_guide_v1';
let voiceGuideOn = true;
try{ voiceGuideOn = localStorage.getItem(VOICE_GUIDE_KEY) !== '0'; }catch(e){}
function speak(text){
  if(!voiceGuideOn || !text) return;
  try{ nsSpeak(text, 'ko-KR'); }catch(e){}
}
// 한국어 조사 "이에요"/"예요"는 앞 낱말이 받침으로 끝나는지에 따라 달라집니다. 이걸 구분 안
// 하고 무조건 "이에요"를 붙이면 "오이에요", "구이에요"처럼 다른 낱말로 들려서, 마지막 글자의
// 받침 유무를 유니코드 계산으로 가려서 맞는 조사를 골라 붙입니다.
function nsHasBatchim(word){
  const ch = word[word.length - 1];
  const code = ch.charCodeAt(0);
  if(code < 0xAC00 || code > 0xD7A3) return true; // 한글 완성형 글자가 아니면 안전한 기본값
  return (code - 0xAC00) % 28 !== 0;
}
function nsCopula(word){
  return nsHasBatchim(word) ? '이에요' : '예요';
}
function nsSpeakNumber(){
  const it = nsItem();
  nsSpeak(it.speakText, it.speakLang);
}
// 마이크 단계 안내 음성 — 아이가 화면 글자를 아직 못 읽어도 무엇을 해야 하는지 귀로 알 수 있도록,
// 이 단계에 들어가면 자동으로 한 번 들려주고 "다시 듣기" 버튼으로 몇 번이든 다시 들을 수 있게 합니다.
// 숫자는 "하나/둘"(순우리말)과 "일/이"(한자어)를 대략 2:1로 섞어서 들려주는데, 어느 쪽이 더 자주
// 나올지는 세션을 시작할 때 한 번 무작위로 정해서 한 세션 안에서는 일관되게 씁니다.
let nsPromptMajority = 'native';
function nsRollPromptMajority(){
  nsPromptMajority = Math.random() < 0.5 ? 'native' : 'sino';
}
function nsPickPromptSystem(){
  const majorityWins = Math.random() < (2/3);
  return majorityWins ? nsPromptMajority : (nsPromptMajority === 'native' ? 'sino' : 'native');
}
function nsPickPromptWord(n){
  const native = NS_NATIVE_NAMES[n];
  const sino = NS_SINO_NAMES[n];
  let system = nsPickPromptSystem();
  if(system === 'native' && !native) system = 'sino'; // 0처럼 순우리말 이름이 없으면 한자어로 대체
  return system === 'native' ? native : sino;
}
function nsTracePromptText(){
  return `${ns._promptWord}! 소리 내어 말해볼까요?`;
}
function nsSpeakTracePrompt(){
  nsSpeak(nsTracePromptText(), 'ko-KR');
}

// ---------------- 2단계: 쓰는 법 데모(애니메이션, 다시보기 가능) ----------------
const NS_DEMO_CANVAS_W = 300, NS_DEMO_CANVAS_H = 420;
function nsRenderDemoStage(){
  return `
    <div class="ns-demo-wrap">
      <canvas id="nsDemoCanvas" width="${NS_DEMO_CANVAS_W}" height="${NS_DEMO_CANVAS_H}"></canvas>
      <div class="ns-pencil" id="nsPencil">✏️</div>
    </div>
    <button class="pill ghost ns-big-btn" id="nsReplayDemo">🔁 다시 보기</button>
    <button class="pill ns-big-btn" id="nsToTrace">나도 써볼래요! ✍️</button>
  `;
}
// 실제 획 순서 좌표를 따라 연필이 움직이면서 한 획씩 그려지고, 획이 끝나면 펜을 살짝 들었다가
// 다음 획 시작점에 내려놓는 것처럼 보이게 합니다.
let nsDemoRunId = 0;
function nsPlayStrokeAnim(canvasId, pencilId, opts){
  opts = opts || {};
  const canvas = document.getElementById(canvasId);
  if(!canvas) return;
  const runId = ++nsDemoRunId; // 다시보기를 연타해도 예전 애니메이션이 계속 겹쳐 그려지지 않도록
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const pencil = document.getElementById(pencilId);
  const strokes = nsGetStrokes();
  const lens = strokes.map(nsStrokeLength);
  const totalLen = lens.reduce((a,b)=>a+b,0) || 1;
  const totalDur = opts.totalDur || 1700;
  const strokeDurs = lens.map(l => Math.max(260, totalDur * (l/totalLen)));

  ctx.clearRect(0,0,W,H);
  // 데모 캔버스에는 연한 안내선을 먼저 깔아서 "어디에 쓰는지"가 함께 보이게 합니다.
  if(opts.withGuide) nsDrawGuide(ctx, W, H);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = opts.color || '#2e2350';
  ctx.lineWidth = nsItem().demoWidth || 10;
  if(pencil) pencil.style.opacity = '1';

  function placePencil(cx, cy){
    if(!pencil) return;
    const rect = canvas.getBoundingClientRect();
    const rw = rect.width || W, rh = rect.height || H;
    pencil.style.left = (rw * (cx/W)) + 'px';
    pencil.style.top = (rh * (cy/H) - 20) + 'px';
  }

  function playStroke(idx){
    if(runId !== nsDemoRunId || !nsIsActive()) return;
    if(idx >= strokes.length){
      if(pencil) setTimeout(()=>{ if(runId===nsDemoRunId) pencil.style.opacity = '0'; }, 300);
      if(runId === nsDemoRunId && opts.onDone) opts.onDone();
      return;
    }
    const pts = strokes[idx];
    if(!pts || pts.length === 0){ playStroke(idx+1); return; }
    const dur = strokeDurs[idx];
    placePencil(pts[0][0], pts[0][1]);
    const t0 = performance.now();
    function frame(t){
      if(runId !== nsDemoRunId || !nsIsActive()) return;
      // rAF가 넘겨주는 t가 첫 프레임에서 t0보다 이를 수 있어 음수 진행률이 되지 않게 0으로 고정합니다.
      const p = Math.max(0, Math.min(1, (t - t0) / dur));
      const idxF = p * (pts.length - 1);
      const i0 = Math.floor(idxF);
      const frac = idxF - i0;
      const cur = pts[Math.min(i0, pts.length-1)];
      const nxt = pts[Math.min(i0+1, pts.length-1)];
      const curX = cur[0] + (nxt[0]-cur[0])*frac;
      const curY = cur[1] + (nxt[1]-cur[1])*frac;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for(let k=1;k<=i0;k++) ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.lineTo(curX, curY);
      ctx.stroke();
      placePencil(curX, curY);
      if(p < 1) requestAnimationFrame(frame);
      else setTimeout(()=> playStroke(idx+1), 180); // 획 사이에 펜을 살짝 드는 느낌의 짧은 정지
    }
    requestAnimationFrame(frame);
  }
  playStroke(0);
}
function nsPlayDemo(){
  nsEnsureGuideFont().then(()=> nsPlayStrokeAnim('nsDemoCanvas', 'nsPencil', { withGuide: !nsItem().useFontGuide }));
}
// 따라쓰기 화면에서 "쓰는법 다시보기"를 누르면, 안내선/그림 위에 겹쳐진 투명 캔버스에
// 잠깐 획순 애니메이션을 보여준 뒤 다시 지워서 원래 안내선+그린 그림이 보이게 합니다.
function nsPlayTraceDemo(){
  const overlay = document.getElementById('nsTraceDemoCanvas');
  if(!overlay) return;
  overlay.style.opacity = '1';
  nsPlayStrokeAnim('nsTraceDemoCanvas', 'nsTracePencil', {
    color: '#ff8f3c',
    onDone: ()=>{
      setTimeout(()=>{
        const c = document.getElementById('nsTraceDemoCanvas');
        if(c){ c.getContext('2d').clearRect(0,0,c.width,c.height); c.style.opacity = '0'; }
      }, 300);
    }
  });
}

// ---------------- 3단계: 안내선 따라쓰기 ----------------
// 마이크 확인 설정: every(매번) / once(글자마다 첫 번째에만) / off(끔)
function nsMicGateActive(){
  const m = ns.settings.micMode;
  if(m === 'off') return false;
  if(m === 'once') return ns.traceRound === 0;
  return true;
}
function nsRenderTraceStage(){
  const gateOn = nsMicGateActive();
  // 이번 회차에 화면/음성에서 쓸 낱말을 한 번만 뽑아둡니다(둘이 서로 다른 낱말을 말하면 안 되므로).
  ns._promptWord = nsItem().promptWord;
  return `
    <div class="ns-trace-round">✍️ 따라쓰기 ${ns.traceRound+1} / ${NS_TRACE_REPEATS}</div>
    ${gateOn ? `
    <div class="ns-mic-gate" id="nsMicGate">
      <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
        <span>🎤 "${ns._promptWord}" 소리내어 말해볼까요?</span>
        <button class="pill ghost" id="nsRepeatPrompt" title="다시 듣기" aria-label="다시 듣기" style="padding:10px 14px; font-size:18px; line-height:1;">🔁</button>
      </div>
      <button class="pill alt ns-big-btn" id="nsMicBtn">🎙️ 말하기 시작</button>
      <div class="ns-mic-hint" id="nsMicHint"></div>
    </div>` : ''}
    <button class="pill ghost ns-big-btn" id="nsTraceReplayDemo">🔁 쓰는법 다시보기</button>
    <div class="ns-trace-wrap" id="nsTraceWrap" style="${gateOn?'opacity:.35; pointer-events:none;':''}">
      <canvas id="nsGuideCanvas" width="${NS_DEMO_CANVAS_W}" height="${NS_DEMO_CANVAS_H}"></canvas>
      <canvas id="nsDrawCanvas" width="${NS_DEMO_CANVAS_W}" height="${NS_DEMO_CANVAS_H}"></canvas>
      <canvas id="nsTraceDemoCanvas" width="${NS_DEMO_CANVAS_W}" height="${NS_DEMO_CANVAS_H}" style="position:absolute; top:0; left:0; opacity:0; pointer-events:none; transition:opacity .2s;"></canvas>
      <div class="ns-pencil" id="nsTracePencil"></div>
    </div>
    <div class="action-row">
      <button class="pill ghost ns-action-btn" id="nsClearTrace">↩️ 지우고 다시</button>
      <button class="pill alt ns-action-btn" id="nsCheckTrace">✅ 다 썼어요!</button>
    </div>
  `;
}
// 숫자 안내선은 진짜 글꼴(Jua)로 그리는데, 예전엔 글꼴이 다 받아지기 전에 그려서(첫 진입/오프라인)
// 기본 글꼴 모양이 나와 쓰는 법 애니메이션과 어긋날 수 있었습니다. 글꼴이 준비될 때까지
// (최대 2.5초) 기다린 뒤 그립니다.
function nsEnsureGuideFont(){
  if(!nsItem().useFontGuide || !document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.race([
    document.fonts.load(`bold 300px 'Jua'`, nsItem().glyph).catch(()=>{}),
    new Promise(r=> setTimeout(r, 2500)),
  ]);
}
function nsRenderGlyphGuide(ctx, W, H, text){
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = Math.floor(H * 0.82);
  ctx.font = `bold ${size}px 'Jua', sans-serif`;
  while(ctx.measureText(text).width > W * 0.86 && size > 40){
    size -= 6;
    ctx.font = `bold ${size}px 'Jua', sans-serif`;
  }
  ctx.fillStyle = 'rgba(46,35,80,.24)';
  ctx.fillText(text, W/2, H/2 + size*0.03);
  ctx.restore();
}
// 한글/영어 안내선: 획 데이터를 굵게 그려서 만듭니다(데모 애니메이션과 정확히 같은 모양).
function nsRenderStrokeGuide(ctx){
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(46,35,80,.2)';
  ctx.lineWidth = 34;
  nsGetStrokes().forEach(pts=>{
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  });
  ctx.restore();
}
function nsDrawGuide(ctx, W, H){
  if(nsItem().useFontGuide) nsRenderGlyphGuide(ctx, W, H, nsItem().glyph);
  else nsRenderStrokeGuide(ctx);
}
async function nsSetupTraceCanvases(){
  await nsEnsureGuideFont();
  const guide = document.getElementById('nsGuideCanvas');
  const draw = document.getElementById('nsDrawCanvas');
  if(!guide || !draw) return;
  const W = guide.width, H = guide.height;

  const gctx = guide.getContext('2d');
  gctx.clearRect(0,0,W,H);
  nsDrawGuide(gctx, W, H);

  // 채점용 마스크: 방금 그린 안내선의 픽셀(알파값이 있는 칸)을 성글게 스캔해서 사용합니다.
  const maskPixels = [];
  const STEP = 6;
  const gdata = gctx.getImageData(0,0,W,H).data;
  for(let y=0; y<H; y+=STEP){
    for(let x=0; x<W; x+=STEP){
      if(gdata[(y*W+x)*4+3] > 15) maskPixels.push([x,y]);
    }
  }
  ns._traceMask = maskPixels;
  // "안내선 근처" 판정용: 안내선을 사방으로 조금씩 밀어 여러 번 겹쳐 그려서(팽창) 약 18px
  // 여유를 둔 영역을 만듭니다. 그린 선이 이 영역 밖에 많으면 마구 문지른 것으로 봅니다.
  const nearCanvas = document.createElement('canvas');
  nearCanvas.width = W; nearCanvas.height = H;
  const nctx = nearCanvas.getContext('2d');
  [6, 12, 18].forEach(r=>{
    for(let k=0; k<16; k++){
      const a = k * Math.PI / 8;
      nctx.drawImage(guide, Math.cos(a)*r, Math.sin(a)*r);
    }
  });
  nctx.drawImage(guide, 0, 0);
  const ndata = nctx.getImageData(0,0,W,H).data;
  const near = new Uint8Array(W*H);
  for(let i=0;i<W*H;i++) near[i] = ndata[i*4+3] > 8 ? 1 : 0;
  ns._traceNear = near;

  const dctx = draw.getContext('2d');
  dctx.clearRect(0,0,W,H);
  dctx.lineCap = 'round'; dctx.lineJoin = 'round';
  dctx.strokeStyle = '#ff6b81';
  dctx.lineWidth = 16;
  ns._drawCtx = dctx;

  // 예전엔 단계마다 window에 pointerup 리스너를 새로 붙이고 떼지 않아 계속 쌓였습니다.
  // 이제는 캔버스 자체에 포인터를 붙잡아(setPointerCapture) 캔버스 핸들러만으로 처리합니다.
  let drawing = false;
  function toLocal(e){
    const rect = draw.getBoundingClientRect();
    return [ (e.clientX-rect.left) * (W/rect.width), (e.clientY-rect.top) * (H/rect.height) ];
  }
  draw.onpointerdown = (e)=>{
    e.preventDefault(); drawing = true;
    try{ draw.setPointerCapture(e.pointerId); }catch(err){}
    const [x,y] = toLocal(e);
    dctx.beginPath(); dctx.moveTo(x,y); dctx.lineTo(x+0.1,y+0.1); dctx.stroke();
  };
  draw.onpointermove = (e)=>{
    if(!drawing) return; e.preventDefault();
    const [x,y] = toLocal(e);
    dctx.lineTo(x,y); dctx.stroke();
  };
  draw.onpointerup = draw.onpointercancel = ()=>{ drawing = false; };
}
// 채점: (1) 안내선을 얼마나 덮었는지(coverage)와 (2) 그린 선이 얼마나 안내선 근처에 있는지
// (precision)를 함께 봅니다. 예전엔 (1)만 봐서 캔버스 전체를 마구 문질러도 100%로 통과됐습니다.
function nsCheckTrace(){
  const draw = document.getElementById('nsDrawCanvas');
  if(!draw || !ns._traceMask || !ns._traceMask.length) return { coverage:0, precision:0 };
  const W = draw.width, H = draw.height;
  const data = draw.getContext('2d').getImageData(0,0,W,H).data;
  const RADIUS = 10;
  let hit = 0;
  ns._traceMask.forEach(([mx,my])=>{
    let found = false;
    for(let dy=-RADIUS; dy<=RADIUS && !found; dy+=6){
      for(let dx=-RADIUS; dx<=RADIUS && !found; dx+=6){
        const x = mx+dx, y = my+dy;
        if(x<0||y<0||x>=W||y>=H) continue;
        if(data[(Math.floor(y)*W+Math.floor(x))*4+3] > 40) found = true;
      }
    }
    if(found) hit++;
  });
  let ink = 0, inkNear = 0;
  for(let y=0; y<H; y+=4){
    for(let x=0; x<W; x+=4){
      if(data[(y*W+x)*4+3] > 40){
        ink++;
        if(ns._traceNear && ns._traceNear[y*W+x]) inkNear++;
      }
    }
  }
  return { coverage: hit / ns._traceMask.length, precision: ink ? inkNear/ink : 0 };
}
function nsWireTraceStage(){
  nsSetupTraceCanvases();
  const replayBtn = document.getElementById('nsTraceReplayDemo');
  if(replayBtn) replayBtn.addEventListener('click', nsPlayTraceDemo);
  if(nsMicGateActive()){
    const micBtn = document.getElementById('nsMicBtn');
    if(micBtn) micBtn.addEventListener('click', nsStartMicCheck);
    const repeatBtn = document.getElementById('nsRepeatPrompt');
    if(repeatBtn) repeatBtn.addEventListener('click', nsSpeakTracePrompt);
    // 글을 못 읽는 아이를 위해 이 단계에 들어오면 안내 음성을 자동으로 한 번 들려줍니다.
    nsSpeakTracePrompt();
  }
  document.getElementById('nsClearTrace').addEventListener('click', ()=>{
    const draw = document.getElementById('nsDrawCanvas');
    if(draw && ns._drawCtx) ns._drawCtx.clearRect(0,0,draw.width,draw.height);
  });
  document.getElementById('nsCheckTrace').addEventListener('click', ()=>{
    const { coverage, precision } = nsCheckTrace();
    if(coverage >= NS_TRACE_COVERAGE_PASS && precision >= NS_TRACE_PRECISION_PASS){
      ns.traceRound++;
      playChime('pop');
      if(ns.traceRound >= NS_TRACE_REPEATS){
        ns.session.completed++;
        nsMarkLearned();
        updateNsProgress();
        renderNsStickers();
        nsGoStage('celebrate');
      } else {
        toast(`좋아요! (${Math.round(coverage*100)}%) 한 번 더 써볼까요!`);
        nsGoStage('trace');
      }
    } else if(coverage >= NS_TRACE_COVERAGE_PASS){
      toast('선 밖으로 너무 많이 나갔어요. 안내선을 따라 천천히 써볼까요?');
      nsSpeak('선을 따라 천천히 써볼까요?', 'ko-KR');
    } else {
      toast(`조금 더 진하게 따라 그려볼까요? (${Math.round(coverage*100)}%)`);
    }
  });
}

// ---------------- 마이크 확인(실제 발음 인식이 아니라 "소리를 냈는지"만 확인) ----------------
// 안드로이드 웹뷰에서는 정확한 음성인식(STT)이 불안정해서, 대신 마이크 음량이 문턱값을
// 넘는지만 확인합니다. 권한이 없거나 소리가 없어도 오래 막히지 않도록 항상 통과 경로를 둡니다.
function nsStartMicCheck(){
  const hint = document.getElementById('nsMicHint');
  const micBtn = document.getElementById('nsMicBtn');
  if(micBtn) micBtn.disabled = true;
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    toast('이 화면에서는 마이크를 쓸 수 없어요, 그냥 써볼까요!');
    if(hint) hint.textContent = '마이크가 지원되지 않는 환경이에요.';
    nsUnlockTrace();
    return;
  }
  const askedAt = performance.now();
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
    if(!nsIsActive()){ stream.getTracks().forEach(t=>t.stop()); return; }
    ns._micStream = stream;
    let actx;
    try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }
    catch(e){ nsStopMic(); if(hint) hint.textContent = '마이크를 쓸 수 없어요, 그냥 써볼까요!'; nsUnlockTrace(); return; }
    ns._micCtx = actx;
    const src = actx.createMediaStreamSource(stream);
    const analyser = actx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let elapsed = 0;
    // 처음 잠깐은 "조용한 상태의 잡음 크기(바닥소음)"만 측정하고, 그보다 확실히 커야 통과되게
    // 합니다. 같은 세션 안에서는 한 번 잰 값을 재사용해 두 번째부터는 바로 시작합니다.
    const CALIBRATE_FRAMES = 10;
    const cachedFloor = ns._noiseFloorCached;
    let calibSamples = [];
    let noiseFloor = cachedFloor != null ? cachedFloor : 0.02;
    let sustained = 0;
    const SUSTAIN_NEEDED = 6; // 약 0.1초 이상 계속 커야 "말했다"로 인정 (순간적인 딸깍 소리 등 오탐 방지)
    if(hint) hint.textContent = cachedFloor != null ? '🎤 지금 말해볼까요?' : '잠깐만요... 🤫';
    function tick(){
      if(!nsIsActive()){ nsStopMic(); return; }
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for(let i=0;i<data.length;i++){ const v = (data[i]-128)/128; sum += v*v; }
      const rms = Math.sqrt(sum/data.length);
      elapsed++;

      if(cachedFloor == null && elapsed <= CALIBRATE_FRAMES){
        calibSamples.push(rms);
        if(elapsed === CALIBRATE_FRAMES){
          const avg = calibSamples.reduce((a,b)=>a+b,0) / calibSamples.length;
          noiseFloor = avg;
          ns._noiseFloorCached = avg;
          if(hint) hint.textContent = '🎤 지금 말해볼까요?';
        }
        ns._micRAF = requestAnimationFrame(tick);
        return;
      }

      const threshold = Math.max(noiseFloor * 2.6, 0.09);
      if(rms > threshold) sustained++; else sustained = 0;

      if(sustained >= SUSTAIN_NEEDED){
        if(hint) hint.textContent = '아주 잘 들렸어요! 👍';
        nsStopMic();
        playChime('pop');
        nsUnlockTrace();
        return;
      }
      if(elapsed > CALIBRATE_FRAMES + 300){ // 약 5초 넘게 못 들으면 막히지 않게 그냥 통과
        if(hint) hint.textContent = '괜찮아요, 그냥 써볼까요!';
        nsStopMic();
        nsUnlockTrace();
        return;
      }
      ns._micRAF = requestAnimationFrame(tick);
    }
    tick();
  }).catch(()=>{
    // 아주 빨리 실패했다면(권한 팝업이 뜰 새도 없이) 앱의 마이크 권한이 꺼져 있을 가능성이 큽니다.
    const tooFast = (performance.now() - askedAt) < 250;
    const msg = tooFast ? '마이크 권한이 꺼져 있어요! (앱을 새로 설치했다면 다시 열 때 허용해주세요)' : '마이크를 쓸 수 없어요, 그냥 써볼까요!';
    toast(msg);
    if(hint) hint.textContent = msg;
    nsUnlockTrace();
  });
}
function nsUnlockTrace(){
  const wrap = document.getElementById('nsTraceWrap');
  const gate = document.getElementById('nsMicGate');
  if(wrap){ wrap.style.opacity = ''; wrap.style.pointerEvents = ''; }
  if(gate){ gate.style.display = 'none'; }
}
function nsStopMic(){
  if(ns._micRAF){ cancelAnimationFrame(ns._micRAF); ns._micRAF = null; }
  if(ns._micStream){ ns._micStream.getTracks().forEach(t=>t.stop()); ns._micStream = null; }
  if(ns._micCtx){ try{ ns._micCtx.close(); }catch(e){} ns._micCtx = null; }
}

// ---------------- 4단계: 칭찬 → 다음 글자 ----------------
const NS_PRAISES = ['참 잘했어요!', '최고예요!', '멋져요!', '대단해요!'];
let nsCelebrateTimer = null;
function nsRenderCelebrateStage(){
  ns._praise = NS_PRAISES[Math.floor(Math.random()*NS_PRAISES.length)];
  return `
    <div class="ns-celebrate-emoji">🎉</div>
    <b style="font-family:'Jua'; font-size:24px;">${ns._praise}</b>
    <div class="sub" style="margin:0;">${nsItem().glyph} 완성! ⭐ 스티커를 받았어요</div>
  `;
}

function nsWireStage(stage){
  if(stage==='reveal'){
    document.getElementById('nsPlaySound').addEventListener('click', nsSpeakNumber);
    document.getElementById('nsToDemo').addEventListener('click', ()=> nsGoStage('demo'));
    nsSpeakNumber();
  } else if(stage==='demo'){
    document.getElementById('nsReplayDemo').addEventListener('click', nsPlayDemo);
    document.getElementById('nsToTrace').addEventListener('click', ()=>{ ns.traceRound = 0; nsGoStage('trace'); });
    nsPlayDemo();
  } else if(stage==='trace'){
    nsWireTraceStage();
  } else if(stage==='celebrate'){
    celebrate();
    nsSpeak(ns._praise, 'ko-KR');
    clearTimeout(nsCelebrateTimer);
    nsCelebrateTimer = setTimeout(()=> nsNextNumber(), 1900);
  }
}

// ---------------- 설정(범위 · 순서 · 마이크 확인) ----------------
function openNumStudySettings(){
  const rangeOptions = (selected)=> Array.from({length:11},(_,i)=>`<option value="${i}" ${i===selected?'selected':''}>${i}</option>`).join('');
  const mode = ns.settings.mode === 'random' ? 'random' : 'sequential';
  const mic = ['every','once','off'].includes(ns.settings.micMode) ? ns.settings.micMode : 'every';
  const isNumber = ns.subject === 'number';
  const isHangul = ns.subject === 'hangul';
  const hset = nsHangulSet();
  showChoiceDialog(`
      <div>⚙️ ${nsSubject().title.replace(/^\S+\s/,'')} 설정</div>
      ${isNumber ? `
      <div class="ns-settings-row" style="margin-top:12px;">
        <label>범위</label>
        <select id="nsMin">${rangeOptions(ns.settings.rangeMin)}</select>
        <span>~</span>
        <select id="nsMax">${rangeOptions(ns.settings.rangeMax)}</select>
      </div>
      <div class="ns-settings-note">※ 지금은 0~10까지 배울 수 있어요.</div>` : ''}
      ${isHangul ? `
      <div class="ns-settings-row" style="flex-direction:column; align-items:flex-start; gap:8px; margin-top:12px;">
        <label style="font-weight:700;">배울 글자</label>
        <label class="ns-settings-toggle"><input type="radio" name="nsHangulSet" value="syllable" ${hset==='syllable'?'checked':''}> 가 나 다 라 (글자)</label>
        <label class="ns-settings-toggle"><input type="radio" name="nsHangulSet" value="consonant" ${hset==='consonant'?'checked':''}> ㄱ ㄴ ㄷ ㄹ (자음)</label>
      </div>` : ''}
      <div class="ns-settings-row" style="flex-direction:column; align-items:flex-start; gap:8px; margin-top:12px;">
        <label style="font-weight:700;">순서</label>
        <label class="ns-settings-toggle"><input type="radio" name="nsMode" value="sequential" ${mode==='sequential'?'checked':''}> 순서대로 (지난번 다음부터)</label>
        <label class="ns-settings-toggle"><input type="radio" name="nsMode" value="random" ${mode==='random'?'checked':''}> 무작위</label>
      </div>
      <div class="ns-settings-row" style="flex-direction:column; align-items:flex-start; gap:8px; margin-top:12px;">
        <label style="font-weight:700;">말하고 나서 쓰기 (마이크 확인)</label>
        <label class="ns-settings-toggle"><input type="radio" name="nsMic" value="every" ${mic==='every'?'checked':''}> 매번</label>
        <label class="ns-settings-toggle"><input type="radio" name="nsMic" value="once" ${mic==='once'?'checked':''}> 글자마다 한 번만</label>
        <label class="ns-settings-toggle"><input type="radio" name="nsMic" value="off" ${mic==='off'?'checked':''}> 끄기</label>
      </div>`,
    [{ label:'닫기', cls:'ghost', value:false }, { label:'저장', cls:'alt', value:true }],
    (v)=>{
      if(!v) return;
      if(isNumber){
        let mn = parseInt(document.getElementById('nsMin').value, 10);
        let mx = parseInt(document.getElementById('nsMax').value, 10);
        if(mn > mx){ const t = mn; mn = mx; mx = t; }
        ns.settings.rangeMin = mn; ns.settings.rangeMax = mx;
      }
      const modeInput = document.querySelector('input[name="nsMode"]:checked');
      ns.settings.mode = modeInput ? modeInput.value : 'sequential';
      const micInput = document.querySelector('input[name="nsMic"]:checked');
      ns.settings.micMode = micInput ? micInput.value : 'every';
      let hangulSetChanged = false;
      if(isHangul){
        const setInput = document.querySelector('input[name="nsHangulSet"]:checked');
        const next = setInput ? setInput.value : 'syllable';
        hangulSetChanged = next !== hset;
        ns.settings.hangulSet = next;
      }
      nsSaveSettings();
      if(hangulSetChanged){
        // 글자 묶음을 바꾸면 그 묶음에서 지난번에 배운 다음 글자부터 새로 시작합니다.
        const last = nsRecords.last[nsRecordKey()];
        ns.current = (last === undefined) ? null : last;
        ns.session = { completed:0 };
        nsNextNumber();
      }
      updateNsProgress();
      renderNsStickers();
      toast('설정을 저장했어요!');
    },
    { wide:true, vertical:false }
  );
}

// ---------------- 보상: 목표 개수 완주 시 고고다이노 영상 ----------------
// YouTube IFrame Player API로 (1) 재생 준비가 되면 재생시키고 전체화면 진입도 시도하고,
// (2) 영상이 끝나면(ENDED) 자동으로 정리하고 홈으로 돌아갑니다.
// 아이가 영상 속 링크/추천 영상/광고를 눌러 다른 곳으로 가지 않도록 영상 위에 투명한 막을
// 덮고(탭하면 재생/일시정지만 됨), 중간에 나가는 ✕ 버튼에는 간단한 보호자 확인을 겁니다.
let nsYTPlayer = null;
let nsYTApiLoading = false;
function nsLoadYouTubeAPI(cb){
  if(window.YT && window.YT.Player){ cb(); return; }
  const prevReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = ()=>{
    if(prevReady){ try{ prevReady(); }catch(e){} }
    cb();
  };
  if(!nsYTApiLoading && !document.getElementById('nsYtApiScript')){
    nsYTApiLoading = true;
    const tag = document.createElement('script');
    tag.id = 'nsYtApiScript';
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.onerror = ()=>{ nsYTApiLoading = false; toast('영상을 불러오지 못했어요. 인터넷 연결을 확인해주세요.'); };
    document.head.appendChild(tag);
  }
}
function nsTryFullscreen(el){
  if(!el) return;
  try{
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitEnterFullscreen || el.mozRequestFullScreen;
    if(req) Promise.resolve(req.call(el)).catch(()=>{}); // 실패해도 조용히 무시(영상은 이미 화면을 꽉 채움)
  }catch(e){}
}
function nsSetRewardPaused(paused){
  const tap = document.getElementById('nsRewardTap');
  if(tap) tap.classList.toggle('paused', !!paused);
}
function showNumberReward(){
  const vid = REWARD_VIDEOS[Math.floor(Math.random()*REWARD_VIDEOS.length)];
  const host = document.getElementById('nsRewardVideoHost');
  if(!host) return;
  document.getElementById('nsRewardTitle').textContent = NS_REWARD_TITLE;
  host.innerHTML = '<div id="nsYtPlayerEl"></div><button class="ns-reward-tap paused" id="nsRewardTap" aria-label="재생/일시정지"></button>';
  document.getElementById('nsRewardTap').addEventListener('click', ()=>{
    if(!nsYTPlayer || !nsYTPlayer.getPlayerState) return;
    const st = nsYTPlayer.getPlayerState();
    if(st === YT.PlayerState.PLAYING) nsYTPlayer.pauseVideo(); else nsYTPlayer.playVideo();
  });
  go('screen-numreward');
  celebrate({count:60});
  nsLoadYouTubeAPI(()=>{
    if(!nsIsRewardActive()) return; // API 로딩 중에 이미 닫았으면 재생하지 않음
    try{
      if(nsYTPlayer){ try{ nsYTPlayer.destroy(); }catch(e){} nsYTPlayer = null; }
      nsYTPlayer = new YT.Player('nsYtPlayerEl', {
        videoId: vid,
        playerVars: { autoplay:1, rel:0, playsinline:1, modestbranding:1, controls:0, disablekb:1, fs:0, iv_load_policy:3 },
        events: {
          onReady: (e)=>{ e.target.playVideo(); nsTryFullscreen(host); },
          onStateChange: (e)=>{
            if(e.data === YT.PlayerState.ENDED){ closeNumberReward(); return; }
            nsSetRewardPaused(e.data !== YT.PlayerState.PLAYING && e.data !== YT.PlayerState.BUFFERING);
          }
        }
      });
    }catch(e){
      // API 생성이 실패해도 최소한 영상은 보이도록 예전 방식의 iframe으로 대체합니다.
      host.innerHTML = `<iframe src="https://www.youtube.com/embed/${vid}?autoplay=1&rel=0&playsinline=1" title="고고다이노 공룡탐험대" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    }
  });
}
function nsIsRewardActive(){
  const el = document.getElementById('screen-numreward');
  return !!(el && el.classList.contains('active'));
}
// 보호자 확인: 간단한 덧셈 문제를 맞혀야 영상 중간에 나갈 수 있습니다.
function parentGate(onPass, reason){
  const a = 2 + Math.floor(Math.random()*7), b = 2 + Math.floor(Math.random()*7);
  const el = showChoiceDialog(`
      <div>👨‍👩‍👧 보호자 확인</div>
      <small>${reason || '계속하려면 보호자가 답을 입력해주세요.'}</small>
      <div class="parent-gate-q" style="margin-top:10px;">${a} + ${b} = ?</div>
      <input class="parent-gate-input" id="parentGateInput" type="number" inputmode="numeric" aria-label="답">`,
    [{ label:'취소', cls:'ghost', value:false }, { label:'확인', cls:'alt', value:true }],
    (v)=>{
      if(!v) return;
      const ans = parseInt((document.getElementById('parentGateInput')||{}).value, 10);
      if(ans === a + b) onPass();
      else toast('답이 달라요.');
    }, { vertical:false, modal:true });
  setTimeout(()=>{ const i = el.querySelector('#parentGateInput'); if(i) i.focus(); }, 80);
}
function requestCloseReward(){
  if(isDialogOpen()) return;
  parentGate(closeNumberReward, '영상을 끝까지 보면 자동으로 홈으로 돌아가요. 지금 나가려면 답을 입력해주세요.');
}
function closeNumberReward(){
  if(nsYTPlayer){ try{ nsYTPlayer.destroy(); }catch(e){} nsYTPlayer = null; }
  if(document.fullscreenElement){ try{ document.exitFullscreen(); }catch(e){} }
  closeDialog();
  const host = document.getElementById('nsRewardVideoHost');
  if(host) host.innerHTML = '';
  ns.session = { completed:0 };
  go('screen-home');
}

// ---------------------------------------------------------------- 보호자 안내 / 설정
function openParentHelp(){
  const est = (navigator.storage && navigator.storage.estimate) ? navigator.storage.estimate() : Promise.resolve(null);
  est.catch(()=>null).then(info=>{
    const usage = info && info.usage ? `${(info.usage/1024/1024).toFixed(1)}MB 사용 중` : '확인할 수 없음';
    showChoiceDialog(`
      <div>👨‍👩‍👧 보호자 안내</div>
      <div class="help-list">
        <div>🖍️ <b>크레용</b>은 문지른 자리만, <b>채우기</b>는 누른 부위 전체를 칠해요. 어느 쪽이든 선 밖으로는 번지지 않아요. ↶/↷로 되돌릴 수 있어요.</div>
        <div>🎨 <b>문양</b>도 색과 똑같이 칠해지고, 작은 무늬가 반복돼 원단처럼 보여요.</div>
        <div>🔄 헬리를 뺀 모든 친구는 <b>변신</b> 도안이 있어요. 변신 도안을 칠해서 저장한 친구는 트랙 모드에서 달릴 수 있어요.</div>
        <div>🌲 필드의 친구를 톡 누르면 인사하고, 끌면 자리를 옮겨요.</div>
        <div>📚 공부모드는 정해진 개수를 끝내면 고고다이노 영상이 나와요. 영상 중간에 나가려면 보호자 확인이 필요해요.</div>
        <div>💾 그림은 이 기기 안에만 저장돼요 (${usage}). 📤 버튼으로 사진/공유로 내보낼 수 있어요.</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px; margin-top:12px; font-size:14px;">
        <label class="ns-settings-toggle" style="justify-content:flex-start;"><input type="checkbox" id="voiceGuideToggle" ${voiceGuideOn?'checked':''}> 음성 안내 (버튼·이름 읽어주기)</label>
        <label class="ns-settings-toggle" style="justify-content:flex-start;"><input type="checkbox" id="bgmToggle" ${!bgmMuted?'checked':''}> 배경음악·효과음</label>
      </div>`,
      [{ label:'닫기', cls:'alt', value:true }],
      ()=>{
        const vg = document.getElementById('voiceGuideToggle');
        if(vg){ voiceGuideOn = vg.checked; try{ localStorage.setItem(VOICE_GUIDE_KEY, voiceGuideOn?'1':'0'); }catch(e){} }
        const bg = document.getElementById('bgmToggle');
        if(bg && bg.checked === bgmMuted) toggleBgmMute();
      }, { wide:true });
  });
}
