import { useEffect, useMemo, useRef, useState } from "react";
import { getPreferredMimeType } from "../lib/recorder";
import { getAudioSupport } from "../lib/audioSupport";

type CheckStatus = "ready" | "requesting" | "testing" | "success" | "error";

const CHECK_DURATION_MS = 500;

const STATUS_TEXT: Record<CheckStatus, string> = {
  ready: "마이크 테스트를 실행해 수업 전 점검을 마쳐 주세요.",
  requesting: "마이크 권한을 요청하고 있습니다.",
  testing: "마이크 경로를 테스트하고 있습니다. 0.5초간 말해 보세요.",
  success: "마이크 테스트가 완료되었습니다. 수업에 사용할 준비가 됐습니다.",
  error: "마이크 테스트에 실패했습니다. 브라우저 권한을 확인해 주세요.",
};

export function MicrophoneCheckPanel() {
  const support = useMemo(() => getAudioSupport(), []);
  const [status, setStatus] = useState<CheckStatus>(support.canRecord ? "ready" : "error");
  const statusText = STATUS_TEXT[status];
  const isMountedRef = useRef(true);
  const activeTestRef = useRef(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  const clearScheduledStop = () => {
    if (stopTimerRef.current !== null) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  };

  const stopMediaTracks = (stream: MediaStream | null = mediaStreamRef.current) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    if (stream === mediaStreamRef.current) {
      mediaStreamRef.current = null;
    }
  };

  const detachRecorder = (recorder: MediaRecorder | null) => {
    if (!recorder) return;
    recorder.ondataavailable = null;
    recorder.onstop = null;
    recorder.onerror = null;
  };

  const cleanupSession = (recorder: MediaRecorder | null = recorderRef.current) => {
    clearScheduledStop();
    detachRecorder(recorder);
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    stopMediaTracks();
    recorderRef.current = null;
  };

  const runMicrophoneCheck = async () => {
    if (!support.canRecord || status === "requesting" || status === "testing") {
      return;
    }

    const testId = ++activeTestRef.current;
    setStatus("requesting");

    let recorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isMountedRef.current || activeTestRef.current !== testId) {
        stopMediaTracks(stream);
        return;
      }

      mediaStreamRef.current = stream;
      const preferredMimeType = getPreferredMimeType();
      const options = preferredMimeType ? { mimeType: preferredMimeType } : undefined;
      recorder = new MediaRecorder(stream, options);

      if (!isMountedRef.current || activeTestRef.current !== testId) {
        stopMediaTracks(stream);
        return;
      }

      recorderRef.current = recorder;

      recorder.onstop = () => {
        if (recorderRef.current !== recorder || activeTestRef.current !== testId || !isMountedRef.current) {
          return;
        }
        stopMediaTracks();
        setStatus("success");
      };

      recorder.onerror = () => {
        if (recorderRef.current !== recorder || activeTestRef.current !== testId || !isMountedRef.current) {
          return;
        }
        cleanupSession(recorder);
        setStatus("error");
      };

      recorder.start();
      if (recorderRef.current !== recorder || activeTestRef.current !== testId || !isMountedRef.current) {
        cleanupSession(recorder);
        return;
      }

      setStatus("testing");
      stopTimerRef.current = window.setTimeout(() => {
        if (recorderRef.current === recorder && activeTestRef.current === testId && isMountedRef.current) {
          recorder.stop();
        }
      }, CHECK_DURATION_MS);
    } catch {
      if (recorderRef.current === recorder && activeTestRef.current === testId) {
        cleanupSession(recorder);
      } else if (stream) {
        stopMediaTracks(stream);
      }
      if (isMountedRef.current && activeTestRef.current === testId) {
        setStatus("error");
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      activeTestRef.current += 1;
      cleanupSession(recorderRef.current);
    };
  }, []);

  return (
    <section className="microphone-check panel-card" aria-labelledby="microphone-check-title">
      <h2 id="microphone-check-title">마이크 사전 점검</h2>
      <button
        type="button"
        className="studio-action primary"
        disabled={!support.canRecord || status === "requesting" || status === "testing"}
        onClick={runMicrophoneCheck}
      >
        마이크 테스트
      </button>
      <div role="status" aria-live="polite" className="microphone-check-status">
        {statusText}
      </div>
    </section>
  );
}
