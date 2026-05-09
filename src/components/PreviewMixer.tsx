import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RecordedVoice } from "../lib/recorder";
import type { SoundTrack } from "../data/soundPalette";

type PreviewMixerProps = {
  recordedVoice: RecordedVoice | null;
  tracks: SoundTrack[];
  selectedTrackIds: SoundTrack["id"][];
};

export function PreviewMixer({
  recordedVoice,
  tracks,
  selectedTrackIds,
}: PreviewMixerProps) {
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const trackAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [isPreviewing, setIsPreviewing] = useState(false);
  const selectedTrackIdSet = useMemo(() => new Set(selectedTrackIds), [selectedTrackIds]);
  const previousSelectedTrackIdSet = useRef<Set<SoundTrack["id"]>>(selectedTrackIdSet);

  const registerTrackAudio = useCallback((trackId: string, element: HTMLAudioElement | null) => {
    if (element) {
      trackAudioRefs.current[trackId] = element;
      element.loop = true;
    } else {
      delete trackAudioRefs.current[trackId];
    }
  }, []);

  const stopAllPreviews = useCallback(() => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.currentTime = 0;
    }

    Object.values(trackAudioRefs.current).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, []);

  const tryPlay = (audio: HTMLAudioElement) => {
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browser autoplay restrictions are expected to block some immediate starts.
    });
  };

  const stopPreview = useCallback(() => {
    stopAllPreviews();
    setIsPreviewing(false);
  }, [stopAllPreviews]);

  const startPreview = useCallback(() => {
    if (!recordedVoice || !voiceAudioRef.current) {
      return;
    }
    stopAllPreviews();
    setIsPreviewing(true);

    const playTargets = [voiceAudioRef.current];
    selectedTrackIdSet.forEach((trackId) => {
      const trackAudio = trackAudioRefs.current[trackId];
      if (trackAudio) {
        playTargets.push(trackAudio);
      }
    });

    playTargets.forEach((audio) => {
      tryPlay(audio);
    });
  }, [recordedVoice, selectedTrackIdSet, stopAllPreviews]);

  useEffect(() => {
    if (!isPreviewing) {
      previousSelectedTrackIdSet.current = selectedTrackIdSet;
      return;
    }

    const nextSet = selectedTrackIdSet;
    const prevSet = previousSelectedTrackIdSet.current;

    prevSet.forEach((trackId) => {
      if (!nextSet.has(trackId)) {
        const trackAudio = trackAudioRefs.current[trackId];
        if (trackAudio) {
          trackAudio.pause();
          trackAudio.currentTime = 0;
        }
      }
    });

    nextSet.forEach((trackId) => {
      if (!prevSet.has(trackId)) {
        const trackAudio = trackAudioRefs.current[trackId];
        if (trackAudio) {
          tryPlay(trackAudio);
        }
      }
    });

    previousSelectedTrackIdSet.current = nextSet;
  }, [isPreviewing, selectedTrackIdSet]);

  return (
    <section aria-labelledby="preview-mixer-title" className="preview-mixer">
      <h2 id="preview-mixer-title">사운드 미리듣기</h2>
      <p>목소리와 선택한 사운드를 함께 들어보고 바로 저장해 보세요.</p>
      <div className="preview-actions">
        <button
          type="button"
          className="studio-action"
          onClick={isPreviewing ? stopPreview : startPreview}
          disabled={!recordedVoice}
        >
          {isPreviewing ? "미리듣기 종료" : "사운드 미리듣기"}
        </button>
      </div>
      <audio ref={voiceAudioRef} src={recordedVoice?.url} preload="none" onEnded={stopPreview} />
      <p className="preview-hint" role="status" aria-live="polite">
        {selectedTrackIdSet.size > 0
          ? `현재 ${selectedTrackIdSet.size}개 사운드가 선택되어 있습니다.`
          : "아직 사운드가 선택되지 않았습니다."}
      </p>
      {tracks.map((track) => (
        <audio
          key={`preview-${track.id}`}
          ref={(element) => registerTrackAudio(track.id, element)}
          src={track.src}
          preload="none"
          hidden
        />
      ))}
    </section>
  );
}
