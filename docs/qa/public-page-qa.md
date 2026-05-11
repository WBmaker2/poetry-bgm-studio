# Public Page QA

Date: 2026-05-09
Target: https://wbmaker2.github.io/poetry-bgm-studio/
Repository: https://github.com/WBmaker2/poetry-bgm-studio
Baseline deployed commit at check time: `723e535`
Baseline deployed run at check time: `25599543948` (`Deploy GitHub Pages`, success)
Result: PASS

## Network Checks

- [x] HTML entry responds with HTTP 200.
- [x] JavaScript bundle responds with HTTP 200.
- [x] CSS bundle responds with HTTP 200.
- [x] `audio/rain.wav` responds with HTTP 200 and `audio/wav`.
- [x] Inline SVG favicon is present, so the page no longer requests a missing `/favicon.ico`.

## Browser Rendering Checks

Browser automation opened the public URL and confirmed:

- [x] Page title: `감성 톡톡 동시 스튜디오: 내 목소리 오디오북`
- [x] Main heading rendered on the first screen.
- [x] `낭송 녹음 시작` button rendered.
- [x] Four sound palette buttons rendered.
- [x] Four visible `role="status"` regions rendered.

## Responsive Checks

| Viewport | Document Width | Body Width | Horizontal Overflow |
| --- | ---: | ---: | --- |
| 1440 x 900 | 1425 | 1425 | false |
| 360 x 720 | 354 | 345 | false |

## Out of Scope

This public QA confirms page delivery, asset loading, rendered UI landmarks, and responsive layout. Real microphone permission, physical audio input, and classroom download behavior must be checked with [real-device-microphone-check.md](real-device-microphone-check.md).
