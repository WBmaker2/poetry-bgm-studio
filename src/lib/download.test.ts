import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPostcardFilename } from "./download";
import { downloadBlob } from "./download";

describe("buildPostcardFilename", () => {
  it("uses a safe Korean classroom filename prefix with timestamp", () => {
    const filename = buildPostcardFilename(new Date("2026-05-09T09:08:07+09:00"));

    expect(filename).toBe("poetry-bgm-studio-20260509-090807.wav");
  });
});

describe("downloadBlob", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("adds anchor to DOM, clicks, removes it, and revokes URL asynchronously", () => {
    vi.useFakeTimers();
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const setTimeoutSpy = vi.spyOn(window, "setTimeout");
    const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:download-audio");
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      return undefined;
    });

    downloadBlob(new Blob(["audio"], { type: "audio/wav" }), "poetry-bgm-studio.wav");

    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    const appendedAnchor = appendChildSpy.mock.calls.at(0)?.[0];
    expect(appendedAnchor).toBeInstanceOf(HTMLAnchorElement);
    expect((appendedAnchor as HTMLAnchorElement | undefined)?.getAttribute("href")).toBe("blob:download-audio");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledWith(appendedAnchor);
    expect(revokeSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);
    expect(revokeSpy).toHaveBeenCalledWith("blob:download-audio");
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
  });

  it("removes temporary anchor and revokes URL even when anchor click throws", () => {
    vi.useFakeTimers();
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:download-audio");
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() =>
      downloadBlob(new Blob(["audio"], { type: "audio/wav" }), "poetry-bgm-studio.wav"),
    ).toThrowError("blocked");
    vi.advanceTimersByTime(150);

    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    const appendedAnchor = appendChildSpy.mock.calls.at(0)?.[0];
    expect(removeChildSpy).toHaveBeenCalledWith(appendedAnchor);
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeSpy).toHaveBeenCalledWith("blob:download-audio");
  });
});
