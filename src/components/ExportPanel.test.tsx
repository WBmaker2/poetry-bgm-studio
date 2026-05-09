import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExportPanel } from "./ExportPanel";
import type { RecordedVoice } from "../lib/recorder";

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

vi.mock("../lib/mixer", () => ({
  renderAudioPostcard: vi.fn(),
}));

vi.mock("../lib/download", () => ({
  buildPostcardFilename: vi.fn(() => "poetry-bgm-studio.wav"),
  downloadBlob: vi.fn(),
}));

describe("ExportPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
});
