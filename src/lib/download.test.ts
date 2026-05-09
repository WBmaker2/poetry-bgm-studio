import { describe, expect, it } from "vitest";
import { buildPostcardFilename } from "./download";

describe("buildPostcardFilename", () => {
  it("uses a safe Korean classroom filename prefix with timestamp", () => {
    const filename = buildPostcardFilename(new Date("2026-05-09T09:08:07+09:00"));

    expect(filename).toBe("poetry-bgm-studio-20260509-090807.wav");
  });
});
