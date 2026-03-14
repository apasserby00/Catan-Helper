import type { AppSettings } from "@/types";

const SETTINGS_KEY = "catan-helper:settings";

export const DEFAULT_SETTINGS: AppSettings = {
  musicEnabled: false,
  musicPresetId: "harbor",
  turnTimerEnabled: true,
  turnDurationSec: 90,
  turnSoundId: "bell"
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      musicEnabled: parsed.musicEnabled ?? DEFAULT_SETTINGS.musicEnabled,
      musicPresetId: parsed.musicPresetId ?? DEFAULT_SETTINGS.musicPresetId,
      turnTimerEnabled: parsed.turnTimerEnabled ?? DEFAULT_SETTINGS.turnTimerEnabled,
      turnDurationSec: parsed.turnDurationSec ?? DEFAULT_SETTINGS.turnDurationSec,
      turnSoundId: parsed.turnSoundId ?? DEFAULT_SETTINGS.turnSoundId
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
