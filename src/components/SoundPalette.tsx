import type { SoundTrack } from "../data/soundPalette";

type SoundPaletteProps = {
  tracks: SoundTrack[];
  selectedTrackIds: SoundTrack["id"][];
  maxSelected: number;
  statusMessage: string;
  onToggleTrack: (trackId: SoundTrack["id"]) => void;
};

export function SoundPalette({
  tracks,
  selectedTrackIds,
  maxSelected,
  statusMessage,
  onToggleTrack,
}: SoundPaletteProps) {
  const selectedTrackSet = new Set(selectedTrackIds);
  const isSelectionLimitReached = selectedTrackIds.length >= maxSelected;
  const limitDescriptionId = "sound-palette-limit";
  const statusId = "sound-palette-status";

  return (
    <section aria-labelledby="sound-palette-title" className="sound-palette">
      <h2 id="sound-palette-title">사운드 팔레트</h2>
      <p id={limitDescriptionId} className="sound-palette-guidance">
        시 낭송이 잘 들리도록 배경 사운드는 최대 {maxSelected}개까지 선택할 수 있습니다.
      </p>
      <p id={statusId} className="sound-palette-status" role="status" aria-live="polite">
        {statusMessage ||
          `현재 ${selectedTrackIds.length}개 선택됨. ${
            isSelectionLimitReached ? "다른 소리를 고르려면 선택한 소리를 먼저 해제하세요." : "소리를 골라 분위기를 맞춰 보세요."
          }`}
      </p>
      <div className="sound-grid">
        {tracks.map((track) => {
          const descriptionId = `track-description-${track.id}`;
          const isSelected = selectedTrackSet.has(track.id);
          const isDisabled = !isSelected && isSelectionLimitReached;

          return (
            <button
              key={track.id}
              type="button"
              aria-pressed={isSelected}
              aria-describedby={`${descriptionId} ${limitDescriptionId} ${statusId}`}
              disabled={isDisabled}
              className={isSelected ? "sound-button active" : "sound-button"}
              onClick={() => onToggleTrack(track.id)}
            >
              <span aria-hidden="true" className="sound-icon">
                {track.iconLabel}
              </span>
              <span>{track.label}</span>
              <span id={descriptionId} className="sound-description">
                {track.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
