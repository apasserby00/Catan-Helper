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
    }
  };
  connect() {}
  start() {}
  stop() {}
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
    vi.stubGlobal("AudioContext", FakeAudioContext);
  });

  it("ducks and restores background music around alerts", async () => {
    vi.useFakeTimers();
    const controller = createAudioController();
    await controller.unlock();
    await controller.setMusicEnabled(true, "harbor");
    const alertPromise = controller.playTurnAlert("bell");
    await vi.runAllTimersAsync();
    await alertPromise;

    const instance = FakeAudioContext.instances[0];
    const musicGain = instance.gainNodes[1];
    expect(musicGain.gain.events.some((event) => event.type === "linear" && event.value === 0.05)).toBe(true);
    expect(musicGain.gain.events.some((event) => event.type === "linear" && event.value === 0.16)).toBe(true);

    controller.teardown();
    vi.useRealTimers();
  });
});
