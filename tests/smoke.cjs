// 고고 컬러링 스튜디오 기본 동작(스모크) 테스트
//
// 실행 방법 (프로젝트 폴더에서):
//   npx http-server -p 8765 -s .   (다른 터미널에서 켜두기)
//   node tests/smoke.cjs            (playwright가 설치돼 있어야 함: npm i -g playwright)
//
// 홈 → 색칠(칠하기/되돌리기/채우기/저장) → 필드 → 트랙(120Hz에서도 같은 속도) → 공부모드
// (마구 문지르기는 통과 못 함) → 새로고침 후에도 저장이 유지되는지까지 한 번에 확인합니다.
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:8765/';
let failures = 0;
function check(cond, msg){
  if(cond) console.log('  ✔', msg);
  else { console.log('  ✘', msg); failures++; }
}

(async ()=>{
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await browser.newContext({ viewport:{ width:1180, height:820 }, hasTouch:true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e=> errors.push(String(e)));
  page.on('console', m=>{ if(m.type()==='error' && !/youtube|fonts\.g|ERR_|Failed to load resource/i.test(m.text())) errors.push(m.text()); });

  await page.goto(BASE);
  await page.waitForFunction(()=> document.querySelectorAll('.char-thumb').length > 0);

  console.log('홈');
  check(await page.isVisible('#screen-home.active'), '홈 화면이 보임');
  check(!(await page.textContent('#screen-home')).includes('프로토타입'), '개발용 문구가 홈에 없음');

  console.log('색칠');
  await page.click('.home-card[aria-label="색칠하기"]');
  await page.waitForSelector('#screen-charpick.active');
  await page.click('.char-thumb[data-char="rex"]');
  await page.waitForSelector('#colorCanvasEl', { timeout: 15000 });
  // 그림 안쪽의 칠할 수 있는 점 하나를 찾아서 문지르기
  const pt = await page.evaluate(()=>{
    const a = currentAnalysis, c = document.getElementById('colorCanvasEl').getBoundingClientRect();
    for(let y=Math.floor(a.h*0.3); y<a.h*0.7; y+=3) for(let x=Math.floor(a.w*0.3); x<a.w*0.7; x+=3){
      const l = a.labelMap[y*a.w+x];
      if(l>=0 && l!==a.bgLabel && getRegionMask(a,l).w > 30) return { x: c.left + (x+0.5)/a.w*c.width, y: c.top + (y+0.5)/a.h*c.height };
    }
  });
  check(!!pt, '칠할 수 있는 부위를 찾음');
  const painted = ()=> page.evaluate(()=>{ const c=currentChar.paintCanvas; const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for(let i=3;i<d.length;i+=4) if(d[i]>0) n++; return n; });
  await page.mouse.move(pt.x, pt.y); await page.mouse.down(); await page.mouse.move(pt.x+8, pt.y+4, { steps:4 }); await page.mouse.up();
  const afterBrush = await painted();
  check(afterBrush > 0, '크레용으로 칠해짐');
  check(await page.isEnabled('#undoBtn'), '되돌리기 버튼 활성화');
  await page.click('#undoBtn');
  check(await painted() === 0, '되돌리기로 원래대로');
  await page.click('#redoBtn');
  check(await painted() === afterBrush, '다시하기로 복원');
  await page.click('.tool-btn[data-mode="fill"]');
  await page.mouse.click(pt.x, pt.y);
  check(await painted() > afterBrush, '채우기로 부위 전체가 칠해짐');
  const beforeErase = await painted();
  await page.click('.tool-btn[data-mode="eraser"]');
  await page.mouse.move(pt.x, pt.y); await page.mouse.down(); await page.mouse.move(pt.x+6, pt.y, { steps:3 }); await page.mouse.up();
  check(await painted() < beforeErase, '지우개로 지워짐');

  // 저장 안 하고 뒤로 → 확인창
  await page.click('#screen-color .backbtn');
  check(await page.waitForSelector('#confirmOverlayEl.show', { timeout: 2000 }).then(()=>true, ()=>false), '저장 안 한 그림이 있으면 나가기 전에 물어봄');
  await page.click('#confirmOverlayEl button:has-text("계속 칠하기")');
  await page.click('.save-main');
  await page.waitForSelector('#confirmOverlayEl.show button:has-text("필드에 데려가기")', { timeout: 5000 });
  const stored = await page.evaluate(()=> idbGet('state'));
  check(stored && stored.savedCharacters && stored.savedCharacters.length === 1, 'IndexedDB에 저장됨');
  await page.click('#confirmOverlayEl button:has-text("필드에 데려가기")');
  await page.waitForSelector('#screen-fieldselect.active');
  await page.click('.field-card[data-field="ocean"]');
  await page.waitForSelector('#screen-field.active');

  console.log('필드');
  check(await page.evaluate(()=> fieldFriends.ocean.length) === 1, '저장한 친구가 고른 필드에 자동으로 들어감');
  check(await page.locator('#sceneEl .sprite').count() === 3, '기본 친구 2 + 저장한 친구 1이 보임');
  const sprite = page.locator('#sceneEl .sprite').last();
  const sb = await sprite.boundingBox();
  await page.mouse.click(sb.x + sb.width/2, sb.y + sb.height/2);
  check(await page.locator('.sprite-bubble').count() > 0, '친구를 누르면 말풍선 인사');

  console.log('새로고침 후 유지');
  await page.reload();
  await page.waitForFunction(()=> document.querySelectorAll('.char-thumb').length > 0);
  await page.waitForFunction(()=> savedCharacters.length === 1, null, { timeout: 5000 }).catch(()=>{});
  check(await page.evaluate(()=> savedCharacters.length === 1 && fieldFriends.ocean.length === 1), '저장한 친구와 필드 배치가 유지됨');

  console.log('트랙');
  await page.click('.home-card[aria-label="트랙 모드"]');
  await page.waitForSelector('#screen-trackpick.active');
  check(await page.locator('#trackThemeRow .theme-chip').count() === 3, '트랙 테마 3종');
  await page.click('.theme-chip[data-theme="desert"]');
  await page.click('#trackPickGrid .char-thumb');
  await page.waitForFunction(()=> track && track.chunks.size > 0);
  // 같은 1초 동안 60Hz/120Hz로 프레임을 돌렸을 때 물리 스텝 수가 같아야 함
  const steps = await page.evaluate(()=>{
    const orig = window.trackFixedStep;
    const count = (hz)=>{
      let n = 0;
      window.trackFixedStep = ()=>{ n++; };
      cancelAnimationFrame(trackRAF);
      track.lastTime = null; track.accumulator = 0;
      for(let i=0;i<=hz;i++){ trackTick(i*1000/hz); cancelAnimationFrame(trackRAF); }
      return n;
    };
    const r = [count(60), count(120)];
    window.trackFixedStep = orig;
    trackRAF = requestAnimationFrame(trackTick);
    return r;
  });
  check(Math.abs(steps[0]-steps[1]) <= 1, `60Hz/120Hz 물리 스텝 수 동일 (${steps.join(' / ')})`);
  check(await page.evaluate(()=> track.theme === TRACK_THEMES.desert), '고른 테마가 적용됨');
  await page.click('#screen-track .backbtn');
  check(await page.evaluate(()=> track === null), '나가면 트랙 정리');
  await page.click('#screen-trackpick .backbtn');

  console.log('공부모드');
  await page.evaluate(()=>{ ns.settings.micMode = 'off'; });
  await page.click('.home-card[aria-label="한글공부"]');
  await page.waitForSelector('#nsToDemo');
  check((await page.textContent('.ns-number-display')).trim() === '가', '한글공부 기본은 가나다 (첫 글자 가)');
  // 🔊 소리 듣기를 누르면 그 터치 안에서 곧바로 speak()가 불려야 함(모바일 브라우저 정책)
  const spoke = await page.evaluate(()=>{
    let calls = []; const orig = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u)=>{ calls.push(u.text); };
    Object.defineProperty(speechSynthesis, 'speaking', { configurable:true, get:()=>false });
    Object.defineProperty(speechSynthesis, 'pending', { configurable:true, get:()=>false });
    document.getElementById('nsPlaySound').click();
    speechSynthesis.speak = orig; delete speechSynthesis.speaking; delete speechSynthesis.pending;
    return calls;
  });
  check(spoke.length === 1 && spoke[0].includes('가방'), '소리 듣기 버튼이 즉시 발음 (' + spoke.join('|') + ')');
  await page.click('#nsToDemo');
  await page.click('#nsToTrace');
  await page.waitForFunction(()=> ns._traceMask && ns._traceMask.length > 0);
  // 마구 문지르기(캔버스 전체 칠하기)는 통과하면 안 됨
  await page.evaluate(()=>{ const c=document.getElementById('nsDrawCanvas'); const x=c.getContext('2d'); x.fillStyle='#f00'; x.fillRect(0,0,c.width,c.height); });
  await page.click('#nsCheckTrace');
  check(await page.evaluate(()=> ns.traceRound) === 0, '마구 문지르기는 통과 못 함');
  // 획 데이터를 따라 정확히 그리면 통과
  await page.evaluate(()=>{ const c=document.getElementById('nsDrawCanvas'); const x=c.getContext('2d'); x.clearRect(0,0,c.width,c.height); x.lineWidth=22; x.lineCap='round'; x.strokeStyle='#f00'; nsGetStrokes().forEach(p=>{ x.beginPath(); x.moveTo(p[0][0],p[0][1]); p.forEach(q=>x.lineTo(q[0],q[1])); x.stroke(); }); });
  await page.click('#nsCheckTrace');
  check(await page.evaluate(()=> ns.traceRound) === 1, '안내선을 따라 쓰면 통과');
  await page.click('#screen-numstudy .backbtn');

  console.log('설정/보상/획순');
  const setSwitch = await page.evaluate(()=>{
    ns.settings.hangulSet = 'consonant'; ns.subject = 'hangul';
    const a = STUDY_SUBJECTS.hangul.item(0).glyph;
    ns.settings.hangulSet = 'vowel';
    const v = STUDY_SUBJECTS.hangul.item(9).glyph + STUDY_SUBJECTS.hangul.keys().length;
    ns.settings.hangulSet = 'syllable';
    const b = STUDY_SUBJECTS.hangul.item(13).glyph;
    return a + v + b;
  });
  check(setSwitch === 'ㄱㅣ10하', 'ㄱㄴㄷ / 모음 / 가나다 묶음 전환 (' + setSwitch + ')');
  const zero = await page.evaluate(()=> NS_DIGIT_STROKES[0][0]);
  check(zero[0][1] < zero[1][1] && zero[1][0] < zero[0][0], '0은 위에서 시작해 왼쪽으로(시계 반대 방향)');
  check(await page.evaluate(()=> !STUDY_SUBJECTS.hangul.rewardTitle && typeof NS_REWARD_TITLE === 'string'), '보상 화면을 모든 과목이 공유');

  console.log('모든 글자 데이터');
  const bad = await page.evaluate(()=>{
    const out = [];
    [['number'],['hangul','syllable'],['hangul','consonant'],['hangul','vowel'],['english']].forEach(([sub,set])=>{ ns.subject = sub; if(set) ns.settings.hangulSet = set; STUDY_SUBJECTS[sub].keys().forEach(k=>{ ns.current = k; const st = nsGetStrokes(); if(!st.length || st.some(p=>p.length<2 || p.some(q=>!isFinite(q[0])||!isFinite(q[1])||q[0]<0||q[0]>300||q[1]<0||q[1]>420))) out.push(sub+(set||'')+':'+k); }); });
    ns.settings.hangulSet = 'syllable';
    return out;
  });
  check(bad.length === 0, '숫자/한글/영어 획 데이터가 모두 캔버스 안에 있음' + (bad.length ? ' ('+bad.join(',')+')' : ''));

  console.log('뒤로가기 / 내보내기 / 보상 / 예전 데이터');
  await page.click('.home-card[aria-label="색칠하기"]');
  await page.waitForSelector('#screen-charpick.active');
  await page.goBack();
  await page.waitForSelector('#screen-home.active', { timeout: 3000 }).catch(()=>{});
  check(await page.evaluate(()=> currentScreenId()) === 'screen-home' && page.url().startsWith(BASE), '기기 뒤로가기로 앱이 꺼지지 않고 이전 화면으로');
  await page.evaluate(()=> startColoring(getDef('tomo')));
  await page.waitForSelector('#colorCanvasEl', { timeout: 15000 });
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }).catch(()=>null),
    page.click('button:has-text("스티커로 내보내기")'),
  ]);
  check(!!download && /sticker.*\.png$/.test(download.suggestedFilename()), '스티커 PNG 내보내기(파일 다운로드)');
  // 실제 YouTube 대신 가짜 플레이어를 써서(네트워크와 무관하게) 영상 보상 화면을 확인
  await page.evaluate(()=>{
    window.YT = { PlayerState:{ ENDED:0, PLAYING:1, PAUSED:2, BUFFERING:3 }, Player: function(el, opts){
      this.opts = opts; this.loadPlaylist = ()=>{}; this.playVideo = ()=>{}; this.pauseVideo = ()=>{}; this.destroy = ()=>{}; this.getPlayerState = ()=>1;
      setTimeout(()=> opts.events.onReady({ target:this }), 0);
    }};
    currentChar.dirty = false; go('screen-home'); ns.subject='number'; showNumberReward();
  });
  await page.click('.ns-reward-close');
  await page.waitForSelector('#parentGateInput');
  const q = await page.textContent('.parent-gate-q');
  const [x, y] = q.match(/\d+/g).map(Number);
  await page.fill('#parentGateInput', String(x + y + 1));
  await page.click('#confirmOverlayEl button:has-text("확인")');
  check(await page.evaluate(()=> currentScreenId()) === 'screen-numreward', '보호자 확인 오답이면 영상 화면 유지');
  await page.click('.ns-reward-close');
  await page.waitForSelector('#parentGateInput');
  const q2 = await page.textContent('.parent-gate-q');
  const [x2, y2] = q2.match(/\d+/g).map(Number);
  await page.fill('#parentGateInput', String(x2 + y2));
  await page.click('#confirmOverlayEl button:has-text("확인")');
  check(await page.evaluate(()=> currentScreenId()) === 'screen-home', '보호자 확인 정답이면 홈으로');
  // 예전 버전(localStorage)에 저장된 친구가 IndexedDB로 옮겨지는지
  await page.evaluate(async ()=>{
    await idbSet('state', null);
    localStorage.setItem('gogodino_saved_v1', JSON.stringify({ savedCharacters:[{uid:'old1', defId:'rex', name:'렉스', image:'data:image/png;base64,iVBORw0KGgo=', vehicleImage:null, paintData:{}}], fieldFriendUids:{forest:['old1'],ocean:[],desert:[]} }));
  });
  await page.reload();
  await page.waitForFunction(()=> savedCharacters.length === 1, null, { timeout: 5000 }).catch(()=>{});
  await page.waitForTimeout(300);
  const migrated = await page.evaluate(async ()=>{ const st = await idbGet('state'); return !!(st && st.savedCharacters[0].uid === 'old1' && fieldFriends.forest.length === 1 && !localStorage.getItem('gogodino_saved_v1')); });
  check(migrated, '예전 localStorage 저장분을 IndexedDB로 옮김');

  console.log('보상 영상 랜덤(가짜 YouTube 플레이어)');
  const rw = await page.evaluate(()=>{
    // 실제 YouTube 대신 호출 내용을 기록하는 가짜 플레이어
    const log = [];
    window.YT = { PlayerState:{ ENDED:0, PLAYING:1, PAUSED:2, BUFFERING:3 }, Player: function(el, opts){
      const self = this; let idx = null;
      this.opts = opts; log.push(this);
      this.loadPlaylist = (o)=>{ self.playlist = o; idx = o.index; };
      this.playVideo = ()=>{}; this.pauseVideo = ()=>{}; this.destroy = ()=>{};
      this.getPlayerState = ()=>1; this.getPlaylistIndex = ()=> idx;
      this._setIndex = (i)=>{ idx = i; };
      setTimeout(()=> opts.events.onReady({ target:self }), 0);
    }};
    // 1) 뽑기 분포와 직전 편 피하기
    const seen = new Set(); let repeats = 0, prev = null;
    for(let i=0;i<2000;i++){ const p = nsPickReward(); const k = p.videoId || ('pl:'+p.index); if(k===prev) repeats++; prev = k; seen.add(k); }
    return { kinds: seen.size, repeats };
  });
  check(rw.kinds === 36 && rw.repeats === 0, `보상 후보 36편 모두 나오고 직전 편은 반복 안 함 (${rw.kinds}종, 반복 ${rw.repeats})`);
  // 2) 재생목록 편이 뽑혔을 때: loadPlaylist로 그 편을 틀고, 다음 편으로 넘어가면 보상 종료
  await page.evaluate(()=>{ go('screen-home'); window._origPick = nsPickReward; nsPickReward = ()=>({ list:REWARD_PLAYLIST.id, index:7 }); showNumberReward(); });
  await page.waitForFunction(()=> window.YT && nsYTPlayer && nsYTPlayer.playlist, null, { timeout: 3000 }).catch(()=>{});
  const pl = await page.evaluate(()=>{
    const p = nsYTPlayer; const r = { list: p.playlist && p.playlist.list, index: p.playlist && p.playlist.index };
    p.opts.events.onStateChange({ data:1, target:p });           // 8편 재생 시작
    r.stillOpen = currentScreenId() === 'screen-numreward';
    p._setIndex(8); p.opts.events.onStateChange({ data:1, target:p }); // 자동으로 9편으로 넘어감
    r.closedAfterNext = currentScreenId() === 'screen-home';
    nsPickReward = window._origPick;
    return r;
  });
  check(pl.list === 'PLweHyEHJTEBUMqlsD48NWJNGeAurKX5y-' && pl.index === 7, '재생목록의 고른 편(8번째)을 재생');
  check(pl.stillOpen && pl.closedAfterNext, '한 편이 끝나 다음 편으로 넘어가면 보상 종료(한 번에 한 편)');

  console.log('대체 보상 (영상을 볼 수 없을 때)');
  const fb = await page.evaluate(async ()=>{
    go('screen-home');
    const before = wallet.eggs;
    showNumberReward();
    await new Promise(r=> setTimeout(r, 30));
    nsYTPlayer.opts.events.onError({ data:150 });   // 퍼가기 금지/삭제된 영상
    const r = { shown: !!document.querySelector('.ns-gift'), eggs: wallet.eggs - before, screen: currentScreenId() };
    document.querySelector('.ns-reward-close').click();   // 보호자 확인 없이 바로 닫혀야 함
    r.closed = currentScreenId() === 'screen-home' && !document.getElementById('parentGateInput');
    // 오프라인이면 기다리지 않고 바로 대체 보상
    Object.defineProperty(navigator, 'onLine', { configurable:true, get:()=>false });
    showNumberReward();
    r.offline = !!document.querySelector('.ns-gift');
    document.getElementById('nsGiftHome').click();
    delete navigator.onLine;
    r.home = currentScreenId() === 'screen-home';
    return r;
  });
  check(fb.shown && fb.screen === 'screen-numreward' && fb.eggs === 5, '영상 오류 시 알 선물 화면으로 대체 (알 +' + fb.eggs + ')');
  check(fb.closed, '대체 보상은 보호자 확인 없이 닫힘');
  check(fb.offline && fb.home, '오프라인이면 바로 대체 보상, 홈으로 버튼 동작');

  console.log('필드 위치 저장 / 꾸미기');
  // 앞 단계에서 켜졌던 전체화면이 완전히 꺼진 다음에 조작합니다(전환 중에는 마우스 입력이 버려짐)
  await page.waitForFunction(()=> !document.fullscreenElement);
  await page.waitForTimeout(400);
  await page.evaluate(()=> openField('forest'));
  await page.waitForSelector('#sceneEl .sprite');
  const grounded = await page.evaluate(()=>{
    const sc = document.getElementById('sceneEl').getBoundingClientRect();
    const groundTop = sc.bottom - (440-270) * Math.max(sc.width/800, sc.height/440);
    return fieldSprites.every(sp=> sp.wrap.getBoundingClientRect().bottom > groundTop);
  });
  check(grounded, '숲에서는 모든 친구 발이 땅 위에 있음');
  // 친구들은 계속 걸어 다녀서, 좌표를 재는 사이 지나가 버리지 않게 잠깐 세워두고 잡습니다
  await page.evaluate(()=> fieldSprites.forEach(sp=>{ sp.held = true; }));
  const sp1 = page.locator('#sceneEl .sprite').last();
  const bb = await sp1.boundingBox();
  await page.mouse.move(bb.x + bb.width/2, bb.y + bb.height/2); await page.mouse.down();
  await page.mouse.move(bb.x + bb.width/2 + 150, bb.y + bb.height/2 + 30, { steps:6 }); await page.mouse.up();
  await page.evaluate(()=> fieldSprites.forEach(sp=>{ sp.held = false; }));
  // 친구들이 걸어 다니며 겹칠 수 있어서, 실제로 잡힌 친구가 누구든 그 친구의 자리가 저장됐는지 확인
  const savedPos = await page.evaluate(async ()=>{ await persistChain; const st = await idbGet('state'); const e = Object.entries(st.fieldLayout.forest.pos)[0]; return e ? { uid:e[0], x:e[1].x, y:e[1].y } : null; });
  check(!!savedPos && savedPos.x > 0 && savedPos.x < 1, '끌어 옮긴 자리가 저장됨');
  await page.evaluate(()=>{ openPropPicker(); document.querySelector('[data-prop="prop-flower"]').click(); });
  await page.evaluate(()=> persistChain);
  await page.reload();
  await page.waitForFunction(()=> document.querySelectorAll('.char-thumb').length > 0 && fieldLayout.forest.props.length === 1, null, { timeout: 5000 }).catch(()=>{});
  await page.evaluate(()=> openField('forest'));
  const restored = await page.evaluate((p)=>{
    const sp = fieldSprites.find(s=>s.uid===p.uid);
    return { same: !!sp && Math.abs(sp.anchorLeft / sp.sceneW - p.x) < 0.02, props: document.querySelectorAll('#sceneEl .prop').length };
  }, savedPos || { uid:'', x:0 });
  check(restored.same, '다시 열어도 옮긴 자리에 있음');
  check(restored.props === 1, '놓은 소품이 유지됨');
  await page.evaluate(()=> go('screen-home'));

  console.log('알 가게 / 특별한 붓 / 다시보기 / 내 그림');
  const shop = await page.evaluate(async ()=>{
    wallet.eggs = 0; wallet.unlocked = {}; saveWallet();
    const r = { lockedFirst: !isUnlocked('brush-glitter') };
    pickBrushStyle('glitter'); r.blocked = brushStyle === 'crayon';
    addEggs(5); tryUnlock('brush-glitter');
    document.querySelector('#confirmOverlayEl button.alt').click();
    r.unlocked = isUnlocked('brush-glitter') && wallet.eggs === 0;
    return r;
  });
  check(shop.lockedFirst && shop.blocked && shop.unlocked, '알이 없으면 잠겨 있고, 알 5개로 반짝이 붓을 엶');
  await page.evaluate(()=> startColoring(getDef('rex')));
  await page.waitForSelector('#colorCanvasEl', { timeout: 15000 });
  const pt2 = await page.evaluate(()=>{
    const a = currentAnalysis, c = document.getElementById('colorCanvasEl').getBoundingClientRect();
    for(let y=Math.floor(a.h*0.3); y<a.h*0.7; y+=3) for(let x=Math.floor(a.w*0.3); x<a.w*0.7; x+=3){
      const l = a.labelMap[y*a.w+x];
      if(l>=0 && l!==a.bgLabel && getRegionMask(a,l).w > 30) return { x: c.left + (x+0.5)/a.w*c.width, y: c.top + (y+0.5)/a.h*c.height };
    }
  });
  for(const st of ['glitter','spray','stamp']){
    await page.evaluate((st)=>{ wallet.unlocked['brush-'+st] = 1; pickBrushStyle(st); }, st);
    await page.mouse.move(pt2.x, pt2.y); await page.mouse.down(); await page.mouse.move(pt2.x+10, pt2.y+5, { steps:4 }); await page.mouse.up();
  }
  const rp = await page.evaluate(async ()=>{
    const f = currentForm(); const before = grabPaint(f).data.slice();
    const n = f.ops.length;
    replayPainting();
    const during = !!replayState;
    await new Promise(r=> setTimeout(r, 1500));
    const after = grabPaint(f).data;
    let same = !replayState; for(let i=0;i<before.length;i+=97) if(before[i]!==after[i]){ same = false; break; }
    return { n, during, same, recent: recentTools.length };
  });
  check(rp.n >= 3 && rp.during && rp.same, `특별한 붓 3종으로 칠하고, 다시보기 뒤 그림이 그대로 (기록 ${rp.n}개)`);
  check(rp.recent >= 1, '최근에 쓴 색이 기억됨');
  const tpl = await page.evaluate(async ()=>{
    currentChar.dirty = false; go('screen-home');
    const c = document.createElement('canvas'); c.width = 300; c.height = 300;
    const x = c.getContext('2d'); x.fillStyle = '#ccc'; x.fillRect(0,0,300,300);   // 회색빛 종이
    x.strokeStyle = '#222'; x.lineWidth = 8; x.strokeRect(60,60,180,180); x.beginPath(); x.moveTo(150,60); x.lineTo(150,240); x.stroke();
    const blob = await new Promise(r=> c.toBlob(r, 'image/png'));
    await importTemplate(new File([blob], 'mine.png', { type:'image/png' }));
    const t = customTemplates[0];
    if(!t) return { ok:false };
    const an = await loadAndAnalyze(t.id + '_base', t.src);
    const st = await idbGet('state');
    return { ok:true, regions: an.regionCount, stored: st.customTemplates.length, shown: !!document.querySelector(`.char-thumb[data-char="${t.id}"]`) };
  });
  check(tpl.ok && tpl.regions === 3 && tpl.stored === 1 && tpl.shown, `내 그림을 도안으로 등록 (회색 종이 사진도 영역 ${tpl.regions}개로 분리)`);

  console.log('트랙 코스 / 일시정지');
  const tk = await page.evaluate(async ()=>{
    trackPrefs.course = '300'; trackPrefs.stars = {};
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const snap = { name:'렉스', vehicleImage: cv.toDataURL('image/png'), uid:'t' };
    await startTrack(snap);
    const r = { goal: track.goal };
    toggleTrackPause(); r.paused = track.paused;
    const x0 = track.car.chassis.position.x; trackTick(performance.now()+500); cancelAnimationFrame(trackRAF);
    r.frozen = track.car.chassis.position.x === x0;
    toggleTrackPause();
    const eggsBefore = wallet.eggs;
    track.eggCount = 9; track.maxDist = 300; trackFixedStep();
    r.finished = track.finished; r.stars = trackPrefs.stars['300']; r.bonus = wallet.eggs - eggsBefore;
    r.dialog = isDialogOpen();
    closeDialog(); stopTrack(); go('screen-home');
    return r;
  });
  check(tk.goal === 300 && tk.paused && tk.frozen, '코스 300m, 일시정지 중에는 차가 멈춤');
  check(tk.finished && tk.stars === 3 && tk.bonus === 6 && tk.dialog, `깃발 도착 시 별 ${tk.stars}개와 보너스 알 ${tk.bonus}개`);

  console.log('공부 확장: 11~20 / 소문자 / 거·고·구 / 이름 / 퀴즈');
  const ext = await page.evaluate(()=>{
    const out = []; const inside = (st)=> st.length && st.every(p=> p.length>=2 && p.every(q=> isFinite(q[0]) && isFinite(q[1]) && q[0]>=0 && q[0]<=300 && q[1]>=0 && q[1]<=420));
    ns.subject = 'number'; ns.settings.rangeMin = 0; ns.settings.rangeMax = 20;
    STUDY_SUBJECTS.number.keys().forEach(k=>{ ns.current = k; if(!inside(nsGetStrokes())) out.push('n'+k); });
    const n15 = STUDY_SUBJECTS.number.item(15);
    ns.settings.rangeMax = 10;
    ns.subject = 'english'; ns.settings.englishSet = 'lower';
    STUDY_SUBJECTS.english.keys().forEach(k=>{ ns.current = k; if(!inside(nsGetStrokes())) out.push('e'+k); });
    const lowerA = STUDY_SUBJECTS.english.item(0).glyph;
    ns.settings.englishSet = 'upper';
    ns.subject = 'hangul'; let syl = '';
    ['syl_eo','syl_o','syl_u'].forEach(set=>{ ns.settings.hangulSet = set; syl += STUDY_SUBJECTS.hangul.item(0).glyph + STUDY_SUBJECTS.hangul.item(13).glyph;
      STUDY_SUBJECTS.hangul.keys().forEach(k=>{ ns.current = k; if(!inside(nsGetStrokes())) out.push(set+k); }); });
    ns.settings.hangulSet = 'name'; ns.settings.childName = '';
    const noName = nsHangulSet();
    ns.settings.childName = '김율a';
    const name = STUDY_SUBJECTS.hangul.keys().map(k=> STUDY_SUBJECTS.hangul.item(k).glyph).join('') + ':' + nsRecordKey();
    ns.settings.hangulSet = 'syllable'; ns.settings.childName = '';
    return { out, n15: n15.chips.join('').replace(/<[^>]+>/g,' ').trim().replace(/\s+/g,'/'), cnt: n15.count, lowerA, syl, noName, name };
  });
  check(ext.out.length === 0, '새 획 데이터(11~20, 소문자, 거·고·구)가 모두 캔버스 안에 있음' + (ext.out.length ? ' ('+ext.out.join(',')+')' : ''));
  check(ext.n15 === '열다섯/십오' && ext.cnt === 15 && ext.lowerA === 'a', `15는 ${ext.n15}, 소문자 첫 글자 ${ext.lowerA}`);
  check(ext.syl === '거허고호구후' && ext.noName === 'syllable' && ext.name === '김율:hangul_name', `글자 묶음 ${ext.syl}, 이름 쓰기 ${ext.name}`);
  await page.evaluate(()=>{ ns.settings.micMode = 'off'; ns.settings.quiz = true; openStudy('hangul'); ns.traceRound = 2; nsGoStage('trace'); });
  await page.waitForFunction(()=> ns._traceMask && ns._traceMask.length > 0);
  await page.evaluate(()=>{ const c=document.getElementById('nsDrawCanvas'); const x=c.getContext('2d'); x.lineWidth=22; x.lineCap='round'; x.strokeStyle='#f00'; nsGetStrokes().forEach(p=>{ x.beginPath(); x.moveTo(p[0][0],p[0][1]); p.forEach(q=>x.lineTo(q[0],q[1])); x.stroke(); }); });
  const fits = await page.evaluate(()=>{ const r = document.getElementById('nsCheckTrace').getBoundingClientRect(); return r.bottom <= window.innerHeight && r.top >= 0; });
  check(fits, '"다 썼어요" 버튼이 스크롤 없이 화면 안에 보임');
  await page.click('#nsCheckTrace');
  check(await page.evaluate(()=> ns.stage) === 'quiz' && await page.locator('.ns-quiz-btn').count() === 3, '세 번 쓰면 듣고 고르기 퀴즈(보기 3개)');
  const eggsQ = await page.evaluate(()=> wallet.eggs);
  await page.evaluate(()=>{ const w = Array.from(document.querySelectorAll('.ns-quiz-btn')).find(b=> b.dataset.key !== String(ns.current)); w.click(); });
  check(await page.evaluate(()=> ns.stage) === 'quiz', '틀린 보기를 누르면 그대로 다시 고르기');
  await page.evaluate(()=> document.querySelector(`.ns-quiz-btn[data-key="${ns.current}"]`).click());
  await page.waitForFunction(()=> ns.stage === 'celebrate', null, { timeout: 3000 }).catch(()=>{});
  check(await page.evaluate(()=> ns.stage) === 'celebrate' && await page.evaluate(()=> wallet.eggs) === eggsQ + 1, '맞히면 칭찬 단계로 가고 알 1개를 받음');
  await page.evaluate(()=> exitNumberStudy());

  console.log('기본 친구 이름 / 캐릭터별 목소리');
  const vt = await page.evaluate(()=>{
    const names = DEFAULT_FIELD_FRIENDS.map(f=>f.name).join(',');
    // 실제로 말하지 않고, 어떤 높낮이/음성으로 말하려 했는지만 기록
    const spoken = [];
    const origSpeak = speechSynthesis.speak.bind(speechSynthesis);
    const origVoices = speechSynthesis.getVoices.bind(speechSynthesis);
    // 가짜 음성 목록을 쓰므로 문장 객체도 평범한 객체로 바꿔 둠(진짜 객체는 가짜 음성을 거부함)
    const OrigU = window.SpeechSynthesisUtterance;
    window.SpeechSynthesisUtterance = function(t){ this.text = t; };
    speechSynthesis.speak = (u)=> spoken.push({ text:u.text, pitch:u.pitch, rate:u.rate, voice:u.voice && u.voice.name });
    speechSynthesis.getVoices = ()=> [ { name:'Korean Male (InJoon)', voiceURI:'injoon', lang:'ko-KR' }, { name:'Yuna', voiceURI:'yuna', lang:'ko-KR' } ];
    Object.defineProperty(speechSynthesis, 'speaking', { configurable:true, get:()=>false });
    Object.defineProperty(speechSynthesis, 'pending', { configurable:true, get:()=>false });
    voiceGuideOn = true;
    ['rex','vicky','amber','anki','default-kid-1'].forEach(id=> speak('안녕', voiceFor(id)));
    speechSynthesis.speak = origSpeak; speechSynthesis.getVoices = origVoices; window.SpeechSynthesisUtterance = OrigU;
    delete speechSynthesis.speaking; delete speechSynthesis.pending;
    return { names, spoken };
  });
  check(vt.names === '율,온', '기본 친구 이름이 율, 온 (' + vt.names + ')');
  const [rexV, vickyV, amberV, ankiV, yulV] = vt.spoken;
  check(new Set(vt.spoken.map(v=>v.pitch.toFixed(2)+'/'+v.rate.toFixed(2))).size === 5, '캐릭터마다 목소리 높낮이/빠르기가 다름');
  check(vickyV.voice === 'Yuna' && amberV.voice === 'Yuna', '비키·엠버는 여성 음성이 있으면 그 음성 사용');
  check(vickyV.pitch > rexV.pitch && amberV.pitch > ankiV.pitch && yulV.pitch > rexV.pitch, '여성/아이 캐릭터는 더 높은 목소리');

  check(errors.length === 0, '페이지 오류 없음' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log(failures ? `\n실패 ${failures}건` : '\n모두 통과');
  process.exit(failures ? 1 : 0);
})().catch(e=>{ console.error(e); process.exit(1); });
