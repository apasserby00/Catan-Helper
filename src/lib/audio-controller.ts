import { ALERT_SOUNDS } from "@/config/audio-presets";

const BACKGROUND_MUSIC_SRC = `${import.meta.env.BASE_URL}audio/catan-clock-loop.mp3`;
const MUSIC_VOLUME = 0.22;
const DUCKED_VOLUME = 0.08;

export interface AudioController {
  unlock(): Promise<void>;
  startBackgroundMusic(): Promise<void>;
  stopBackgroundMusic(): void;
  pauseBackgroundMusic(): void;
  resumeBackgroundMusic(): Promise<void>;
  playTurnAlert(soundId: string): Promise<void>;
  setMusicEnabled(enabled: boolean): Promise<void>;
  teardown(): void;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function createAudioController(): AudioController {
  const AudioContextCtor =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

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
  const alertGain = context.createGain();
  const musicElement = new Audio(BACKGROUND_MUSIC_SRC);
  musicElement.loop = true;
  musicElement.preload = "auto";
  musicElement.volume = 0;

  masterGain.gain.value = 1;
  alertGain.gain.value = 1;
  alertGain.connect(masterGain);
  masterGain.connect(context.destination);

  let unlocked = false;
  let musicEnabled = false;
  let musicStarted = false;
  let volumeTimers: number[] = [];

  function clearVolumeTimers() {
    volumeTimers.forEach((timer) => window.clearTimeout(timer));
    volumeTimers = [];
  }

  function rampMusicVolume(target: number, durationMs: number) {
    clearVolumeTimers();
    const start = musicElement.volume;
    const steps = 6;

    for (let step = 1; step <= steps; step += 1) {
      const timer = window.setTimeout(() => {
        const progress = step / steps;
        musicElement.volume = start + (target - start) * progress;
      }, (durationMs / steps) * step);
      volumeTimers.push(timer);
    }
  }

  async function unlock() {
    if (context.state === "suspended") {
      await context.resume();
    }

    if (unlocked) {
      return;
    }

    unlocked = true;

    try {
      await musicElement.play();
      musicElement.pause();
      musicElement.currentTime = 0;
    } catch {
      // Browsers may still require another gesture; ignore and retry on later calls.
    }
  }

  async function startBackgroundMusic() {
    if (!musicEnabled || !unlocked) {
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    clearVolumeTimers();
    musicElement.pause();
    musicElement.currentTime = 0;
    musicElement.volume = 0;

    try {
      await musicElement.play();
      musicStarted = true;
      rampMusicVolume(MUSIC_VOLUME, 420);
    } catch {
      musicStarted = false;
    }
  }

  function stopBackgroundMusic() {
    clearVolumeTimers();
    musicElement.pause();
    musicElement.currentTime = 0;
    musicElement.volume = 0;
    musicStarted = false;
  }

  function pauseBackgroundMusic() {
    if (!musicStarted) {
      return;
    }

    rampMusicVolume(0, 180);
    const timer = window.setTimeout(() => {
      musicElement.pause();
    }, 180);
    volumeTimers.push(timer);
  }

  async function resumeBackgroundMusic() {
    if (!musicEnabled || !unlocked) {
      return;
    }

    if (!musicStarted) {
      try {
        await musicElement.play();
        musicStarted = true;
      } catch {
        return;
      }
    } else {
      try {
        await musicElement.play();
      } catch {
        return;
      }
    }

    rampMusicVolume(MUSIC_VOLUME, 280);
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

    if (musicEnabled && musicStarted) {
      rampMusicVolume(DUCKED_VOLUME, 90);
    }

    sound.frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 0 ? "square" : "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32 + index * 0.08);
      oscillator.connect(gain);
      gain.connect(alertGain);
      oscillator.start(now);
      oscillator.stop(now + 0.45 + index * 0.08);
    });

    await wait(420);

    if (musicEnabled && musicStarted) {
      rampMusicVolume(MUSIC_VOLUME, 260);
    }
  }

  async function setMusicEnabled(enabled: boolean) {
    musicEnabled = enabled;
    if (!enabled) {
      stopBackgroundMusic();
      return;
    }

    if (musicStarted) {
      rampMusicVolume(MUSIC_VOLUME, 220);
      return;
    }

    await startBackgroundMusic();
  }

  function teardown() {
    clearVolumeTimers();
    musicElement.pause();
    musicElement.src = "";
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
