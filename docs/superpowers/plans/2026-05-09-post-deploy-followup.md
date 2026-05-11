# Poetry & BGM Studio Post-Deploy Follow-Up Plan

> **Workflow:** Use `superpowers:subagent-driven-development`. Implement one task at a time, then run spec and quality review before continuing.

**Goal:** 배포가 끝난 `Poetry & BGM Studio`를 수업 투입 가능한 상태로 더 단단하게 만들고, 공개 아카이브인 Hong's Vibe Coding Lab까지 등록한다.

**Context:**

- Repo: `https://github.com/WBmaker2/poetry-bgm-studio`
- Live app: `https://wbmaker2.github.io/poetry-bgm-studio/`
- Current branch: `main`
- App: 3~4학년 국어/음악 융합 동시 낭송 오디오 엽서 웹앱

## Task 1: Real-Device Microphone Verification Support

**Intent:** 실제 교사용 기기에서 마이크 권한/녹음/저장까지 확인할 수 있는 체크리스트와 증거 기록 양식을 추가한다. 자동화로 실제 교실 마이크를 대신할 수 없다는 점을 명확히 남긴다.

**Files:**

- Create: `docs/qa/real-device-microphone-check.md`
- Update: `README.md`

**Acceptance:**

- Chrome/Edge/Safari/Chromebook 관점의 HTTPS 실기기 점검 순서가 있다.
- 마이크 권한, 녹음 시작/정지, 내 목소리 재생, BGM 선택, WAV 저장, 다운로드 위치 확인 항목이 있다.
- 학생 개인정보/공유기기 주의사항이 있다.
- README에서 해당 체크 문서로 연결된다.

## Task 2: Teacher Guide

**Intent:** 교사가 바로 수업에 넣을 수 있도록 40분 수업 흐름, 학생 활동지 문항, 발표/공유 규칙, 평가 관찰 포인트를 문서화한다.

**Files:**

- Create: `docs/teacher-guide.md`
- Update: `README.md`

**Acceptance:**

- 3~4학년 국어/음악 성취기준이 연결된다.
- 도입/활동/공유/정리까지 시간 흐름이 있다.
- 학생용 활동지 문항과 교사용 관찰 체크포인트가 있다.
- 저작권/개인정보/소음관리 안내가 있다.

## Task 3: GitHub Actions Warning Cleanup

**Intent:** GitHub Actions의 Node 20 deprecation warning을 줄이고, Pages 배포 workflow를 현재 런타임 전환에 더 안전하게 만든다.

**Files:**

- Update: `.github/workflows/deploy-pages.yml`

**Acceptance:**

- workflow에 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`가 설정된다.
- `npm test`와 GitHub Pages base build가 로컬에서 통과한다.
- README나 QA 문서 변경이 필요하면 최소한으로 반영한다.

## Task 4: Public Page Real-Use QA

**Intent:** 공개 URL 기준으로 HTML/JS/audio 응답, React 렌더링, 데스크톱/모바일 overflow, 기본 상호작용 상태를 확인하고 기록한다.

**Files:**

- Create: `docs/qa/public-page-qa.md`
- Update: `docs/qa/browser-smoke.md` if helpful

**Acceptance:**

- 공개 URL, GitHub Actions run, commit SHA가 기록된다.
- HTML, JS asset, CSS asset, `audio/rain.wav` 응답 확인이 기록된다.
- Browser/Playwright에서 공개 페이지 제목과 주요 landmark 렌더링을 확인한다.
- 1440px/360px 가로 overflow 결과가 기록된다.
- 실제 마이크 테스트는 Task 1 문서로 분리되어 있음을 명시한다.

## Task 5: Hong's Vibe Coding Lab Registration

**Intent:** 라이브 앱을 HVC 공개 아카이브에 실제 등록 또는 기존 항목 업데이트한다.

**Files:**

- Create: `docs/hvc/poetry-bgm-studio-payload.json`
- Create: `docs/hvc/registration-report.md`
- Create or reference thumbnail artifact if needed.

**Acceptance:**

- 라이브 앱 첫 화면을 확인하고 메타데이터를 작성한다.
- 실제 첫 화면 썸네일을 캡처한다.
- HVC admin에 로그인 가능한 경우 등록/업데이트하고 admin/public 양쪽을 확인한다.
- 관리자 인증이 막히면 payload, thumbnail, registration report까지 준비하고, 필요한 비밀값만 명확히 요청한다.

## Final Verification

- Run `npm test`
- Run `npm run build -- --base=/poetry-bgm-studio/`
- Commit changes
- Push `main`
- Watch GitHub Pages workflow
- Verify public URL after deployment
