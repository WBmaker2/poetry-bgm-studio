import { afterEach, describe, expect, it, vi } from "vitest";
import { renderAudioPostcard } from "./mixer";

describe("renderAudioPostcard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createAudioBuffer = (duration: number, sampleRate = 44100, numberOfChannels = 1) => ({
    duration,
    numberOfChannels,
    sampleRate,
    getChannelData: vi.fn(() => new Float32Array([0])),
  });

  it("throws clear error when recorded voice has zero duration", async () => {
    vi.stubGlobal(
      "AudioContext",
      class {
        decodeAudioData = vi.fn().mockResolvedValue(createAudioBuffer(0));
        close = vi.fn().mockResolvedValue(undefined);
      },
    );
    vi.stubGlobal(
      "OfflineAudioContext",
      class {
        constructor() {}
      },
    );

    await expect(
      renderAudioPostcard({
        voiceBlob: new Blob(["voice"], { type: "audio/webm" }),
        tracks: [],
      }),
    ).rejects.toThrow("녹음된 목소리 길이가 0초");
  });

  it("renders at least one frame when duration rounds to zero frames", async () => {
    const offlineCtorCalls: Array<[number, number, number]> = [];

    vi.stubGlobal(
      "AudioContext",
      class {
        decodeAudioData = vi.fn().mockResolvedValue(createAudioBuffer(1 / 44100 / 2));
        close = vi.fn().mockResolvedValue(undefined);
      },
    );
    vi.stubGlobal(
      "OfflineAudioContext",
      class {
        constructor(channels: number, length: number, sampleRate: number) {
          offlineCtorCalls.push([channels, length, sampleRate]);
        }
        createBufferSource() {
          return {
            connect: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
            buffer: null,
          };
        }
        createGain() {
          return {
            connect: vi.fn(),
            gain: { value: 1 },
          };
        }
        destination = {};
        startRendering = vi.fn().mockResolvedValue({
          numberOfChannels: 1,
          getChannelData: () => new Float32Array([0, 0, 0]),
        });
      },
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob([], { type: "audio/wav" })),
      }),
    );

    const blob = await renderAudioPostcard({
      voiceBlob: new Blob(["voice"], { type: "audio/webm" }),
      tracks: [],
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(offlineCtorCalls[0]?.[1]).toBe(1);
  });

  it("throws clear error when duration cap is invalid", async () => {
    vi.stubGlobal(
      "AudioContext",
      class {
        decodeAudioData = vi.fn().mockResolvedValue(createAudioBuffer(1));
        close = vi.fn().mockResolvedValue(undefined);
      },
    );
    vi.stubGlobal(
      "OfflineAudioContext",
      class {
        constructor() {}
      },
    );

    await expect(
      renderAudioPostcard({
        voiceBlob: new Blob(["voice"], { type: "audio/webm" }),
        tracks: [],
        durationLimitSeconds: 0,
      }),
    ).rejects.toThrow("재생 제한 시간이 0초 이하거나 음수입니다.");
  });
});
