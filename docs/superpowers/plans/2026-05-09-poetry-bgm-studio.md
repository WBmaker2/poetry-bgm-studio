# Poetry & BGM Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 3~4학년 학생이 동시 낭송을 녹음하고, 어울리는 BGM/효과음을 선택해 하나의 오디오 엽서 WAV 파일로 저장하는 국어/음악 융합 웹앱을 만든다.

**Architecture:** 앱은 서버 없이 브라우저에서만 동작한다. `MediaRecorder`로 목소리를 녹음하고, `AudioContext`/`OfflineAudioContext`로 녹음본과 선택한 BGM/효과음을 믹싱한 뒤 WAV 파일로 다운로드한다. 수업용 사용성을 위해 모든 핵심 문구는 한국어로 제공하고, 마이크 권한/브라우저 지원/파일 준비 상태를 화면 상태로 명확히 보여준다.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, Web Audio API, MediaRecorder API, CSS Modules 없이 단일 `src/styles.css`

**Execution Status (2026-05-09):** Tasks 1~6 have been implemented on `feature/poetry-bgm-studio`. Current verification includes unit tests, production build, and local browser smoke for recording, sound selection, WAV export, and responsive overflow checks.

---

## Scope Decisions

- 앱 이름: `감성 톡톡 동시 스튜디오: 내 목소리 오디오북`
- 영어 프로젝트명: `Poetry & BGM Studio`
- 대상: 3~4학년군 국어 / 음악
- 성취기준 연결: `[4국05-01]`, `[4음01-01]`
- 저장 형식: `WAV`; 브라우저 기본 MP3 인코딩은 사용하지 않는다.
- 개인정보: 녹음과 믹싱은 모두 로컬 브라우저에서 처리하며 서버 업로드를 만들지 않는다.
- 오디오 파일: `public/audio/*.wav`에 기본 샘플을 생성한다. 교사가 파일을 교체해도 같은 경로를 유지하면 앱이 그대로 동작한다.
- 마이크 제약: 배포 환경에서는 HTTPS 또는 `localhost`에서 마이크 권한이 정상 동작한다.
- 디자인 방향: 첫 화면부터 실제 스튜디오 작업 화면이다. 랜딩페이지나 제품 소개 화면을 만들지 않는다.

## File Structure

- Create: `package.json` - scripts, dependencies, project metadata
- Create: `index.html` - Vite mount point and Korean metadata
- Create: `tsconfig.json` - TypeScript app config
- Create: `tsconfig.node.json` - Vite config TypeScript config
- Create: `vite.config.ts` - React/Vitest setup
- Create: `src/main.tsx` - React entrypoint
- Create: `src/App.tsx` - app shell and state composition
- Create: `src/styles.css` - responsive classroom studio UI
- Create: `src/data/soundPalette.ts` - BGM/effect track registry
- Create: `src/lib/audioSupport.ts` - browser feature detection
- Create: `src/lib/recorder.ts` - mic recording helpers
- Create: `src/lib/mixer.ts` - offline audio mix/render helpers
- Create: `src/lib/wav.ts` - WAV encoder
- Create: `src/lib/download.ts` - filename and download helpers
- Create: `src/components/RecorderPanel.tsx` - recording controls/status
- Create: `src/components/SoundPalette.tsx` - BGM/effect buttons and hidden audio tags
- Create: `src/components/PreviewMixer.tsx` - voice+BGM preview controls
- Create: `src/components/ExportPanel.tsx` - final audio postcard export
- Create: `src/test/setup.ts` - jsdom test setup
- Create: `src/lib/audioSupport.test.ts` - support detection tests
- Create: `src/lib/soundPalette.test.ts` - sound registry tests
- Create: `src/lib/wav.test.ts` - WAV encoder tests
- Create: `src/lib/download.test.ts` - filename/download tests
- Create: `src/App.test.tsx` - UI smoke and accessibility state tests
- Create: `scripts/generate-audio-assets.mjs` - deterministic WAV sample generator
- Create: `public/audio/README.md` - teacher-facing audio replacement guide
- Create: `docs/qa/browser-smoke.md` - manual browser verification checklist
- Create: `README.md` - project overview, classroom use, local run, privacy note

## Task 1: Project Scaffold And Baseline Test

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Create package and config files**

Use this `package.json`:

```json
{
  "name": "poetry-bgm-studio",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test": "vitest --run",
    "test:watch": "vitest",
    "generate:audio": "node scripts/generate-audio-assets.mjs"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: `node_modules/` and `package-lock.json` are created.

- [ ] **Step 3: Write the first failing UI test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Poetry & BGM Studio", () => {
  it("renders the Korean classroom studio title and primary recording action", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "감성 톡톡 동시 스튜디오: 내 목소리 오디오북",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "낭송 녹음 시작" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because `src/App.tsx` has not rendered the required title and button yet.

- [ ] **Step 5: Implement minimal app shell**

Create `src/App.tsx`:

```tsx
import "./styles.css";

export default function App() {
  return (
    <main className="studio-shell">
      <section className="studio-hero" aria-labelledby="studio-title">
        <div>
          <p className="curriculum-line">3~4학년 국어 / 음악 융합</p>
          <h1 id="studio-title">감성 톡톡 동시 스튜디오: 내 목소리 오디오북</h1>
          <p className="studio-lede">
            내가 쓴 동시를 낭송하고, 시의 분위기에 맞는 소리를 골라 오디오 엽서로 저장합니다.
          </p>
        </div>
        <button type="button" className="primary-action">
          낭송 녹음 시작
        </button>
      </section>
    </main>
  );
}
```

Create `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts src
git commit -m "chore: scaffold poetry bgm studio"
```

If the repository has not been initialized, run `git init` before the commit.

## Task 2: Sound Palette And Sample Audio Assets

**Files:**
- Create: `src/data/soundPalette.ts`
- Create: `src/lib/soundPalette.test.ts`
- Create: `scripts/generate-audio-assets.mjs`
- Create: `public/audio/README.md`

- [ ] **Step 1: Write failing sound palette tests**

Create `src/lib/soundPalette.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { SOUND_TRACKS, getTrackById } from "../data/soundPalette";

describe("sound palette", () => {
  it("has the four classroom mood tracks required by the lesson idea", () => {
    expect(SOUND_TRACKS.map((track) => track.id)).toEqual([
      "rain",
      "piano",
      "waves",
      "birds",
    ]);
  });

  it("keeps gain values in a safe range under the student voice", () => {
    for (const track of SOUND_TRACKS) {
      expect(track.defaultGain).toBeGreaterThanOrEqual(0.08);
      expect(track.defaultGain).toBeLessThanOrEqual(0.35);
    }
  });

  it("finds a track by id", () => {
    expect(getTrackById("piano")?.label).toBe("잔잔한 피아노");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/soundPalette.test.ts`

Expected: FAIL because `src/data/soundPalette.ts` does not exist.

- [ ] **Step 3: Implement sound registry**

Create `src/data/soundPalette.ts`:

```ts
export type SoundCategory = "bgm" | "effect";

export type SoundTrack = {
  id: "rain" | "piano" | "waves" | "birds";
  label: string;
  description: string;
  category: SoundCategory;
  iconLabel: string;
  src: string;
  defaultGain: number;
};

export const SOUND_TRACKS: SoundTrack[] = [
  {
    id: "rain",
    label: "빗소리",
    description: "차분하고 촉촉한 분위기의 시에 어울립니다.",
    category: "effect",
    iconLabel: "비",
    src: "/audio/rain.wav",
    defaultGain: 0.22,
  },
  {
    id: "piano",
    label: "잔잔한 피아노",
    description: "따뜻하거나 조용한 마음을 표현할 때 좋습니다.",
    category: "bgm",
    iconLabel: "피아노",
    src: "/audio/piano.wav",
    defaultGain: 0.2,
  },
  {
    id: "waves",
    label: "파도 소리",
    description: "바다, 여행, 그리움이 담긴 시에 어울립니다.",
    category: "effect",
    iconLabel: "파도",
    src: "/audio/waves.wav",
    defaultGain: 0.24,
  },
  {
    id: "birds",
    label: "새소리",
    description: "아침, 숲, 봄의 느낌을 살릴 때 좋습니다.",
    category: "effect",
    iconLabel: "새",
    src: "/audio/birds.wav",
    defaultGain: 0.18,
  },
];

export function getTrackById(id: SoundTrack["id"]) {
  return SOUND_TRACKS.find((track) => track.id === id);
}
```

- [ ] **Step 4: Add deterministic audio asset generator**

Create `scripts/generate-audio-assets.mjs`. It must generate four short loopable WAV files at `public/audio/rain.wav`, `public/audio/piano.wav`, `public/audio/waves.wav`, and `public/audio/birds.wav`. Use generated tones/noise only so the repository has no copyright dependency.

Run: `npm run generate:audio`

Expected: four `.wav` files exist under `public/audio/`.

- [ ] **Step 5: Add teacher audio replacement guide**

Create `public/audio/README.md`:

```md
# Audio Assets

기본 WAV 파일은 수업 실습을 위해 로컬에서 생성한 짧은 샘플입니다.

교사가 직접 준비한 오디오로 교체하려면 파일명을 아래와 같이 유지하세요.

- `rain.wav`
- `piano.wav`
- `waves.wav`
- `birds.wav`

오디오 파일은 학생 목소리보다 작게 믹싱됩니다. 너무 큰 파일을 넣을 경우 앱 로딩과 최종 WAV 저장 시간이 길어질 수 있습니다.
```

- [ ] **Step 6: Run tests**

Run: `npm test -- src/lib/soundPalette.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/data/soundPalette.ts src/lib/soundPalette.test.ts scripts/generate-audio-assets.mjs public/audio
git commit -m "feat: add classroom sound palette"
```

## Task 3: Browser Support And Recorder Service

**Files:**
- Create: `src/lib/audioSupport.ts`
- Create: `src/lib/audioSupport.test.ts`
- Create: `src/lib/recorder.ts`
- Modify: `src/App.tsx`
- Create: `src/components/RecorderPanel.tsx`

- [ ] **Step 1: Write failing support detection tests**

Create `src/lib/audioSupport.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { getAudioSupport } from "./audioSupport";

describe("getAudioSupport", () => {
  it("reports all required APIs when they exist", () => {
    const support = getAudioSupport({
      mediaDevices: { getUserMedia: vi.fn() },
      MediaRecorder: function MediaRecorder() {},
      AudioContext: function AudioContext() {},
      OfflineAudioContext: function OfflineAudioContext() {},
    });

    expect(support.canRecord).toBe(true);
    expect(support.canMixOffline).toBe(true);
    expect(support.missing).toEqual([]);
  });

  it("lists missing APIs in Korean-friendly keys", () => {
    const support = getAudioSupport({});

    expect(support.canRecord).toBe(false);
    expect(support.canMixOffline).toBe(false);
    expect(support.missing).toEqual([
      "마이크 권한 API",
      "녹음 API",
      "오디오 재생 API",
      "오디오 저장 API",
    ]);
  });
});
```

- [ ] **Step 2: Implement support detection**

Create `src/lib/audioSupport.ts`:

```ts
type AudioSupportTarget = {
  mediaDevices?: { getUserMedia?: unknown };
  MediaRecorder?: unknown;
  AudioContext?: unknown;
  webkitAudioContext?: unknown;
  OfflineAudioContext?: unknown;
  webkitOfflineAudioContext?: unknown;
};

export function getAudioSupport(target: AudioSupportTarget = globalThis as AudioSupportTarget) {
  const hasGetUserMedia = typeof target.mediaDevices?.getUserMedia === "function";
  const hasMediaRecorder = typeof target.MediaRecorder === "function";
  const hasAudioContext =
    typeof target.AudioContext === "function" || typeof target.webkitAudioContext === "function";
  const hasOfflineAudioContext =
    typeof target.OfflineAudioContext === "function" ||
    typeof target.webkitOfflineAudioContext === "function";

  const missing = [
    !hasGetUserMedia && "마이크 권한 API",
    !hasMediaRecorder && "녹음 API",
    !hasAudioContext && "오디오 재생 API",
    !hasOfflineAudioContext && "오디오 저장 API",
  ].filter(Boolean) as string[];

  return {
    canRecord: hasGetUserMedia && hasMediaRecorder,
    canMixOffline: hasAudioContext && hasOfflineAudioContext,
    missing,
  };
}
```

- [ ] **Step 3: Implement recorder helper**

Create `src/lib/recorder.ts` with these exported functions and types:

```ts
export type RecorderState = "idle" | "requesting" | "recording" | "stopped" | "error";

export type RecordedVoice = {
  blob: Blob;
  url: string;
  mimeType: string;
  recordedAt: Date;
};

export function getPreferredMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) ?? "";
}

export function createRecordedVoice(chunks: BlobPart[], mimeType: string, recordedAt = new Date()) {
  const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
  return {
    blob,
    url: URL.createObjectURL(blob),
    mimeType: blob.type,
    recordedAt,
  };
}
```

- [ ] **Step 4: Build recorder panel UI**

Create `src/components/RecorderPanel.tsx` with buttons for:

- `낭송 녹음 시작`
- `녹음 정지`
- `내 목소리 들어보기`
- `다시 녹음`

The panel must expose a `role="status"` or `aria-live="polite"` region with these states:

- `마이크 권한을 요청하고 있습니다.`
- `녹음 중입니다. 시를 천천히 낭송해 보세요.`
- `녹음이 저장되었습니다. 배경음악을 골라 들어볼 수 있습니다.`
- `마이크를 사용할 수 없습니다. 브라우저 권한을 확인해 주세요.`

- [ ] **Step 5: Wire panel into `src/App.tsx`**

`App.tsx` should own `RecordedVoice | null` state and pass callbacks to `RecorderPanel`.

- [ ] **Step 6: Run tests**

Run: `npm test -- src/lib/audioSupport.test.ts src/App.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/lib/audioSupport.ts src/lib/audioSupport.test.ts src/lib/recorder.ts src/components/RecorderPanel.tsx src/App.tsx src/App.test.tsx
git commit -m "feat: add local voice recorder"
```

## Task 4: Offline Mixer, WAV Export, And Download Naming

**Files:**
- Create: `src/lib/wav.ts`
- Create: `src/lib/wav.test.ts`
- Create: `src/lib/mixer.ts`
- Create: `src/lib/download.ts`
- Create: `src/lib/download.test.ts`
- Create: `src/components/PreviewMixer.tsx`
- Create: `src/components/ExportPanel.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing filename tests**

Create `src/lib/download.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildPostcardFilename } from "./download";

describe("buildPostcardFilename", () => {
  it("uses a safe Korean classroom filename prefix with timestamp", () => {
    const filename = buildPostcardFilename(new Date("2026-05-09T09:08:07+09:00"));
    expect(filename).toBe("poetry-bgm-studio-20260509-090807.wav");
  });
});
```

- [ ] **Step 2: Implement filename helper**

Create `src/lib/download.ts`:

```ts
function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function buildPostcardFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `poetry-bgm-studio-${year}${month}${day}-${hour}${minute}${second}.wav`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 3: Write failing WAV encoder tests**

Create `src/lib/wav.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { encodeWav } from "./wav";

describe("encodeWav", () => {
  it("creates a WAV file header", () => {
    const wav = encodeWav([new Float32Array([0, 0.5, -0.5])], 44100);
    const text = new TextDecoder("ascii").decode(wav.slice(0, 12));

    expect(text).toBe("RIFF*\u0000\u0000\u0000WAVE");
  });
});
```

- [ ] **Step 4: Implement WAV encoder**

Create `src/lib/wav.ts`. It must export `encodeWav(channels: Float32Array[], sampleRate: number): ArrayBuffer`, clamp samples to `[-1, 1]`, and write 16-bit PCM RIFF/WAVE data.

- [ ] **Step 5: Implement offline mixer**

Create `src/lib/mixer.ts` with:

```ts
import type { SoundTrack } from "../data/soundPalette";

export type MixRequest = {
  voiceBlob: Blob;
  tracks: SoundTrack[];
  durationLimitSeconds?: number;
};

export async function renderAudioPostcard(request: MixRequest): Promise<Blob> {
  // Decode voice and selected tracks.
  // Render the voice at full gain.
  // Loop selected BGM/effects under the voice using each track's defaultGain.
  // Return a WAV Blob generated through encodeWav().
}
```

The concrete implementation must use `OfflineAudioContext` and `encodeWav`. It must not upload audio or call a remote API.

- [ ] **Step 6: Add preview and export components**

Create `PreviewMixer.tsx`:

- selected tracks appear as active buttons
- voice preview uses the recorded voice URL
- BGM/effect previews use hidden `<audio src={track.src}>` elements
- volume labels use Korean text: `목소리`, `배경음`, `효과음`

Create `ExportPanel.tsx`:

- disabled until a voice recording exists
- button text: `오디오 엽서 저장`
- progress text: `오디오 엽서를 만들고 있습니다.`
- success text: `오디오 엽서 파일을 저장했습니다.`
- error text: `오디오 저장에 실패했습니다. 다시 시도해 주세요.`

- [ ] **Step 7: Run tests**

Run: `npm test -- src/lib/download.test.ts src/lib/wav.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/lib/wav.ts src/lib/wav.test.ts src/lib/mixer.ts src/lib/download.ts src/lib/download.test.ts src/components/PreviewMixer.tsx src/components/ExportPanel.tsx src/App.tsx
git commit -m "feat: export mixed audio postcards"
```

## Task 5: Classroom Studio UI, Accessibility, And Responsive Layout

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/components/RecorderPanel.tsx`
- Modify: `src/components/SoundPalette.tsx`
- Modify: `src/components/PreviewMixer.tsx`
- Modify: `src/components/ExportPanel.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write UI behavior tests**

Extend `src/App.test.tsx` with:

```tsx
it("shows curriculum standards and local privacy note", () => {
  render(<App />);

  expect(screen.getByText("[4국05-01]")).toBeInTheDocument();
  expect(screen.getByText("[4음01-01]")).toBeInTheDocument();
  expect(screen.getByText(/녹음 파일은 이 브라우저 안에서만 처리됩니다/)).toBeInTheDocument();
});

it("renders all four sound buttons", () => {
  render(<App />);

  expect(screen.getByRole("button", { name: /빗소리/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /잔잔한 피아노/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /파도 소리/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /새소리/ })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL until the full studio UI exists.

- [ ] **Step 3: Implement final app layout**

`src/App.tsx` should compose these regions:

- Header: app title, subject line, privacy note
- Left/main region: poem title input, recording panel, voice preview
- Right/support region: achievement standards, mood guide, selected sound list
- Bottom region: sound palette, preview mixer, export panel

Use semantic landmarks:

- `<main>`
- `<section aria-labelledby="...">`
- status region with `role="status"`

- [ ] **Step 4: Implement responsive CSS**

`src/styles.css` must support:

- desktop two-column studio layout
- tablet single-column layout
- mobile controls with no horizontal scroll
- buttons with fixed minimum height so labels do not jump
- focus-visible ring for keyboard users
- `prefers-reduced-motion` support

- [ ] **Step 5: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: both PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/App.tsx src/styles.css src/components src/App.test.tsx
git commit -m "feat: polish classroom studio interface"
```

## Task 6: Browser Smoke Verification And Docs

**Files:**
- Create: `docs/qa/browser-smoke.md`
- Create: `README.md`

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

Expected: Vite serves the app on a local URL such as `http://localhost:5173/`.

- [ ] **Step 2: Verify in Browser plugin**

Use the Browser plugin first. Verify:

- first viewport shows the studio, not a landing page
- recording button requests mic permission on localhost
- recording stop creates playable voice preview
- each BGM/effect button toggles selected state
- preview plays voice and selected sound layer together
- `오디오 엽서 저장` downloads a WAV file
- desktop and mobile widths do not show horizontal overflow
- screen status text changes through recording/export states

- [ ] **Step 3: Save smoke checklist**

Create `docs/qa/browser-smoke.md`:

```md
# Browser Smoke Checklist

Date: 2026-05-09
Target: local dev server

## Checks

- [ ] Studio screen appears as the first screen.
- [ ] Microphone permission prompt appears on localhost.
- [ ] Voice recording can start and stop.
- [ ] Recorded voice preview plays.
- [ ] 빗소리, 잔잔한 피아노, 파도 소리, 새소리 buttons toggle selected state.
- [ ] Mixed preview plays without hiding controls.
- [ ] 오디오 엽서 저장 downloads a WAV file.
- [ ] Status text is announced through a visible status region.
- [ ] Mobile viewport has no horizontal overflow.
- [ ] No server upload is required.
```

- [ ] **Step 4: Write README**

Create `README.md` with:

- app purpose
- grade/subject and achievement standards
- local run commands
- microphone privacy note
- audio file replacement instructions
- browser support note for HTTPS/localhost
- test/build commands

- [ ] **Step 5: Final verification commands**

Run:

```bash
npm test
npm run build
```

Expected: both PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add README.md docs/qa/browser-smoke.md
git commit -m "docs: document poetry bgm studio classroom use"
```

## Execution Notes

- If using subagents, use `GPT-5.3-Codex-Spark` for task workers when available, following the local AGENTS.md instruction. The orchestrator and review agent stay on the main model.
- Use one worker per task only after the previous task has a passing test/build checkpoint.
- Before implementation begins, generate or sketch one visual concept for the primary studio screen and keep it as the UI reference. The implementation should build the actual usable studio as the first screen.
- Do not add accounts, uploads, cloud storage, class sharing, or AI-generated poem writing in the first version.
- Keep reset/destructive actions out of v1 except `다시 녹음`, which only replaces the current local recording.

## Self-Review

- Spec coverage: voice recording, BGM/effect buttons, combined preview, final audio saving, Korean classroom context, achievement standards, and local privacy handling are covered.
- Placeholder scan: implementation tasks define concrete files, commands, labels, and expected states.
- Type consistency: `SoundTrack`, `RecordedVoice`, `MixRequest`, `buildPostcardFilename`, and `renderAudioPostcard` are defined before use in later tasks.
