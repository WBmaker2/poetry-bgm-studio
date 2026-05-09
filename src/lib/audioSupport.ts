type AudioSupportTarget = {
  mediaDevices?: { getUserMedia?: unknown };
  MediaRecorder?: unknown;
  AudioContext?: unknown;
  webkitAudioContext?: unknown;
  OfflineAudioContext?: unknown;
  webkitOfflineAudioContext?: unknown;
};

export function getAudioSupport(target: AudioSupportTarget = globalThis as AudioSupportTarget) {
  const hasGetUserMedia = typeof target.mediaDevices?.getUserMedia === "function";
  const hasMediaRecorder = typeof target.MediaRecorder === "function";
  const hasAudioContext =
    typeof target.AudioContext === "function" || typeof target.webkitAudioContext === "function";
  const hasOfflineAudioContext =
    typeof target.OfflineAudioContext === "function" ||
    typeof target.webkitOfflineAudioContext === "function";

  const missing = [
    !hasGetUserMedia && "마이크 권한 API",
    !hasMediaRecorder && "녹음 API",
    !hasAudioContext && "오디오 재생 API",
    !hasOfflineAudioContext && "오디오 저장 API",
  ].filter(Boolean) as string[];

  return {
    canRecord: hasGetUserMedia && hasMediaRecorder,
    canMixOffline: hasAudioContext && hasOfflineAudioContext,
    missing,
  };
}
