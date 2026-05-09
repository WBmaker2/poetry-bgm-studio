import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecorderPanel } from "./RecorderPanel";

type FakeTrack = { stop: ReturnType<typeof vi.fn> };

class FakeMediaStream {
  private tracks: FakeTrack[];

  constructor() {
    this.tracks = [{ stop: vi.fn() }, { stop: vi.fn() }];
  }

  getTracks() {
    return this.tracks;
  }
}

class FakeMediaRecorder {
  static instances: FakeMediaRecorder[] = [];

  static reset() {
    FakeMediaRecorder.instances = [];
  }

  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  state: "inactive" | "recording" = "inactive";
  mimeType = "audio/webm";

  constructor(public stream: FakeMediaStream) {
    FakeMediaRecorder.instances.push(this);
  }

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    this.onstop?.();
  }

  emitData() {
    this.ondataavailable?.({
      data: new Blob(["chunk"], { type: "audio/webm" }),
    });
  }

  emitError() {
    this.onerror?.();
  }
}

const getUserMediaMock = vi.fn();

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

vi.mock("../lib/audioSupport", () => ({
  getAudioSupport: vi.fn(() => ({
    canRecord: true,
    canMixOffline: false,
    missing: [],
  })),
}));

const setupMediaMocks = () => {
  vi.stubGlobal("MediaRecorder", FakeMediaRecorder as unknown);
  vi.stubGlobal("navigator", {
    ...(globalThis.navigator as unknown as Record<string, unknown>),
    mediaDevices: { getUserMedia: getUserMediaMock },
  });
  getUserMediaMock.mockResolvedValue(new FakeMediaStream());
};

const createDeferredUserMedia = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
};

describe("RecorderPanel", () => {
  afterEach(() => {
    FakeMediaRecorder.reset();
    getUserMediaMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("does not save when recording errors and later stops", async () => {
    setupMediaMocks();

    const onRecordingComplete = vi.fn();
    render(
      <RecorderPanel
        recordedVoice={null}
        onRecordingComplete={onRecordingComplete}
        onClearRecording={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "낭송 녹음 시작" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "녹음 정지" })).toBeEnabled();
    });

    const recorder = FakeMediaRecorder.instances.at(-1);
    expect(recorder).toBeDefined();
    recorder?.emitError();
    recorder?.stop();

    await waitFor(() => {
      expect(onRecordingComplete).not.toHaveBeenCalled();
      expect(screen.queryByText("녹음이 저장되었습니다. 배경음악을 골라 들어볼 수 있습니다.")).not.toBeInTheDocument();
    });
  });

  it("does not call onRecordingComplete after unmount cleanup while recording", async () => {
    setupMediaMocks();

    const onRecordingComplete = vi.fn();
    const { unmount } = render(
      <RecorderPanel
        recordedVoice={null}
        onRecordingComplete={onRecordingComplete}
        onClearRecording={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "낭송 녹음 시작" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "녹음 정지" })).toBeEnabled();
    });

    unmount();

    await waitFor(() => {
      expect(onRecordingComplete).not.toHaveBeenCalled();
    });
  });

  it("does not accept late events from previous recorder once a new session starts", async () => {
    setupMediaMocks();

    const onRecordingComplete = vi.fn();
    render(
      <RecorderPanel
        recordedVoice={null}
        onRecordingComplete={onRecordingComplete}
        onClearRecording={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "낭송 녹음 시작" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "녹음 정지" })).toBeEnabled();
    });

    const firstRecorder = FakeMediaRecorder.instances.at(0);
    expect(firstRecorder).toBeDefined();

    firstRecorder?.emitData();
    firstRecorder?.emitError();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "낭송 녹음 시작" })).toBeEnabled();
    });

    await userEvent.click(screen.getByRole("button", { name: "낭송 녹음 시작" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "녹음 정지" })).toBeEnabled();
    });

    const secondRecorder = FakeMediaRecorder.instances.at(-1);
    expect(secondRecorder).toBeDefined();
    expect(secondRecorder).not.toBe(firstRecorder);

    firstRecorder?.emitData();
    firstRecorder?.stop();

    expect(onRecordingComplete).not.toHaveBeenCalled();
    expect(screen.queryByText("녹음이 저장되었습니다. 배경음악을 골라 들어볼 수 있습니다.")).not.toBeInTheDocument();

    secondRecorder?.emitData();
    secondRecorder?.stop();

    await waitFor(() => {
      expect(onRecordingComplete).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("status")).toHaveTextContent(
        "녹음이 저장되었습니다. 배경음악을 골라 들어볼 수 있습니다.",
      );
    });
  });

  it("does not create or start recorder when component unmounts before getUserMedia resolves", async () => {
    const deferred = createDeferredUserMedia<FakeMediaStream>();
    setupMediaMocks();
    getUserMediaMock.mockReturnValue(deferred.promise);

    const onRecordingComplete = vi.fn();
    const stream = new FakeMediaStream();

    const { unmount } = render(
      <RecorderPanel
        recordedVoice={null}
        onRecordingComplete={onRecordingComplete}
        onClearRecording={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "낭송 녹음 시작" }));
    unmount();

    deferred.resolve(stream);

    await waitFor(() => {
      expect(FakeMediaRecorder.instances).toHaveLength(0);
      expect(stream.getTracks().at(0)?.stop).toHaveBeenCalledTimes(1);
      expect(stream.getTracks().at(1)?.stop).toHaveBeenCalledTimes(1);
    });

    expect(onRecordingComplete).not.toHaveBeenCalled();
  });

  it("does not save when recorder stops with no chunks", async () => {
    setupMediaMocks();

    const onRecordingComplete = vi.fn();
    render(
      <RecorderPanel
        recordedVoice={null}
        onRecordingComplete={onRecordingComplete}
        onClearRecording={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "낭송 녹음 시작" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "녹음 정지" })).toBeEnabled();
    });

    FakeMediaRecorder.instances.at(-1)?.stop();

    await waitFor(() => {
      expect(onRecordingComplete).not.toHaveBeenCalled();
      expect(screen.queryByText("녹음이 저장되었습니다. 배경음악을 골라 들어볼 수 있습니다.")).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("");
    });
  });
});
