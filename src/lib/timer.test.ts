import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/settings-storage";
import {
  acknowledgeTurnAlert,
  createSession,
  finishSession,
  formatDuration,
  getElapsedMs,
  getTurnReconciliation,
  pauseSession,
  resumeSession,
  skipToNextTurn
} from "@/lib/timer";

describe("timer helpers", () => {
  it("tracks start, pause, resume, and finish correctly", () => {
    const session = createSession(DEFAULT_SETTINGS, 1_000);
    expect(getElapsedMs(session, 6_000)).toBe(5_000);

    const paused = pauseSession(session, 11_000);
    expect(paused.status).toBe("paused");
    expect(getElapsedMs(paused, 20_000)).toBe(10_000);

    const resumed = resumeSession(paused, 30_000);
    expect(getElapsedMs(resumed, 34_000)).toBe(14_000);

    const record = finishSession(resumed, "Alex", 40_000);
    expect(record.durationMs).toBe(20_000);
    expect(record.winner).toBe("Alex");
    expect(record.turnDurationSec).toBe(90);
    expect(record.completedTurns).toBe(0);
  });

  it("reconciles turn cycles after background elapsed time", () => {
    const session = createSession(
      {
        ...DEFAULT_SETTINGS,
        turnDurationSec: 30
      },
      0
    );

    const reconciliation = getTurnReconciliation(session, 95_000);
    expect(reconciliation.completedCycles).toBe(3);
    expect(reconciliation.currentCycleElapsedMs).toBe(5_000);
    expect(reconciliation.msUntilNextAlert).toBe(25_000);

    const updated = acknowledgeTurnAlert(session, reconciliation.completedCycles);
    expect(updated.lastTurnAlertCycle).toBe(3);
  });

  it("keeps turn timers frozen while paused", () => {
    const session = createSession(DEFAULT_SETTINGS, 0);
    const paused = pauseSession(session, 10_000);
    const reconciliation = getTurnReconciliation(paused, 80_000);

    expect(reconciliation.totalTurnElapsedMs).toBe(10_000);
    expect(reconciliation.completedCycles).toBe(0);
  });

  it("skips to the next turn without changing the main game timer", () => {
    const session = createSession(
      {
        ...DEFAULT_SETTINGS,
        turnDurationSec: 30
      },
      0
    );

    const skipped = skipToNextTurn(session, 10_000);
    const reconciliation = getTurnReconciliation(skipped, 10_000);

    expect(getElapsedMs(skipped, 10_000)).toBe(10_000);
    expect(skipped.lastTurnAlertCycle).toBe(1);
    expect(reconciliation.currentCycleElapsedMs).toBe(0);
    expect(reconciliation.msUntilNextAlert).toBe(30_000);
  });

  it("formats duration as hh:mm:ss", () => {
    expect(formatDuration(3_723_000)).toBe("01:02:03");
  });
});
