import type { SoundTrack } from "../data/soundPalette";

type SoundPaletteProps = {
  tracks: SoundTrack[];
  selectedTrackIds: SoundTrack["id"][];
  onToggleTrack: (trackId: SoundTrack["id"]) => void;
};

export function SoundPalette({ tracks, selectedTrackIds, onToggleTrack }: SoundPaletteProps) {
  const selectedTrackSet = new Set(selectedTrackIds);

  return (
    <section aria-labelledby="sound-palette-title" className="sound-palette">
      <h2 id="sound-palette-title">사운드 팔레트</h2>
      <div className="sound-grid">
        {tracks.map((track) => {
          const descriptionId = `track-description-${track.id}`;
          const isSelected = selectedTrackSet.has(track.id);

          return (
            <button
              key={track.id}
              type="button"
              aria-pressed={isSelected}
              aria-describedby={descriptionId}
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
