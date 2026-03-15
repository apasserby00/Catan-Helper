import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/lib/settings-storage";

describe("settings storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns defaults when nothing is stored", () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("persists and reloads settings", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      musicEnabled: true,
      turnDurationSec: 120
    };

    saveSettings(settings);
    expect(loadSettings()).toEqual(settings);
  });
});
