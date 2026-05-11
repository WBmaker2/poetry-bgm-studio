import { describe, expect, it } from "vitest";
import { MAX_SELECTED_SOUND_TRACKS, SOUND_TRACKS, getTrackById } from "../data/soundPalette";

describe("sound palette", () => {
  it("has the eight classroom mood tracks required by the lesson idea", () => {
    expect(SOUND_TRACKS.map((track) => track.id)).toEqual([
      "rain",
      "piano",
      "waves",
      "birds",
      "stream",
      "wind",
      "musicBox",
      "bell",
    ]);
  });

  it("limits the classroom mix to two selected sounds", () => {
    expect(MAX_SELECTED_SOUND_TRACKS).toBe(2);
  });

  it("keeps gain values in a safe range under the student voice", () => {
    for (const track of SOUND_TRACKS) {
      expect(track.defaultGain).toBeGreaterThanOrEqual(0.08);
      expect(track.defaultGain).toBeLessThanOrEqual(0.35);
    }
  });

  it("finds a track by id", () => {
    expect(getTrackById("piano")?.label).toBe("잔잔한 피아노");
    expect(getTrackById("musicBox")?.label).toBe("오르골");
  });
});
