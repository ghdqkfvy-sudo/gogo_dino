// ---------------------------------------------------------------- 시작
// 키보드(또는 스위치 접근성 기기) 사용자도 카드/스와치를 Enter·Space로 누를 수 있게 합니다.
document.addEventListener('keydown', (e)=>{
  if(e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target;
  if(!el || el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'SELECT') return;
  const role = el.getAttribute && el.getAttribute('role');
  if(role === 'button' || role === 'option'){ e.preventDefault(); el.click(); }
});

async function initApp(){
  nsLoadSettings();
  nsLoadRecords();
  renderCharGrid();
  renderFieldSelect();
  initTrackControls();
  updateBgmButtons();
  initBackButton();
  await loadPersistedState();
  requestPersistentStorage();
}
initApp();

// 태블릿 앱(웹뷰)으로 감쌌을 때 와이파이가 잠깐 끊겨도 마지막 버전으로는 계속 실행되도록
// 서비스 워커를 등록합니다. (지원 안 하는 환경이면 조용히 무시)
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
