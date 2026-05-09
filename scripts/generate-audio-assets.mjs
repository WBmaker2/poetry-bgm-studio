import fs from "node:fs";
import path from "node:path";

const SAMPLE_RATE = 44100;
const BIT_DEPTH = 16;
const CHANNELS = 1;
const DURATION_SECONDS = 3;
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION_SECONDS;
const OUTPUT_DIR = path.resolve("public", "audio");

const TWOPI = Math.PI * 2;

function ensureDirectoryExists(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function floatToInt16Sample(sample) {
  const clamped = Math.max(-1, Math.min(1, sample));
  return Math.round(clamped * 32767);
}

function writeWav(samples, sampleRate = SAMPLE_RATE) {
  const numSamples = samples.length;
  const blockAlign = (CHANNELS * BIT_DEPTH) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;
  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  buffer.write("RIFF", offset, 4, "ascii");
  offset += 4;
  buffer.writeUInt32LE(fileSize, offset);
  offset += 4;
  buffer.write("WAVE", offset, 4, "ascii");
  offset += 4;
  buffer.write("fmt ", offset, 4, "ascii");
  offset += 4;
  buffer.writeUInt32LE(16, offset);
  offset += 4;
  buffer.writeUInt16LE(1, offset);
  offset += 2;
  buffer.writeUInt16LE(CHANNELS, offset);
  offset += 2;
  buffer.writeUInt32LE(sampleRate, offset);
  offset += 4;
  buffer.writeUInt32LE(byteRate, offset);
  offset += 4;
  buffer.writeUInt16LE(blockAlign, offset);
  offset += 2;
  buffer.writeUInt16LE(BIT_DEPTH, offset);
  offset += 2;
  buffer.write("data", offset, 4, "ascii");
  offset += 4;
  buffer.writeUInt32LE(dataSize, offset);
  offset += 4;

  for (const sample of samples) {
    buffer.writeInt16LE(floatToInt16Sample(sample), offset);
    offset += 2;
  }

  return buffer;
}

function lcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return (state / 0x100000000) * 2 - 1;
  };
}

function applyLoopFade(samples) {
  const fadeLength = Math.floor(SAMPLE_RATE * 0.05);
  for (let i = 0; i < fadeLength && i < samples.length; i += 1) {
    const gain = i / fadeLength;
    samples[i] *= gain;
    samples[samples.length - 1 - i] *= gain;
  }
}

function generateRainTone() {
  const noise = lcg(0x1234abcd);
  const samples = new Array(TOTAL_SAMPLES);
  for (let i = 0; i < TOTAL_SAMPLES; i += 1) {
    const t = i / SAMPLE_RATE;
    const slowWave = Math.sin(TWOPI * 0.35 * t) * 0.2;
    const wind = noise();
    const rumble = Math.sin(TWOPI * 120 * t) * 0.15;
    const drop = Math.sin(TWOPI * (0.5 + slowWave) * t);
    samples[i] = (wind * 0.3 + rumble * 0.15 + 0.2 * drop) * (0.7 + slowWave * 0.2);
  }
  applyLoopFade(samples);
  return samples;
}

function generatePianoTone() {
  const samples = new Array(TOTAL_SAMPLES);
  for (let i = 0; i < TOTAL_SAMPLES; i += 1) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, (i / SAMPLE_RATE) / 0.25);
    const release = 1 - Math.max(0, (i - SAMPLE_RATE * 2.4) / (SAMPLE_RATE * 0.6));
    const envelope = Math.min(attack, release);
    const fundamental = Math.sin(TWOPI * 261.626 * t) * 0.45;
    const third = Math.sin(TWOPI * 392.438 * t) * 0.2;
    const fifth = Math.sin(TWOPI * 523.251 * t) * 0.15;
    const overtone = Math.sin(TWOPI * 783.991 * t) * 0.12;
    samples[i] = (fundamental + third + fifth + overtone) * envelope * 0.25;
  }
  applyLoopFade(samples);
  return samples;
}

function generateWavesTone() {
  const samples = new Array(TOTAL_SAMPLES);
  for (let i = 0; i < TOTAL_SAMPLES; i += 1) {
    const t = i / SAMPLE_RATE;
    const swell = Math.sin(TWOPI * 0.3 * t);
    const low = Math.sin(TWOPI * 174.614 * t) * (0.32 + swell * 0.05);
    const mid = Math.sin(TWOPI * 349.228 * t) * 0.12;
    const high = Math.sin(TWOPI * 523.251 * t) * 0.08;
    const lfo = (0.6 + 0.4 * Math.sin(TWOPI * 1.0 * t));
    samples[i] = (low + mid + high) * lfo * 0.6;
  }
  applyLoopFade(samples);
  return samples;
}

function generateBirdsTone() {
  const samples = new Array(TOTAL_SAMPLES);
  for (let i = 0; i < TOTAL_SAMPLES; i += 1) {
    const t = i / SAMPLE_RATE;
    const flutter = (Math.sin(TWOPI * 4.5 * t) + 1) * 0.5;
    const chirpStart = (Math.sin(TWOPI * (700 + 300 * flutter) * t) * 0.12);
    const chirpEnd = (Math.sin(TWOPI * (980 + 220 * Math.sin(TWOPI * 0.12 * t)) * t) * 0.12);
    const harmonic = Math.sin(TWOPI * 1318.51 * t) * (0.25 + 0.12 * flutter) * 0.08;
    const pulse = ((Math.sin(TWOPI * 1.8 * t) + 1) * 0.5) ** 3;
    samples[i] = (chirpStart + chirpEnd + harmonic) * (0.5 + 0.5 * pulse) * 0.8;
  }
  applyLoopFade(samples);
  return samples;
}

function writeTrack(fileName, sampleGenerator) {
  const samples = sampleGenerator();
  const wavBuffer = writeWav(samples);
  const outputPath = path.join(OUTPUT_DIR, fileName);
  fs.writeFileSync(outputPath, wavBuffer);
}

function main() {
  ensureDirectoryExists(OUTPUT_DIR);
  writeTrack("rain.wav", generateRainTone);
  writeTrack("piano.wav", generatePianoTone);
  writeTrack("waves.wav", generateWavesTone);
  writeTrack("birds.wav", generateBirdsTone);
  console.log(`Generated WAV assets: ${["rain", "piano", "waves", "birds"].join(", ")} in ${OUTPUT_DIR}`);
}

main();
