// 고고다이노 컬러링 스튜디오 — 서비스 워커
//
// 앱 파일(같은 출처): "네트워크 우선, 실패 시 캐시" — 인터넷이 있으면 항상 최신 파일을 받아서
// 보여주고 동시에 캐시에 저장, 인터넷이 없으면 마지막으로 캐시해둔 파일을 대신 보여줍니다.
// 처음 설치될 때 핵심 파일(화면/스크립트/물리엔진)을 미리 받아둬서, 한 번만 열어봤어도
// 오프라인에서 바로 실행됩니다.
//
// 구글 폰트(Jua/고운돋움): "캐시 우선" — 글꼴 파일은 바뀌지 않으므로 한 번 받은 것을 계속
// 씁니다. 예전엔 외부 파일이라 캐시하지 않아서, 오프라인에서는 글꼴이 빠지고 숫자 따라쓰기
// 안내선 모양도 달라졌습니다.

const CACHE_NAME = 'gogodino-cache-v2';
const FONT_CACHE = 'gogodino-fonts-v1';
const PRECACHE = [
  './', 'index.html', 'matter.min.js', 'css/app.css',
  'js/common.js', 'js/coloring.js', 'js/field.js', 'js/track.js', 'js/study.js', 'js/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== FONT_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(req).then(hit => hit || fetch(req).then(res => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()).catch(() => {});
          return res;
        }))
      )
    );
    return;
  }

  // 그 밖의 외부 리소스(YouTube 등)는 브라우저 기본 동작에 맡깁니다.
  if (url.origin !== location.origin) return;
  // 음원 등 부분 요청(Range)은 캐시에 넣을 수 없으므로(206 응답) 그대로 통과시킵니다.
  if (req.headers.has('range')) return;

  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req).then((cached) => cached || Promise.reject('offline-and-not-cached')))
  );
});
