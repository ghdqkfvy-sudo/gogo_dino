// tools/friends_src/friend_*.svg → characters/friend_*.png (흰 배경, 700x700). 사전 설치된 Chromium을 씁니다(CHROMIUM_PATH).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const src = path.join(__dirname, 'friends_src'), dir = path.join(__dirname, '..', 'characters');
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 700, height: 700 } });
  for (const f of fs.readdirSync(src).filter(f => /^friend_.*\.svg$/.test(f))) {
    await p.setContent(`<body style="margin:0;background:#fff">${fs.readFileSync(path.join(src, f), 'utf8')}</body>`);
    await p.screenshot({ path: path.join(dir, f.replace('.svg', '.png')) });
  }
  await b.close();
})();
