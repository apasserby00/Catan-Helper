import type { AlertSound } from "@/types";

export const ALERT_SOUNDS: AlertSound[] = [
  { id: "bell", label: "Bell", frequencies: [880, 1174.66] },
  { id: "wood", label: "Wood", frequencies: [523.25, 659.25] },
  { id: "horn", label: "Horn", frequencies: [392, 493.88] }
];
