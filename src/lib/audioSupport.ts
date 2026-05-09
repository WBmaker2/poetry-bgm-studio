type AudioSupportTarget = {
  navigator?: {
    mediaDevices?: { getUserMedia?: unknown };
  };
  mediaDevices?: { getUserMedia?: unknown };
  MediaRecorder?: unknown;
  AudioContext?: unknown;
  webkitAudioContext?: unknown;
  OfflineAudioContext?: unknown;
  webkitOfflineAudioContext?: unknown;
};

export function getAudioSupport(target: AudioSupportTarget = {}) {
  const globalTarget = globalThis as unknown as AudioSupportTarget;

  const mediaDevices =
    target.mediaDevices ?? target.navigator?.mediaDevices ?? globalTarget.navigator?.mediaDevices;
  const mediaRecorder = target.MediaRecorder ?? globalTarget.MediaRecorder;
  const audioContext = target.AudioContext ?? globalTarget.AudioContext;
  const webkitAudioContext = target.webkitAudioContext ?? globalTarget.webkitAudioContext;
  const offlineAudioContext = target.OfflineAudioContext ?? globalTarget.OfflineAudioContext;
  const webkitOfflineAudioContext =
    target.webkitOfflineAudioContext ?? globalTarget.webkitOfflineAudioContext;

  const hasGetUserMedia = typeof mediaDevices?.getUserMedia === "function";
  const hasMediaRecorder = typeof mediaRecorder === "function";
  const hasAudioContext = typeof audioContext === "function" || typeof webkitAudioContext === "function";
  const hasOfflineAudioContext =
    typeof offlineAudioContext === "function" || typeof webkitOfflineAudioContext === "function";

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
