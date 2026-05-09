export type RecorderState = "idle" | "requesting" | "recording" | "stopped" | "error";

export type RecordedVoice = {
  blob: Blob;
  url: string;
  mimeType: string;
  recordedAt: Date;
};

type MediaRecorderConstructor = {
  isTypeSupported?: (mimeType: string) => boolean;
};

export function getPreferredMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
  const mediaRecorder = typeof MediaRecorder !== "undefined" ? (MediaRecorder as unknown as MediaRecorderConstructor) : undefined;

  return candidates.find((type) => mediaRecorder?.isTypeSupported?.(type)) ?? "";
}

export function createRecordedVoice(chunks: BlobPart[], mimeType: string, recordedAt = new Date()) {
  const blob = new Blob(chunks, { type: mimeType || "audio/webm" });

  return {
    blob,
    url: URL.createObjectURL(blob),
    mimeType: blob.type,
    recordedAt,
  };
}
