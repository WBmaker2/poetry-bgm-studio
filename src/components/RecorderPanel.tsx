import { useEffect, useMemo, useRef, useState } from "react";
import { createRecordedVoice, getPreferredMimeType, type RecordedVoice, type RecorderState } from "../lib/recorder";
import { getAudioSupport } from "../lib/audioSupport";

type RecorderPanelProps = {
  recordedVoice: RecordedVoice | null;
  onRecordingComplete: (voice: RecordedVoice) => void;
  onClearRecording: () => void;
};

const STATUS_TEXT: Record<RecorderState, string> = {
  idle: "",
  requesting: "마이크 권한을 요청하고 있습니다.",
  recording: "녹음 중입니다. 시를 천천히 낭송해 보세요.",
  stopped: "녹음이 저장되었습니다. 배경음악을 골라 들어볼 수 있습니다.",
  error: "마이크를 사용할 수 없습니다. 브라우저 권한을 확인해 주세요.",
};

export function RecorderPanel({
  recordedVoice,
  onRecordingComplete,
  onClearRecording,
}: RecorderPanelProps) {
  const support = useMemo(() => getAudioSupport(), []);
  const [state, setState] = useState<RecorderState>(support.canRecord ? "idle" : "error");
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wasErroredRef = useRef(false);
  const isCancelledRef = useRef(false);

  const detachRecorder = (recorder: MediaRecorder | null) => {
    if (!recorder) return;
    recorder.ondataavailable = null;
    recorder.onstop = null;
    recorder.onerror = null;
  };

  const resetRecordingSession = (recorder: MediaRecorder | null) => {
    isCancelledRef.current = true;
    wasErroredRef.current = false;
    detachRecorder(recorder);
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    recorderRef.current = null;
    chunksRef.current = [];
    stopMediaTracks();
  };

  const stopMediaTracks = () => {
    const stream = mediaStreamRef.current;
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const statusMessage = STATUS_TEXT[state];
  const canStart = support.canRecord && state !== "recording" && state !== "requesting";

  const handleStart = async () => {
    if (state === "recording" || state === "requesting") {
      return;
    }
    if (!support.canRecord) {
      setState("error");
      return;
    }

    setState("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const preferredMimeType = getPreferredMimeType();
      const options = preferredMimeType ? { mimeType: preferredMimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      recorderRef.current = recorder;
      wasErroredRef.current = false;
      isCancelledRef.current = false;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (isCancelledRef.current || wasErroredRef.current) {
          return;
        }
        if (chunksRef.current.length === 0) {
          setState("idle");
          stopMediaTracks();
          return;
        }
        const mimeType = recorder.mimeType || getPreferredMimeType() || "audio/webm";
        const recorded = createRecordedVoice(chunksRef.current, mimeType);
        onRecordingComplete(recorded);
        setState("stopped");
        stopMediaTracks();
      };

      recorder.onerror = () => {
        if (isCancelledRef.current) {
          return;
        }
        wasErroredRef.current = true;
        setState("error");
        stopMediaTracks();
      };

      recorder.start();
      setState("recording");
    } catch {
      stopMediaTracks();
      setState("error");
    }
  };

  const handleStop = () => {
    const recorder = recorderRef.current;
    if (!recorder || state !== "recording") {
      return;
    }
    recorder.stop();
  };

  const handlePlay = () => {
    audioRef.current?.play();
  };

  const handleReset = () => {
    onClearRecording();
    setState("idle");
    chunksRef.current = [];
  };

  useEffect(() => () => resetRecordingSession(recorderRef.current), []);

  return (
    <section className="recorder-panel" aria-label="낭송 녹음 패널">
      <div className="recorder-actions">
        <button type="button" className="primary-action" disabled={!canStart} onClick={handleStart}>
          낭송 녹음 시작
        </button>

        <button type="button" onClick={handleStop} disabled={state !== "recording"}>
          녹음 정지
        </button>

        <button type="button" onClick={handlePlay} disabled={!recordedVoice}>
          내 목소리 들어보기
        </button>

        <button type="button" onClick={handleReset} disabled={!recordedVoice}>
          다시 녹음
        </button>
      </div>

      <div role="status" aria-live="polite" className="recorder-status">
        {statusMessage}
      </div>

      {recordedVoice ? <audio ref={audioRef} src={recordedVoice.url} controls preload="none" /> : null}
    </section>
  );
}
