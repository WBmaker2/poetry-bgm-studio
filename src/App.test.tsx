import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { RecordedVoice } from "./lib/recorder";

vi.mock("./components/RecorderPanel", () => ({
  RecorderPanel: ({ onRecordingComplete }: { onRecordingComplete: (voice: RecordedVoice) => void }) => (
    <div>
      <button type="button">낭송 녹음 시작</button>
      <button
        type="button"
        onClick={() =>
          onRecordingComplete({
            blob: new Blob(["abc"], { type: "audio/webm" }),
            url: "blob:rec-a",
            mimeType: "audio/webm",
            recordedAt: new Date(),
          })
        }
      >
        낭송 완료
      </button>
    </div>
  ),
}));

describe("Poetry & BGM Studio", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Korean classroom studio title and primary recording action", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "감성 톡톡 동시 스튜디오: 내 목소리 오디오북",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "낭송 녹음 시작" })).toBeInTheDocument();
  });

  it("revokes the latest object URL when App unmounts", async () => {
    const user = userEvent.setup();
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");

    const { unmount } = render(<App />);
    await user.click(screen.getByRole("button", { name: "낭송 완료" }));

    unmount();

    expect(revokeSpy).toHaveBeenCalledWith("blob:rec-a");
  });
});
