export type SessionStatus = "idle" | "running" | "paused";
export type AppLanguage = "en" | "tr";

export interface AppSettings {
  language: AppLanguage;
  musicEnabled: boolean;
  turnTimerEnabled: boolean;
  turnDurationSec: number;
  turnSoundId: string;
}

export interface ActiveGameSession {
  id: string;
  status: SessionStatus;
  startedAt: number;
  elapsedMsBeforeCurrentRun: number;
  lastResumedAt: number | null;
  pausedAt: number | null;
  turnTimerEnabled: boolean;
  turnDurationSec: number;
  turnElapsedMsBeforeCurrentRun: number;
  turnLastResumedAt: number | null;
  lastTurnAlertCycle: number;
  musicEnabled: boolean;
  turnSoundId: string;
}

export interface GameHistoryRecord {
  id: string;
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  winner?: string;
  turnTimerEnabled: boolean;
  turnDurationSec: number | null;
  completedTurns: number;
}

export interface TurnReconciliation {
  enabled: boolean;
  durationMs: number;
  totalTurnElapsedMs: number;
  currentCycleElapsedMs: number;
  msUntilNextAlert: number | null;
  completedCycles: number;
}

export interface AlertSound {
  id: string;
  label: string;
  frequencies: number[];
}
