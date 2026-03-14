export type SessionStatus = "idle" | "running" | "paused";

export interface AppSettings {
  musicEnabled: boolean;
  musicPresetId: string;
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
  lastTurnAlertCycle: number;
  musicEnabled: boolean;
  musicPresetId: string;
  turnSoundId: string;
}

export interface GameHistoryRecord {
  id: string;
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  winner?: string;
  turnTimerEnabled: boolean;
  turnDurationSec: number;
  musicEnabled: boolean;
  musicPresetId: string;
  turnSoundId: string;
}

export interface TurnReconciliation {
  enabled: boolean;
  durationMs: number;
  totalTurnElapsedMs: number;
  currentCycleElapsedMs: number;
  msUntilNextAlert: number | null;
  completedCycles: number;
}

export interface MusicPreset {
  id: string;
  label: string;
  frequencies: number[];
}

export interface AlertSound {
  id: string;
  label: string;
  frequencies: number[];
}
