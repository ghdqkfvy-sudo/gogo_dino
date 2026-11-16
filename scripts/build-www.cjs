// 앱(APK)은 Netlify 사이트를 그대로 불러오는 "링크 방식"입니다(capacitor.config.json의 server.url).
// 그래서 웹 파일을 앱 안에 넣지 않고, 인터넷이 안 될 때 보여줄 안내 화면(error.html)만 www/에 담습니다.
// GitHub에 푸시 → Netlify에 배포되면 앱을 다시 빌드하지 않아도 앱에 바로 반영됩니다.
// 사용: npm run android:sync (= 이 스크립트 + cap sync android)
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'error.html']) fs.copyFileSync(path.join(__dirname, 'app-shell', f), path.join(out, f));
console.log('www/ 준비 완료: index.html, error.html (앱은 Netlify 사이트를 불러옵니다)');
