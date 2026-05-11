# Browser Smoke Checklist

Date: 2026-05-09
Last updated: 2026-05-11
Target: local dev server, `http://localhost:5180/`
Result: PASS

## Notes

- Browser layout checks were run on the local Vite dev server.
- The full recording/export smoke used a synthetic in-browser microphone stream so the test could verify `MediaRecorder` without using a classroom microphone.
- Real microphone permission should still be checked once on the teacher device before class, especially after deployment to a new HTTPS URL.

## 2026-05-11 Sound Palette Update

- [x] Eight sound palette buttons render: `빗소리`, `잔잔한 피아노`, `파도 소리`, `새소리`, `시냇물 소리`, `바람 소리`, `오르골`, `종소리`.
- [x] Selecting two sounds keeps those two pressed and disables the remaining unselected sound buttons.
- [x] Desktop layout shows the palette as two rows of four cards.
- [x] Mobile `360 x 720` layout wraps the palette into two columns within the viewport.

## Checks

- [x] Studio screen appears as the first screen.
- [x] Recording request path runs on localhost and shows microphone request/recording status.
- [x] Voice recording can start and stop.
- [x] Recorded voice preview is created after stop.
- [x] Sound palette buttons toggle selected state.
- [x] Sound palette selection is limited to two sounds.
- [x] Mixed preview controls stay visible after selecting a sound.
- [x] `오디오 엽서 저장` downloads a WAV file.
- [x] Status text is announced through visible `role="status"` regions.
- [x] Desktop viewport has no horizontal overflow.
- [x] Mobile viewport has no horizontal overflow.
- [x] No server upload is required.

## Evidence

- `npm test`: 10 test files and 59 tests passed after the sound palette update.
- `npm run build -- --base=/poetry-bgm-studio/`: production build passed after the sound palette update.
- Playwright smoke downloaded `poetry-bgm-studio-20260509-195313.wav`.
- After recording, `낭송 녹음 시작` stayed disabled until `다시 녹음`, preventing accidental stale export.
- Desktop viewport: `1440x900`, document width `1425`, overflow `false`.
- Mobile viewport: `360x720`, document width `354`, overflow `false`.

See also [public-page-qa.md](public-page-qa.md) for deployed GitHub Pages checks.
