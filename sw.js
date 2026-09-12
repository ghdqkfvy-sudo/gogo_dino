// 고고다이노 컬러링 스튜디오 — 서비스 워커
//
// 이 앱을 나중에 태블릿 전용 앱(Capacitor)으로 감쌀 때, 웹뷰가 이 페이지를 매번
// 인터넷에서 새로 불러오게 됩니다. 와이파이가 잠깐 끊기거나 느릴 때도 최소한
// "마지막으로 성공했던 버전"으로는 계속 실행되도록, 그리고 평소에는 항상 최신
// 버전을 먼저 받아오도록(캐시를 우선하지 않음) "네트워크 우선, 실패 시 캐시" 전략을 씁니다.
//
// 즉: 인터넷이 있으면 -> 항상 최신 파일을 받아서 보여주고, 동시에 캐시에 저장.
//     인터넷이 없으면 -> 마지막으로 캐시해둔 파일을 대신 보여줌(완전히 먹통이 되지 않음).
//
// 새 캐릭터나 필드를 추가해도 이 파일 자체를 매번 손댈 필요는 없습니다 — 어떤 파일을
// 요청하든 그때그때 캐시하는 방식(런타임 캐싱)이라 미리 파일 목록을 적어둘 필요가 없습니다.

const CACHE_NAME = 'gogodino-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  // 우리 서버(같은 출처)에서 오는 파일만 캐시합니다. 구글 폰트 같은 외부 리소스는
  // 그대로 브라우저 기본 동작에 맡깁니다.
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then((cached) => cached || Promise.reject('offline-and-not-cached')))
  );
});
