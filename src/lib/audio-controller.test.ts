import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAudioController } from "@/lib/audio-controller";

class FakeGainParam {
  value = 0;
  events: Array<{ type: string; value: number }> = [];

  cancelScheduledValues() {}

  setValueAtTime(value: number) {
    this.value = value;
    this.events.push({ type: "set", value });
  }

  linearRampToValueAtTime(value: number) {
    this.value = value;
    this.events.push({ type: "linear", value });
  }

  exponentialRampToValueAtTime(value: number) {
    this.value = value;
    this.events.push({ type: "exp", value });
  }
}

class FakeGainNode {
  gain = new FakeGainParam();
  connect() {}
}

class FakeOscillatorNode {
  type = "sine";
  frequency = {
    value: 0,
    setValueAtTime: (value: number) => {
      this.frequency.value = value;
    },
    linearRampToValueAtTime: (value: number) => {
      this.frequency.value = value;
    }
  };
  connect() {}
  start() {}
  stop() {}
}

class FakeAudioElement {
  static instances: FakeAudioElement[] = [];
  loop = false;
  preload = "auto";
  volume = 0;
  currentTime = 0;
  paused = true;
  src: string;

  constructor(src: string) {
    this.src = src;
    FakeAudioElement.instances.push(this);
  }

  async play() {
    this.paused = false;
  }

  pause() {
    this.paused = true;
  }
}

class FakeAudioContext {
  state: AudioContextState = "running";
  currentTime = 0;
  destination = {};
  gainNodes: FakeGainNode[] = [];
  static instances: FakeAudioContext[] = [];

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  createGain() {
    const node = new FakeGainNode();
    this.gainNodes.push(node);
    return node as unknown as GainNode;
  }

  createOscillator() {
    return new FakeOscillatorNode() as unknown as OscillatorNode;
  }

  async resume() {
    this.state = "running";
  }

  async close() {}
}

describe("audio controller", () => {
  beforeEach(() => {
    FakeAudioContext.instances = [];
    FakeAudioElement.instances = [];
    vi.stubGlobal("AudioContext", FakeAudioContext);
    vi.stubGlobal("Audio", FakeAudioElement);
  });

  it("ducks and restores background music around alerts", async () => {
    vi.useFakeTimers();
    const controller = createAudioController();
    await controller.unlock();
    await controller.setMusicEnabled(true);
    await vi.runAllTimersAsync();

    const music = FakeAudioElement.instances[0];
    expect(music.paused).toBe(false);

    const alertPromise = controller.playTurnAlert();
    await vi.runAllTimersAsync();
    await alertPromise;

    expect(music.volume).toBe(0.12);

    controller.teardown();
    vi.useRealTimers();
  });

  it("unlocks the audio element for background playback", async () => {
    const controller = createAudioController();
    await controller.unlock();

    const music = FakeAudioElement.instances[0];
    expect(music.currentTime).toBe(0);
    expect(music.paused).toBe(true);
  });

  it("does not rewind music when unlock is called again", async () => {
    const controller = createAudioController();
    await controller.unlock();

    const music = FakeAudioElement.instances[0];
    music.currentTime = 42;
    await controller.unlock();

    expect(music.currentTime).toBe(42);
  });
});
