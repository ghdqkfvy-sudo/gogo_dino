// ---------------------------------------------------------------- 이미지 분석(영역 자동 분리)
// JPG 라인아트를 불러와 "어두운 선 = 벽" 으로 보고, 벽으로 막히지 않은 영역들을
// 연결요소 라벨링(flood fill)으로 전부 분리합니다. 이후에는 클릭한 픽셀의 라벨만
// 조회하면 되므로, 어떤 모양이든(직선이든 복잡한 로봇 부품이든) 항상 정확한 경계를 지킵니다.
const analysisCache = {};

function loadImage(src){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    img.onload = ()=> resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 2026-09-13: 원본 도안 이미지들이 그림 주변에 남겨둔 흰 여백 비율이 캐릭터마다 서로 달라서
// (예: 로보카폴리 쪽은 프레임을 거의 꽉 채워 그려져 있고, 렉스·토모 등은 여백이 더 넓음),
// 색칠 화면에서 카드 폭에 꽉 채워 보여줘도 실제 캐릭터가 차지하는 크기가 서로 다르게
// 보였습니다. "비키 크기에 맞춰줘" 요청에 따라, 비키가 보여주는 여백 비율(그림이 프레임의
// 약 88%를 채우는 정도)을 기준으로 모든 캐릭터의 프레임을 이 콘텐츠 바운딩 박스 기준으로
// 다시 잘라/여백을 더해서 통일합니다 — 여백이 넓던 캐릭터는 살짝 크롭돼 커 보이고, 이미
// 꽉 차 있던 캐릭터는 살짝 여백이 더해져 작아 보이면서 다들 비슷한 크기로 맞춰집니다.
const CHAR_FRAME_TARGET_FILL = 0.88;
function findContentBBox(img){
  // 바운딩 박스만 찾으면 되므로 정밀도보다 속도를 위해 작게 축소해서 스캔합니다.
  const probeMax = 400;
  const pscale = Math.min(1, probeMax / Math.max(img.width, img.height));
  const pw = Math.max(1, Math.round(img.width*pscale)), ph = Math.max(1, Math.round(img.height*pscale));
  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = pw; probeCanvas.height = ph;
  const pctx = probeCanvas.getContext('2d', {willReadFrequently:true});
  pctx.fillStyle = '#ffffff'; pctx.fillRect(0,0,pw,ph);
  pctx.drawImage(img,0,0,pw,ph);
  const pdata = pctx.getImageData(0,0,pw,ph).data;
  // 2026-09-13: 처음엔 안티앨리어싱된 옅은 선까지 잡으려고 250(거의 흰색)으로 느슨하게
  // 잡았더니, 원본 JPG의 압축 잡티/미세한 배경 톤 차이(완전한 255가 아닌 부분)까지 "콘텐츠"로
  // 오인해서 바운딩 박스가 캔버스 전체에 가깝게 커지는 문제가 있었습니다(특히 고해상도
  // 원본에서 심함). 아래 wall 판정에 쓰는 것과 같은 기준(180)으로 통일해서 실제 선/그림
  // 부분만 정확히 잡히게 했습니다.
  const AA_THRESH = 180;
  let minx=pw, miny=ph, maxx=-1, maxy=-1;
  for(let y=0; y<ph; y++){
    for(let x=0; x<pw; x++){
      const i = (y*pw+x)*4;
      const lum = (pdata[i]+pdata[i+1]+pdata[i+2])/3;
      if(lum < AA_THRESH){
        if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y;
      }
    }
  }
  if(maxx<0) return {x0:0, y0:0, x1:img.width, y1:img.height}; // 못 찾으면(전부 흰 배경) 원본 그대로
  return { x0: minx/pscale, y0: miny/pscale, x1: (maxx+1)/pscale, y1: (maxy+1)/pscale };
}
async function loadAndAnalyze(defId, src){
  if(analysisCache[defId]) return analysisCache[defId];
  const img = await loadImage(src);

  const bbox = findContentBBox(img);
  const bboxW = bbox.x1 - bbox.x0, bboxH = bbox.y1 - bbox.y0;
  // 새 프레임 = 바운딩 박스 / 목표 채움비율. 목표비율이 1보다 작으므로 여백이 넓던 원본은
  // 프레임이 줄어들며 크롭되고(더 크게 보임), 이미 꽉 찬 원본은 프레임이 늘어나며 여백이
  // 더해집니다(더 작게 보임) — 어느 쪽도 콘텐츠 바운딩 박스 안쪽을 잘라내는 일은 없습니다.
  const frameW = bboxW / CHAR_FRAME_TARGET_FILL;
  const frameH = bboxH / CHAR_FRAME_TARGET_FILL;
  const ccx = (bbox.x0 + bbox.x1) / 2, ccy = (bbox.y0 + bbox.y1) / 2;
  const srcX = ccx - frameW/2, srcY = ccy - frameH/2;

  const maxDim = 560;
  const scale = Math.min(1, maxDim / Math.max(frameW, frameH));
  const w = Math.max(1, Math.round(frameW*scale));
  const h = Math.max(1, Math.round(frameH*scale));
  const lineCanvas = document.createElement('canvas');
  lineCanvas.width = w; lineCanvas.height = h;
  const lctx = lineCanvas.getContext('2d', {willReadFrequently:true});
  lctx.fillStyle = '#ffffff'; lctx.fillRect(0,0,w,h);
  // 소스 사각형(srcX,srcY,frameW,frameH)이 원본 이미지 경계를 벗어나도, 캔버스는 겹치는
  // 부분만 그리고 나머지는 위에서 미리 채운 흰 배경 그대로 남습니다.
  lctx.drawImage(img, srcX, srcY, frameW, frameH, 0, 0, w, h);

  const imageData = lctx.getImageData(0,0,w,h);
  const data = imageData.data;
  const THRESH = 180;
  const wall = new Uint8Array(w*h);
  for(let i=0;i<w*h;i++){
    const lum = (data[i*4]+data[i*4+1]+data[i*4+2])/3;
    if(lum < THRESH){
      wall[i] = 1;
    } else {
      wall[i] = 0;
      // 원본 JPG는 압축 잡티/미세한 톤 차이 때문에 "흰 배경"이라도 완전한 255가 아닐 수
      // 있습니다. 이 배경 위에 나중에 고른 색을 'multiply'로 겹치면 그 잡티만큼 색이
      // 칙칙하고 어둡게 보이고, 색깔 고르기 스와치와도 미묘하게 달라 보였습니다.
      // 여기서 선(=wall) 밖의 모든 픽셀을 완전한 흰색(255,255,255)으로 고정해서, 이후
      // multiply 합성 시 고른 색이 항상 스와치 색 그대로 보이도록 만듭니다.
      data[i*4] = 255; data[i*4+1] = 255; data[i*4+2] = 255;
    }
  }
  lctx.putImageData(imageData, 0, 0);

  const labelMap = new Int32Array(w*h).fill(-2);
  for(let i=0;i<w*h;i++) if(wall[i]) labelMap[i] = -1;
  let nextLabel = 0;
  const stack = [];
  for(let start=0; start<w*h; start++){
    if(labelMap[start] !== -2) continue;
    const label = nextLabel++;
    labelMap[start] = label; stack.push(start);
    while(stack.length){
      const cur = stack.pop();
      const cx = cur % w, cy = (cur / w) | 0;
      if(cx>0 && labelMap[cur-1]===-2){ labelMap[cur-1]=label; stack.push(cur-1); }
      if(cx<w-1 && labelMap[cur+1]===-2){ labelMap[cur+1]=label; stack.push(cur+1); }
      if(cy>0 && labelMap[cur-w]===-2){ labelMap[cur-w]=label; stack.push(cur-w); }
      if(cy<h-1 && labelMap[cur+w]===-2){ labelMap[cur+w]=label; stack.push(cur+w); }
    }
  }
  const bgLabel = labelMap[0]; // 좌상단은 항상 캐릭터 바깥 배경이라고 가정

  const analysis = {w, h, labelMap, lineCanvas, bgLabel, regionCount: nextLabel, maskCache: new Map()};
  analysisCache[defId] = analysis;
  return analysis;
}

// 라벨(영역) 하나의 알파마스크+바운딩박스를 만들어서 캐시해둡니다. 도형이 바뀌지 않는 한
// 같은 캐릭터를 다시 열어도 재사용되므로, 매 붓질마다 새로 스캔하지 않습니다.
function getRegionMask(analysis, label){
  if(analysis.maskCache.has(label)) return analysis.maskCache.get(label);
  const { w, h, labelMap } = analysis;
  let x0=w, y0=h, x1=-1, y1=-1;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w; maskCanvas.height = h;
  const mctx = maskCanvas.getContext('2d');
  const imgData = mctx.createImageData(w, h);
  for(let i=0;i<w*h;i++){
    if(labelMap[i]===label){
      imgData.data[i*4+3] = 255;
      const x = i % w, y = (i / w) | 0;
      if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;
    }
  }
  mctx.putImageData(imgData, 0, 0);
  const entry = (x1<0) ? null : { maskCanvas, x0, y0, w:(x1-x0+1), h:(y1-y0+1) };
  analysis.maskCache.set(label, entry);
  return entry;
}

// 캐릭터 "실루엣" 마스크: 배경 라벨(bgLabel)이 아닌 모든 픽셀(선 + 안쪽 영역 전부)을 불투명으로,
// 종이 바깥 여백은 투명으로 만듭니다. 필드/갤러리에 내보낼 때 하얀 여백이 같이 나가지 않도록 잘라내는 용도.
function getSilhouetteMask(analysis){
  if(analysis.silhouetteMask) return analysis.silhouetteMask;
  const { w, h, labelMap, bgLabel } = analysis;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w; maskCanvas.height = h;
  const mctx = maskCanvas.getContext('2d');
  const imgData = mctx.createImageData(w, h);
  for(let i=0;i<w*h;i++){
    imgData.data[i*4+3] = (labelMap[i]===bgLabel) ? 0 : 255;
  }
  mctx.putImageData(imgData, 0, 0);
  analysis.silhouetteMask = maskCanvas;
  return maskCanvas;
}

// ---------------------------------------------------------------- 색칠 상태 + 렌더링
// 색깔이든 문양이든 "coloring pages" 류 앱처럼 실제 크레용/도장으로 문지르듯 붓 자국이
// 쌓이는 방식으로 동작합니다. 도구는 세 가지입니다:
//   크레용(brush) - 문지른 자리만 칠함 / 채우기(fill) - 톡 누른 부위 전체를 한 번에 칠함 /
//   지우개(eraser) - 문지른 자리의 색을 지움. 어느 도구든 그 부위의 실제 선 밖으로는 번지지 않습니다.
let brushRadius = 20;          // 분석 해상도(가로 최대 560px) 기준 붓 반지름 - 가는 10 / 보통 20 / 굵은 34
let paintMode = 'brush';          // 'brush' | 'fill' | 'eraser'
const UNDO_LIMIT = 20;            // 되돌리기 최대 단계 (한 단계 = 붓질 한 번)

let currentChar = null;      // {defId, currentForm, forms, paintCanvas, editingUid, dirty}
let currentAnalysis = null;
let currentTool = {type:'color', value:PALETTE[0]};
let savedCharacters = [];    // {uid, defId, name, image(dataURL), vehicleImage, paintData}
let fieldFriends = {forest:[], ocean:[], desert:[]};
let currentField = 'forest';
// 색칠을 어디서 시작했는지 - 필드의 "+ 친구 추가"/"편집"에서 왔다면 저장 후 그 필드로 돌아갑니다.
let coloringOrigin = null;   // null | {type:'field', field}
let pendingFieldAddUid = null; // 저장 직후 "필드에 데려가기"를 고르면, 다음에 여는 필드에 자동으로 추가

function currentScreenId(){
  const el = document.querySelector('.screen.active');
  return el ? el.id : 'screen-home';
}

function go(id){
  if(id !== 'screen-field' && typeof stopFieldAnim === 'function') stopFieldAnim();
  if(id !== 'screen-track' && typeof track !== 'undefined' && track) stopTrack();
  if(!BGM_SCREENS.has(id)) stopBGM();
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(id !== 'screen-home') armHistory();
  window.scrollTo(0, 0);
}

// ---- 안드로이드 하드웨어 뒤로가기 ----
// 예전엔 화면 전환이 브라우저 기록(history)과 연결돼 있지 않아서, 뒤로가기 버튼을 누르면
// 이전 화면이 아니라 앱 자체가 바로 꺼졌습니다. 홈이 아닌 화면에 있을 때는 기록에 한 칸을
// 쌓아두고, 뒤로가기(popstate)가 오면 그 화면의 ← 버튼과 똑같은 동작을 한 뒤 다시 한 칸을
// 쌓아 둡니다. 홈 화면에서 누르면 평소처럼 앱을 나갑니다.
const BACK_ACTIONS = {
  'screen-charpick':   ()=> leaveCharPick(),
  'screen-color':      ()=> leaveColoring(),
  'screen-fieldselect':()=> go('screen-home'),
  'screen-field':      ()=> go('screen-fieldselect'),
  'screen-trackpick':  ()=> go('screen-home'),
  'screen-track':      ()=> { stopTrack(); go('screen-trackpick'); },
  'screen-numstudy':   ()=> exitNumberStudy(),
  'screen-numreward':  ()=> requestCloseReward(),
};
function armHistory(){
  try{
    if(!history.state || history.state.gogo !== 'app') history.pushState({gogo:'app'}, '');
  }catch(e){}
}
function handleBackPress(){
  if(isDialogOpen()){ closeDialog(); return true; }
  const act = BACK_ACTIONS[currentScreenId()];
  if(act){ act(); return true; }
  return false;
}
function initBackButton(){
  try{ history.replaceState({gogo:'root'}, ''); }catch(e){}
  window.addEventListener('popstate', ()=>{
    if(handleBackPress()){
      // 아직 홈이 아니면(혹은 확인창을 닫았으면) 다음 뒤로가기를 받을 수 있게 다시 한 칸 쌓음
      if(currentScreenId() !== 'screen-home' || isDialogOpen()) armHistory();
    }
  });
  // Capacitor App 플러그인이 있으면(APK) 하드웨어 버튼을 직접 받아서 처리합니다.
  try{
    const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if(App && App.addListener){
      App.addListener('backButton', ()=>{
        if(!handleBackPress() && currentScreenId() === 'screen-home' && App.exitApp) App.exitApp();
      });
    }
  }catch(e){}
}

// 홈 화면 카드를 눌렀을 때 살짝 커졌다 작아지는 "통통" 애니메이션을 잠깐 보여준 다음
// 화면을 전환합니다(전환 즉시 카드가 화면에서 사라지므로, 애니메이션이 눈에 보이려면
// 실제 이동 전에 아주 짧게 기다려야 합니다). 아직 글을 못 읽는 아이를 위해 카드 이름도 읽어줍니다.
function pressCard(el, fn){
  el.classList.remove('pop');
  void el.offsetWidth; // 강제 리플로우 - 같은 클래스를 다시 넣어도 애니메이션이 재생되게
  el.classList.add('pop');
  if(el.dataset.say) speak(el.dataset.say);
  setTimeout(fn, 170);
}

function openCharPick(origin){
  coloringOrigin = origin || null;
  go('screen-charpick');
}
function leaveCharPick(){
  if(coloringOrigin && coloringOrigin.type === 'field') openField(coloringOrigin.field);
  else go('screen-home');
}

function renderCharGrid(){
  const grid = document.getElementById('charGrid');
  // 애니메이션(프랜차이즈)별로 섹션을 나눠서, 어떤 만화 캐릭터인지 색깔 배지+테두리로
  // 한눈에 구분되게 그립니다. CHARACTERS 배열에 등장하는 순서대로 섹션을 만듭니다.
  const order = [];
  CHARACTERS.forEach(ch=>{ if(!order.includes(ch.franchise)) order.push(ch.franchise); });
  grid.innerHTML = order.map(fr=>{
    const meta = FRANCHISES[fr] || { label:fr, emoji:'✨', color:'#888', tint:'#f2f2f2' };
    const chars = CHARACTERS.filter(c=>c.franchise===fr);
    return `
    <div class="char-section" style="--fr-color:${meta.color}; --fr-tint:${meta.tint};">
      <div class="char-section-head">
        <span class="fr-badge">${meta.emoji}</span>
        <span class="fr-label">${meta.label}</span>
      </div>
      <div class="char-section-grid">
        ${chars.map(ch=>`
          <div class="char-thumb has-fr" role="button" tabindex="0" aria-label="${ch.name} 색칠하기" data-char="${ch.id}" style="--fr-color:${meta.color};">
            <img src="${ch.src}" alt="${ch.name}" loading="lazy">
            <span>${ch.name}</span>
          </div>`).join('')}
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('.char-thumb').forEach(el=>{
    el.addEventListener('click', ()=>{
      const def = getDef(el.dataset.char);
      speak(def.name);
      startColoring(def);
    });
  });
}

function blankPaintCanvas(analysis){
  const c = document.createElement('canvas');
  c.width = analysis.w; c.height = analysis.h;
  return c;
}

// resumeSnap을 넘기면 예전에 저장했던 붓칠 레이어를 그대로 복원해서 "이어서 칠하기"가 됩니다.
async function startColoring(def, resumeSnap){
  document.getElementById('colorTitle').textContent = def.name + (resumeSnap ? ' 이어서 칠하기' : ' 색칠하기');
  const hasVehicle = !!def.vehicleSrc;
  document.getElementById('transformBtn').style.display = hasVehicle ? '' : 'none';
  renderColorRow();
  renderPatternRow();
  go('screen-color');
  playFranchiseBGM(def.franchise);
  const host = document.getElementById('svgHost');
  host.innerHTML = '<div class="loading-box">불러오는 중... 🦖</div>';
  currentChar = null;
  updateUndoButtons();

  try{
    const baseAnalysis = await loadAndAnalyze(def.id + '_base', def.src);
    const baseCanvas = blankPaintCanvas(baseAnalysis);
    if(resumeSnap && resumeSnap.paintData && resumeSnap.paintData.base){
      const img = await loadImage(resumeSnap.paintData.base);
      baseCanvas.getContext('2d').drawImage(img, 0, 0);
    }
    const forms = { base: { analysis: baseAnalysis, paintCanvas: baseCanvas, undo:[], redo:[] } };
    if(hasVehicle){
      const vAnalysis = await loadAndAnalyze(def.id + '_vehicle', def.vehicleSrc);
      const vCanvas = blankPaintCanvas(vAnalysis);
      if(resumeSnap && resumeSnap.paintData && resumeSnap.paintData.vehicle){
        const vImg = await loadImage(resumeSnap.paintData.vehicle);
        vCanvas.getContext('2d').drawImage(vImg, 0, 0);
      }
      forms.vehicle = { analysis: vAnalysis, paintCanvas: vCanvas, undo:[], redo:[] };
    }
    if(currentScreenId() !== 'screen-color') return; // 불러오는 사이에 아이가 이미 나갔으면 중단

    currentChar = { defId: def.id, currentForm: 'base', forms, paintCanvas: forms.base.paintCanvas, editingUid: resumeSnap ? resumeSnap.uid : null, dirty:false };
    currentAnalysis = forms.base.analysis;
    mountColorCanvas();
    renderColorCanvas();
    updateUndoButtons();
  }catch(e){
    console.error('도안 불러오기 실패:', e);
    host.innerHTML = '<div class="loading-box">😥 그림을 불러오지 못했어요. 뒤로 갔다가 다시 시도해주세요.</div>';
  }
}

function currentForm(){ return currentChar ? currentChar.forms[currentChar.currentForm] : null; }

function mountColorCanvas(){
  const host = document.getElementById('svgHost');
  host.innerHTML = '<canvas id="colorCanvasEl" aria-label="색칠 도안"></canvas>';
  const canvas = document.getElementById('colorCanvasEl');
  canvas.width = currentAnalysis.w;
  canvas.height = currentAnalysis.h;
  attachDragPaint(canvas);
}

// 화면 갱신: 지금까지 누적된 붓칠 레이어 위에 원본 선화를 'multiply'로 얹어서
// 선은 항상 또렷하게 살아있고, 흰 배경 자리에만 칠한 색이 비쳐 보이게 합니다.
function renderColorCanvas(){
  if(!currentChar || !currentAnalysis) return;
  const { w, h, lineCanvas } = currentAnalysis;
  const canvas = document.getElementById('colorCanvasEl');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,w,h);
  ctx.drawImage(currentChar.paintCanvas, 0, 0);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(lineCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}
// 손가락을 움직일 때마다 화면 전체를 다시 그리면 저사양 태블릿에서 끊겨서, 한 프레임에
// 한 번만 다시 그리도록 묶습니다.
let colorRenderQueued = false;
function scheduleColorRender(){
  if(colorRenderQueued) return;
  colorRenderQueued = true;
  requestAnimationFrame(()=>{ colorRenderQueued = false; renderColorCanvas(); });
}

// ---- 되돌리기 / 다시하기 ----
// 붓질 한 번(손가락을 대서 뗄 때까지)이 시작되기 직전의 붓칠 레이어를 통째로 저장해 둡니다.
function pushUndo(){
  const form = currentForm();
  if(!form) return;
  const c = form.paintCanvas;
  form.undo.push(c.getContext('2d').getImageData(0,0,c.width,c.height));
  if(form.undo.length > UNDO_LIMIT) form.undo.shift();
  form.redo.length = 0;
  updateUndoButtons();
}
function restoreSnapshot(form, imgData){
  form.paintCanvas.getContext('2d').putImageData(imgData, 0, 0);
}
function undoPaint(){
  const form = currentForm();
  if(!form || !form.undo.length) return;
  const c = form.paintCanvas;
  form.redo.push(c.getContext('2d').getImageData(0,0,c.width,c.height));
  restoreSnapshot(form, form.undo.pop());
  currentChar.dirty = true;
  renderColorCanvas();
  updateUndoButtons();
  playChime('pop');
}
function redoPaint(){
  const form = currentForm();
  if(!form || !form.redo.length) return;
  const c = form.paintCanvas;
  form.undo.push(c.getContext('2d').getImageData(0,0,c.width,c.height));
  restoreSnapshot(form, form.redo.pop());
  currentChar.dirty = true;
  renderColorCanvas();
  updateUndoButtons();
  playChime('pop');
}
// 핀치(두 손가락)를 시작하면, 첫 손가락이 닿으며 이미 칠해진 한 점은 실수이므로 되돌립니다.
function cancelLastStroke(){
  const form = currentForm();
  if(!form || !form.undo.length) return;
  restoreSnapshot(form, form.undo.pop());
  renderColorCanvas();
  updateUndoButtons();
}
function updateUndoButtons(){
  const form = currentForm();
  const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn');
  if(u) u.disabled = !(form && form.undo.length);
  if(r) r.disabled = !(form && form.redo.length);
}

// 붓질 한 구간마다 캔버스를 새로 만들지 않도록, 작업용 캔버스 하나를 재사용하고
// 실제로 칠해지는 작은 사각형(붓 자국 ∩ 부위 영역)만 지우고 그립니다.
let strokeScratch = null;
function getStrokeScratch(w, h){
  if(!strokeScratch) strokeScratch = document.createElement('canvas');
  if(strokeScratch.width !== w || strokeScratch.height !== h){ strokeScratch.width = w; strokeScratch.height = h; }
  return strokeScratch;
}
function paintSourceFor(ctx, tool, bbox){
  if(tool.type === 'pattern') return ctx.createPattern(getPatternTile(tool.value).canvas, 'repeat');
  if(tool.type === 'rainbow' && bbox){
    // 채우기 도구로 무지개를 고르면 부위 전체에 무지개 그라데이션을 깝니다.
    const g = ctx.createLinearGradient(bbox.x0, bbox.y0, bbox.x0+bbox.w, bbox.y0+bbox.h);
    ['#ff5c7a','#ffd54f','#8be24a','#4a7bf7','#a855f7'].forEach((c,i,arr)=> g.addColorStop(i/(arr.length-1), c));
    return g;
  }
  return tool.value || '#000';
}
// 칠한 결과(sc의 bx0,by0,bw,bh 부분)를 누적 레이어에 얹거나(칠하기) 깎아냅니다(지우개).
function commitScratch(sc, bx0, by0, bw, bh, erase){
  const pctx = currentChar.paintCanvas.getContext('2d');
  pctx.save();
  if(erase) pctx.globalCompositeOperation = 'destination-out';
  pctx.drawImage(sc, bx0, by0, bw, bh, bx0, by0, bw, bh);
  pctx.restore();
}

// 한 붓질 구간(이전 점 -> 지금 점)을 그려서, 잠긴 영역의 마스크로 잘라낸 뒤
// 누적 레이어(paintCanvas)에 얹습니다. 마스크가 그 영역의 실제 모양 그대로라서
// 손가락이 아무리 빨리 움직여도 outline 밖으로는 색이 절대 나갈 수 없습니다.
function stampStroke(label, x0, y0, x1, y1, tool, erase){
  const region = getRegionMask(currentAnalysis, label);
  if(!region) return;
  const { w, h } = currentAnalysis;
  const r = brushRadius;
  const bx0 = Math.max(region.x0, Math.floor(Math.min(x0,x1) - r - 2));
  const by0 = Math.max(region.y0, Math.floor(Math.min(y0,y1) - r - 2));
  const bx1 = Math.min(region.x0 + region.w, Math.ceil(Math.max(x0,x1) + r + 2));
  const by1 = Math.min(region.y0 + region.h, Math.ceil(Math.max(y0,y1) + r + 2));
  if(bx1 <= bx0 || by1 <= by0) return;
  const bw = bx1 - bx0, bh = by1 - by0;
  const sc = getStrokeScratch(w, h);
  const sctx = sc.getContext('2d');
  sctx.save();
  sctx.clearRect(bx0, by0, bw, bh);
  sctx.beginPath(); sctx.rect(bx0, by0, bw, bh); sctx.clip();
  const src = erase ? '#000' : paintSourceFor(sctx, tool);
  sctx.fillStyle = src; sctx.strokeStyle = src;
  sctx.lineWidth = r*2; sctx.lineCap = 'round'; sctx.lineJoin = 'round';
  sctx.beginPath(); sctx.arc(x0, y0, r, 0, Math.PI*2); sctx.fill();
  if(x0!==x1 || y0!==y1){ sctx.beginPath(); sctx.moveTo(x0,y0); sctx.lineTo(x1,y1); sctx.stroke(); }
  sctx.globalCompositeOperation = 'destination-in';
  sctx.drawImage(region.maskCanvas, bx0, by0, bw, bh, bx0, by0, bw, bh);
  sctx.restore();
  commitScratch(sc, bx0, by0, bw, bh, erase);
}

// 채우기 도구: 누른 부위 하나를 통째로 칠합니다(더 어린 아이용).
function fillRegion(label, tool){
  const region = getRegionMask(currentAnalysis, label);
  if(!region) return;
  const { w, h } = currentAnalysis;
  const sc = getStrokeScratch(w, h);
  const sctx = sc.getContext('2d');
  const { x0, y0 } = region, bw = region.w, bh = region.h;
  sctx.save();
  sctx.clearRect(x0, y0, bw, bh);
  sctx.fillStyle = paintSourceFor(sctx, tool, region);
  sctx.fillRect(x0, y0, bw, bh);
  sctx.globalCompositeOperation = 'destination-in';
  sctx.drawImage(region.maskCanvas, x0, y0, bw, bh, x0, y0, bw, bh);
  sctx.restore();
  commitScratch(sc, x0, y0, bw, bh, false);
}

// ---- 크레용 색칠: 이 터치 동안 "처음 닿은 영역 하나"에만 잠깁니다. 손가락이 그 영역
// 밖으로 나가 다른 부위를 스치더라도(=드래그로 경계를 넘어가도) 절대 번지지 않고,
// 손을 떼면 잠금이 풀립니다.
// 손가락 두 개 = 확대/이동(핀치줌+팬), 손가락 한 개 = 색칠 - 실제로 그림 앱들이 쓰는 방식과
// 동일합니다. getBoundingClientRect가 CSS transform(scale/translate)까지 반영해서 값을 주기
// 때문에, 캔버스를 확대해도 붓질 좌표 계산(pointAt/extend)은 그대로 정확하게 맞습니다.
const NS_COLOR_ZOOM_MAX = 3;
function attachDragPaint(canvas){
  let lockedLabel = null;
  let lastX = null, lastY = null;
  let strokeActive = false;   // 이번 터치로 이미 무언가를 칠했는지(=되돌리기 스냅샷을 쌓았는지)
  const pointers = new Map(); // pointerId -> {x,y} (client 좌표)
  let pinch = null;

  canvas._zoom = { scale:1, tx:0, ty:0 };
  function applyZoom(){
    const z = canvas._zoom;
    // 확대한 그림을 너무 멀리 끌어서 화면 밖으로 잃어버리지 않도록 이동 범위를 제한합니다.
    const limX = canvas.clientWidth * (z.scale - 1) / 2 + 40;
    const limY = canvas.clientHeight * (z.scale - 1) / 2 + 40;
    if(z.scale <= 1.001){ z.tx = 0; z.ty = 0; }
    else { z.tx = Math.max(-limX, Math.min(limX, z.tx)); z.ty = Math.max(-limY, Math.min(limY, z.ty)); }
    canvas.style.transform = `translate(${z.tx}px, ${z.ty}px) scale(${z.scale})`;
  }
  function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
  function mid(a,b){ return {x:(a.x+b.x)/2, y:(a.y+b.y)/2}; }

  function pointAt(clientX, clientY){
    const rect = canvas.getBoundingClientRect();
    if(rect.width===0 || rect.height===0) return null;
    const x = (clientX - rect.left) / rect.width * currentAnalysis.w;
    const y = (clientY - rect.top) / rect.height * currentAnalysis.h;
    if(x<0||y<0||x>=currentAnalysis.w||y>=currentAnalysis.h) return null;
    const label = currentAnalysis.labelMap[Math.floor(y)*currentAnalysis.w + Math.floor(x)];
    return {x, y, label};
  }
  function paintable(label){ return label!==null && label!==undefined && label!==-1 && label!==currentAnalysis.bgLabel; }

  // 멀티컬러 붓: 획을 얼마나 그었는지(누적 거리)에 따라 색상환을 계속 돌립니다.
  let rainbowHue = 0;
  const RAINBOW_HUE_PER_PX = 1.6;
  function toolForSegment(tool, segLen){
    if(tool.type !== 'rainbow') return tool;
    rainbowHue = (rainbowHue + segLen*RAINBOW_HUE_PER_PX) % 360;
    return { type:'color', value:`hsl(${rainbowHue.toFixed(1)},82%,58%)` };
  }
  function markDirty(){ if(currentChar) currentChar.dirty = true; }

  function begin(clientX, clientY){
    if(!currentChar) return;
    const p = pointAt(clientX, clientY);
    if(!p || !paintable(p.label)) return;
    if(paintMode === 'fill'){
      pushUndo(); strokeActive = true;
      fillRegion(p.label, currentTool);
      markDirty();
      scheduleColorRender();
      playChime('pop');
      return; // 채우기는 끌어도 더 칠하지 않음
    }
    lockedLabel = p.label; lastX = p.x; lastY = p.y;
    pushUndo(); strokeActive = true;
    if(currentTool.type==='rainbow') rainbowHue = Math.random()*360;
    stampStroke(lockedLabel, p.x, p.y, p.x, p.y, toolForSegment(currentTool, 0), paintMode==='eraser');
    markDirty();
    scheduleColorRender();
  }
  function extend(clientX, clientY){
    if(lockedLabel===null) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width * currentAnalysis.w;
    const y = (clientY - rect.top) / rect.height * currentAnalysis.h;
    const segLen = Math.hypot(x-lastX, y-lastY);
    if(segLen < 0.5) return;
    stampStroke(lockedLabel, lastX, lastY, x, y, toolForSegment(currentTool, segLen), paintMode==='eraser');
    lastX = x; lastY = y;
    scheduleColorRender();
  }

  canvas.addEventListener('pointerdown', (e)=>{
    try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
    pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if(pointers.size >= 2){
      // 두 번째 손가락이 닿는 순간 - 진행 중이던 붓질은 취소(되돌림)하고 핀치 모드로 전환
      if(strokeActive) cancelLastStroke();
      strokeActive = false;
      lockedLabel = null; lastX = null; lastY = null;
      const pts = Array.from(pointers.values());
      pinch = { startDist: dist(pts[0], pts[1]) || 1, startScale: canvas._zoom.scale, startMid: mid(pts[0], pts[1]), startTX: canvas._zoom.tx, startTY: canvas._zoom.ty };
    } else {
      lockedLabel = null; lastX = null; lastY = null; strokeActive = false;
      begin(e.clientX, e.clientY);
    }
  });
  canvas.addEventListener('pointermove', (e)=>{
    if(!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if(pointers.size >= 2 && pinch){
      const pts = Array.from(pointers.values());
      const newDist = dist(pts[0], pts[1]) || 1;
      const newMid = mid(pts[0], pts[1]);
      canvas._zoom.scale = Math.min(NS_COLOR_ZOOM_MAX, Math.max(1, pinch.startScale * (newDist / pinch.startDist)));
      canvas._zoom.tx = pinch.startTX + (newMid.x - pinch.startMid.x);
      canvas._zoom.ty = pinch.startTY + (newMid.y - pinch.startMid.y);
      applyZoom();
      return;
    }
    if(e.buttons===0 || pinch) return;
    if(paintMode === 'fill') return;
    if(lockedLabel===null){ begin(e.clientX, e.clientY); return; } // 배경에서 눌렀다가 영역으로 들어온 경우
    extend(e.clientX, e.clientY);
  });
  function release(e){
    pointers.delete(e.pointerId);
    if(pointers.size < 2) pinch = null;
    if(pointers.size === 0){ lockedLabel = null; lastX = null; lastY = null; strokeActive = false; }
  }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
}
function resetCanvasZoom(){
  const canvas = document.getElementById('colorCanvasEl');
  if(!canvas) return;
  canvas._zoom = { scale:1, tx:0, ty:0 };
  canvas.style.transform = 'translate(0px,0px) scale(1)';
}

// ---- 도구/팔레트 고르기 ----
function pickMode(mode){
  paintMode = mode;
  document.querySelectorAll('.tool-btn').forEach(b=> b.classList.toggle('active', b.dataset.mode===mode));
  speak({brush:'크레용', fill:'한 번에 채우기', eraser:'지우개'}[mode]);
}
function pickBrushSize(r){
  brushRadius = r;
  document.querySelectorAll('.size-btn').forEach(b=> b.classList.toggle('active', +b.dataset.size===r));
}
function pickToolTab(tab){
  document.querySelectorAll('.tool-tab').forEach(b=> b.classList.toggle('active', b.dataset.tab===tab));
  document.getElementById('colorRow').hidden = tab !== 'color';
  document.getElementById('patternRow').hidden = tab !== 'pattern';
}
// 색/문양을 고르면 지우개 상태였더라도 자동으로 크레용으로 돌아갑니다(지우개로 칠하려다 헷갈리지 않게).
function leaveEraser(){ if(paintMode === 'eraser') pickMode('brush'); }

function renderColorRow(){
  const row = document.getElementById('colorRow');
  row.innerHTML = PALETTE.map((c,i)=>`<div class="swatch" role="option" tabindex="0" aria-label="색 ${c}" style="background:${c}; animation-delay:${i*16}ms" data-color="${c}"></div>`).join('')
    + `<div class="swatch rainbow" role="option" tabindex="0" aria-label="무지개 색" title="멀티컬러" style="animation-delay:${PALETTE.length*16}ms" data-rainbow="1"></div>`;
  row.querySelectorAll('.swatch[data-color]').forEach(el=>{
    el.addEventListener('click', ()=> pickColor(el.dataset.color, el));
    if(currentTool.type==='color' && currentTool.value===el.dataset.color) el.classList.add('active');
  });
  const rb = row.querySelector('.swatch.rainbow');
  if(rb){
    rb.addEventListener('click', ()=> pickRainbow(rb));
    if(currentTool.type==='rainbow') rb.classList.add('active');
  }
}
function renderPatternRow(){
  const row = document.getElementById('patternRow');
  row.innerHTML = PATTERNS.map((p,i)=>{
    const tile = getPatternTile(p.id);
    return `<div class="pat-swatch" role="option" tabindex="0" aria-label="${p.label} 문양" title="${p.label}" style="background-image:url(${tile.dataURL}); background-size:18px 18px; animation-delay:${i*16}ms" data-pat="${p.id}"></div>`;
  }).join('');
  row.querySelectorAll('.pat-swatch').forEach(el=>{
    el.addEventListener('click', ()=> pickPattern(el.dataset.pat, el));
    if(currentTool.type==='pattern' && currentTool.value===el.dataset.pat) el.classList.add('active');
  });
}
function clearSwatchActive(){
  document.querySelectorAll('.swatch, .pat-swatch').forEach(s=>s.classList.remove('active'));
}
function pickColor(c, el){
  currentTool = {type:'color', value:c};
  clearSwatchActive(); el.classList.add('active');
  leaveEraser();
}
function pickPattern(id, el){
  currentTool = {type:'pattern', value:id};
  clearSwatchActive(); el.classList.add('active');
  leaveEraser();
  const p = findPattern(id); if(p) speak(p.label);
}
// 멀티컬러(무지개) 붓 - 칠하는 동안 붓이 지나간 거리만큼 색상환을 따라 계속 바뀝니다.
function pickRainbow(el){
  currentTool = {type:'rainbow', value:null};
  clearSwatchActive(); el.classList.add('active');
  leaveEraser();
  speak('무지개');
}
function toggleForm(){
  if(!currentChar || !currentChar.forms.vehicle){
    toast('이 캐릭터는 아직 변신 모드 도안이 없어요!');
    return;
  }
  currentChar.currentForm = currentChar.currentForm==='base' ? 'vehicle' : 'base';
  const f = currentChar.forms[currentChar.currentForm];
  currentAnalysis = f.analysis;
  currentChar.paintCanvas = f.paintCanvas;
  mountColorCanvas();
  renderColorCanvas();
  updateUndoButtons();
  playChime('pop');
  speak('변신!');
}
// 다 지우기 - 실수로 눌러도 되돌릴 수 있게 되돌리기 기록에 남기고, 그래도 한 번 더 물어봅니다.
function resetColors(){
  if(!currentChar) return;
  showConfirmDialog('<div>지금 그림을<br>다 지울까요?</div><small>↶ 되돌리기로 다시 살릴 수 있어요.</small>', ()=>{
    pushUndo();
    const c = currentChar.paintCanvas;
    c.getContext('2d').clearRect(0,0,c.width,c.height);
    currentChar.dirty = true;
    renderColorCanvas();
  }, '네, 지울래요');
}

// 저장하지 않은 그림이 있는데 ← (또는 기기 뒤로가기)를 누르면 한 번 물어봅니다.
function leaveColoring(){
  const back = ()=>{
    const origin = coloringOrigin;
    if(origin && origin.type === 'field') openField(origin.field);
    else go('screen-charpick');
  };
  if(!currentChar || !currentChar.dirty){ back(); return; }
  showChoiceDialog('<div>칠한 그림을<br>저장할까요?</div>', [
    { label:'💾 저장하고 나가기', cls:'alt', value:'save' },
    { label:'🗑️ 저장 안 하고 나가기', cls:'ghost', value:'discard' },
    { label:'🖍️ 계속 칠하기', cls:'ghost', value:'stay' },
  ], (v)=>{
    if(v === 'save') saveCharacter();
    else if(v === 'discard'){ currentChar.dirty = false; back(); }
  });
}

// 붓칠 레이어 + 선화를 합쳐서 한 장의 그림으로 만듭니다. transparent면 종이 여백(캐릭터 바깥)을
// 투명하게 오려내서 스티커처럼 만듭니다. scale로 내보내기용 고해상도 버전도 만듭니다.
function composeForm(form, transparent, scale){
  scale = scale || 1;
  const { w, h } = form.analysis;
  const composed = document.createElement('canvas');
  composed.width = Math.round(w*scale); composed.height = Math.round(h*scale);
  const cctx = composed.getContext('2d');
  cctx.imageSmoothingEnabled = true; cctx.imageSmoothingQuality = 'high';
  cctx.scale(scale, scale);
  cctx.fillStyle = '#ffffff'; cctx.fillRect(0,0,w,h);
  cctx.drawImage(form.paintCanvas, 0, 0);
  cctx.globalCompositeOperation = 'multiply';
  cctx.drawImage(form.analysis.lineCanvas, 0, 0);
  if(transparent){
    cctx.globalCompositeOperation = 'destination-in';
    cctx.drawImage(getSilhouetteMask(form.analysis), 0, 0);
  }
  cctx.globalCompositeOperation = 'source-over';
  return composed;
}

function snapshotForm(form){
  const SNAP = 220;
  // 종이 여백(캐릭터 바깥 배경)을 투명하게 잘라내서, 필드/갤러리에 네모난 흰 배경이 같이
  // 나가지 않고 캐릭터 실루엣만 오려낸 스티커처럼 보이게 합니다.
  const composed = composeForm(form, true);
  const snapCanvas = document.createElement('canvas');
  snapCanvas.width = SNAP; snapCanvas.height = SNAP;
  const sctx = snapCanvas.getContext('2d');
  const scale = Math.min(SNAP/composed.width, SNAP/composed.height);
  const dw = composed.width*scale, dh = composed.height*scale;
  sctx.drawImage(composed, (SNAP-dw)/2, (SNAP-dh)/2, dw, dh);
  return snapCanvas.toDataURL('image/png');
}

let saving = false;
async function saveCharacter(){
  if(!currentChar || saving) return;
  saving = true;
  try{
    const def = getDef(currentChar.defId);
    const image = snapshotForm(currentChar.forms.base);
    const vehicleImage = currentChar.forms.vehicle ? snapshotForm(currentChar.forms.vehicle) : null;
    // 붓칠 레이어 자체(paintCanvas)도 그대로 저장해둬서, 나중에 "이어서 칠하기"로 다시 열었을 때
    // 지금까지 칠한 자국을 픽셀 그대로 복원할 수 있게 합니다.
    const paintData = {
      base: currentChar.forms.base.paintCanvas.toDataURL('image/png'),
      vehicle: currentChar.forms.vehicle ? currentChar.forms.vehicle.paintCanvas.toDataURL('image/png') : null,
    };

    let isUpdate = false, uid = currentChar.editingUid, prev = null;
    const idx = uid ? savedCharacters.findIndex(s=>s.uid===uid) : -1;
    if(idx >= 0){
      isUpdate = true;
      prev = Object.assign({}, savedCharacters[idx]);
      Object.assign(savedCharacters[idx], { image, vehicleImage, paintData });
    } else {
      uid = 'c' + Date.now() + Math.random().toString(36).slice(2,7);
      savedCharacters.push({ uid, defId: currentChar.defId, name: def.name, image, vehicleImage, paintData });
    }
    // 새로 저장한 친구를 필드의 "+ 친구 추가"에서 만들었다면 그 필드에 바로 넣어줍니다.
    const origin = coloringOrigin;
    let addedToField = null;
    if(!isUpdate && origin && origin.type === 'field' && !isInField(origin.field, uid)){
      fieldFriends[origin.field].push(savedCharacters[savedCharacters.length-1]);
      addedToField = origin.field;
    }

    const ok = await persistState();
    if(!ok){
      // 저장소에 쓰지 못했으면 화면 상태도 되돌리고, 그림은 그대로 둔 채 분명히 알려줍니다
      // (예전엔 실패를 조용히 무시해서 "저장 완료!"가 뜨고도 다시 열면 그림이 사라졌습니다).
      if(isUpdate) Object.assign(savedCharacters[idx], prev);
      else savedCharacters = savedCharacters.filter(s=>s.uid!==uid);
      if(addedToField) fieldFriends[addedToField] = fieldFriends[addedToField].filter(s=>s.uid!==uid);
      showChoiceDialog('<div>😥 저장하지 못했어요</div><small>기기 저장 공간이 부족할 수 있어요. 필드에서 안 쓰는 그림을 지우고 다시 저장해주세요.</small>',
        [{ label:'확인', cls:'alt', value:true }], null);
      return;
    }
    currentChar.editingUid = uid; // 같은 세션에서 다시 저장하면 새로 만들지 않고 덮어씁니다.
    currentChar.dirty = false;
    showSaveConfirm(def.name, isUpdate);
    celebrate({count:30});
    speak(isUpdate ? '수정 완료!' : '저장 완료!');

    setTimeout(()=>{
      if(currentScreenId() !== 'screen-color') return;
      if(origin && origin.type === 'field'){ openField(origin.field); return; }
      showChoiceDialog(`<div>${escapeHtml(def.name)}${isUpdate?' 수정 완료!':' 저장 완료!'}</div><small>이제 뭐 할까요?</small>`, [
        { label:'🌲 필드에 데려가기', cls:'alt', value:'field' },
        { label:'🖍️ 계속 칠하기', cls:'ghost', value:'stay' },
        { label:'🏠 홈으로', cls:'ghost', value:'home' },
      ], (v)=>{
        if(v === 'field'){ pendingFieldAddUid = uid; go('screen-fieldselect'); }
        else if(v === 'home') go('screen-home');
      });
    }, 900);
  } finally {
    saving = false;
  }
}

let downloadsApi = null;
if (window.claude && window.claude.use) {
  window.claude.use('downloads').then(api => { downloadsApi = api; }).catch(()=>{});
}

function blobToBase64(blob){
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=> resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// 그림 내보내기 - 예전엔 Claude 미리보기 전용 기능(window.claude)만 써서 실제 사이트/APK에서는
// 항상 "지원되지 않아요"만 떴습니다. 환경별로 되는 방법을 차례로 시도합니다:
//   ① APK(Capacitor): Filesystem에 저장 후 Share 시트(갤러리 저장/카톡 전송 등)
//   ② 공유를 지원하는 모바일 브라우저: Web Share(파일 공유)
//   ③ 그 외(PC 브라우저 등): 일반 파일 다운로드
//   (Claude 미리보기 안에서는 기존 downloads 기능)
async function exportPNG(sticker){
  if(!currentChar){ toast('그림을 불러온 다음에 내보낼 수 있어요.'); return; }
  const def = getDef(currentChar.defId);
  const canvas = composeForm(currentForm(), !!sticker, 2);
  const blob = await new Promise(res=> canvas.toBlob(res, 'image/png'));
  if(!blob){ toast('내보내기에 실패했어요.'); return; }
  const filename = `gogodino_${def.id}${sticker?'_sticker':''}_${Date.now()}.png`;

  if(downloadsApi){
    try{ await downloadsApi.save({ filename, data: blob }); toast('🖼️ 저장됐어요!'); }
    catch(e){ if(!(e && e.code==='declined')) toast('내보내기에 실패했어요.'); }
    return;
  }

  const cap = window.Capacitor;
  const plugins = cap && cap.Plugins;
  if(cap && cap.isNativePlatform && cap.isNativePlatform() && plugins && plugins.Filesystem){
    try{
      const data = await blobToBase64(blob);
      const res = await plugins.Filesystem.writeFile({ path: filename, data, directory: plugins.Share ? 'CACHE' : 'DOCUMENTS' });
      if(plugins.Share){
        await plugins.Share.share({ title: def.name + ' 그림', files: [res.uri], url: res.uri, dialogTitle: '그림 보내기' });
      } else {
        toast('📁 내 파일(Documents)에 저장했어요!');
      }
    }catch(e){
      if(!(e && /cancel/i.test(String(e.message||e)))) toast('내보내기에 실패했어요.');
    }
    return;
  }

  try{
    const file = new File([blob], filename, { type:'image/png' });
    if(navigator.canShare && navigator.canShare({ files:[file] })){
      await navigator.share({ files:[file], title: def.name + ' 그림' });
      return;
    }
  }catch(e){
    if(e && e.name === 'AbortError') return; // 공유창을 그냥 닫은 경우
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=> URL.revokeObjectURL(url), 4000);
  toast('🖼️ 그림 파일을 내려받았어요!');
}
