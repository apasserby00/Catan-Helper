const BACKGROUND_MUSIC_SRC = `${import.meta.env.BASE_URL}audio/catan-clock-loop.mp3`;
const TURN_ALERT_SRC = `${import.meta.env.BASE_URL}audio/turn-alert.wav`;
const MUSIC_VOLUME = 0.12;
const DUCKED_VOLUME = 0.08;

export interface AudioController {
  unlock(): Promise<void>;
  startBackgroundMusic(): Promise<void>;
  stopBackgroundMusic(): void;
  pauseBackgroundMusic(): void;
  resumeBackgroundMusic(): Promise<void>;
  playTurnAlert(): Promise<void>;
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
  const musicElement = new Audio(BACKGROUND_MUSIC_SRC);
  const alertElement = new Audio(TURN_ALERT_SRC);
  musicElement.loop = true;
  musicElement.preload = "auto";
  musicElement.volume = 0;
  alertElement.preload = "auto";

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

      await alertElement.play();
      alertElement.pause();
      alertElement.currentTime = 0;
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

  async function playTurnAlert() {
    if (!unlocked) {
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    if (musicEnabled && musicStarted) {
      rampMusicVolume(DUCKED_VOLUME, 90);
    }

    alertElement.pause();
    alertElement.currentTime = 0;

    try {
      await alertElement.play();
    } catch {
      return;
    }

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
    alertElement.pause();
    alertElement.src = "";
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
