import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RecordedVoice } from "../lib/recorder";
import type { SoundTrack } from "../data/soundPalette";

type PreviewMixerProps = {
  recordedVoice: RecordedVoice | null;
  tracks: SoundTrack[];
  selectedTrackIds: SoundTrack["id"][];
  onToggleTrack: (trackId: SoundTrack["id"]) => void;
};

export function PreviewMixer({
  recordedVoice,
  tracks,
  selectedTrackIds,
  onToggleTrack,
}: PreviewMixerProps) {
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const trackAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [isPreviewing, setIsPreviewing] = useState(false);
  const selectedTrackIdSet = useMemo(() => new Set(selectedTrackIds), [selectedTrackIds]);
  const previousSelectedTrackIdSet = useRef<Set<SoundTrack["id"]>>(selectedTrackIdSet);

  const categorized = useMemo(() => {
    return {
      bgm: tracks.filter((track) => track.category === "bgm"),
      effect: tracks.filter((track) => track.category === "effect"),
    };
  }, [tracks]);

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

  const renderTrackButtons = (items: SoundTrack[]) =>
    items.map((track) => {
      const isActive = selectedTrackIdSet.has(track.id);
      return (
        <button
          key={track.id}
          type="button"
          aria-pressed={isActive}
          className={isActive ? "track-button active" : "track-button"}
          onClick={() => onToggleTrack(track.id)}
        >
          {track.iconLabel} {track.label}
        </button>
      );
    });

  return (
    <section aria-label="사운드 미리듣기">
      <h2>사운드 미리듣기</h2>
      <h3>목소리</h3>
      <div className="preview-actions">
        <button type="button" onClick={isPreviewing ? stopPreview : startPreview} disabled={!recordedVoice}>
          {isPreviewing ? "미리듣기 종료" : "사운드 미리듣기"}
        </button>
      </div>
      <audio ref={voiceAudioRef} src={recordedVoice?.url} preload="none" onEnded={stopPreview} />

      <h3>배경음</h3>
      <div className="track-row">{renderTrackButtons(categorized.bgm)}</div>

      <h3>효과음</h3>
      <div className="track-row">{renderTrackButtons(categorized.effect)}</div>

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
