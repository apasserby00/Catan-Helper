import type { ActiveGameSession, AppSettings, GameHistoryRecord, TurnReconciliation } from "@/types";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSession(settings: AppSettings, now = Date.now()): ActiveGameSession {
  return {
    id: createId("session"),
    status: "running",
    startedAt: now,
    elapsedMsBeforeCurrentRun: 0,
    lastResumedAt: now,
    pausedAt: null,
    turnTimerEnabled: settings.turnTimerEnabled,
    turnDurationSec: settings.turnDurationSec,
    turnElapsedMsBeforeCurrentRun: 0,
    lastTurnAlertCycle: 0,
    musicEnabled: settings.musicEnabled,
    musicPresetId: settings.musicPresetId,
    turnSoundId: settings.turnSoundId
  };
}

export function getElapsedMs(session: ActiveGameSession, now = Date.now()) {
  if (session.status !== "running" || session.lastResumedAt === null) {
    return session.elapsedMsBeforeCurrentRun;
  }

  return session.elapsedMsBeforeCurrentRun + Math.max(0, now - session.lastResumedAt);
}

export function getTurnElapsedMs(session: ActiveGameSession, now = Date.now()) {
  if (!session.turnTimerEnabled) {
    return 0;
  }

  if (session.status !== "running" || session.lastResumedAt === null) {
    return session.turnElapsedMsBeforeCurrentRun;
  }

  return session.turnElapsedMsBeforeCurrentRun + Math.max(0, now - session.lastResumedAt);
}

export function pauseSession(session: ActiveGameSession, now = Date.now()): ActiveGameSession {
  if (session.status !== "running" || session.lastResumedAt === null) {
    return session;
  }

  const elapsedSinceResume = Math.max(0, now - session.lastResumedAt);
  return {
    ...session,
    status: "paused",
    elapsedMsBeforeCurrentRun: session.elapsedMsBeforeCurrentRun + elapsedSinceResume,
    turnElapsedMsBeforeCurrentRun: session.turnElapsedMsBeforeCurrentRun + elapsedSinceResume,
    lastResumedAt: null,
    pausedAt: now
  };
}

export function resumeSession(session: ActiveGameSession, now = Date.now()): ActiveGameSession {
  if (session.status !== "paused") {
    return session;
  }

  return {
    ...session,
    status: "running",
    lastResumedAt: now,
    pausedAt: null
  };
}

export function updateSessionForSettings(
  session: ActiveGameSession,
  settings: AppSettings,
  now = Date.now()
): ActiveGameSession {
  const nextSession = session.status === "running" ? pauseSession(session, now) : session;
  const updated: ActiveGameSession = {
    ...nextSession,
    turnTimerEnabled: settings.turnTimerEnabled,
    turnDurationSec: settings.turnDurationSec,
    musicEnabled: settings.musicEnabled,
    musicPresetId: settings.musicPresetId,
    turnSoundId: settings.turnSoundId
  };

  if (!settings.turnTimerEnabled) {
    updated.turnElapsedMsBeforeCurrentRun = 0;
    updated.lastTurnAlertCycle = 0;
  }

  if (settings.turnTimerEnabled && !session.turnTimerEnabled) {
    updated.turnElapsedMsBeforeCurrentRun = 0;
    updated.lastTurnAlertCycle = 0;
  }

  return session.status === "running" ? resumeSession(updated, now) : updated;
}

export function getTurnReconciliation(
  session: ActiveGameSession | null,
  now = Date.now()
): TurnReconciliation {
  if (!session || !session.turnTimerEnabled) {
    return {
      enabled: false,
      durationMs: 0,
      totalTurnElapsedMs: 0,
      currentCycleElapsedMs: 0,
      msUntilNextAlert: null,
      completedCycles: 0
    };
  }

  const durationMs = session.turnDurationSec * 1000;
  const totalTurnElapsedMs = getTurnElapsedMs(session, now);
  const completedCycles = Math.floor(totalTurnElapsedMs / durationMs);
  const currentCycleElapsedMs = totalTurnElapsedMs % durationMs;

  return {
    enabled: true,
    durationMs,
    totalTurnElapsedMs,
    currentCycleElapsedMs,
    msUntilNextAlert: durationMs - currentCycleElapsedMs,
    completedCycles
  };
}

export function acknowledgeTurnAlert(session: ActiveGameSession, completedCycles: number) {
  if (completedCycles <= session.lastTurnAlertCycle) {
    return session;
  }

  return {
    ...session,
    lastTurnAlertCycle: completedCycles
  };
}

export function finishSession(
  session: ActiveGameSession,
  winner: string,
  now = Date.now()
): GameHistoryRecord {
  return {
    id: createId("history"),
    startedAt: session.startedAt,
    finishedAt: now,
    durationMs: getElapsedMs(session, now),
    winner: winner.trim() || undefined,
    turnTimerEnabled: session.turnTimerEnabled,
    turnDurationSec: session.turnDurationSec,
    musicEnabled: session.musicEnabled,
    musicPresetId: session.musicPresetId,
    turnSoundId: session.turnSoundId
  };
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
}
