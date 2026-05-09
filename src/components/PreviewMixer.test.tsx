import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PreviewMixer } from "./PreviewMixer";
import type { RecordedVoice } from "../lib/recorder";
import type { SoundTrack } from "../data/soundPalette";

const TRACKS: SoundTrack[] = [
  {
    id: "rain",
    label: "빗소리",
    description: "차분하고 촉촉한 분위기",
    category: "effect",
    iconLabel: "비",
    src: "/audio/rain.wav",
    defaultGain: 0.22,
  },
  {
    id: "piano",
    label: "잔잔한 피아노",
    description: "조용한 분위기",
    category: "bgm",
    iconLabel: "피아노",
    src: "/audio/piano.wav",
    defaultGain: 0.2,
  },
];

const recordedVoice: RecordedVoice = {
  blob: new Blob(["audio"], { type: "audio/webm" }),
  url: "blob:voice",
  mimeType: "audio/webm",
  recordedAt: new Date("2026-05-09T00:00:00Z"),
};

describe("PreviewMixer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const prepareAudioSpies = (audios: HTMLAudioElement[]) => {
    const playSpies = audios.map((audio) => vi.spyOn(audio, "play").mockResolvedValue());
    const pauseSpies = audios.map((audio) =>
      vi.spyOn(audio, "pause").mockImplementation(function pauseAndReset(this: HTMLAudioElement) {
        this.currentTime = 0;
      }),
    );

    return {
      playSpies,
      pauseSpies,
    };
  };

  const ensurePreviewStarts = async (user: ReturnType<typeof userEvent.setup>, button: HTMLButtonElement) => {
    if (button.textContent === "미리듣기 종료") {
      await user.click(button);
    }
    await waitFor(() => {
      expect(button).toHaveTextContent("사운드 미리듣기");
    });
    await user.click(button);
    await waitFor(() => {
      expect(button).toHaveTextContent("미리듣기 종료");
    });
  };

  it("stops all selected track previews when voice playback ends", async () => {
    const user = userEvent.setup();
    const onToggleTrack = vi.fn();
    const { container } = render(
      <PreviewMixer
        recordedVoice={recordedVoice}
        tracks={TRACKS}
        selectedTrackIds={["rain"]}
        onToggleTrack={onToggleTrack}
      />,
    );

    const audios = Array.from(container.querySelectorAll("audio")) as HTMLAudioElement[];
    const voiceAudio = audios[0];
    const [rainAudio] = audios.slice(1);
    const { playSpies, pauseSpies } = prepareAudioSpies(audios);
    const voicePauseSpy = pauseSpies[0];
    const rainPauseSpy = pauseSpies[1];
    const previewButton = container.querySelector(".preview-actions button") as HTMLButtonElement;

    await ensurePreviewStarts(user, previewButton);

    const previousVoicePauseCount = voicePauseSpy.mock.calls.length;
    const previousRainPauseCount = rainPauseSpy.mock.calls.length;
    voiceAudio.dispatchEvent(new Event("ended"));

    await waitFor(() => {
      expect(previewButton).toHaveTextContent("사운드 미리듣기");
      expect(voicePauseSpy.mock.calls.length).toBeGreaterThan(previousVoicePauseCount);
      expect(rainPauseSpy.mock.calls.length).toBeGreaterThan(previousRainPauseCount);
      expect(rainAudio.currentTime).toBe(0);
      expect(voiceAudio.currentTime).toBe(0);
    });

    expect(playSpies[0]).toHaveBeenCalledTimes(1);
    expect(playSpies[1]).toHaveBeenCalledTimes(1);
  });

  it("syncs preview tracks when selection changes during preview", async () => {
    const user = userEvent.setup();
    const onToggleTrack = vi.fn();
    const { container, rerender } = render(
      <PreviewMixer
        recordedVoice={recordedVoice}
        tracks={TRACKS}
        selectedTrackIds={["rain"]}
        onToggleTrack={onToggleTrack}
      />,
    );

    const audios = Array.from(container.querySelectorAll("audio")) as HTMLAudioElement[];
    const [voiceAudio, rainAudio] = audios;
    const { pauseSpies, playSpies } = prepareAudioSpies(audios);
    const voicePauseSpy = pauseSpies[0];
    const rainPauseSpy = pauseSpies[1];
    const rainPlaySpy = playSpies[1];
    const pianoPlaySpy = playSpies[2];
    const previewButton = container.querySelector(".preview-actions button") as HTMLButtonElement;

    await ensurePreviewStarts(user, previewButton);

    const rainPauseCountBeforeSelection = rainPauseSpy.mock.calls.length;
    const voicePauseCountBeforeSelection = voicePauseSpy.mock.calls.length;

    expect(rainPlaySpy).toHaveBeenCalled();
    expect(pianoPlaySpy).not.toHaveBeenCalled();

    rerender(
      <PreviewMixer
        recordedVoice={recordedVoice}
        tracks={TRACKS}
        selectedTrackIds={["piano"]}
        onToggleTrack={onToggleTrack}
      />,
    );

    await waitFor(() => {
      expect(previewButton).toHaveTextContent("미리듣기 종료");
    });

    expect(rainPauseSpy.mock.calls.length).toBeGreaterThan(rainPauseCountBeforeSelection);
    expect(rainPauseSpy).toHaveBeenCalled();
    expect(rainAudio.currentTime).toBe(0);
    expect(pianoPlaySpy).toHaveBeenCalledTimes(1);
    expect(voicePauseSpy.mock.calls.length).toBe(voicePauseCountBeforeSelection);

    voiceAudio.dispatchEvent(new Event("ended"));
    await waitFor(() => {
      expect(previewButton).toHaveTextContent("사운드 미리듣기");
    });
  });
});
