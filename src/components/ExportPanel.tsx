import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildPostcardFilename, downloadBlob } from "../lib/download";
import { renderAudioPostcard } from "../lib/mixer";
import { getAudioSupport } from "../lib/audioSupport";
import type { RecordedVoice } from "../lib/recorder";
import type { SoundTrack } from "../data/soundPalette";

const CLASSROOM_DURATION_CAP_SECONDS = 180;

type ExportPanelProps = {
  recordedVoice: RecordedVoice | null;
  poemTitle: string;
  selectedTracks: SoundTrack[];
};

export function ExportPanel({ recordedVoice, poemTitle, selectedTracks }: ExportPanelProps) {
  const support = useMemo(() => getAudioSupport(), []);
  const [status, setStatus] = useState<"idle" | "building" | "success" | "error">("idle");
  const [reflection, setReflection] = useState("");
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
  }, [recordedVoice, selectedTracks, poemTitle, reflection]);

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
        tracks: selectedTracks,
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
  }, [recordedVoice, selectedTracks, support.canMixOffline]);

  return (
    <section className="export-panel panel-card" aria-labelledby="export-title">
      <h2 id="export-title">오디오 엽서 저장</h2>
      <div className="export-result-card">
        <h3 className="export-result-title">결과 카드</h3>
        <p className="export-result-line">
          <span className="export-result-label">동시 제목</span>
          <span>{poemTitle.trim() ? poemTitle : "제목이 비어있습니다."}</span>
        </p>
        <div className="export-result-field">
          <span className="export-result-label" id="selected-sound-list-label">
            선택 소리
          </span>
          {selectedTracks.length > 0 ? (
            <ul className="export-result-list" aria-labelledby="selected-sound-list-label">
              {selectedTracks.map((track) => (
                <li key={track.id}>{track.label}</li>
              ))}
            </ul>
          ) : (
            <p className="export-result-empty" aria-labelledby="selected-sound-list-label">
              아직 소리를 선택하지 않았습니다.
            </p>
          )}
        </div>
        <label htmlFor="reflection-note" className="export-result-label">
          한 줄 성찰(교실 노트)
        </label>
        <textarea
          id="reflection-note"
          className="export-reflection"
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
          rows={1}
          maxLength={120}
          placeholder="수업에서 느낀 점을 한 줄로 적어보세요."
        />
        <p className="export-reflection-hint">이 메모는 화면에만 남고 WAV 파일에는 포함되지 않습니다.</p>
        <p className="export-format-hint">
          저장 안내: 파일 형식 WAV, 파일명은 poetry-bgm-studio-YYYYMMDD-HHMMSS.wav
        </p>
      </div>
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
