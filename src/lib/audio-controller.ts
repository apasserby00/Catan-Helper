import { ALERT_SOUNDS, MUSIC_PRESETS } from "@/config/audio-presets";

export interface AudioController {
  unlock(): Promise<void>;
  startBackgroundMusic(presetId: string): Promise<void>;
  stopBackgroundMusic(): void;
  pauseBackgroundMusic(): void;
  resumeBackgroundMusic(): Promise<void>;
  playTurnAlert(soundId: string): Promise<void>;
  setMusicEnabled(enabled: boolean, presetId: string): Promise<void>;
  teardown(): void;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function createAudioController(): AudioController {
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return {
      async unlock() {},
      async startBackgroundMusic() {},
      stopBackgroundMusic() {},
      pauseBackgroundMusic() {},
      async resumeBackgroundMusic() {},
      async playTurnAlert() {},
      async setMusicEnabled() {},
      teardown() {}
    };
  }

  const context = new AudioContextCtor();
  const masterGain = context.createGain();
  const musicGain = context.createGain();
  const alertGain = context.createGain();
  masterGain.gain.value = 0.9;
  musicGain.gain.value = 0;
  alertGain.gain.value = 0.9;
  musicGain.connect(masterGain);
  alertGain.connect(masterGain);
  masterGain.connect(context.destination);

  let unlocked = false;
  let musicStarted = false;
  let musicOscillators: OscillatorNode[] = [];
  let musicEnabled = false;
  let currentPresetId = "harbor";

  async function unlock() {
    if (context.state === "suspended") {
      await context.resume();
    }
    unlocked = true;
  }

  function clearMusic() {
    musicOscillators.forEach((oscillator) => oscillator.stop());
    musicOscillators = [];
    musicStarted = false;
    musicGain.gain.cancelScheduledValues(context.currentTime);
    musicGain.gain.setValueAtTime(0, context.currentTime);
  }

  async function startBackgroundMusic(presetId: string) {
    currentPresetId = presetId;
    if (!musicEnabled || !unlocked) {
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    const preset = MUSIC_PRESETS.find((entry) => entry.id === presetId) ?? MUSIC_PRESETS[0];
    clearMusic();
    musicOscillators = preset.frequencies.map((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index % 2 === 0 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? 0.05 : 0.03;
      oscillator.connect(gain);
      gain.connect(musicGain);
      oscillator.start();
      return oscillator;
    });
    musicStarted = true;
    musicGain.gain.cancelScheduledValues(context.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.16, context.currentTime + 0.45);
  }

  function stopBackgroundMusic() {
    clearMusic();
  }

  function pauseBackgroundMusic() {
    musicGain.gain.cancelScheduledValues(context.currentTime);
    musicGain.gain.linearRampToValueAtTime(0, context.currentTime + 0.15);
  }

  async function resumeBackgroundMusic() {
    if (!musicStarted) {
      await startBackgroundMusic(currentPresetId);
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    musicGain.gain.cancelScheduledValues(context.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.16, context.currentTime + 0.3);
  }

  async function playTurnAlert(soundId: string) {
    if (!unlocked) {
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    const sound = ALERT_SOUNDS.find((entry) => entry.id === soundId) ?? ALERT_SOUNDS[0];
    const now = context.currentTime;
    const restoreTarget = musicEnabled && musicStarted ? 0.16 : 0;

    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(0.05, now + 0.08);

    sound.frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 0 ? "square" : "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + index * 0.1);
      oscillator.connect(gain);
      gain.connect(alertGain);
      oscillator.start(now);
      oscillator.stop(now + 0.5 + index * 0.1);
    });

    await wait(500);
    musicGain.gain.cancelScheduledValues(context.currentTime);
    musicGain.gain.linearRampToValueAtTime(restoreTarget, context.currentTime + 0.3);
  }

  async function setMusicEnabled(enabled: boolean, presetId: string) {
    musicEnabled = enabled;
    currentPresetId = presetId;
    if (!enabled) {
      stopBackgroundMusic();
      return;
    }

    await startBackgroundMusic(presetId);
  }

  function teardown() {
    clearMusic();
    void context.close();
  }

  return {
    unlock,
    startBackgroundMusic,
    stopBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic,
    playTurnAlert,
    setMusicEnabled,
    teardown
  };
}
