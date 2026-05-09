import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExportPanel } from "./ExportPanel";
import type { RecordedVoice } from "../lib/recorder";
import { getAudioSupport } from "../lib/audioSupport";

const track = {
  id: "rain" as const,
  label: "빗소리",
  description: "차분하고 촉촉한 분위기",
  category: "effect" as const,
  iconLabel: "비",
  src: "/audio/rain.wav",
  defaultGain: 0.22,
};

const recordedVoice: RecordedVoice = {
  blob: new Blob(["audio"], { type: "audio/webm" }),
  url: "blob:voice",
  mimeType: "audio/webm",
  recordedAt: new Date("2026-05-09T00:00:00Z"),
};

const secondRecordedVoice: RecordedVoice = {
  blob: new Blob(["audio-2"], { type: "audio/webm" }),
  url: "blob:voice-2",
  mimeType: "audio/webm",
  recordedAt: new Date("2026-05-09T00:00:10Z"),
};

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
};

vi.mock("../lib/mixer", () => ({
  renderAudioPostcard: vi.fn(),
}));

vi.mock("../lib/download", () => ({
  buildPostcardFilename: vi.fn(() => "poetry-bgm-studio.wav"),
  downloadBlob: vi.fn(),
}));

vi.mock("../lib/audioSupport", () => ({
  getAudioSupport: vi.fn(() => ({
    canRecord: true,
    canMixOffline: true,
    missing: [],
  })),
}));

describe("ExportPanel", () => {
  afterEach(() => {
    vi.mocked(getAudioSupport).mockReturnValue({
      canRecord: true,
      canMixOffline: true,
      missing: [],
    });
    vi.clearAllMocks();
  });

  it("passes classroom-safe duration cap into renderAudioPostcard", async () => {
    const user = userEvent.setup();
    const { renderAudioPostcard } = await import("../lib/mixer");
    const { downloadBlob } = await import("../lib/download");

    vi.mocked(renderAudioPostcard).mockResolvedValue(new Blob(["export"], { type: "audio/wav" }));

    render(<ExportPanel recordedVoice={recordedVoice} tracks={[track]} />);

    await user.click(screen.getByRole("button", { name: "오디오 엽서 저장" }));

    expect(renderAudioPostcard).toHaveBeenCalledWith({
      voiceBlob: recordedVoice.blob,
      tracks: [track],
      durationLimitSeconds: 180,
    });
    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), "poetry-bgm-studio.wav");
  });

  it("disables export and shows a clear browser support message without OfflineAudioContext", async () => {
    const user = userEvent.setup();
    const { renderAudioPostcard } = await import("../lib/mixer");

    vi.mocked(getAudioSupport).mockReturnValue({
      canRecord: true,
      canMixOffline: false,
      missing: ["오디오 재생 API", "오디오 저장 API"],
    });

    render(<ExportPanel recordedVoice={recordedVoice} tracks={[track]} />);

    const exportButton = screen.getByRole("button", { name: "오디오 엽서 저장" });
    expect(exportButton).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "오디오 저장을 지원하지 않습니다. (오디오 재생 API, 오디오 저장 API)",
    );

    await user.click(exportButton);

    expect(renderAudioPostcard).not.toHaveBeenCalled();
  });

  it("does not download when the recording is replaced while export is still building", async () => {
    const user = userEvent.setup();
    const { renderAudioPostcard } = await import("../lib/mixer");
    const { downloadBlob } = await import("../lib/download");
    const deferred = createDeferred<Blob>();

    vi.mocked(renderAudioPostcard).mockReturnValue(deferred.promise);

    const { rerender } = render(<ExportPanel recordedVoice={recordedVoice} tracks={[track]} />);
    await user.click(screen.getByRole("button", { name: "오디오 엽서 저장" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("오디오 엽서를 만들고 있습니다.");
    });

    rerender(<ExportPanel recordedVoice={secondRecordedVoice} tracks={[track]} />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("");
    });

    deferred.resolve(new Blob(["exported-audio"], { type: "audio/wav" }));

    await Promise.resolve();

    expect(downloadBlob).not.toHaveBeenCalled();
  });
});
