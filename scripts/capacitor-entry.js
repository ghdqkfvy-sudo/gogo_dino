// APK 전용: 이 앱의 일반 스크립트(js/*.js)가 window.Capacitor.Plugins.* 로 네이티브 기능을 쓰므로,
// 번들러로 플러그인을 불러와 그 전역에 등록합니다. (웹사이트 버전에는 포함되지 않습니다)
import { Capacitor, registerPlugin } from '@capacitor/core';
import '@capacitor/app';
import '@capacitor/filesystem';
import '@capacitor/share';
import '@capacitor-community/text-to-speech';
window.Capacitor = window.Capacitor || Capacitor;
