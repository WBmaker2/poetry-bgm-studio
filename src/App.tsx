import { useCallback, useEffect, useMemo, useState } from "react";
import { ExportPanel } from "./components/ExportPanel";
import { PreviewMixer } from "./components/PreviewMixer";
import { SoundPalette } from "./components/SoundPalette";
import { RecorderPanel } from "./components/RecorderPanel";
import { SOUND_TRACKS } from "./data/soundPalette";
import { type RecordedVoice } from "./lib/recorder";
import "./styles.css";
import type { SoundTrack } from "./data/soundPalette";

export default function App() {
  const [recordedVoice, setRecordedVoice] = useState<RecordedVoice | null>(null);
  const [poemTitle, setPoemTitle] = useState("이번 주 동시");
  const [selectedTrackIds, setSelectedTrackIds] = useState<SoundTrack["id"][]>([]);

  const selectedTracks = useMemo(
    () => SOUND_TRACKS.filter((track) => selectedTrackIds.includes(track.id)),
    [selectedTrackIds],
  );

  const handleToggleTrack = useCallback((trackId: SoundTrack["id"]) => {
    setSelectedTrackIds((previousTrackIds) => {
      if (previousTrackIds.includes(trackId)) {
        return previousTrackIds.filter((id) => id !== trackId);
      }

      return [...previousTrackIds, trackId];
    });
  }, []);

  const handleRecordingComplete = useCallback((voice: RecordedVoice) => {
    setRecordedVoice((previousVoice) => {
      if (previousVoice) {
        URL.revokeObjectURL(previousVoice.url);
      }
      return voice;
    });
  }, []);

  const handleClearRecording = useCallback(() => {
    setRecordedVoice((previousVoice) => {
      if (previousVoice) {
        URL.revokeObjectURL(previousVoice.url);
      }
      return null;
    });
    setSelectedTrackIds([]);
  }, []);

  useEffect(() => {
    return () => {
      if (recordedVoice) {
        URL.revokeObjectURL(recordedVoice.url);
      }
    };
  }, [recordedVoice]);

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <p className="curriculum-line" aria-label="수업 기준">
          <span className="std-tag">[4국05-01]</span>
          말의 운율 찾기 ·
          <span className="std-tag">[4음01-01]</span>
          영상자료와 음향 결합
        </p>
        <h1 id="studio-title">감성 톡톡 동시 스튜디오: 내 목소리 오디오북</h1>
        <p className="studio-lede">
          동시 제목과 목소리를 입력하면 배경음과 효과음을 붙여 수업 시간에 바로 들려줄 오디오 엽서를
          만듭니다.
        </p>
        <p className="studio-privacy">
          녹음 파일은 이 브라우저 안에서만 처리됩니다. 업로드 없이 즉시 저장하고 제출할 수 있습니다.
        </p>
      </header>

      <div className="studio-layout">
        <section className="studio-main" aria-labelledby="studio-main-title">
          <h2 id="studio-main-title">수업 작업 공간</h2>
          <label htmlFor="poem-title" className="studio-label">
            동시 제목
          </label>
          <input
            id="poem-title"
            className="poem-input"
            value={poemTitle}
            onChange={(event) => setPoemTitle(event.target.value)}
          />
          <RecorderPanel
            recordedVoice={recordedVoice}
            onRecordingComplete={handleRecordingComplete}
            onClearRecording={handleClearRecording}
          />
        </section>

        <aside className="studio-support" aria-labelledby="studio-support-title">
          <h2 id="studio-support-title">수업 안내</h2>
          <section
            className="support-card"
            aria-labelledby="studio-standard-title"
          >
            <h3 id="studio-standard-title">성취기준</h3>
            <p>[4국05-01] 시의 정서 표현</p>
            <p>[4음01-01] 듣고 분류한 소리를 합성해 분위기를 만들기</p>
          </section>

          <section className="support-card" aria-labelledby="studio-mood-title">
            <h3 id="studio-mood-title">무드 가이드</h3>
            <ul>
              <li>조용하고 차분한 시 → 빗소리, 새소리</li>
              <li>기쁨과 포근한 분위기 → 잔잔한 피아노</li>
              <li>떠남·그리움 느낌 → 파도 소리</li>
            </ul>
          </section>

          <section className="support-card" aria-labelledby="studio-selected-title">
            <h3 id="studio-selected-title">선택한 소리</h3>
            {selectedTracks.length > 0 ? (
              <ul>
                {selectedTracks.map((track) => (
                  <li key={track.id}>{track.label}</li>
                ))}
              </ul>
            ) : (
              <p>아직 선택한 소리가 없습니다.</p>
            )}
          </section>

          <section className="studio-status" role="status" aria-live="polite">
            {poemTitle ? <p>현재 동시 제목: {poemTitle}</p> : <p>동시 제목을 입력해 주세요.</p>}
          </section>
        </aside>
      </div>

      <section className="studio-bottom" aria-labelledby="studio-bottom-title">
        <h2 id="studio-bottom-title" className="sr-only">
          사운드 선택, 미리듣기, 저장
        </h2>
        <SoundPalette tracks={SOUND_TRACKS} selectedTrackIds={selectedTrackIds} onToggleTrack={handleToggleTrack} />
        <PreviewMixer
          recordedVoice={recordedVoice}
          tracks={SOUND_TRACKS}
          selectedTrackIds={selectedTrackIds}
        />
        <ExportPanel recordedVoice={recordedVoice} tracks={selectedTracks} />
      </section>
    </main>
  );
}
