export type SoundCategory = "bgm" | "effect";

export const MAX_SELECTED_SOUND_TRACKS = 2;

export type SoundTrack = {
  id: "rain" | "piano" | "waves" | "birds" | "stream" | "wind" | "musicBox" | "bell";
  label: string;
  description: string;
  category: SoundCategory;
  iconLabel: string;
  src: string;
  defaultGain: number;
};

function trackSrc(fileName: string) {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/+$/, "");

  return `${baseUrl}/audio/${fileName}`;
}

export const SOUND_TRACKS: SoundTrack[] = [
  {
    id: "rain",
    label: "빗소리",
    description: "차분하고 촉촉한 분위기의 시에 어울립니다.",
    category: "effect",
    iconLabel: "비",
    src: trackSrc("rain.wav"),
    defaultGain: 0.22,
  },
  {
    id: "piano",
    label: "잔잔한 피아노",
    description: "따뜻하거나 조용한 마음을 표현할 때 좋습니다.",
    category: "bgm",
    iconLabel: "피아노",
    src: trackSrc("piano.wav"),
    defaultGain: 0.2,
  },
  {
    id: "waves",
    label: "파도 소리",
    description: "바다, 여행, 그리움이 담긴 시에 어울립니다.",
    category: "effect",
    iconLabel: "파도",
    src: trackSrc("waves.wav"),
    defaultGain: 0.24,
  },
  {
    id: "birds",
    label: "새소리",
    description: "아침, 숲, 봄의 느낌을 살릴 때 좋습니다.",
    category: "effect",
    iconLabel: "새",
    src: trackSrc("birds.wav"),
    defaultGain: 0.18,
  },
  {
    id: "stream",
    label: "시냇물 소리",
    description: "맑고 잔잔한 흐름이 있는 시에 어울립니다.",
    category: "effect",
    iconLabel: "시냇물",
    src: trackSrc("stream.wav"),
    defaultGain: 0.2,
  },
  {
    id: "wind",
    label: "바람 소리",
    description: "쓸쓸함, 기다림, 계절감이 담긴 시에 좋습니다.",
    category: "effect",
    iconLabel: "바람",
    src: trackSrc("wind.wav"),
    defaultGain: 0.16,
  },
  {
    id: "musicBox",
    label: "오르골",
    description: "동화 같거나 추억이 담긴 시에 어울립니다.",
    category: "bgm",
    iconLabel: "오르골",
    src: trackSrc("music-box.wav"),
    defaultGain: 0.18,
  },
  {
    id: "bell",
    label: "종소리",
    description: "마무리, 희망, 반짝이는 순간을 살릴 때 좋습니다.",
    category: "effect",
    iconLabel: "종",
    src: trackSrc("bell.wav"),
    defaultGain: 0.14,
  },
];

export function getTrackById(id: SoundTrack["id"]) {
  return SOUND_TRACKS.find((track) => track.id === id);
}
