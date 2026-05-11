# Poetry & BGM Studio Classroom Readiness Follow-Up

> Workflow: `superpowers:subagent-driven-development`

## Goal

배포와 HVC 등록이 끝난 `Poetry & BGM Studio`를 실제 수업 투입 직전 수준으로 다듬는다.  
우선순위는 이전 추천안 그대로 `1 -> 3 -> 2 -> 4 -> 5` 순서로 진행한다.

## Context

- Repo: `https://github.com/WBmaker2/poetry-bgm-studio`
- Live app: `https://wbmaker2.github.io/poetry-bgm-studio/`
- Target: 초등 3~4학년 국어 / 음악 융합 수업
- Existing app stack: Vite + React + TypeScript + Vitest
- Existing classroom docs:
  - `docs/teacher-guide.md`
  - `docs/qa/real-device-microphone-check.md`
  - `docs/qa/public-page-qa.md`

## Task 1: 수업용 패키지 완성

Create a classroom handout package that a teacher can use without rewriting the existing guide.

### Files

- Create `docs/classroom-package.md`
- Update `README.md`

### Acceptance

- Includes a student worksheet print section.
- Includes a teacher evaluation rubric.
- Includes presentation feedback sentence cards.
- Includes a concise microphone pre-class checklist that links to `docs/qa/real-device-microphone-check.md`.
- Keeps Korean classroom wording for 3~4학년 국어/음악.
- README links to the package.

## Task 2: 마이크 사전 점검 기능 추가

Add an in-app microphone precheck so teachers can verify permission and input before the lesson starts.

### Files

- Add or update React component(s) under `src/components/`.
- Add focused tests.
- Update styles if needed.

### Acceptance

- The app has a visible `마이크 테스트` control.
- It requests microphone permission separately from the main recording flow.
- It records or samples briefly enough to confirm the microphone path without creating the final poetry recording.
- It shows clear status text for ready/testing/success/error states through `role="status"` or another accessible live region.
- It stops media tracks after the test.
- It does not replace or break the existing `낭송 녹음 시작` flow.

## Task 3: 앱 안에 수업 모드 추가

Add a lightweight classroom flow mode that makes the first-screen workflow easier for students.

### Files

- Update `src/App.tsx`.
- Update styles.
- Add or update tests.

### Acceptance

- The app shows a compact step indicator for:
  1. 제목 입력
  2. 녹음
  3. 소리 선택
  4. 미리듣기/저장
- The current step reacts to app state:
  - no title -> step 1
  - title but no voice -> step 2
  - voice but no sound -> step 3
  - voice and sound selected -> step 4
- The indicator is accessible and does not crowd the existing recording/sound/export controls.
- No landing-page or marketing section is added.

## Task 4: 오디오 엽서 결과 카드 개선

Make the final export area read more like a classroom result card.

### Files

- Update `src/components/ExportPanel.tsx` and caller props as needed.
- Update tests.
- Update styles if needed.

### Acceptance

- The export area shows the poem title.
- It shows the selected sound list.
- It includes a one-line reflection input or textarea.
- It shows the expected download filename/format guidance.
- It keeps the existing WAV export behavior intact.
- The result card remains useful before and after export and has accessible labels/status text.

## Task 5: GitHub Actions Node 20 Warning Tracking

Document the remaining GitHub Actions Node 20 annotation so it is not confused with an app failure.

### Files

- Create `docs/ops/github-actions-node20-warning.md`.
- Update `README.md` or the follow-up plan if useful.

### Acceptance

- Explains the observed warning in the last successful Pages workflow.
- Notes that the workflow currently forces compatible actions to Node 24 and still deploys successfully.
- States the likely follow-up: revisit when upstream GitHub actions remove the internal Node 20 target.
- Does not claim the warning is fully fixed.

## Final Verification

- Run `npm test`.
- Run `npm run build -- --base=/poetry-bgm-studio/`.
- Run `git diff --check`.
- Perform a public-ready browser smoke on the local or preview build if feasible.
- Commit locally when all tasks and reviews pass.

