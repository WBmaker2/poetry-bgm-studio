const RIFF_ID = "RIFF";
const WAVE_ID = "WAVE";
const FMT_ID = "fmt ";
const DATA_ID = "data";
const PCM_FORMAT = 1;
const BITS_PER_SAMPLE = 16;

function clampSample(sample: number) {
  if (Number.isNaN(sample)) {
    return 0;
  }

  return Math.max(-1, Math.min(1, sample));
}

function writeAscii(view: DataView, offset: number, text: string) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

function encodeSample(value: number) {
  const clamped = clampSample(value);
  if (clamped === -1) {
    return -32768;
  }
  const scaled = Math.round(clamped * 32767);

  return Math.max(-32768, Math.min(32767, scaled));
}

export function encodeWav(channels: Float32Array[], sampleRate: number): ArrayBuffer {
  const channelCount = Math.max(1, channels.length);
  const frameCount = channels.reduce((maxLength, channel) => Math.max(maxLength, channel.length), 0);
  const bytesPerSample = BITS_PER_SAMPLE / 8;
  const blockAlign = channelCount * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataByteCount = frameCount * blockAlign;
  const totalByteCount = 44 + dataByteCount;
  const buffer = new ArrayBuffer(totalByteCount);
  const view = new DataView(buffer);

  writeAscii(view, 0, RIFF_ID);
  view.setUint32(4, totalByteCount - 8, true);
  writeAscii(view, 8, WAVE_ID);
  writeAscii(view, 12, FMT_ID);
  view.setUint32(16, 16, true);
  view.setUint16(20, PCM_FORMAT, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);
  writeAscii(view, 36, DATA_ID);
  view.setUint32(40, dataByteCount, true);

  let cursor = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = channels[channel]?.[frame] ?? 0;
      view.setInt16(cursor, encodeSample(sample), true);
      cursor += bytesPerSample;
    }
  }

  return buffer;
}
