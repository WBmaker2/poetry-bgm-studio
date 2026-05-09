# Browser Smoke Checklist

Date: 2026-05-09
Target: local dev server, `http://localhost:5180/`
Result: PASS

## Notes

- Browser layout checks were run on the local Vite dev server.
- The full recording/export smoke used a synthetic in-browser microphone stream so the test could verify `MediaRecorder` without using a classroom microphone.
- Real microphone permission should still be checked once on the teacher device before class, especially after deployment to a new HTTPS URL.

## Checks

- [x] Studio screen appears as the first screen.
- [x] Recording request path runs on localhost and shows microphone request/recording status.
- [x] Voice recording can start and stop.
- [x] Recorded voice preview is created after stop.
- [x] `빗소리`, `잔잔한 피아노`, `파도 소리`, `새소리` buttons toggle selected state.
- [x] Mixed preview controls stay visible after selecting a sound.
- [x] `오디오 엽서 저장` downloads a WAV file.
- [x] Status text is announced through visible `role="status"` regions.
- [x] Desktop viewport has no horizontal overflow.
- [x] Mobile viewport has no horizontal overflow.
- [x] No server upload is required.

## Evidence

- `npm test`: 9 test files and 32 tests passed after final review fixes.
- `npm run build`: production build passed after final review fixes.
- Playwright smoke downloaded `poetry-bgm-studio-20260509-195313.wav`.
- After recording, `낭송 녹음 시작` stayed disabled until `다시 녹음`, preventing accidental stale export.
- Desktop viewport: `1440x900`, document width `1425`, overflow `false`.
- Mobile viewport: `360x720`, document width `354`, overflow `false`.
