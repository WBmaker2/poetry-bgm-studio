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
