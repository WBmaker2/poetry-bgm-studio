import { describe, expect, it } from "vitest";
import { encodeWav } from "./wav";

describe("encodeWav", () => {
  it("creates a WAV file header", () => {
    const wav = encodeWav([new Float32Array([0, 0.5, -0.5])], 44100);
    const riff = new TextDecoder("ascii").decode(wav.slice(0, 4));
    const wave = new TextDecoder("ascii").decode(wav.slice(8, 12));
    const fmt = new TextDecoder("ascii").decode(wav.slice(12, 16));
    const data = new TextDecoder("ascii").decode(wav.slice(36, 40));
    const view = new DataView(wav);

    expect(riff).toBe("RIFF");
    expect(wave).toBe("WAVE");
    expect(fmt).toBe("fmt ");
    expect(data).toBe("data");
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(44100);
    expect(view.getUint16(34, true)).toBe(16);
  });
});
