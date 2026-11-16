// 이 앱의 일반 스크립트(js/*.js)가 window.Capacitor.Plugins.* 로 네이티브 기능(음성·공유·파일·뒤로가기)을 쓰므로,
// 플러그인을 그 전역에 등록합니다. 결과물 js/capacitor-plugins.js 는 웹사이트에 포함되며(npm run build:plugins 로 다시 만듦),
// 일반 브라우저에서는 아무 영향이 없고 APK 안에서 사이트를 열 때만 네이티브 기능으로 연결됩니다.
import { Capacitor, registerPlugin } from '@capacitor/core';
import '@capacitor/app';
import '@capacitor/filesystem';
import '@capacitor/share';
import '@capacitor-community/text-to-speech';
window.Capacitor = window.Capacitor || Capacitor;
