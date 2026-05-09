import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildPostcardFilename, downloadBlob } from "../lib/download";
import { renderAudioPostcard } from "../lib/mixer";
import { getAudioSupport } from "../lib/audioSupport";
import type { RecordedVoice } from "../lib/recorder";
import type { SoundTrack } from "../data/soundPalette";

const CLASSROOM_DURATION_CAP_SECONDS = 180;

type ExportPanelProps = {
  recordedVoice: RecordedVoice | null;
  tracks: SoundTrack[];
};

export function ExportPanel({ recordedVoice, tracks }: ExportPanelProps) {
  const support = useMemo(() => getAudioSupport(), []);
  const [status, setStatus] = useState<"idle" | "building" | "success" | "error">("idle");
  const canExport = Boolean(recordedVoice) && support.canMixOffline;
  const unsupportedMessage =
    support.missing.length > 0
      ? `오디오 저장을 지원하지 않습니다. (${support.missing.join(", ")})`
      : "오디오 저장을 지원하지 않습니다.";
  const currentExportRef = useRef(0);
  const currentVoiceRef = useRef<RecordedVoice | null>(null);

  useEffect(() => {
    currentVoiceRef.current = recordedVoice;
    currentExportRef.current += 1;
    setStatus("idle");
  }, [recordedVoice]);

  const handleExport = useCallback(async () => {
    if (!recordedVoice || !support.canMixOffline) {
      return;
    }

    const requestId = ++currentExportRef.current;
    const queuedVoice = recordedVoice;
    setStatus("building");

    try {
      const blob = await renderAudioPostcard({
        voiceBlob: queuedVoice.blob,
        tracks,
        durationLimitSeconds: CLASSROOM_DURATION_CAP_SECONDS,
      });

      if (requestId !== currentExportRef.current || currentVoiceRef.current !== queuedVoice) {
        return;
      }
      downloadBlob(blob, buildPostcardFilename());
      setStatus("success");
    } catch {
      if (requestId !== currentExportRef.current || currentVoiceRef.current !== queuedVoice) {
        return;
      }
      setStatus("error");
    }
  }, [recordedVoice, support.canMixOffline, tracks]);

  return (
    <section className="export-panel panel-card" aria-labelledby="export-title">
      <h2 id="export-title">오디오 엽서 저장</h2>
      <button
        type="button"
        className="studio-action"
        onClick={handleExport}
        disabled={!canExport || status === "building"}
      >
        오디오 엽서 저장
      </button>
      <div role="status" aria-live="polite" className="export-status">
        {status === "building"
          ? "오디오 엽서를 만들고 있습니다."
          : status === "success"
            ? "오디오 엽서 파일을 저장했습니다."
            : status === "error"
              ? "오디오 저장에 실패했습니다. 다시 시도해 주세요."
              : support.canMixOffline
                ? ""
                : unsupportedMessage}
      </div>
    </section>
  );
}
