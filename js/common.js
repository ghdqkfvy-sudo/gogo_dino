/* =========================================================================
   고고 컬러링 스튜디오
   스크립트는 화면별로 나뉘어 있고 index.html에서 아래 순서대로 불러옵니다
   (모두 일반 스크립트라 전역 함수/변수를 서로 공유합니다):
     common.js   - 토스트·확인창·축하 연출, 캐릭터/프랜차이즈 목록, 배경음악, 팔레트·문양
     coloring.js - 도안 분석(영역 자동 분리), 색칠 엔진, 화면 이동/뒤로가기, 저장·내보내기
     field.js    - 필드(숲/바다/사막) 장면과 갤러리, 저장소(IndexedDB)
     track.js    - 트랙 모드(Matter.js 물리 레이싱)
     study.js    - 공부모드(숫자/한글/영어), 음성 안내, 보상 영상, 보호자 안내
     main.js     - 앱 시작
   ========================================================================= */

// ---------------------------------------------------------------- 토스트 알림
function toast(msg){
  let host = document.getElementById('toastHost');
  if(!host){
    host = document.createElement('div');
    host.id = 'toastHost';
    document.body.appendChild(host);
  }
  const bubble = document.createElement('div');
  bubble.className = 'toast-bubble';
  bubble.textContent = msg;
  host.appendChild(bubble);
  requestAnimationFrame(()=>{ bubble.style.opacity = '1'; bubble.style.transform = 'translateY(0)'; });
  setTimeout(()=>{
    bubble.style.opacity = '0'; bubble.style.transform = 'translateY(8px)';
    setTimeout(()=> bubble.remove(), 320);
  }, 1700);
}

// 저장 버튼을 눌렀을 때는 화면 아래 작은 토스트보다 눈에 잘 띄도록, 화면 가운데에 크게
// "저장 완료!" 팝업을 잠깐 띄웁니다.
function showSaveConfirm(name, isUpdate){
  let el = document.getElementById('saveConfirmEl');
  if(!el){
    el = document.createElement('div');
    el.id = 'saveConfirmEl';
    el.className = 'save-confirm';
    document.body.appendChild(el);
  }
  el.innerHTML = `<div class="icon">✅</div><b>${escapeHtml(name)} ${isUpdate ? '수정 완료!' : '저장 완료!'}</b>`;
  el.classList.remove('show');
  void el.offsetWidth; // 재생 위해 강제 리플로우
  el.classList.add('show');
  clearTimeout(el._hideT);
  el._hideT = setTimeout(()=> el.classList.remove('show'), 1450);
}

// 공용 선택창: buttons = [{label, cls, value}] - 누른 버튼의 value로 onPick(value) 호출.
// 바깥(어두운 배경)을 누르면 닫히고 onPick(null)이 호출됩니다. message는 HTML로 그대로 들어가므로
// 직접 만든 문구만 넘깁니다(저장된 이름 등은 escapeHtml을 거친 값만).
function showChoiceDialog(message, buttons, onPick, opts){
  opts = opts || {};
  let el = document.getElementById('confirmOverlayEl');
  if(!el){
    el = document.createElement('div');
    el.id = 'confirmOverlayEl';
    document.body.appendChild(el);
  }
  el.className = 'confirm-overlay';
  if(el._handler){ el.removeEventListener('click', el._handler); el._handler = null; }
  const vertical = opts.vertical || buttons.length > 2;
  el.innerHTML = `
    <div class="confirm-card${opts.wide?' wide':''}" role="dialog" aria-modal="true">
      <div class="msg">${message}</div>
      <div class="${vertical?'sheet-actions':'confirm-btn-row'}">
        ${buttons.map((b,i)=>`<button class="pill ${b.cls||'ghost'}" style="flex:1" data-idx="${i}">${b.label}</button>`).join('')}
      </div>
    </div>`;
  requestAnimationFrame(()=> el.classList.add('show'));
  const close = (val)=>{
    el.classList.remove('show');
    el.removeEventListener('click', handler);
    el._handler = null;
    if(onPick) onPick(val);
  };
  const handler = (e)=>{
    const btn = e.target.closest('button[data-idx]');
    if(btn){ close(buttons[+btn.dataset.idx].value); return; }
    if(e.target === el && !opts.modal) close(null);
  };
  el._handler = handler;
  el.addEventListener('click', handler);
  const first = el.querySelector('button[data-idx]');
  if(first) setTimeout(()=>{ try{ first.focus({preventScroll:true}); }catch(e){} }, 50);
  return el;
}
function isDialogOpen(){
  const el = document.getElementById('confirmOverlayEl');
  return !!(el && el.classList.contains('show'));
}
function closeDialog(){
  const el = document.getElementById('confirmOverlayEl');
  if(!el || !el.classList.contains('show')) return;
  if(el._handler){ el.removeEventListener('click', el._handler); el._handler = null; }
  el.classList.remove('show');
}

// 삭제처럼 되돌릴 수 없는 동작 전에 "정말 할까요?" 한 번 더 물어보는 공용 확인창.
function showConfirmDialog(message, onYes, yesLabel){
  showChoiceDialog(message, [
    { label:'아니요', cls:'ghost', value:false },
    { label: yesLabel || '네, 삭제', cls:'danger', value:true },
  ], (v)=>{ if(v) onYes(); }, { vertical:false });
}

function escapeHtml(str){
  return String(str == null ? '' : str).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ---------------------------------------------------------------- 축하 연출(색종이 + 효과음)
// 효과음은 파일 없이 Web Audio로 짧게 합성합니다(저작권 걱정 없음, 오프라인에서도 동작).
let sfxCtx = null;
function sfxAudioCtx(){
  if(sfxCtx) return sfxCtx;
  try{ sfxCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ sfxCtx = null; }
  return sfxCtx;
}
function playChime(kind){
  if(bgmMuted) return;
  const ctx = sfxAudioCtx();
  if(!ctx) return;
  try{
    if(ctx.state === 'suspended') ctx.resume();
    const notes = kind === 'coin' ? [988, 1319] : kind === 'pop' ? [660] : [523, 659, 784, 1047];
    const gap = kind === 'coin' ? 0.07 : 0.11;
    notes.forEach((freq, i)=>{
      const t = ctx.currentTime + i*gap;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = kind === 'coin' ? 'square' : 'triangle';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(kind === 'coin' ? 0.08 : 0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'coin' ? 0.16 : 0.42));
      osc.connect(g).connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.5);
    });
  }catch(e){}
}
function celebrate(opts){
  opts = opts || {};
  playChime('fanfare');
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  const colors = ['#ff5c7a','#ffd54f','#8be24a','#4a7bf7','#a855f7','#2fb8cf','#f0a53d'];
  const n = opts.count || 46;
  for(let i=0;i<n;i++){
    const b = document.createElement('i');
    b.className = 'confetti-bit';
    b.style.left = (Math.random()*100) + 'vw';
    b.style.background = colors[i % colors.length];
    b.style.setProperty('--dx', ((Math.random()-0.5)*160) + 'px');
    b.style.setProperty('--rot', (Math.random()*720-360) + 'deg');
    b.style.animationDelay = (Math.random()*0.35) + 's';
    b.style.animationDuration = (1.2 + Math.random()*0.9) + 's';
    layer.appendChild(b);
  }
  document.body.appendChild(layer);
  setTimeout(()=> layer.remove(), 2600);
}

// ---------------------------------------------------------------- 캐릭터 카탈로그
// prunnnn.com / saegchil.co.kr 에서 받은 실제 고고다이노 도안(로봇 모드).
// 변신(차량) 모드 도안이 확보되면 vehicleSrc를 추가하면 자동으로 변신 버튼이 켜집니다.
const CHARACTERS = [
  {id:'rex',   name:'렉스',  src:'characters/rex.jpg',   vehicleSrc:'characters/rex_v.jpg',  franchise:'gogodino'},
  {id:'tomo',  name:'토모',  src:'characters/tomo.jpg',  vehicleSrc:'characters/tomo_v.jpg', franchise:'gogodino'},
  {id:'vicky', name:'비키',  src:'characters/vicky.jpg', vehicleSrc:'characters/vicky_v.jpg', franchise:'gogodino'},
  {id:'ping',  name:'핑',    src:'characters/ping.jpg',  vehicleSrc:'characters/ping_v.jpg', franchise:'gogodino'},
  {id:'loki',  name:'로키',  src:'characters/loki.jpg',  vehicleSrc:'characters/loki_v.jpg', franchise:'gogodino'},
  {id:'poki',  name:'포키',  src:'characters/poki.jpg',  vehicleSrc:'characters/poki_v.jpg', franchise:'gogodino'},
  {id:'anki',  name:'안키',  src:'characters/anki.jpg',  vehicleSrc:'characters/anki_v.jpg', franchise:'gogodino'},
  {id:'storm', name:'스톰',  src:'characters/storm.jpg', vehicleSrc:'characters/storm_v.jpg', franchise:'gogodino'},
  // 로보카폴리 4종 (2026-09-12 추가) - 헬리는 변신(차량) 모드 도안이 따로 없어 vehicleSrc 없음
  {id:'poli',  name:'폴리',  src:'characters/poli.jpg',  vehicleSrc:'characters/poli_v.jpg', franchise:'robocarpoli'},
  {id:'roy',   name:'로이',  src:'characters/roy.jpg',   vehicleSrc:'characters/roy_v.jpg',  franchise:'robocarpoli'},
  {id:'amber', name:'엠버',  src:'characters/amber.jpg', vehicleSrc:'characters/amber_v.jpg', franchise:'robocarpoli'},
  {id:'helly', name:'헬리',  src:'characters/helly.jpg', franchise:'robocarpoli'},
];

// 2026-09-12: 사용자가 직접 준 사진 두 장을 "항상 모든 필드(숲/바다/사막)에 기본으로 있는
// 친구"로 넣습니다. savedCharacters/fieldFriends(사용자가 색칠해서 저장한 캐릭터 목록)에는
// 안 들어가고 renderScene에서 매번 따로 더해서 보여주기만 하므로, 갤러리에 나타나지도
// 않고 "빼기/삭제" 버튼으로 지워지지도 않습니다(요청하신 대로 항상 고정 배치).
// aspectRatio(=가로/세로)를 넣어두면, 저장된 캐릭터들처럼 정사각형 틀에 억지로 끼워
// 넣지 않고 원본 사진 비율 그대로(옆으로 눌리지 않게) 자리 배치됩니다.
const DEFAULT_FIELD_FRIENDS = [
  { uid: 'default-kid-1', name: '까르르', image: 'characters/default_kid1.webp', aspectRatio: 229/495 },
  { uid: 'default-kid-2', name: '몬스터 옷', image: 'characters/default_kid2.webp', aspectRatio: 558/900 },
];
function getDef(id){ return CHARACTERS.find(c=>c.id===id); }

// 만화(프랜차이즈)별 구분용 메타데이터 - 실제 방송사 로고를 그대로 쓰는 대신, 저작권 문제 없이
// 한눈에 구분되는 색상 배지+이모지 조합을 씁니다. 나중에 진짜 엠블럼 이미지를 갖고 계시면
// emblemSrc를 추가해서 이모지 대신 그 이미지를 쓰도록 renderCharGrid 쪽만 살짝 바꾸면 됩니다.
const FRANCHISES = {
  gogodino:    { label:'고고다이노', emoji:'🦖', color:'#2f9e6f', tint:'#eafaf1' },
  robocarpoli: { label:'로보카폴리', emoji:'🚓', color:'#2f7fd1', tint:'#eaf3fc' },
};

// ---- 배경음악(BGM) / 효과음(SFX) ----
// 화면별로 곡을 매핑합니다. color/track의 실제 mp3는 사용자가 소장한 정식 음원(OST)을
// 받아서 넣었고, field(숲/바다/사막)와 track의 엔진음·점프음은 저작권 걱정 없는
// 자체 제작(합성) 사운드입니다. audio/ 폴더에 실제 파일이 있어야 재생됩니다.
const BGM_SOURCES = {
  color: { gogodino: 'audio/gogodino_ost.mp3', robocarpoli: 'audio/poli_ost.mp3' },
  field: { forest: 'audio/forest_ost.mp3', ocean: 'audio/ocean_ost.mp3', desert: 'audio/desert_ost.mp3' },
  track: { race: 'audio/track_ost.mp3' },
};
const BGM_SCREENS = new Set(['screen-color','screen-field','screen-track']);
const BGM_STORAGE_KEY = 'gogodino_bgm_muted_v1';
let bgmMuted = false;
try{ bgmMuted = localStorage.getItem(BGM_STORAGE_KEY) === '1'; }catch(e){}
let bgmFadeTimer = null;
let bgmCurrentPath = null;

function bgmEl(){ return document.getElementById('bgmPlayer'); }
function engineEl(){ return document.getElementById('enginePlayer'); }

function bgmClearFade(){ if(bgmFadeTimer){ clearInterval(bgmFadeTimer); bgmFadeTimer = null; } }

function bgmFadeTo(target, ms, thenPause){
  const el = bgmEl();
  if(!el) return;
  bgmClearFade();
  const start = el.volume;
  const steps = Math.max(1, Math.round(ms/40));
  let i = 0;
  bgmFadeTimer = setInterval(()=>{
    i++;
    el.volume = Math.max(0, Math.min(1, start + (target-start) * (i/steps)));
    if(i >= steps){
      bgmClearFade();
      el.volume = target;
      if(thenPause && target === 0){ el.pause(); }
    }
  }, 40);
}

// 같은 곡(path)이 이미 재생 중이면 그대로 이어가고(처음부터 다시 재생하지 않음),
// 다른 곡으로 바뀔 때만 페이드 아웃 없이 부드럽게 전환합니다.
function playBGM(path, vol){
  const el = bgmEl();
  if(!el || !path) return;
  vol = vol == null ? 0.32 : vol;
  if(bgmCurrentPath === path && !el.paused){ bgmClearFade(); bgmFadeTo(bgmMuted?0:vol, 200); return; }
  bgmCurrentPath = path;
  bgmClearFade();
  el.pause();
  el.src = path;
  el.currentTime = 0;
  el.loop = true;
  el.volume = 0;
  if(!bgmMuted){
    el.play().then(()=> bgmFadeTo(vol, 500)).catch(()=>{ /* 자동재생이 막혔다면 음소거 버튼으로 다시 시도 가능 */ });
  }
}

function playFranchiseBGM(franchise){ playBGM(BGM_SOURCES.color[franchise], 0.35); }
function playFieldBGM(field){ playBGM(BGM_SOURCES.field[field], 0.28); }
function playTrackBGM(){ playBGM(BGM_SOURCES.track.race, 0.3); }

function stopBGM(){
  const el = bgmEl();
  if(!el) return;
  bgmCurrentPath = null;
  bgmFadeTo(0, 400, true);
}

function toggleBgmMute(){
  bgmMuted = !bgmMuted;
  try{ localStorage.setItem(BGM_STORAGE_KEY, bgmMuted ? '1' : '0'); }catch(e){}
  updateBgmButtons();
  const el = bgmEl();
  if(el){
    if(bgmMuted){ bgmFadeTo(0, 250); }
    else if(bgmCurrentPath){
      if(el.paused){ el.volume = 0; el.play().then(()=>bgmFadeTo(0.32,300)).catch(()=>{}); }
      else bgmFadeTo(0.32, 300);
    }
  }
  const eEl = engineEl();
  if(eEl && bgmMuted) eEl.volume = 0;
}

function updateBgmButtons(){
  document.querySelectorAll('.bgm-toggle-btn').forEach(b=>{ b.textContent = bgmMuted ? '🔇' : '🔊'; });
}

document.addEventListener('visibilitychange', ()=>{
  const el = bgmEl();
  const eEl = engineEl();
  if(document.hidden){
    if(el && bgmCurrentPath) el.pause();
    if(eEl) eEl.pause();
  }else{
    if(!bgmMuted){
      if(el && bgmCurrentPath) el.play().catch(()=>{});
      if(eEl && track) eEl.play().catch(()=>{});
    }
  }
});

// ---- 트랙 모드 전용: 엔진 루프음 + 점프 효과음 (전부 자체 제작 합성 사운드) ----
const SFX_JUMP = 'audio/jump.mp3';
const ENGINE_LOOP_SRC = 'audio/engine_loop.mp3';

function playEngineLoop(){
  const el = engineEl();
  if(!el) return;
  el.src = ENGINE_LOOP_SRC;
  el.loop = true;
  el.currentTime = 0;
  el.playbackRate = 0.75;
  el.volume = bgmMuted ? 0 : 0.12;
  if(!bgmMuted) el.play().catch(()=>{});
}

function stopEngineLoop(){
  const el = engineEl();
  if(!el) return;
  el.pause();
  el.currentTime = 0;
}

// trackTick()에서 매 프레임 호출 - 차 속도에 맞춰 엔진음 피치/음량을 부드럽게 변화시킵니다.
function updateEngineSound(){
  if(!track) return;
  const el = engineEl();
  if(!el) return;
  const speed = Math.hypot(track.car.chassis.velocity.x, track.car.chassis.velocity.y);
  const n = Math.max(0, Math.min(1, speed/9));
  el.playbackRate = 0.75 + n*1.15;
  const target = bgmMuted ? 0 : (0.12 + n*0.28);
  el.volume += (target - el.volume) * 0.2;
}

// 짧은 효과음은 겹쳐 재생될 수 있어(연속 점프 등) 매번 새 Audio를 만들어 재생합니다.
function playSfx(path, vol){
  if(bgmMuted) return;
  try{
    const a = new Audio(path);
    a.volume = vol == null ? 0.6 : vol;
    a.play().catch(()=>{});
  }catch(e){}
}

const PALETTE = [
  '#ff2d55','#ff5c7a','#ff8fab','#ffb3c6',           // 빨강·핑크
  '#ff9f43','#ffb347','#ffd58a',                     // 주황
  '#ffe15a','#fff2a8','#f7d64c',                     // 노랑
  '#8be24a','#5fbf5f','#2f9e56','#bff0a0',           // 초록
  '#3ec6e0','#7fe0d0','#00c896',                     // 청록·민트
  '#4a7bf7','#7aa8ff','#2453c4',                     // 파랑
  '#a855f7','#c99bff','#7b3fb0',                     // 보라
  '#7a5230','#c08552',                               // 갈색
  '#2e2350','#6b6285',                                // 네이비
  '#ffffff','#e6e6e6','#c0c0c0','#4a4a4a','#111111', // 무채색
];

// 문양: 이제 "작은 타일 하나"를 그려서 반복(repeat)되는 진짜 무늬 원단처럼 만듭니다.
// 예전에는 영역의 가로세로 크기에 맞춰 하나의 그림을 늘려서 탭 한 번에 영역 전체를 채웠는데,
// 그러면 영역 크기마다 무늬가 다르게 늘어나 보여 부자연스러웠습니다. 지금은 색칠과 완전히 같은
// 크레용 붓질 방식으로 동작합니다 — 실제로 문지른 자리에만 무늬가 나타나고, 무늬 자체는
// 항상 같은 간격으로 반복되는 자그마한 프린트 패턴이라 자연스럽게 이어집니다.
function drawStarShape(ctx, cx, cy, outerR, innerR, points){
  ctx.beginPath();
  for(let i=0;i<points*2;i++){
    const r = i%2===0 ? outerR : innerR;
    const ang = i*Math.PI/points - Math.PI/2;
    const x = cx + Math.cos(ang)*r, y = cy + Math.sin(ang)*r;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath(); ctx.fill();
}
const PATTERNS = [
  {id:'pat-pinkheart', label:'핑크하트', bg:'#ffd1e6', fg:'#e63950',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     const cx=s*0.5, topY=s*0.36;
     ctx.fillStyle=this.fg; ctx.beginPath(); ctx.moveTo(cx, s*0.76);
     ctx.bezierCurveTo(cx-s*0.32, s*0.5, cx-s*0.32, topY, cx, topY+s*0.1);
     ctx.bezierCurveTo(cx+s*0.32, topY, cx+s*0.32, s*0.5, cx, s*0.76);
     ctx.closePath(); ctx.fill(); }},
  {id:'pat-skystar', label:'하늘별', bg:'#cdeaff', fg:'#ffcf3a',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.fillStyle=this.fg; drawStarShape(ctx, s*0.5, s*0.5, s*0.32, s*0.14, 5); }},
  {id:'pat-mintleaf', label:'민트잎', bg:'#c7f5df', fg:'#2fae6e',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.fillStyle=this.fg; ctx.save(); ctx.translate(s*0.5,s*0.5); ctx.rotate(-0.5);
     ctx.beginPath(); ctx.moveTo(0,-s*0.34);
     ctx.bezierCurveTo(s*0.3,-s*0.1, s*0.3,s*0.22, 0,s*0.34);
     ctx.bezierCurveTo(-s*0.3,s*0.22, -s*0.3,-s*0.1, 0,-s*0.34);
     ctx.closePath(); ctx.fill(); ctx.restore(); }},
  {id:'pat-dot', label:'물방울', bg:'#fff2c2', fg:'#ff9f43',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.fillStyle=this.fg; ctx.beginPath(); ctx.arc(s*0.5,s*0.5,s*0.22,0,Math.PI*2); ctx.fill(); }},
  {id:'pat-stripe', label:'줄무늬', bg:'#e7f3ff', fg:'#4a7bf7',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.strokeStyle=this.fg; ctx.lineWidth=s*0.26; ctx.lineCap='butt';
     for(let off=-s; off<=s*2; off+=s*0.5){
       ctx.beginPath(); ctx.moveTo(off,-s*0.5); ctx.lineTo(off+s*1.5,s*1.5); ctx.stroke();
     } }},
  {id:'pat-check', label:'체크무늬', bg:'#fff2e0', fg:'#f0a53d',
   draw(ctx,s){ const h=s/2; ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.fillStyle=this.fg; ctx.fillRect(0,0,h,h); ctx.fillRect(h,h,h,h); }},
  {id:'pat-flower', label:'꽃무늬', bg:'#fff0f6', fg:'#ff8fb3',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     const cx=s*0.5, cy=s*0.5, pr=s*0.15, dist=s*0.17;
     ctx.fillStyle=this.fg;
     for(let i=0;i<5;i++){ const ang=i*(Math.PI*2/5)-Math.PI/2;
       ctx.beginPath(); ctx.arc(cx+Math.cos(ang)*dist, cy+Math.sin(ang)*dist, pr, 0, Math.PI*2); ctx.fill(); }
     ctx.fillStyle='#ffe15a'; ctx.beginPath(); ctx.arc(cx,cy,pr*0.75,0,Math.PI*2); ctx.fill(); }},
  {id:'pat-night', label:'별밤', bg:'#2b2a5c', fg:'#ffe9a8',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.fillStyle=this.fg;
     drawStarShape(ctx, s*0.26, s*0.28, s*0.09, s*0.04, 4);
     drawStarShape(ctx, s*0.76, s*0.7, s*0.07, s*0.03, 4);
     ctx.save();
     ctx.beginPath(); ctx.arc(s*0.7, s*0.26, s*0.16, 0, Math.PI*2); ctx.fill();
     ctx.globalCompositeOperation='destination-out';
     ctx.beginPath(); ctx.arc(s*0.77, s*0.21, s*0.14, 0, Math.PI*2); ctx.fill();
     ctx.restore(); }},
  {id:'pat-rainbow', label:'무지개', bg:'#eaf6ff', fg:'#4a7bf7',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     const cx=s*0.5, cy=s*0.92;
     [['#ff5c7a',s*0.36],['#ffd54f',s*0.27],['#5fbf5f',s*0.18]].forEach(([color,r])=>{
       ctx.strokeStyle=color; ctx.lineWidth=s*0.08; ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,0); ctx.stroke();
     }); }},
  {id:'pat-zigzag', label:'지그재그', bg:'#fff6e0', fg:'#f0a53d',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.strokeStyle=this.fg; ctx.lineWidth=s*0.11; ctx.lineJoin='miter'; ctx.lineCap='round';
     const step=s/4;
     ctx.beginPath(); ctx.moveTo(-step, s*0.62);
     for(let x=-step, k=0; x<=s+step; x+=step, k++){ ctx.lineTo(x, k%2===0 ? s*0.38 : s*0.62); }
     ctx.stroke(); }},
  {id:'pat-paw', label:'발자국', bg:'#f3e3c8', fg:'#8a5a32',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.fillStyle=this.fg;
     ctx.beginPath(); ctx.ellipse(s*0.5,s*0.62,s*0.19,s*0.15,0,0,Math.PI*2); ctx.fill();
     [[-0.17,-0.18],[0,-0.26],[0.17,-0.18]].forEach(([dx,dy])=>{
       ctx.beginPath(); ctx.arc(s*0.5+dx*s, s*0.5+dy*s, s*0.075, 0, Math.PI*2); ctx.fill(); }); }},
  {id:'pat-argyle', label:'다이아무늬', bg:'#eef0ff', fg:'#7b3fb0',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.fillStyle=this.fg; ctx.save(); ctx.translate(s*0.5,s*0.5); ctx.rotate(Math.PI/4);
     ctx.fillRect(-s*0.22,-s*0.22,s*0.44,s*0.44); ctx.restore(); }},
  {id:'pat-honeycomb', label:'벌집무늬', bg:'#fff4d6', fg:'#e0a53d',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.strokeStyle=this.fg; ctx.lineWidth=s*0.06;
     ctx.beginPath();
     for(let i=0;i<6;i++){ const ang=i*Math.PI/3-Math.PI/2; const x=s*0.5+Math.cos(ang)*s*0.3, y=s*0.5+Math.sin(ang)*s*0.3;
       i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
     ctx.closePath(); ctx.stroke(); }},
  {id:'pat-space', label:'우주별', bg:'#241f4d', fg:'#ffe9a8',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.fillStyle='#8ec9ff'; ctx.beginPath(); ctx.arc(s*0.3,s*0.34,s*0.14,0,Math.PI*2); ctx.fill();
     ctx.strokeStyle='#ffd58a'; ctx.lineWidth=s*0.035; ctx.save(); ctx.translate(s*0.3,s*0.34); ctx.rotate(-0.3);
     ctx.beginPath(); ctx.ellipse(0,0,s*0.24,s*0.07,0,0,Math.PI*2); ctx.stroke(); ctx.restore();
     ctx.fillStyle=this.fg;
     drawStarShape(ctx, s*0.76, s*0.68, s*0.06, s*0.025, 4);
     drawStarShape(ctx, s*0.82, s*0.22, s*0.05, s*0.02, 4); }},
  {id:'pat-melon', label:'수박씨', bg:'#ffc2d1', fg:'#2e2350',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.fillStyle=this.fg;
     [[0.3,0.3],[0.68,0.42],[0.42,0.68],[0.75,0.78]].forEach(([fx,fy],i)=>{
       ctx.save(); ctx.translate(s*fx,s*fy); ctx.rotate(fx*3);
       ctx.beginPath(); ctx.ellipse(0,0,s*0.045,s*0.09,0,0,Math.PI*2); ctx.fill();
       ctx.restore(); }); }},
  {id:'pat-confetti', label:'색종이', bg:'#fffaf0', fg:'#ff5c7a',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     const colors=['#ff5c7a','#4a7bf7','#ffd54f','#8be24a','#a855f7'];
     [[0.2,0.25],[0.62,0.18],[0.8,0.55],[0.3,0.7],[0.55,0.85]].forEach((p,i)=>{
       ctx.fillStyle=colors[i%colors.length]; ctx.save(); ctx.translate(s*p[0], s*p[1]); ctx.rotate(i*0.9);
       ctx.fillRect(-s*0.05,-s*0.03,s*0.1,s*0.06); ctx.restore(); }); }},
  {id:'pat-flame', label:'화염', bg:'#ffe1c9', fg:'#ff6b35',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     const cx=s*0.5;
     ctx.fillStyle=this.fg;
     ctx.beginPath(); ctx.moveTo(cx, s*0.86);
     ctx.bezierCurveTo(cx-s*0.28, s*0.62, cx-s*0.16, s*0.34, cx, s*0.1);
     ctx.bezierCurveTo(cx+s*0.2, s*0.34, cx+s*0.26, s*0.6, cx, s*0.86);
     ctx.closePath(); ctx.fill();
     ctx.fillStyle='#ffd23f';
     ctx.beginPath(); ctx.moveTo(cx, s*0.8);
     ctx.bezierCurveTo(cx-s*0.13, s*0.6, cx-s*0.06, s*0.42, cx, s*0.3);
     ctx.bezierCurveTo(cx+s*0.09, s*0.42, cx+s*0.13, s*0.6, cx, s*0.8);
     ctx.closePath(); ctx.fill(); }},
  {id:'pat-ice', label:'얼음', bg:'#e2f6ff', fg:'#3fb8e8',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     const cx=s*0.5, cy=s*0.5, r=s*0.34;
     ctx.fillStyle=this.fg;
     ctx.beginPath();
     for(let i=0;i<6;i++){ const ang=i*Math.PI/3-Math.PI/2; const x=cx+Math.cos(ang)*r, y=cy+Math.sin(ang)*r;
       i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
     ctx.closePath(); ctx.fill();
     ctx.strokeStyle='#d8f4ff'; ctx.lineWidth=s*0.035; ctx.lineCap='round';
     for(let i=0;i<3;i++){ const ang=i*Math.PI/3-Math.PI/2;
       ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(ang)*r*0.8, cy+Math.sin(ang)*r*0.8); ctx.stroke(); }
     ctx.fillStyle='#ffffff'; ctx.globalAlpha=0.55;
     ctx.beginPath(); ctx.ellipse(cx-r*0.28, cy-r*0.3, r*0.22, r*0.12, -0.6, 0, Math.PI*2); ctx.fill();
     ctx.globalAlpha=1; }},
  {id:'pat-citrus', label:'오렌지속살', bg:'#fff0d6', fg:'#ff9a3c',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     const cx=s*0.5, cy=s*0.5, r=s*0.38, n=8;
     for(let i=0;i<n;i++){
       const a0=i*(Math.PI*2/n), a1=a0+Math.PI*2/n*0.82;
       ctx.fillStyle = i%2===0 ? this.fg : '#ffb266';
       ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,a0,a1); ctx.closePath(); ctx.fill();
     }
     ctx.fillStyle='#fff6e8'; ctx.beginPath(); ctx.arc(cx,cy,r*0.14,0,Math.PI*2); ctx.fill(); }},
  {id:'pat-kiwi', label:'키위속살', bg:'#eafbd0', fg:'#7fbf3f',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     const cx=s*0.5, cy=s*0.5;
     ctx.fillStyle=this.fg; ctx.beginPath(); ctx.arc(cx,cy,s*0.36,0,Math.PI*2); ctx.fill();
     ctx.fillStyle='#f7fbe0'; ctx.beginPath(); ctx.arc(cx,cy,s*0.16,0,Math.PI*2); ctx.fill();
     ctx.fillStyle='#3a2b1a';
     const n=9, r=s*0.255;
     for(let i=0;i<n;i++){ const ang=i*(Math.PI*2/n);
       ctx.save(); ctx.translate(cx+Math.cos(ang)*r, cy+Math.sin(ang)*r); ctx.rotate(ang+Math.PI/2);
       ctx.beginPath(); ctx.ellipse(0,0,s*0.016,s*0.038,0,0,Math.PI*2); ctx.fill(); ctx.restore(); } }},
  {id:'pat-strawberry', label:'딸기씨', bg:'#ff8fa3', fg:'#ffd93a',
   draw(ctx,s){ ctx.fillStyle=this.bg; ctx.fillRect(0,0,s,s);
     ctx.fillStyle=this.fg;
     [[0.22,0.24],[0.62,0.18],[0.42,0.42],[0.78,0.4],[0.3,0.62],[0.6,0.68],[0.85,0.78],[0.16,0.85]].forEach(([fx,fy],i)=>{
       ctx.save(); ctx.translate(s*fx,s*fy); ctx.rotate(i*0.9);
       ctx.beginPath(); ctx.ellipse(0,0,s*0.028,s*0.055,0,0,Math.PI*2); ctx.fill();
       ctx.restore(); }); }},
];
function findPattern(id){ return PATTERNS.find(p=>p.id===id); }

const PATTERN_TILE_SIZE = 40; // 문양 타일 한 칸 크기(분석 해상도 px 기준) — 어느 영역에서든 같은 간격으로 반복됩니다.
const patternTileCache = new Map();
function getPatternTile(patternId){
  if(patternTileCache.has(patternId)) return patternTileCache.get(patternId);
  const pat = findPattern(patternId);
  const tile = document.createElement('canvas');
  tile.width = PATTERN_TILE_SIZE; tile.height = PATTERN_TILE_SIZE;
  pat.draw(tile.getContext('2d'), PATTERN_TILE_SIZE);
  const entry = { canvas: tile, dataURL: tile.toDataURL('image/png') };
  patternTileCache.set(patternId, entry);
  return entry;
}
