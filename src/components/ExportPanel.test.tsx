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

const track2 = {
  id: "piano" as const,
  label: "잔잔한 피아노",
  description: "따뜻한 배경음에 잘 어울립니다.",
  category: "bgm" as const,
  iconLabel: "피아노",
  src: "/audio/piano.wav",
  defaultGain: 0.2,
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

    render(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="봄은 노래"
        selectedTracks={[track]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "오디오 엽서 저장" }));

    expect(renderAudioPostcard).toHaveBeenCalledWith({
      voiceBlob: recordedVoice.blob,
      tracks: [track],
      durationLimitSeconds: 180,
    });
    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), "poetry-bgm-studio.wav");
  });

  it("shows poem title, selected sounds, and reflection input in the result card", async () => {
    const user = userEvent.setup();

    render(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="겨울 종달새"
        selectedTracks={[track]}
      />,
    );

    expect(screen.getByRole("heading", { name: "결과 카드" })).toBeInTheDocument();
    expect(screen.getByText("동시 제목")).toBeInTheDocument();
    expect(screen.getByText("겨울 종달새")).toBeInTheDocument();
    expect(screen.getByText("선택 소리")).toBeInTheDocument();
    expect(screen.getByText("빗소리")).toBeInTheDocument();
    expect(screen.getByText("이 메모는 화면에만 남고 WAV 파일에는 포함되지 않습니다.")).toBeInTheDocument();
    expect(
      screen.getByLabelText("한 줄 성찰(교실 노트)"),
    ).toHaveAttribute("placeholder", "수업에서 느낀 점을 한 줄로 적어보세요.");
    expect(screen.getByText(/저장 안내: 파일 형식 WAV/i)).toBeInTheDocument();
    expect(
      screen.getByText(/poetry-bgm-studio-YYYYMMDD-HHMMSS\.wav/),
    ).toBeInTheDocument();

    await user.type(
      screen.getByRole("textbox", { name: "한 줄 성찰(교실 노트)" }),
      "목소리 톤을 더 부드럽게 바꿨더라.",
    );
    expect(screen.getByRole("textbox", { name: "한 줄 성찰(교실 노트)" })).toHaveValue(
      "목소리 톤을 더 부드럽게 바꿨더라.",
    );
  });

  it("invalidates a building export when selected tracks change", async () => {
    const user = userEvent.setup();
    const { renderAudioPostcard } = await import("../lib/mixer");
    const { downloadBlob } = await import("../lib/download");
    const deferred = createDeferred<Blob>();

    vi.mocked(renderAudioPostcard).mockReturnValue(deferred.promise);

    const { rerender } = render(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="봄은 노래"
        selectedTracks={[track]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "오디오 엽서 저장" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("오디오 엽서를 만들고 있습니다.");
    });

    rerender(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="봄은 노래"
        selectedTracks={[track, track2]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("");
    });

    deferred.resolve(new Blob(["exported-audio"], { type: "audio/wav" }));
    await Promise.resolve();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("invalidates a building export when poem title changes", async () => {
    const user = userEvent.setup();
    const { renderAudioPostcard } = await import("../lib/mixer");
    const { downloadBlob } = await import("../lib/download");
    const deferred = createDeferred<Blob>();

    vi.mocked(renderAudioPostcard).mockReturnValue(deferred.promise);

    const { rerender } = render(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="봄은 노래"
        selectedTracks={[track]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "오디오 엽서 저장" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("오디오 엽서를 만들고 있습니다.");
    });

    rerender(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="한겨울의 길"
        selectedTracks={[track]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("");
    });

    deferred.resolve(new Blob(["exported-audio"], { type: "audio/wav" }));
    await Promise.resolve();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("invalidates a building export when reflection changes", async () => {
    const user = userEvent.setup();
    const { renderAudioPostcard } = await import("../lib/mixer");
    const { downloadBlob } = await import("../lib/download");
    const deferred = createDeferred<Blob>();

    vi.mocked(renderAudioPostcard).mockReturnValue(deferred.promise);

    render(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="봄은 노래"
        selectedTracks={[track]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "오디오 엽서 저장" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("오디오 엽서를 만들고 있습니다.");
    });

    await user.type(screen.getByRole("textbox", { name: "한 줄 성찰(교실 노트)" }), "교실 노트");

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("");
    });

    deferred.resolve(new Blob(["exported-audio"], { type: "audio/wav" }));
    await Promise.resolve();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("resets status when poem title changes", async () => {
    const { renderAudioPostcard } = await import("../lib/mixer");
    vi.mocked(renderAudioPostcard).mockResolvedValue(new Blob(["export"], { type: "audio/wav" }));

    const { rerender } = render(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="봄은 노래"
        selectedTracks={[track]}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "오디오 엽서 저장" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("오디오 엽서 파일을 저장했습니다.");
    });

    rerender(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="밤하늘 노래"
        selectedTracks={[track]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("");
    });
  });

  it("resets success message when reflection changes", async () => {
    const user = userEvent.setup();
    const { renderAudioPostcard } = await import("../lib/mixer");
    vi.mocked(renderAudioPostcard).mockResolvedValue(new Blob(["export"], { type: "audio/wav" }));

    render(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="봄은 노래"
        selectedTracks={[track]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "오디오 엽서 저장" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("오디오 엽서 파일을 저장했습니다.");
    });

    await user.type(screen.getByRole("textbox", { name: "한 줄 성찰(교실 노트)" }), "오늘 느낌은");

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("");
    });
  });

  it("disables export and shows a clear browser support message without OfflineAudioContext", async () => {
    const user = userEvent.setup();
    const { renderAudioPostcard } = await import("../lib/mixer");

    vi.mocked(getAudioSupport).mockReturnValue({
      canRecord: true,
      canMixOffline: false,
      missing: ["오디오 재생 API", "오디오 저장 API"],
    });

    render(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="봄은 노래"
        selectedTracks={[track]}
      />,
    );

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

    const { rerender } = render(
      <ExportPanel
        recordedVoice={recordedVoice}
        poemTitle="봄은 노래"
        selectedTracks={[track]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "오디오 엽서 저장" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("오디오 엽서를 만들고 있습니다.");
    });

    rerender(
      <ExportPanel
        recordedVoice={secondRecordedVoice}
        poemTitle="봄은 노래"
        selectedTracks={[track]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("");
    });

    deferred.resolve(new Blob(["exported-audio"], { type: "audio/wav" }));

    await Promise.resolve();

    expect(downloadBlob).not.toHaveBeenCalled();
  });
});
