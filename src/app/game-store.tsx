import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import { createAudioController } from "@/lib/audio-controller";
import { addHistory, clearActiveSession, deleteHistory, getActiveSession, listHistory, saveActiveSession } from "@/lib/db";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/lib/settings-storage";
import {
  acknowledgeTurnAlert,
  createSession,
  finishSession,
  getElapsedMs,
  getTurnReconciliation,
  pauseSession,
  resumeSession,
  updateSessionForSettings
} from "@/lib/timer";
import type { ActiveGameSession, AppSettings, GameHistoryRecord } from "@/types";

interface GameContextValue {
  settings: AppSettings;
  session: ActiveGameSession | null;
  history: GameHistoryRecord[];
  now: number;
  hydrated: boolean;
  setSettings: (updater: (current: AppSettings) => AppSettings) => void;
  startGame: () => Promise<void>;
  pauseGame: () => Promise<void>;
  resumeGame: () => Promise<void>;
  finishGame: (winner: string) => Promise<void>;
  deleteHistoryRecord: (id: string) => Promise<void>;
  clearWinnerDraft: () => void;
  winnerDraft: string;
  setWinnerDraft: (value: string) => void;
  unlockAudio: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: PropsWithChildren) {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [session, setSession] = useState<ActiveGameSession | null>(null);
  const [history, setHistory] = useState<GameHistoryRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [winnerDraft, setWinnerDraft] = useState("");
  const audioRef = useRef(createAudioController());

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const [storedSession, storedHistory] = await Promise.all([getActiveSession(), listHistory()]);
      if (cancelled) {
        return;
      }

      setSettingsState(loadSettings());
      setSession(storedSession ?? null);
      setHistory(storedHistory);
      setHydrated(true);
    }

    void hydrate();

    return () => {
      cancelled = true;
      audioRef.current.teardown();
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveSettings(settings);
    if (!session) {
      return;
    }

    const updated = updateSessionForSettings(session, settings, Date.now());
    setSession(updated);
    void saveActiveSession(updated);
  }, [settings]);

  useEffect(() => {
    if (!session) {
      audioRef.current.stopBackgroundMusic();
      return;
    }

    if (session.status === "paused") {
      audioRef.current.pauseBackgroundMusic();
      return;
    }

    void audioRef.current.setMusicEnabled(session.musicEnabled, session.musicPresetId);
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== "running") {
      return;
    }

    const reconciliation = getTurnReconciliation(session, now);
    if (!reconciliation.enabled || reconciliation.completedCycles <= session.lastTurnAlertCycle) {
      return;
    }

    void audioRef.current.playTurnAlert(session.turnSoundId);
    const updated = acknowledgeTurnAlert(session, reconciliation.completedCycles);
    setSession(updated);
    void saveActiveSession(updated);
  }, [now, session]);

  useEffect(() => {
    function handleVisibilityChange() {
      setNow(Date.now());
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, []);

  async function unlockAudio() {
    await audioRef.current.unlock();
    if (session?.status === "running" && session.musicEnabled) {
      await audioRef.current.setMusicEnabled(true, session.musicPresetId);
    }
  }

  function setSettings(updater: (current: AppSettings) => AppSettings) {
    setSettingsState((current) => updater(current));
  }

  async function startGame() {
    await unlockAudio();
    const nextSession = createSession(settings, Date.now());
    setSession(nextSession);
    await saveActiveSession(nextSession);
    if (nextSession.musicEnabled) {
      await audioRef.current.setMusicEnabled(true, nextSession.musicPresetId);
    }
  }

  async function pauseGame() {
    if (!session) {
      return;
    }

    const nextSession = pauseSession(session, Date.now());
    setSession(nextSession);
    await saveActiveSession(nextSession);
    audioRef.current.pauseBackgroundMusic();
  }

  async function resumeGame() {
    if (!session) {
      return;
    }

    await unlockAudio();
    const nextSession = resumeSession(session, Date.now());
    setSession(nextSession);
    await saveActiveSession(nextSession);
    if (nextSession.musicEnabled) {
      await audioRef.current.resumeBackgroundMusic();
    }
  }

  async function finishGameWithWinner(winner: string) {
    if (!session) {
      return;
    }

    const record = finishSession(session, winner, Date.now());
    audioRef.current.stopBackgroundMusic();
    await addHistory(record);
    await clearActiveSession();
    setHistory(await listHistory());
    setSession(null);
    setWinnerDraft("");
  }

  async function removeHistory(id: string) {
    await deleteHistory(id);
    setHistory(await listHistory());
  }

  const value = useMemo<GameContextValue>(
    () => ({
      settings,
      session,
      history,
      now,
      hydrated,
      setSettings,
      startGame,
      pauseGame,
      resumeGame,
      finishGame: finishGameWithWinner,
      deleteHistoryRecord: removeHistory,
      clearWinnerDraft: () => setWinnerDraft(""),
      winnerDraft,
      setWinnerDraft,
      unlockAudio
    }),
    [settings, session, history, now, hydrated, winnerDraft]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}

export function useElapsedTime() {
  const { now, session } = useGame();
  return session ? getElapsedMs(session, now) : 0;
}
