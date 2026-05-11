import { render, screen } from "@testing-library/react";
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
  }: {
    isMicrophoneCheckActive?: boolean;
    onBusyChange?: (isBusy: boolean) => void;
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

  it("renders all four sound buttons", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: /빗소리/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /잔잔한 피아노/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /파도 소리/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /새소리/ })).toBeInTheDocument();
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
