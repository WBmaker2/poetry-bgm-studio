export type SoundCategory = "bgm" | "effect";

export type SoundTrack = {
  id: "rain" | "piano" | "waves" | "birds";
  label: string;
  description: string;
  category: SoundCategory;
  iconLabel: string;
  src: string;
  defaultGain: number;
};

export const SOUND_TRACKS: SoundTrack[] = [
  {
    id: "rain",
    label: "빗소리",
    description: "차분하고 촉촉한 분위기의 시에 어울립니다.",
    category: "effect",
    iconLabel: "비",
    src: "/audio/rain.wav",
    defaultGain: 0.22,
  },
  {
    id: "piano",
    label: "잔잔한 피아노",
    description: "따뜻하거나 조용한 마음을 표현할 때 좋습니다.",
    category: "bgm",
    iconLabel: "피아노",
    src: "/audio/piano.wav",
    defaultGain: 0.2,
  },
  {
    id: "waves",
    label: "파도 소리",
    description: "바다, 여행, 그리움이 담긴 시에 어울립니다.",
    category: "effect",
    iconLabel: "파도",
    src: "/audio/waves.wav",
    defaultGain: 0.24,
  },
  {
    id: "birds",
    label: "새소리",
    description: "아침, 숲, 봄의 느낌을 살릴 때 좋습니다.",
    category: "effect",
    iconLabel: "새",
    src: "/audio/birds.wav",
    defaultGain: 0.18,
  },
];

export function getTrackById(id: SoundTrack["id"]) {
  return SOUND_TRACKS.find((track) => track.id === id);
}
