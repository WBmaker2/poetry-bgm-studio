import { useCallback, useState } from "react";
import { buildPostcardFilename, downloadBlob } from "../lib/download";
import { renderAudioPostcard } from "../lib/mixer";
import type { RecordedVoice } from "../lib/recorder";
import type { SoundTrack } from "../data/soundPalette";

type ExportPanelProps = {
  recordedVoice: RecordedVoice | null;
  tracks: SoundTrack[];
};

export function ExportPanel({ recordedVoice, tracks }: ExportPanelProps) {
  const [status, setStatus] = useState<"idle" | "building" | "success" | "error">("idle");
  const canExport = Boolean(recordedVoice);

  const handleExport = useCallback(async () => {
    if (!recordedVoice) {
      return;
    }

    setStatus("building");
    try {
      const blob = await renderAudioPostcard({
        voiceBlob: recordedVoice.blob,
        tracks,
      });

      downloadBlob(blob, buildPostcardFilename());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [recordedVoice, tracks]);

  return (
    <section className="export-panel" aria-label="오디오 엽서 저장">
      <button type="button" onClick={handleExport} disabled={!canExport || status === "building"}>
        오디오 엽서 저장
      </button>
      <div role="status" aria-live="polite" className="export-status">
        {status === "building" ? "오디오 엽서를 만들고 있습니다." : status === "success" ? "오디오 엽서 파일을 저장했습니다." : status === "error" ? "오디오 저장에 실패했습니다. 다시 시도해 주세요." : ""}
      </div>
    </section>
  );
}
