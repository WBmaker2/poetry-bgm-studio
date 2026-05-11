# Poetry & BGM Studio

`감성 톡톡 동시 스튜디오: 내 목소리 오디오북`은 3~4학년 학생이 동시를 낭송해 녹음하고, 시의 분위기에 어울리는 배경음악과 효과음을 골라 하나의 WAV 오디오 엽서로 저장하는 국어/음악 융합 웹앱입니다.

## 수업 연결

- 대상: 3~4학년군 국어 / 음악
- 국어 성취기준: `[4국05-01]` 시나 이야기를 읽고 생각이나 느낌을 다양한 방식으로 표현한다.
- 음악 성취기준: `[4음01-01]` 악곡의 특징을 이해하며 노래 부르거나 악기로 연주한다.
- 활동 흐름: 동시 제목 입력 → 목소리 녹음 → 사운드 선택 → 사운드 미리듣기 → 오디오 엽서 저장
- 교사용 수업안은 [교사용 가이드](docs/teacher-guide.md)를 참고하세요.
- 수업 바로 실행용 패키지는 [수업용 패키지(인쇄형)](docs/classroom-package.md)에서 확인하세요.

## 로컬 실행

```bash
npm install
npm run generate:audio
npm run dev
```

개발 서버가 표시한 `localhost` 주소를 브라우저에서 엽니다. 마이크 녹음은 `localhost` 또는 HTTPS 배포 주소에서 사용해 주세요.

## 검증

```bash
npm test
npm run build
```

브라우저 수동 확인 항목은 [docs/qa/browser-smoke.md](docs/qa/browser-smoke.md)에 정리되어 있습니다.
실기기 마이크 검증은 [docs/qa/real-device-microphone-check.md](docs/qa/real-device-microphone-check.md)에서 Chrome/Edge/Safari/Chromebook 기준으로 확인할 수 있습니다.

## 배포

GitHub Pages 배포는 `.github/workflows/deploy-pages.yml`에서 실행됩니다. `main` 브랜치에 푸시하면 테스트와 빌드를 거쳐 `https://wbmaker2.github.io/poetry-bgm-studio/`로 배포됩니다.
2026-05-11 확인된 성공 런(`25661058576`)에서는 GitHub Actions 경고(`Node.js 20 deprecation`)가 남았으나, 워크플로우는 정상 배포를 완료했습니다.
이는 현재 운영 노트에 정리되어 있어 앱 오류와 구분됩니다: `docs/ops/github-actions-node20-warning.md`.

## 개인정보와 저장 방식

녹음과 오디오 믹싱은 모두 학생의 브라우저 안에서 처리됩니다. 앱 서버 업로드나 계정 로그인을 사용하지 않으며, 저장 버튼을 누르면 현재 기기에서 WAV 파일로 다운로드됩니다. 단, 기기 다운로드 폴더가 iCloud/Drive/OneDrive/학교 MDM 등과 동기화되는지는 수업 전 별도로 확인해 주세요.

## 사운드 파일 교체

기본 사운드는 `public/audio/`에 있는 짧은 WAV 샘플입니다. 교사가 직접 준비한 오디오로 바꾸려면 파일명을 그대로 유지해 교체하면 됩니다.

- 저작권/라이선스 주의: 직접 제작한 오디오, 학교가 보유한 저작물, 또는 수업용 라이선스가 있는 음원만 사용하세요. 상업용/온라인 음원은 사용 허가 없이 교재 제작·공유에 사용하지 마세요.

- `rain.wav`
- `piano.wav`
- `waves.wav`
- `birds.wav`
- `stream.wav`
- `wind.wav`
- `music-box.wav`
- `bell.wav`

사운드가 너무 길거나 큰 파일이면 미리듣기와 WAV 저장 시간이 길어질 수 있습니다.

## 브라우저 지원

- Chrome, Edge, Safari처럼 `MediaRecorder`, `AudioContext`, `OfflineAudioContext`를 지원하는 최신 브라우저를 권장합니다.
- 마이크 권한은 보안 정책상 HTTPS 또는 `localhost`에서 가장 안정적으로 동작합니다.
- 수업 전 교사용 기기에서 실제 마이크 권한 팝업과 저장 다운로드 위치를 한 번 확인해 주세요.
