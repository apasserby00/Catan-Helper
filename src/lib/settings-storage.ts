import type { AppSettings } from "@/types";

const SETTINGS_KEY = "catan-clock:settings";

export const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  musicEnabled: false,
  turnTimerEnabled: true,
  turnDurationSec: 90
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
      language: parsed.language ?? DEFAULT_SETTINGS.language,
      musicEnabled: parsed.musicEnabled ?? DEFAULT_SETTINGS.musicEnabled,
      turnTimerEnabled: parsed.turnTimerEnabled ?? DEFAULT_SETTINGS.turnTimerEnabled,
      turnDurationSec: parsed.turnDurationSec ?? DEFAULT_SETTINGS.turnDurationSec
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
