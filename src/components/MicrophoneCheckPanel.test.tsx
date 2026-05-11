import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, afterEach, expect, it, vi } from "vitest";
import { MicrophoneCheckPanel } from "./MicrophoneCheckPanel";

type FakeTrack = {
  stop: ReturnType<typeof vi.fn>;
};

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
  static shouldThrowOnStart = false;

  static reset() {
    FakeMediaRecorder.instances = [];
    FakeMediaRecorder.shouldThrowOnStart = false;
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
    if (FakeMediaRecorder.shouldThrowOnStart) {
      throw new Error("MediaRecorder failed");
    }
    this.state = "recording";
  }

  stop() {
    if (this.state === "inactive") {
      return;
    }
    this.state = "inactive";
    this.onstop?.();
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

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
};

const setupMediaMocks = (stream = new FakeMediaStream()) => {
  vi.stubGlobal("MediaRecorder", FakeMediaRecorder as unknown);
  vi.stubGlobal("navigator", {
    ...(globalThis.navigator as unknown as Record<string, unknown>),
    mediaDevices: { getUserMedia: getUserMediaMock },
  });
  getUserMediaMock.mockResolvedValue(stream);
  return stream;
};

describe("MicrophoneCheckPanel", () => {
  afterEach(() => {
    FakeMediaRecorder.reset();
    getUserMediaMock.mockReset();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("요청 버튼을 누르면 마이크 권한이 분리되어 요청된다", async () => {
    setupMediaMocks();
    const user = userEvent.setup();
    const deferred = createDeferred<FakeMediaStream>();
    const pendingStream = new FakeMediaStream();
    getUserMediaMock.mockReturnValue(deferred.promise);

    render(<MicrophoneCheckPanel />);

    await user.click(screen.getByRole("button", { name: "마이크 테스트" }));

    expect(getUserMediaMock).toHaveBeenCalledWith({ audio: true });
    expect(screen.getByRole("status")).toHaveTextContent("마이크 권한을 요청하고 있습니다.");
    deferred.resolve(pendingStream);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("마이크 경로를 테스트하고 있습니다. 0.5초간 말해 보세요.");
    });

    expect(pendingStream.getTracks().at(0)?.stop).not.toHaveBeenCalled();
  });

  it("테스트 성공 시 결과를 표시하고 미디어 트랙을 정지한다", async () => {
    const stream = setupMediaMocks();
    const user = userEvent.setup();

    render(<MicrophoneCheckPanel />);

    await user.click(screen.getByRole("button", { name: "마이크 테스트" }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("마이크 경로를 테스트하고 있습니다. 0.5초간 말해 보세요.");
    });

    await waitFor(
      () => {
        expect(stream.getTracks().at(0)?.stop).toHaveBeenCalled();
      },
      { timeout: 1200 },
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("마이크 테스트가 완료되었습니다. 수업에 사용할 준비가 됐습니다.");
      expect(stream.getTracks().at(0)?.stop).toHaveBeenCalledTimes(1);
      expect(stream.getTracks().at(1)?.stop).toHaveBeenCalledTimes(1);
      expect(FakeMediaRecorder.instances).toHaveLength(1);
    });
  });

  it("권한 요청 실패 시 오류 상태를 보여준다", async () => {
    const stream = setupMediaMocks();
    getUserMediaMock.mockRejectedValue(new Error("denied"));
    const user = userEvent.setup();

    render(<MicrophoneCheckPanel />);
    await user.click(screen.getByRole("button", { name: "마이크 테스트" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("마이크 테스트에 실패했습니다. 브라우저 권한을 확인해 주세요.");
      expect(stream.getTracks().at(0)?.stop).not.toHaveBeenCalled();
    });
  });

  it("마이크 점검 중 에러 발생 시 실패 상태가 된다", async () => {
    const stream = setupMediaMocks();
    FakeMediaRecorder.shouldThrowOnStart = true;
    const user = userEvent.setup();

    render(<MicrophoneCheckPanel />);
    await user.click(screen.getByRole("button", { name: "마이크 테스트" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("마이크 테스트에 실패했습니다. 브라우저 권한을 확인해 주세요.");
      expect(stream.getTracks().at(0)?.stop).toHaveBeenCalledTimes(1);
    });
  });
});
