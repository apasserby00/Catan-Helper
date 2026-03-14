import type { AlertSound, MusicPreset } from "@/types";

export const MUSIC_PRESETS: MusicPreset[] = [
  { id: "harbor", label: "Harbor", frequencies: [196, 246.94, 329.63] },
  { id: "fields", label: "Fields", frequencies: [174.61, 220, 293.66] },
  { id: "forge", label: "Forge", frequencies: [220, 277.18, 369.99] }
];

export const ALERT_SOUNDS: AlertSound[] = [
  { id: "bell", label: "Bell", frequencies: [880, 1174.66] },
  { id: "wood", label: "Wood", frequencies: [523.25, 659.25] },
  { id: "horn", label: "Horn", frequencies: [392, 493.88] }
];
