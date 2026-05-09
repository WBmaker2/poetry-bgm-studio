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
