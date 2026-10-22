// ---------------------------------------------------------------- 트랙 모드 (Matter.js 물리 레이싱)
// 저장할 때 변신(차량) 폼이 있던 친구만 달릴 수 있습니다. 실제 물리 엔진(Matter.js) 위에서
// 차대+바퀴 두 개로 이루어진 차를 만들고, 사인파를 겹쳐 만든 구불구불한 언덕길 + 바위/상자
// 장애물을 배치합니다. 고속으로 급경사나 장애물에 부딪히면 스크립트로 흉내낸 게 아니라
// 실제 강체 충돌/회전으로 데굴데굴 구르고 튕겨 날아갑니다.
let track = null;      // {engine, world, car, obstacles, vImg, cw, ch, dpr, startX, stuckFrames, resizeHandler, dust, camXSmooth, camYSmooth}
let trackRAF = null;
let trackDrivePower = 0; // -1(좌) ~ 1(우), 조이스틱을 당긴 정도에 비례 (키보드/버튼은 -1/0/1로 씀)
const TRACK_WHEEL_SPEED = 0.62;
// 2026-09-12: 예전에는 바닥/장애물을 -6000~6000(±740m) 범위에 통째로 미리 깔아두고, 차가
// 그 밖으로 나가면 허공으로 떨어지는 문제를 "더 못 나가게 막는" 식으로 해결했습니다. 이번엔
// 아예 최대거리 제한을 없애서, 차 주변 일정 범위만 그때그때(청크 단위로) 바닥/장애물을
// 만들고, 멀리 뒤처진 청크는 정리(제거)하는 방식으로 바꿨습니다 - 그래서 원리상 얼마나
// 멀리 달리든 끝없이 이어집니다 (아래 trackUpdateChunks 참고). trackGroundY 자체가 x값에
// 상관없이 항상 지형 높이를 계산해주는 함수라 이 방식이 가능합니다.
const TRACK_CHUNK_SIZE = 1000;     // 청크(구간) 하나의 x축 너비
const TRACK_LOAD_RADIUS = 2600;    // 차 기준 이 거리 안의 청크는 항상 만들어져 있어야 함
const TRACK_UNLOAD_RADIUS = 4200;  // 이 거리보다 멀어진 청크는 정리(제거) - LOAD보다 넉넉히 커서 자주 만들었다 지웠다 하지 않게 함

// 청크별로 항상 같은 장애물 배치가 나오도록(다시 가까워졌을 때 배치가 바뀌어 보이지 않게)
// 청크 인덱스로 시드를 만든 결정론적 난수 생성기.
function trackSeededRandom(seed){
  let s = (seed >>> 0) || 1;
  return function(){
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---- 트랙 테마(필드와 같은 숲/바다/사막) + 최고 기록 ----
const TRACK_THEMES = {
  forest: { label:'🌲 숲길',   sky:['#bfe9ff','#eaf9ff'], sun:'#fff2c4', hills:['#bfe0c9','#9fd0ac'], ground:['#8fd48a','#4fae5f','#284f2c'], edge:'#2a6b3c', dust:'214,199,168' },
  ocean:  { label:'🌊 바닷가', sky:['#9fe3f5','#e6fbff'], sun:'#fff8de', hills:['#7fd0e6','#2fb8cf'], ground:['#f5e2b0','#e0c27f','#a8874a'], edge:'#b8975a', dust:'240,226,190' },
  desert: { label:'🏜️ 사막',   sky:['#ffe2a8','#fff5dc'], sun:'#fff1c4', hills:['#f3cf94','#e3ab6c'], ground:['#f0c982','#e0ad63','#a9713a'], edge:'#a9713a', dust:'230,196,140' },
};
const TRACK_PREFS_KEY = 'gogodino_track_v1';
let trackPrefs = { theme:'forest', bestDist:0, bestEggs:0 };
try{ Object.assign(trackPrefs, JSON.parse(localStorage.getItem(TRACK_PREFS_KEY) || '{}')); }catch(e){}
if(!TRACK_THEMES[trackPrefs.theme]) trackPrefs.theme = 'forest';
function saveTrackPrefs(){ try{ localStorage.setItem(TRACK_PREFS_KEY, JSON.stringify(trackPrefs)); }catch(e){} }

function openTrackPick(){
  renderTrackThemeRow();
  renderTrackPickGrid();
  go('screen-trackpick');
}
function renderTrackThemeRow(){
  const row = document.getElementById('trackThemeRow');
  row.innerHTML = Object.entries(TRACK_THEMES).map(([id,t])=>
    `<button class="theme-chip${trackPrefs.theme===id?' active':''}" role="radio" aria-checked="${trackPrefs.theme===id}" data-theme="${id}">${t.label}</button>`).join('');
  row.querySelectorAll('.theme-chip').forEach(b=> b.addEventListener('click', ()=>{
    trackPrefs.theme = b.dataset.theme; saveTrackPrefs(); renderTrackThemeRow();
    speak(TRACK_THEMES[b.dataset.theme].label.replace(/^\S+\s/, ''));
  }));
  const best = document.getElementById('trackBestLabel');
  best.textContent = trackPrefs.bestDist > 0 ? `🏆 최고 기록: ${trackPrefs.bestDist}m · 🥚 ${trackPrefs.bestEggs}개` : '🏆 아직 기록이 없어요. 첫 기록을 세워볼까요?';
}

function renderTrackPickGrid(){
  const grid = document.getElementById('trackPickGrid');
  const list = savedCharacters.filter(s=>s.vehicleImage);
  if(list.length===0){
    grid.innerHTML = `<div class="empty-cta"><div>변신할 수 있는 친구를 먼저 색칠하고 저장해주세요! (헬리 빼고 다 돼요)</div><button class="pill alt" onclick="openCharPick()">🖍️ 색칠하러 가기</button></div>`;
    return;
  }
  grid.innerHTML = list.map(s=>{
    const def = getDef(s.defId);
    const fr = def ? FRANCHISES[def.franchise] : null;
    return `
    <div class="char-thumb${fr?' has-fr':''}" role="button" tabindex="0" aria-label="${escapeHtml(s.name)}와 달리기" data-uid="${s.uid}" ${fr?`style="--fr-color:${fr.color};"`:''}>
      ${fr?`<span class="fr-chip" title="${fr.label}">${fr.emoji}</span>`:''}
      <img src="${s.vehicleImage}" alt="${escapeHtml(s.name)}">
      <span>${escapeHtml(s.name)}</span>
    </div>`;
  }).join('');
  grid.querySelectorAll('.char-thumb').forEach(el=>{
    el.addEventListener('click', ()=>{
      const snap = list.find(s=>s.uid===el.dataset.uid);
      if(snap) startTrack(snap);
    });
  });
}

// 지형 높낮이 함수: 출발점 주변은 평탄하고, 멀어질수록 여러 사인파가 겹쳐 굴곡이 커집니다.
// 좌/우가 서로 다른 위상을 쓰기 때문에 왼쪽과 오른쪽 트랙 모양이 다릅니다.
function trackGroundY(x){
  const ax = Math.abs(x);
  const flatEnd = 260;
  const t = Math.max(0, ax - flatEnd);
  const seed = x < 0 ? 2.3 : 0;
  const raw = 480
    + Math.sin(t/380 + seed) * 78
    + Math.sin(t/150 + 1.4 + seed) * 34
    + Math.sin(t/58 + 0.6 + seed) * 13;
  const fade = Math.min(1, t/260);
  return 480 + (raw - 480) * fade;
}

// 청크 하나 분량의 바닥(경사 지형 조각들)을 만듭니다. chunkIndex*TRACK_CHUNK_SIZE ~
// (chunkIndex+1)*TRACK_CHUNK_SIZE 구간만 담당합니다.
function buildTrackGroundChunk(world, chunkIndex){
  // 예전에는 구간(step)이 40px에 두께가 18px이라, 회전된 사각형 조각들이 이어지는
  // 경사가 급한 지점에서 조각과 조각 사이에 미세한 틈이 생겨 바퀴가 그 틈으로
  // "푹" 빠지는 버그가 있었습니다. 구간을 더 촘촘하게 나누고 두께를 훨씬 두껍게 해서
  // 조각 사이 틈을 사실상 없애고, 빠르게 움직이는 바퀴가 얇은 바닥을 뚫고 지나가는
  // 현상(터널링)도 함께 줄였습니다.
  const step = 22, thickness = 60;
  const xStart = chunkIndex * TRACK_CHUNK_SIZE, xEnd = xStart + TRACK_CHUNK_SIZE;
  const bodies = [];
  for(let x=xStart; x<xEnd; x+=step){
    const x0=x, x1=Math.min(x+step, xEnd);
    const y0=trackGroundY(x0), y1=trackGroundY(x1);
    const cx=(x0+x1)/2, cy=(y0+y1)/2;
    const len = Math.hypot(x1-x0, y1-y0) + 6;
    const angle = Math.atan2(y1-y0, x1-x0);
    const seg = Matter.Bodies.rectangle(cx, cy+thickness/2-2, len, thickness, {
      isStatic:true, angle, friction:0.95, frictionStatic:1, label:'ground'
    });
    bodies.push(seg);
  }
  Matter.World.add(world, bodies);
  return bodies;
}

// 청크 하나 분량의 장애물(돌/상자)을 만듭니다. 청크 인덱스로 시드를 고정한 난수를 써서,
// 같은 청크는 다시 만들어도(청크를 지웠다가 재생성해도) 항상 같은 배치가 나오게 합니다.
function buildTrackObstacleChunk(world, chunkIndex){
  // 예전에는 바위/상자가 너무 커서(반지름 15~30, 한 변 30~48) 차가 아예 못 넘어가고 계속
  // 튕겨 막히는 문제가 있었습니다. 크기를 확 줄이고 가볍게(밀도 낮춤) 만들어서 차가 밀고
  // 지나가거나 살짝 넘어갈 수 있게 하고, 상자는 모서리를 둥글려(chamfer) 바퀴가 덜 걸리게 했습니다.
  const xStart = chunkIndex * TRACK_CHUNK_SIZE, xEnd = xStart + TRACK_CHUNK_SIZE;
  const rand = trackSeededRandom(chunkIndex * 2654435761 + 12345);
  const bodies = [];
  for(let x=xStart; x<xEnd; x+=170){
    if(Math.abs(x) < 320) continue; // 출발 지점 근처는 항상 비워둠
    if(rand() < 0.5) continue;
    const gy = trackGroundY(x);
    let body;
    if(rand() < 0.5){
      const r = 7 + rand()*7;
      body = Matter.Bodies.circle(x, gy - r - 3, r, {
        restitution:0.45, friction:0.55, density:0.0012, label:'obstacle'
      });
    } else {
      const s = 15 + rand()*11;
      body = Matter.Bodies.rectangle(x, gy - s/2 - 3, s, s, {
        restitution:0.3, friction:0.6, density:0.0009, angle:(rand()-0.5)*0.5,
        label:'obstacle', chamfer:{radius:Math.min(5, s*0.18)}
      });
      body.customSize = s;
    }
    Matter.World.add(world, body);
    bodies.push(body);
  }
  return bodies;
}

// 공룡알(모으기 아이템): 물리 바디가 아니라 위치만 있는 장식이라 차를 막지 않고, 차체가
// 가까이 지나가면 "획득"됩니다. 일부는 공중에 떠 있어서 점프해야 먹을 수 있습니다.
// 청크를 지웠다가 다시 만들어도 이미 먹은 알이 되살아나지 않도록 "청크:번호" 키로 기억합니다.
function buildTrackEggChunk(chunkIndex){
  const xStart = chunkIndex * TRACK_CHUNK_SIZE, xEnd = xStart + TRACK_CHUNK_SIZE;
  const rand = trackSeededRandom(chunkIndex * 40503 + 777);
  const eggs = [];
  let k = 0;
  for(let x=xStart+60; x<xEnd; x+=125, k++){
    if(Math.abs(x) < 380) continue;
    if(rand() < 0.45) continue;
    const high = rand() < 0.35;
    const key = chunkIndex + ':' + k;
    if(track && track.collected.has(key)) continue;
    eggs.push({ key, x, y: trackGroundY(x) - (high ? 230 : 95), hue: Math.floor(rand()*6) });
  }
  return eggs;
}

// 차 위치를 기준으로 필요한 청크는 만들고, 너무 멀어진 청크는 정리합니다. 매 프레임 호출해도
// 가벼운 편(청크가 새로 필요할 때만 실제로 바디를 생성)이라 trackTick에서 매번 불러도 됩니다.
function trackUpdateChunks(){
  if(!track) return;
  const carX = track.car.chassis.position.x;
  const minChunk = Math.floor((carX - TRACK_LOAD_RADIUS) / TRACK_CHUNK_SIZE);
  const maxChunk = Math.floor((carX + TRACK_LOAD_RADIUS) / TRACK_CHUNK_SIZE);
  for(let ci=minChunk; ci<=maxChunk; ci++){
    if(track.chunks.has(ci)) continue;
    const groundBodies = buildTrackGroundChunk(track.world, ci);
    const obstacleBodies = buildTrackObstacleChunk(track.world, ci);
    const eggs = buildTrackEggChunk(ci);
    track.chunks.set(ci, { groundBodies, obstacleBodies, eggs });
    obstacleBodies.forEach(b=> track.obstacles.push(b));
  }
  const unloadMin = Math.floor((carX - TRACK_UNLOAD_RADIUS) / TRACK_CHUNK_SIZE);
  const unloadMax = Math.floor((carX + TRACK_UNLOAD_RADIUS) / TRACK_CHUNK_SIZE);
  for(const [ci, chunk] of Array.from(track.chunks.entries())){
    if(ci >= unloadMin && ci <= unloadMax) continue;
    Matter.World.remove(track.world, chunk.groundBodies);
    Matter.World.remove(track.world, chunk.obstacleBodies);
    if(chunk.obstacleBodies.length){
      const removeSet = new Set(chunk.obstacleBodies);
      track.obstacles = track.obstacles.filter(o=>!removeSet.has(o));
    }
    track.chunks.delete(ci);
  }
}

function buildTrackCar(world, x, y){
  // 2026-09-12: 캐릭터(차체) 그림을 2배로 키우면서, 물리적으로도 바퀴/차체를 똑같이 2배
  // 스케일했습니다 (바퀴 반지름 24->48, 차체 112x36->224x72, 축 위치도 함께 2배). 이렇게
  // 물리 크기와 그림 크기를 같은 비율로 맞춰야 그림과 실제 충돌 범위가 어긋나 보이지 않습니다.
  const group = Matter.Body.nextGroup(true);
  const chassis = Matter.Bodies.rectangle(x, y-64, 224, 72, {
    density:0.0018, friction:0.02, frictionAir:0.02, restitution:0.15,
    collisionFilter:{group}, label:'chassis', chamfer:{radius:14}
  });
  const wheelOpts = { density:0.0032, friction:1, frictionAir:0.012, restitution:0.25, collisionFilter:{group}, label:'wheel' };
  const wheelF = Matter.Bodies.circle(x+80, y-8, 48, wheelOpts);
  const wheelR = Matter.Bodies.circle(x-80, y-8, 48, wheelOpts);
  const axleF = Matter.Constraint.create({ bodyA:chassis, pointA:{x:80,y:52}, bodyB:wheelF, stiffness:0.5, damping:0.18, length:2 });
  const axleR = Matter.Constraint.create({ bodyA:chassis, pointA:{x:-80,y:52}, bodyB:wheelR, stiffness:0.5, damping:0.18, length:2 });
  Matter.World.add(world, [chassis, wheelF, wheelR, axleF, axleR]);
  return { chassis, wheelF, wheelR, axleF, axleR };
}

// 차가 뒤집혀서 못 일어나면(플립) 자동으로 하늘 위에서 새 차를 다시 만들어 떨어뜨립니다.
// (수동으로 "다시 출발" 버튼을 누를 필요 없이 자동 복구)
function respawnCarInPlace(){
  if(!track) return;
  const { chassis, wheelF, wheelR, axleF, axleR } = track.car;
  // 이제 트랙에 최대거리 제한이 없어서(청크가 계속 이어짐) 현재 위치 그대로 다시
  // 떨어뜨리면 됩니다 - 그 자리 주변 청크는 이미 만들어져 있으므로 바닥도 항상 있습니다.
  const atX = chassis.position.x;
  Matter.World.remove(track.world, [chassis, wheelF, wheelR, axleF, axleR]);
  const dropY = trackGroundY(atX) - 480; // 화면 위쪽에서 뚝 떨어지도록 지면보다 훨씬 높은 위치에서 재생성 (차 크기 2배에 맞춰 낙하 높이도 비례해서 키움)
  track.car = buildTrackCar(track.world, atX, dropY);
  track.groundContacts = 0;
  track.flipFrames = 0;
  trackToast('🔁 다시 출발!');
}

function recordTrackBest(){
  if(!track) return;
  let changed = false;
  if(track.maxDist > trackPrefs.bestDist){ trackPrefs.bestDist = track.maxDist; changed = true; }
  if(track.eggCount > trackPrefs.bestEggs){ trackPrefs.bestEggs = track.eggCount; changed = true; }
  if(changed) saveTrackPrefs();
}
function stopTrack(){
  recordTrackBest();
  if(trackRAF){ cancelAnimationFrame(trackRAF); trackRAF = null; }
  if(track && track.resizeHandler) window.removeEventListener('resize', track.resizeHandler);
  track = null;
  trackDrivePower = 0;
  stopEngineLoop();
}

function restartTrack(){
  if(track && track.snap) startTrack(track.snap);
}

async function startTrack(snap){
  stopTrack();
  document.getElementById('trackTitle').textContent = snap.name + ' 트랙 모드';
  go('screen-track');
  playTrackBGM();
  playEngineLoop();

  const errEl = document.getElementById('trackError');
  if(errEl) errEl.hidden = true;

  // 물리 엔진(Matter.js) 스크립트 로드가 실패하면(네트워크 문제, 회사/공용 와이파이의
  // 도메인 차단 등) Matter 전역 객체가 아예 없어서, 아래 코드가 조용히 실패하고
  // 캔버스가 텅 빈 채로(하늘색 배경만) 남는 문제가 있었습니다. 이제는 미리 확인해서
  // 사용자에게 분명한 안내 메시지를 보여줍니다.
  if(typeof Matter === 'undefined'){
    if(errEl) errEl.hidden = false;
    trackToast('😥 물리 엔진 로드 실패');
    return;
  }

  try{
    const canvas = document.getElementById('trackCanvas');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    function fitCanvas(){
      const rect = canvas.getBoundingClientRect();
      track_cw = rect.width; track_ch = rect.height;
      canvas.width = Math.max(1, Math.round(rect.width*dpr));
      canvas.height = Math.max(1, Math.round(rect.height*dpr));
      if(track){ track.cw = rect.width; track.ch = rect.height; track.dpr = dpr; }
    }
    let track_cw = 0, track_ch = 0;
    fitCanvas();
    const resizeHandler = ()=> fitCanvas();
    window.addEventListener('resize', resizeHandler);

    const engine = Matter.Engine.create();
    engine.gravity.y = 1;
    const world = engine.world;
    const startY = trackGroundY(0);
    const car = buildTrackCar(world, 0, startY);
    const vImg = await loadImage(snap.vehicleImage);
    if(currentScreenId() !== 'screen-track'){ window.removeEventListener('resize', resizeHandler); return; } // 불러오는 사이 나갔으면 중단

    track = {
      engine, world, car, obstacles: [], vImg, snap,
      cw: track_cw, ch: track_ch, dpr, startX: 0,
      flipFrames: 0, groundContacts: 0, jumpCooldown: 0, resizeHandler,
      dust: [], camXSmooth: null, camYSmooth: null,
      chunks: new Map(), // 청크 단위 무한 트랙 스트리밍 (trackUpdateChunks 참고)
      theme: TRACK_THEMES[trackPrefs.theme] || TRACK_THEMES.forest,
      collected: new Set(), eggCount: 0, nextMilestone: 100, maxDist: 0,
      lastTime: null, accumulator: 0,
    };
    trackUpdateChunks(); // 시작 지점(x=0) 주변 바닥/장애물을 미리 만들어둠

    // 바퀴가 지면과 닿아있는지 세어서(점프는 땅에 붙어 있을 때만 가능) "접지 상태"를 판정합니다.
    const isGroundPair = (a,b) => (a.label==='wheel' && b.label==='ground') || (b.label==='wheel' && a.label==='ground');
    Matter.Events.on(engine, 'collisionStart', (evt)=>{
      if(!track) return;
      evt.pairs.forEach(p=>{ if(isGroundPair(p.bodyA, p.bodyB)) track.groundContacts++; });
    });
    Matter.Events.on(engine, 'collisionEnd', (evt)=>{
      if(!track) return;
      evt.pairs.forEach(p=>{ if(isGroundPair(p.bodyA, p.bodyB)) track.groundContacts = Math.max(0, track.groundContacts-1); });
    });

    trackDrivePower = 0;
    updateTrackHud();
    trackRAF = requestAnimationFrame(trackTick);
  }catch(e){
    console.error('트랙 모드 초기화 실패:', e);
    if(errEl) errEl.hidden = false;
    trackToast('😥 트랙 로드 실패');
  }
}

const TRACK_JUMP_VY = -13.5;
const TRACK_JUMP_COOLDOWN = 22; // 프레임 단위 쿨다운(연속 점프 스팸 방지)

function applyTrackDriveInput(){
  if(!track) return;
  let power = Math.max(-1, Math.min(1, trackDrivePower));
  // 최대거리 제한이 없어졌으므로(청크가 계속 이어짐) 더 이상 가장자리에서 입력을 막을 필요가 없습니다.
  const target = TRACK_WHEEL_SPEED * power;
  [track.car.wheelF, track.car.wheelR].forEach(w=>{
    const next = w.angularVelocity + (target - w.angularVelocity) * 0.3;
    Matter.Body.setAngularVelocity(w, next);
  });
}

// 바퀴 그림을 없앤 대신, 땅에 붙어서 빠르게 달릴 때 뒷바퀴 쪽에서 흙먼지 입자를 뿜어
// "실제로 굴러가는" 느낌을 줍니다.
function spawnDustParticles(){
  if(!track) return;
  const { car } = track;
  const speed = Math.hypot(car.chassis.velocity.x, car.chassis.velocity.y);
  if(track.groundContacts <= 0 || speed < 1.4) return;
  const movingRight = car.chassis.velocity.x >= 0;
  const rear = movingRight ? car.wheelR : car.wheelF;
  const dir = movingRight ? -1 : 1;
  if(Math.random() < 0.65){
    track.dust.push({
      x: rear.position.x + dir*6 + (Math.random()-0.5)*6,
      y: rear.position.y + 12 + (Math.random()-0.5)*4,
      vx: dir*(0.5 + Math.random()*0.9),
      vy: -0.5 - Math.random()*0.7,
      life: 24 + Math.random()*10, maxLife: 34,
      size: 3.5 + Math.random()*4.5
    });
  }
}

function updateDustParticles(){
  if(!track) return;
  track.dust.forEach(p=>{ p.x += p.vx; p.y += p.vy; p.vy += 0.015; p.vx *= 0.98; p.life--; });
  if(track.dust.length) track.dust = track.dust.filter(p=>p.life > 0);
}

function drawDustParticles(ctx){
  if(!track) return;
  track.dust.forEach(p=>{
    const a = Math.max(0, p.life/p.maxLife) * 0.45;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${track.theme.dust},${a})`;
    ctx.fill();
  });
}

function trackJump(){
  if(!track) return;
  if(track.jumpCooldown > 0) return;
  if(track.groundContacts <= 0) return; // 공중에서는 점프 불가 - 바퀴가 땅에 닿아있을 때만
  const { chassis, wheelF, wheelR } = track.car;
  [chassis, wheelF, wheelR].forEach(b=>{
    Matter.Body.setVelocity(b, { x:b.velocity.x, y:TRACK_JUMP_VY });
  });
  track.jumpCooldown = TRACK_JUMP_COOLDOWN;
  trackToast('⤴️ 점프!');
  playSfx(SFX_JUMP, 0.55);
}

function trackToast(msg){
  const el = document.getElementById('trackToast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._hideT);
  el._hideT = setTimeout(()=> el.classList.remove('show'), 2200);
}

// 물리 시뮬레이션은 화면 주사율과 상관없이 "실제 시간" 기준 1/60초 단위로 진행합니다.
// 예전엔 화면 프레임마다 1/60초씩 진행해서, 120Hz 태블릿에서는 게임이 2배 빠르게 돌았습니다.
const TRACK_STEP_MS = 1000/60;
function trackTick(now){
  if(!track) return;
  if(now == null) now = performance.now();
  if(track.lastTime == null) track.lastTime = now;
  // 탭 전환 등으로 오래 멈췄다 돌아오면 한꺼번에 따라잡지 않도록 상한을 둡니다.
  track.accumulator += Math.min(100, now - track.lastTime);
  track.lastTime = now;
  updateEngineSound();
  let steps = 0;
  while(track && track.accumulator >= TRACK_STEP_MS && steps < 6){
    track.accumulator -= TRACK_STEP_MS;
    steps++;
    trackFixedStep();
  }
  if(!track) return;
  drawTrack();
  updateTrackHud();
  trackRAF = requestAnimationFrame(trackTick);
}

// 1/60초 한 칸 분량의 시뮬레이션. 한 칸을 다시 더 작은 두 스텝으로 나눠 계산해서 빠르게
// 떨어지거나 달릴 때 바퀴가 얇은 바닥을 뚫고 지나가는(터널링) 현상을 줄입니다.
function trackFixedStep(){
  applyTrackDriveInput();
  Matter.Engine.update(track.engine, TRACK_STEP_MS/2);
  Matter.Engine.update(track.engine, TRACK_STEP_MS/2);
  trackUpdateChunks(); // 차가 이동한 만큼 앞쪽 청크를 새로 만들고, 멀어진 뒤쪽 청크는 정리
  if(track.jumpCooldown > 0) track.jumpCooldown--;
  spawnDustParticles();
  updateDustParticles();
  collectTrackEggs();

  // 뒤집힘 자동 복구: 차체가 거의 뒤집힌 각도(대략 115도 이상 기운 상태)로 한동안
  // 회복하지 못하면, 사용자가 버튼을 누르지 않아도 자동으로 하늘에서 새 차가 떨어집니다.
  const angleNorm = Math.atan2(Math.sin(track.car.chassis.angle), Math.cos(track.car.chassis.angle));
  const flippedOver = Math.abs(angleNorm) > 2.0;
  const settling = Math.abs(track.car.chassis.angularVelocity) < 0.05;
  if(flippedOver && settling) track.flipFrames++;
  else track.flipFrames = 0;
  if(track.flipFrames >= 50) respawnCarInPlace();

  // 안전망: 그래도 혹시 바닥 틈으로 빠져서 지형선보다 한참 아래로 꺼졌다면
  // (터널링/물리 이상 등 어떤 이유로든) 자동으로 원래 위치 위에서 다시 떨어뜨려
  // 화면 밖/땅속에 갇히는 일이 없도록 합니다.
  const gY = trackGroundY(track.car.chassis.position.x);
  if(track.car.chassis.position.y > gY + 140){
    respawnCarInPlace();
  }

  // 거리 기록 + 100m마다 축하
  const dist = Math.round(Math.abs(track.car.chassis.position.x - track.startX)/8);
  if(dist > track.maxDist) track.maxDist = dist;
  if(track.maxDist >= track.nextMilestone){
    showTrackMilestone(`${track.nextMilestone}m 돌파! 🎉`);
    track.nextMilestone += 100;
  }
}

function collectTrackEggs(){
  const c = track.car.chassis.position;
  track.chunks.forEach(chunk=>{
    if(!chunk.eggs || !chunk.eggs.length) return;
    chunk.eggs = chunk.eggs.filter(egg=>{
      if(Math.abs(egg.x - c.x) < 120 && Math.abs(egg.y - c.y) < 95){
        track.collected.add(egg.key);
        track.eggCount++;
        playChime('coin');
        if(track.eggCount % 10 === 0) showTrackMilestone(`🥚 ${track.eggCount}개 모았어요!`);
        return false;
      }
      return true;
    });
  });
}

function showTrackMilestone(text){
  const wrap = document.querySelector('#screen-track .track-wrap');
  if(!wrap) return;
  let el = document.getElementById('trackMilestone');
  if(!el){ el = document.createElement('div'); el.id = 'trackMilestone'; el.className = 'track-milestone'; wrap.appendChild(el); }
  el.textContent = text;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(()=> el.classList.remove('show'), 1400);
  playChime('fanfare');
}

const EGG_COLORS = ['#ffd54f','#8be24a','#7fd0ff','#ff9fb8','#c99bff','#ffb347'];
function drawTrackEggs(ctx, camX, W){
  const t = performance.now()/1000;
  track.chunks.forEach(chunk=>{
    (chunk.eggs || []).forEach(egg=>{
      if(Math.abs(egg.x - camX) > W/2 + 80) return;
      const bob = Math.sin(t*3 + egg.x*0.01) * 5;
      ctx.save();
      ctx.translate(egg.x, egg.y + bob);
      ctx.beginPath(); ctx.ellipse(0, 0, 15, 19, 0, 0, Math.PI*2);
      ctx.fillStyle = '#fffaf0'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#7a5a2a'; ctx.stroke();
      ctx.fillStyle = EGG_COLORS[egg.hue % EGG_COLORS.length];
      [[-6,-6,4],[5,2,5],[-3,9,3]].forEach(([dx,dy,r])=>{ ctx.beginPath(); ctx.arc(dx,dy,r,0,Math.PI*2); ctx.fill(); });
      ctx.restore();
    });
  });
}

function drawParallaxHills(ctx, camX, W, H){
  const theme = track.theme;
  ctx.save();
  ctx.fillStyle = theme.sun;
  ctx.beginPath(); ctx.arc(W*0.8, H*0.2, Math.min(W,H)*0.1, 0, Math.PI*2); ctx.fill();
  [[0.32,theme.hills[0]],[0.58,theme.hills[1]]].forEach(([par,color])=>{
    const off = -camX*par;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for(let px=0; px<=W; px+=24){
      const wx = px - off;
      const y = H*0.6 + Math.sin(wx*0.004)*H*0.06 + Math.sin(wx*0.011+1)*H*0.03;
      ctx.lineTo(px, y);
    }
    ctx.lineTo(W,H); ctx.closePath();
    ctx.globalAlpha=.6; ctx.fillStyle=color; ctx.fill(); ctx.globalAlpha=1;
  });
  ctx.restore();
}

function drawTrackGroundPath(ctx, camX, W, H){
  const left = camX - W/2 - 80, right = camX + W/2 + 80;
  ctx.beginPath();
  ctx.moveTo(left, trackGroundY(left));
  for(let x=left; x<=right; x+=16) ctx.lineTo(x, trackGroundY(x));
  ctx.lineTo(right, camX+900); ctx.lineTo(left, camX+900);
  ctx.closePath();
  const g = track.theme.ground;
  const grad = ctx.createLinearGradient(0,300,0,900);
  grad.addColorStop(0,g[0]); grad.addColorStop(.18,g[1]); grad.addColorStop(1,g[2]);
  ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(left, trackGroundY(left));
  for(let x=left; x<=right; x+=16) ctx.lineTo(x, trackGroundY(x));
  ctx.strokeStyle = track.theme.edge; ctx.lineWidth = 6; ctx.lineJoin='round'; ctx.stroke();
}

function drawTrackObstacle(ctx, o){
  ctx.save();
  ctx.translate(o.position.x, o.position.y);
  ctx.rotate(o.angle);
  if(o.circleRadius){
    ctx.beginPath(); ctx.arc(0,0,o.circleRadius,0,Math.PI*2);
    ctx.fillStyle = '#9a9aa2'; ctx.fill(); ctx.strokeStyle = '#5c5c66'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(-o.circleRadius*0.3,-o.circleRadius*0.3,o.circleRadius*0.32,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();
  } else {
    const s = o.customSize || 32;
    ctx.fillStyle = '#c98a4a'; ctx.fillRect(-s/2,-s/2,s,s);
    ctx.strokeStyle = '#7a4a26'; ctx.lineWidth = 3; ctx.strokeRect(-s/2,-s/2,s,s);
    ctx.beginPath(); ctx.moveTo(-s/2,0); ctx.lineTo(s/2,0); ctx.moveTo(0,-s/2); ctx.lineTo(0,s/2);
    ctx.strokeStyle = '#7a4a26'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();
}

function drawTrackCar(ctx, car, vImg){
  // 실제 그림(바퀴 없는 캐릭터 사진)과 물리 바퀴의 위치/크기가 안맞아 보이는 문제가 있어서
  // 바퀴는 그리지 않고(물리 시뮬레이션용 몸체는 그대로 유지) 차체 그림 하나만 부드럽게 그립니다.
  const c = car.chassis;
  ctx.save();
  ctx.translate(c.position.x, c.position.y);
  ctx.rotate(c.angle);
  const s = 256; // 물리 차체/바퀴를 2배로 키운 비율에 맞춰 그림도 2배 (128 -> 256)
  if(vImg) ctx.drawImage(vImg, -s/2, -s/2, s, s);
  ctx.restore();
}

function drawTrack(){
  const canvas = document.getElementById('trackCanvas');
  if(!canvas || !track) return;
  const ctx = canvas.getContext('2d');
  const W = track.cw, H = track.ch;
  if(W<=0 || H<=0) return;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(track.dpr, track.dpr);
  ctx.clearRect(0,0,W,H);

  // 카메라가 차에 딱 붙어서 고정되어 있으면 차가 그냥 화면 한가운데서 앞뒤로 흔들리는 것처럼 보입니다.
  // 진행 방향/속도에 따라 살짝 앞을 미리 보여주고(lookahead), 위치를 부드럽게 뒤쫓아가게(lerp) 만들어서
  // 실제로 달리는 듯한 자연스러운 카메라 움직임을 줍니다.
  const chassisX = track.car.chassis.position.x;
  const chassisY = track.car.chassis.position.y;
  const vx = track.car.chassis.velocity.x;
  const lookAhead = Math.max(-95, Math.min(95, vx*15));
  if(track.camXSmooth == null){ track.camXSmooth = chassisX; track.camYSmooth = chassisY; }
  // 안전장치: 차가 순간적으로 크게 떨어지거나(안전망 재출발 등) 카메라가 실제 위치와
  // 너무 멀어지면, 천천히 뒤쫓는 대신 바로 딱 붙여서 화면이 하늘색으로 오래 뒤덮이는
  // 어색한 순간이 생기지 않게 합니다.
  if(Math.abs(chassisY - track.camYSmooth) > 260) track.camYSmooth = chassisY;
  track.camXSmooth += ((chassisX + lookAhead) - track.camXSmooth) * 0.08;
  track.camYSmooth += (chassisY - track.camYSmooth) * 0.12;
  const camX = track.camXSmooth;
  const camY = track.camYSmooth;

  const skyGrad = ctx.createLinearGradient(0,0,0,H);
  skyGrad.addColorStop(0,track.theme.sky[0]); skyGrad.addColorStop(1,track.theme.sky[1]);
  ctx.fillStyle = skyGrad; ctx.fillRect(0,0,W,H);
  drawParallaxHills(ctx, camX, W, H);

  ctx.save();
  ctx.translate(W/2 - camX, H*0.56 - camY);
  drawTrackGroundPath(ctx, camX, W, H);
  track.obstacles.forEach(o=>{
    if(Math.abs(o.position.x - camX) < W/2 + 120) drawTrackObstacle(ctx, o);
  });
  drawTrackEggs(ctx, camX, W);
  drawDustParticles(ctx);
  drawTrackCar(ctx, track.car, track.vImg);
  ctx.restore();
}

function updateTrackHud(){
  const hud = document.getElementById('trackHud');
  if(!hud || !track) return;
  const dist = Math.round(Math.abs(track.car.chassis.position.x - track.startX)/8);
  const best = Math.max(trackPrefs.bestDist, track.maxDist);
  const text = `📏 ${dist}m   🥚 ${track.eggCount}   🏆 ${best}m`;
  if(hud.textContent !== text) hud.textContent = text;
}

function initTrackControls(){
  const joy = document.getElementById('joystick');
  const knob = document.getElementById('joystickKnob');
  const bJ = document.getElementById('btnJump');
  const maxR = 34;       // 조이스틱 손잡이가 움직일 수 있는 최대 반경(px)
  const deadZone = 6;    // 이 범위 안에서는 입력 없음으로 취급
  let pointerId = null;
  let jumpArmed = false; // 위로 쭉 당기는 제스처로 점프가 이미 발동됐는지(연타 방지)

  function setKnob(dx, dy){ knob.style.transform = `translate(${dx}px, ${dy}px)`; }
  function resetJoystick(){
    setKnob(0,0);
    trackDrivePower = 0;
    jumpArmed = false;
    joy.classList.remove('active');
  }
  function updateFromPoint(clientX, clientY){
    const rect = joy.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    const dx = clientX - cx, dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, maxR);
    const ang = Math.atan2(dy, dx);
    const kx = Math.cos(ang) * clamped, ky = Math.sin(ang) * clamped;
    setKnob(kx, ky);
    trackDrivePower = (clamped < deadZone) ? 0 : (kx / maxR);
    // 보너스 아이디어: 조이스틱을 위로 세게 쭉 당기면 점프도 함께 발동됩니다.
    if(ky < -maxR*0.7){
      if(!jumpArmed){ trackJump(); jumpArmed = true; }
    } else if(ky > -maxR*0.35){
      jumpArmed = false;
    }
  }

  // 조이스틱을 한 손가락으로 드래그하는 도중 다른 손가락으로 점프 버튼을 누르면(듀얼 터치),
  // 일부 안드로이드 웹뷰에서는 두 번째 손가락이 닿는 순간 Pointer Events의 setPointerCapture가
  // 첫 번째 손가락의 캡처를 취소(pointercancel)해버려 조이스틱이 원점으로 튕기는 문제가
  // 있었습니다("조이스틱 드래그 중 점프하면 초기화됨"). Pointer Events는 멀티터치일 때 이런
  // 캡처 충돌 버그가 웹뷰별로 있는 반면, 원시 Touch Events는 touch.identifier로 각 손가락을
  // 완전히 독립적으로 추적하기 때문에 이런 문제가 없습니다. 그래서 터치 입력은 Touch Events를
  // 우선 사용하고, 마우스(데스크톱 테스트용)만 기존 Pointer Events 경로로 처리합니다.
  function touchById(list, id){
    for(let i=0;i<list.length;i++){ if(list[i].identifier === id) return list[i]; }
    return null;
  }

  let touchId = null;
  joy.addEventListener('touchstart', (e)=>{
    e.preventDefault();
    if(touchId !== null) return; // 이미 다른 손가락이 조작 중이면 새 손가락은 무시
    const t = e.changedTouches[0];
    touchId = t.identifier;
    joy.classList.add('active');
    updateFromPoint(t.clientX, t.clientY);
  }, {passive:false});
  joy.addEventListener('touchmove', (e)=>{
    if(touchId === null) return;
    const t = touchById(e.changedTouches, touchId);
    if(!t) return;
    e.preventDefault();
    updateFromPoint(t.clientX, t.clientY);
  }, {passive:false});
  ['touchend','touchcancel'].forEach(evt=>{
    joy.addEventListener(evt, (e)=>{
      if(touchId === null) return;
      const t = touchById(e.changedTouches, touchId);
      if(!t) return; // 내가 추적하던 손가락이 뗀 게 아니라 "다른" 손가락 이벤트면 무시
      touchId = null;
      resetJoystick();
    }, {passive:false});
  });

  // 마우스(터치가 아닌 입력) 전용 - 터치는 위 Touch Events가 전담하므로 여기서는 건너뜁니다.
  joy.addEventListener('pointerdown', (e)=>{
    if(e.pointerType === 'touch') return;
    e.preventDefault();
    pointerId = e.pointerId;
    try{ joy.setPointerCapture(pointerId); }catch(err){}
    joy.classList.add('active');
    updateFromPoint(e.clientX, e.clientY);
  });
  joy.addEventListener('pointermove', (e)=>{
    if(e.pointerType === 'touch') return;
    if(pointerId === null || e.pointerId !== pointerId) return;
    e.preventDefault();
    updateFromPoint(e.clientX, e.clientY);
  });
  ['pointerup','pointercancel'].forEach(evt=>{
    joy.addEventListener(evt, (e)=>{
      if(e.pointerType === 'touch') return;
      if(pointerId !== null && e.pointerId !== pointerId) return;
      pointerId = null;
      resetJoystick();
    });
  });

  bJ.addEventListener('touchstart', (e)=>{ e.preventDefault(); trackJump(); }, {passive:false});
  bJ.addEventListener('pointerdown', (e)=>{
    if(e.pointerType === 'touch') return; // 터치는 위 touchstart가 전담(중복 발동 방지)
    e.preventDefault(); trackJump();
  });

  window.addEventListener('keydown', (e)=>{
    if(!document.getElementById('screen-track').classList.contains('active')) return;
    if(e.key==='ArrowLeft') trackDrivePower = -1;
    if(e.key==='ArrowRight') trackDrivePower = 1;
    if(e.key==='ArrowUp' || e.key===' ' || e.key==='Spacebar'){ e.preventDefault(); trackJump(); }
  });
  window.addEventListener('keyup', (e)=>{
    if(e.key==='ArrowLeft' && trackDrivePower < 0) trackDrivePower = 0;
    if(e.key==='ArrowRight' && trackDrivePower > 0) trackDrivePower = 0;
  });
}
