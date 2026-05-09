import { encodeWav } from "./wav";
import type { SoundTrack } from "../data/soundPalette";

export type MixRequest = {
  voiceBlob: Blob;
  tracks: SoundTrack[];
  durationLimitSeconds?: number;
};

type AudioContextConstructor = new (sampleRate?: number) => BaseAudioContext;

function getAudioContext() {
  const globalThisAudio = globalThis as typeof globalThis & {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };

  return globalThisAudio.AudioContext ?? globalThisAudio.webkitAudioContext;
}

function getOfflineAudioContext() {
  const globalThisOffline = globalThis as typeof globalThis & {
    OfflineAudioContext?: typeof OfflineAudioContext;
    webkitOfflineAudioContext?: typeof OfflineAudioContext;
  };

  return globalThisOffline.OfflineAudioContext ?? globalThisOffline.webkitOfflineAudioContext;
}

async function decodeAudioBlob(context: AudioContext, blob: Blob) {
  const bytes = await blob.arrayBuffer();
  return context.decodeAudioData(bytes);
}

async function loadTrackBuffer(context: AudioContext, track: SoundTrack) {
  const response = await fetch(track.src);
  if (!response.ok) {
    throw new Error(`Failed to load track ${track.id}: ${response.statusText}`);
  }

  return decodeAudioBlob(context, await response.blob());
}

function normalizeDurationSeconds(seconds?: number) {
  if (seconds === undefined) {
    return undefined;
  }
  if (!Number.isFinite(seconds) || seconds < 0) {
    return 0;
  }

  return seconds;
}

export async function renderAudioPostcard(request: MixRequest): Promise<Blob> {
  const { voiceBlob, tracks, durationLimitSeconds } = request;
  const AudioContextCtor = getAudioContext();
  const OfflineAudioContextCtor = getOfflineAudioContext();

  if (!AudioContextCtor || !OfflineAudioContextCtor) {
    throw new Error("오디오 컨텍스트를 사용할 수 없습니다.");
  }

  const decodeContext = new AudioContextCtor();
  try {
    const recordedVoiceBuffer = await decodeAudioBlob(decodeContext, voiceBlob);
    const selectedTracks = tracks ?? [];
    const maxDuration = normalizeDurationSeconds(durationLimitSeconds);
    const renderedDurationSeconds = Math.min(
      recordedVoiceBuffer.duration,
      maxDuration === undefined ? Number.POSITIVE_INFINITY : maxDuration,
    );

    const trackBuffers = await Promise.all(selectedTracks.map((track) => loadTrackBuffer(decodeContext, track)));

    const sampleRate = recordedVoiceBuffer.sampleRate;
    const maxChannels = Math.max(
      recordedVoiceBuffer.numberOfChannels,
      ...trackBuffers.map((trackBuffer) => trackBuffer.numberOfChannels),
    );
    const renderSampleCount = Math.max(0, Math.ceil(renderedDurationSeconds * sampleRate));
    const offlineContext = new OfflineAudioContextCtor(
      maxChannels,
      renderSampleCount,
      sampleRate,
    ) as OfflineAudioContext;

    const voiceSource = offlineContext.createBufferSource();
    voiceSource.buffer = recordedVoiceBuffer;
    voiceSource.connect(offlineContext.destination);
    if (renderedDurationSeconds > 0) {
      voiceSource.start(0, 0, renderedDurationSeconds);
    }

    trackBuffers.forEach((trackBuffer, index) => {
      const track = selectedTracks[index];
      const trackSource = offlineContext.createBufferSource();
      const gainNode = offlineContext.createGain();

      trackSource.buffer = trackBuffer;
      trackSource.loop = renderedDurationSeconds > trackBuffer.duration;
      trackSource.connect(gainNode);
      gainNode.connect(offlineContext.destination);
      gainNode.gain.value = track.defaultGain;

      if (renderedDurationSeconds > 0) {
        trackSource.start(0);
        trackSource.stop(renderedDurationSeconds);
      }
    });

    const renderedBuffer = await offlineContext.startRendering();
    const renderedChannels = [];
    for (let channel = 0; channel < renderedBuffer.numberOfChannels; channel += 1) {
      renderedChannels.push(renderedBuffer.getChannelData(channel));
    }

    const wav = encodeWav(renderedChannels, sampleRate);

    return new Blob([wav], { type: "audio/wav" });
  } finally {
    if ("close" in decodeContext && typeof decodeContext.close === "function") {
      await decodeContext.close();
    }
  }
}
