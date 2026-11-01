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
  check(await page.locator('.theme-chip').count() === 3, '트랙 테마 3종');
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
  await page.evaluate(()=>{ currentChar.dirty = false; go('screen-home'); ns.subject='number'; showNumberReward(); });
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
