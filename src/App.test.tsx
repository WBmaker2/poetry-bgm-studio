import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { RecordedVoice } from "./lib/recorder";

vi.mock("./lib/audioSupport", () => ({
  getAudioSupport: vi.fn(() => ({
    canRecord: true,
    canMixOffline: true,
    missing: [],
  })),
}));

vi.mock("./components/RecorderPanel", () => ({
  RecorderPanel: ({
    isMicrophoneCheckActive,
    onBusyChange,
    onRecordingComplete,
    onClearRecording,
  }: {
    isMicrophoneCheckActive?: boolean;
    onBusyChange?: (isBusy: boolean) => void;
    onClearRecording?: () => void;
    onRecordingComplete: (voice: RecordedVoice) => void;
  }) => (
    <div>
      <button type="button" disabled={Boolean(isMicrophoneCheckActive)} onClick={() => onBusyChange?.(true)}>
        낭송 녹음 시작
      </button>
      <button type="button" onClick={() => onBusyChange?.(false)}>
        낭송 정지
      </button>
      <button
        type="button"
        onClick={() =>
          onRecordingComplete({
            blob: new Blob(["abc"], { type: "audio/webm" }),
            url: "blob:rec-a",
            mimeType: "audio/webm",
            recordedAt: new Date(),
          })
        }
      >
        낭송 완료
      </button>
      <button type="button" onClick={onClearRecording}>
        녹음 초기화
      </button>
    </div>
  ),
}));

describe("Poetry & BGM Studio", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the Korean classroom studio title and primary recording action", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "감성 톡톡 동시 스튜디오: 내 목소리 오디오북",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "낭송 녹음 시작" })).toBeInTheDocument();
  });

  it("shows classroom step 1 by default before title is entered", () => {
    render(<App />);

    const stepNav = screen.getByRole("region", { name: "수업 모드 단계" });
    expect(within(stepNav).getByRole("listitem", { name: "1. 제목 입력" })).toHaveAttribute("aria-current", "step");
    expect(within(stepNav).getByRole("listitem", { name: "2. 녹음" })).not.toHaveAttribute("aria-current", "step");
    expect(within(stepNav).getByRole("listitem", { name: "3. 소리 선택" })).not.toHaveAttribute("aria-current", "step");
    expect(within(stepNav).getByRole("listitem", { name: "4. 미리듣기/저장" })).not.toHaveAttribute("aria-current", "step");
  });

  it("updates to step 2 after 제목 입력", async () => {
    const user = userEvent.setup();
    render(<App />);

    const poemTitle = screen.getByRole("textbox", { name: "동시 제목" });
    await user.type(poemTitle, "봄이 오는 날");

    const stepNav = screen.getByRole("region", { name: "수업 모드 단계" });
    expect(within(stepNav).getByRole("listitem", { name: "2. 녹음" })).toHaveAttribute("aria-current", "step");
    expect(within(stepNav).getByRole("listitem", { name: "1. 제목 입력" })).not.toHaveAttribute("aria-current", "step");
  });

  it("updates to step 3 after recording completes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole("textbox", { name: "동시 제목" }), "밤하늘");
    await user.click(screen.getByRole("button", { name: "낭송 완료" }));

    const stepNav = screen.getByRole("region", { name: "수업 모드 단계" });
    expect(within(stepNav).getByRole("listitem", { name: "3. 소리 선택" })).toHaveAttribute("aria-current", "step");
    expect(within(stepNav).getByRole("listitem", { name: "2. 녹음" })).not.toHaveAttribute("aria-current", "step");
  });

  it("updates to step 4 when a sound is selected", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole("textbox", { name: "동시 제목" }), "우산 속 이야기");
    await user.click(screen.getByRole("button", { name: "낭송 완료" }));
    await user.click(screen.getByRole("button", { name: /빗소리/ }));

    const stepNav = screen.getByRole("region", { name: "수업 모드 단계" });
    expect(within(stepNav).getByRole("listitem", { name: "4. 미리듣기/저장" })).toHaveAttribute("aria-current", "step");
    expect(within(stepNav).getByRole("listitem", { name: "3. 소리 선택" })).not.toHaveAttribute("aria-current", "step");
  });

  it("moves back to step 3 when the selected sound is removed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole("textbox", { name: "동시 제목" }), "달빛 아래");
    await user.click(screen.getByRole("button", { name: "낭송 완료" }));
    await user.click(screen.getByRole("button", { name: /빗소리/ }));

    await user.click(screen.getByRole("button", { name: /빗소리/ }));

    const stepNav = screen.getByRole("region", { name: "수업 모드 단계" });
    expect(within(stepNav).getByRole("listitem", { name: "3. 소리 선택" })).toHaveAttribute("aria-current", "step");
    expect(within(stepNav).getByRole("listitem", { name: "4. 미리듣기/저장" })).not.toHaveAttribute("aria-current", "step");
  });

  it("returns to step 1 when the poem title is cleared", async () => {
    const user = userEvent.setup();
    render(<App />);

    const poemTitleInput = screen.getByRole("textbox", { name: "동시 제목" });
    await user.type(poemTitleInput, "가을의 노래");

    const stepNav = screen.getByRole("region", { name: "수업 모드 단계" });
    expect(within(stepNav).getByRole("listitem", { name: "2. 녹음" })).toHaveAttribute("aria-current", "step");

    await user.clear(poemTitleInput);

    expect(within(stepNav).getByRole("listitem", { name: "1. 제목 입력" })).toHaveAttribute("aria-current", "step");
    expect(within(stepNav).getByRole("listitem", { name: "2. 녹음" })).not.toHaveAttribute("aria-current", "step");
  });

  it("moves to step 2 when the recording is cleared", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole("textbox", { name: "동시 제목" }), "밤하늘 아래");
    await user.click(screen.getByRole("button", { name: "낭송 완료" }));
    await user.click(screen.getByRole("button", { name: /빗소리/ }));
    await user.click(screen.getByRole("button", { name: /녹음 초기화/ }));

    const stepNav = screen.getByRole("region", { name: "수업 모드 단계" });
    expect(within(stepNav).getByRole("listitem", { name: "2. 녹음" })).toHaveAttribute("aria-current", "step");
    expect(within(stepNav).getByRole("listitem", { name: "3. 소리 선택" })).not.toHaveAttribute("aria-current", "step");
    expect(within(stepNav).getByRole("listitem", { name: "4. 미리듣기/저장" })).not.toHaveAttribute("aria-current", "step");
  });

  it("shows curriculum standards and local privacy note", () => {
    render(<App />);

    expect(screen.getByText("[4국05-01]")).toBeInTheDocument();
    expect(screen.getByText("[4음01-01]")).toBeInTheDocument();
    expect(
      screen.getByText(/녹음 파일은 이 브라우저 안에서만 처리됩니다/),
    ).toBeInTheDocument();
  });

  it("shows classroom-ready microphone test control", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "마이크 테스트" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "낭송 녹음 시작" })).toBeInTheDocument();
  });

  it("renders all eight sound buttons", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: /빗소리/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /잔잔한 피아노/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /파도 소리/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /새소리/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /시냇물 소리/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /바람 소리/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /오르골/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /종소리/ })).toBeInTheDocument();
  });

  it("limits the sound palette to two selected sounds", async () => {
    const user = userEvent.setup();
    render(<App />);

    const rainButton = screen.getByRole("button", { name: /빗소리/ });
    const pianoButton = screen.getByRole("button", { name: /잔잔한 피아노/ });
    const wavesButton = screen.getByRole("button", { name: /파도 소리/ });

    await user.click(rainButton);
    await user.click(pianoButton);

    expect(rainButton).toHaveAttribute("aria-pressed", "true");
    expect(pianoButton).toHaveAttribute("aria-pressed", "true");
    expect(wavesButton).toBeDisabled();
    expect(screen.getByText(/현재 2개 선택되었습니다/)).toBeInTheDocument();

    await user.click(rainButton);

    expect(wavesButton).not.toBeDisabled();
    expect(rainButton).toHaveAttribute("aria-pressed", "false");
  });

  it("revokes the latest object URL when App unmounts", async () => {
    const user = userEvent.setup();
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");

    const { unmount } = render(<App />);
    await user.click(screen.getByRole("button", { name: "낭송 완료" }));

    unmount();

    expect(revokeSpy).toHaveBeenCalledWith("blob:rec-a");
  });

  it("blocks main recording start while microphone precheck is requesting", async () => {
    const pending = new Promise<MediaStream>(() => {});
    vi.stubGlobal("MediaRecorder", class {
      start() {
        return;
      }
    });
    vi.stubGlobal("navigator", {
      ...(globalThis.navigator as unknown as Record<string, unknown>),
      mediaDevices: {
        getUserMedia: vi.fn(() => pending),
      },
    });

    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "마이크 테스트" }));
    expect(screen.getByRole("button", { name: "낭송 녹음 시작" })).toBeDisabled();
  });

  it("disables microphone test while main recording is active/requesting", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "낭송 녹음 시작" }));
    expect(screen.getByRole("button", { name: "마이크 테스트" })).toBeDisabled();
  });
});
