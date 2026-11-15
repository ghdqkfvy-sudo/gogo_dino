// 앱(APK)에 넣을 웹 파일만 www/ 폴더로 복사합니다. (테스트·CI·개발용 파일은 제외)
// 사용: npm run build:www  → npx cap sync android
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'www');
const items = ['index.html', 'manifest.json', 'sw.js', 'matter.min.js', 'css', 'js', 'audio', 'characters', 'icons'];
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const it of items) {
  fs.cpSync(path.join(root, it), path.join(out, it), { recursive: true, filter: (src) => !src.endsWith('README.txt') && !src.endsWith('.DS_Store') });
}

// APK용: 네이티브 플러그인(window.Capacitor.Plugins.*)을 등록하는 스크립트를 번들로 만들어 index.html에 끼웁니다.
require('esbuild').buildSync({
  entryPoints: [path.join(__dirname, 'capacitor-entry.js')],
  bundle: true, minify: true, format: 'iife', target: 'es2019',
  outfile: path.join(out, 'js', 'capacitor-plugins.js'),
});
const htmlPath = path.join(out, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
if (!html.includes('<script src="matter.min.js"></script>')) throw new Error('index.html에서 끼울 위치를 찾지 못했어요');
html = html.replace('<script src="matter.min.js"></script>', '<script src="js/capacitor-plugins.js"></script>\n<script src="matter.min.js"></script>');
fs.writeFileSync(htmlPath, html);
console.log('www/ 준비 완료:', items.join(', '));
