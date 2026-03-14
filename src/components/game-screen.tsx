import { History, Pause, Play, Settings2, TimerReset, Trophy, Volume2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { ALERT_SOUNDS, MUSIC_PRESETS } from "@/config/audio-presets";
import { useElapsedTime, useGame } from "@/app/game-store";
import { formatDuration, getTurnReconciliation } from "@/lib/timer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(timestamp);
}

export function GameScreen() {
  const {
    hydrated,
    session,
    settings,
    history,
    now,
    setSettings,
    startGame,
    pauseGame,
    resumeGame,
    finishGame,
    deleteHistoryRecord,
    winnerDraft,
    setWinnerDraft,
    clearWinnerDraft,
    unlockAudio
  } = useGame();
  const elapsedMs = useElapsedTime();
  const turnState = useMemo(() => getTurnReconciliation(session, now), [session, now]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);

  if (!hydrated) {
    return <main className="flex min-h-screen items-center justify-center p-6 text-sm text-sand-800">Getting things ready...</main>;
  }

  const isRunning = session?.status === "running";
  const isPaused = session?.status === "paused";

  return (
    <main className="min-h-screen px-4 py-5 text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <p className="font-display text-xl leading-none text-ink">Catan Clock</p>
          <div className="flex items-center gap-2">
            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open game history"
                  className="rounded-full border border-sand-300 bg-white/80 p-3 text-sand-800 shadow-sm transition hover:bg-sand-50"
                >
                  <History className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent className="max-h-[88vh] overflow-y-auto">
                <SheetTitle className="font-display text-3xl text-ink">Past games</SheetTitle>
                <SheetDescription className="mt-2 text-sm text-sand-800">
                  Your last 30 finished games are saved on this device.
                </SheetDescription>

                <div className="mt-5 space-y-3">
                  {history.length === 0 && (
                    <div className="rounded-[1.5rem] border border-dashed border-sand-300 bg-white/70 px-4 py-5 text-sm text-sand-800">
                      You have not finished a game yet.
                    </div>
                  )}
                  {history.map((record) => (
                    <div key={record.id} className="rounded-[1.5rem] border border-sand-200 bg-white/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-display text-2xl text-ink">{formatDuration(record.durationMs)}</div>
                          <p className="mt-1 text-sm text-sand-800">
                            {record.winner ? `Winner: ${record.winner}` : "No winner saved"}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Delete history ${record.id}`}
                          className="rounded-full bg-sand-100 px-3 py-2 text-xs font-semibold text-sand-800"
                          onClick={() => void deleteHistoryRecord(record.id)}
                        >
                          Delete
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-sand-700">Started: {formatDateTime(record.startedAt)}</p>
                      <p className="mt-1 text-xs text-sand-700">Finished: {formatDateTime(record.finishedAt)}</p>
                      <p className="mt-2 text-xs text-sand-700">
                        {record.turnTimerEnabled ? `${record.turnDurationSec}-second turn reminder` : "Turn reminder off"} |{" "}
                        {record.musicEnabled ? `Music: ${record.musicPresetId}` : "Music off"} | Sound: {record.turnSoundId}
                      </p>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open settings"
                  className="rounded-full border border-sand-300 bg-white/80 p-3 text-sand-800 shadow-sm transition hover:bg-sand-50"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent className="max-h-[88vh] overflow-y-auto">
                <SheetTitle className="font-display text-3xl text-ink">Settings</SheetTitle>
                <SheetDescription className="mt-2 text-sm text-sand-800">
                  Choose how the clock sounds and remembers your games.
                </SheetDescription>

                <div className="mt-6 space-y-5">
                  <SettingRow
                    label="Background music"
                    description="Play soft music while the game is running."
                    control={
                      <Switch
                        checked={settings.musicEnabled}
                        onCheckedChange={(checked) =>
                          setSettings((current) => ({
                            ...current,
                            musicEnabled: checked
                          }))
                        }
                      />
                    }
                  />

                  <LabeledSelect
                    label="Music style"
                    value={settings.musicPresetId}
                    onValueChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        musicPresetId: value
                      }))
                    }
                    options={MUSIC_PRESETS.map((preset) => ({ value: preset.id, label: preset.label }))}
                  />

                  <SettingRow
                    label="Turn reminder"
                    description="Play a sound when it is time to pass the turn."
                    control={
                      <Switch
                        checked={settings.turnTimerEnabled}
                        onCheckedChange={(checked) =>
                          setSettings((current) => ({
                            ...current,
                            turnTimerEnabled: checked
                          }))
                        }
                      />
                    }
                  />

                  <LabeledSelect
                    label="Time per turn"
                    value={String(settings.turnDurationSec)}
                    onValueChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        turnDurationSec: Number(value)
                      }))
                    }
                    options={[
                      { value: "60", label: "1 minute" },
                      { value: "75", label: "1 minute 15 seconds" },
                      { value: "90", label: "1 minute 30 seconds" },
                      { value: "120", label: "2 minutes" }
                    ]}
                  />

                  <LabeledSelect
                    label="Reminder sound"
                    value={settings.turnSoundId}
                    onValueChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        turnSoundId: value
                      }))
                    }
                    options={ALERT_SOUNDS.map((sound) => ({ value: sound.id, label: sound.label }))}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Card className="flex-1 bg-[linear-gradient(180deg,rgba(255,252,247,0.95),rgba(244,234,213,0.9))]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sand-700">Game time</p>
              <div className="mt-2 font-display text-6xl tabular-nums text-ink">{formatDuration(elapsedMs)}</div>
              <p className="mt-2 text-sm text-sand-800">
                {session ? (isRunning ? "Game in progress" : "Game paused") : "Ready when you are"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Enable sound"
              onClick={() => void unlockAudio()}
              className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white/80 px-3 py-2 text-xs font-semibold text-sand-700"
            >
              <Volume2 className="h-4 w-4" />
              Enable sound
            </button>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-ink px-4 py-4 text-sand-50">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-sand-200">Turn reminder</p>
              <span className="text-xs text-sand-200">
                {settings.turnTimerEnabled ? `Every ${settings.turnDurationSec} seconds` : "Off"}
              </span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="font-display text-4xl tabular-nums">
                  {turnState.enabled ? formatDuration(turnState.msUntilNextAlert ?? 0) : "--:--:--"}
                </div>
                <p className="mt-1 text-xs text-sand-200">
                  {turnState.enabled
                    ? `${turnState.completedCycles} ${turnState.completedCycles === 1 ? "turn finished" : "turns finished"}`
                    : "Turn reminders are turned off"}
                </p>
              </div>
              <div className="h-20 w-3 rounded-full bg-sand-900/60">
                <div
                  className="rounded-full bg-sand-200 transition-all"
                  style={{
                    height: turnState.enabled
                      ? `${Math.max(8, (turnState.currentCycleElapsedMs / turnState.durationMs) * 100)}%`
                      : "8%"
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {!session && (
              <Button className="col-span-2" size="lg" onClick={() => void startGame()}>
                <Play className="mr-2 h-4 w-4" />
                Start game
              </Button>
            )}
            {isRunning && (
              <>
                <Button variant="secondary" size="lg" onClick={() => void pauseGame()}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button variant="danger" size="lg" onClick={() => setFinishOpen(true)}>
                  <Trophy className="mr-2 h-4 w-4" />
                  Finish
                </Button>
              </>
            )}
            {isPaused && (
              <>
                <Button size="lg" onClick={() => void resumeGame()}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
                <Button variant="danger" size="lg" onClick={() => setFinishOpen(true)}>
                  <Trophy className="mr-2 h-4 w-4" />
                  Finish
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      <Dialog
        open={finishOpen}
        onOpenChange={(open) => {
          setFinishOpen(open);
          if (!open) {
            clearWinnerDraft();
          }
        }}
      >
        <DialogContent>
          <DialogTitle className="font-display text-3xl text-ink">End this game?</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-sand-800">
            Save this game to your history. You can add the winner if you want.
          </DialogDescription>
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-sand-800" htmlFor="winner">
              Winner
            </label>
            <Input
              id="winner"
              placeholder="Optional"
              value={winnerDraft}
              onChange={(event) => setWinnerDraft(event.target.value)}
            />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => setFinishOpen(false)}>
              Go back
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                void finishGame(winnerDraft);
                setFinishOpen(false);
              }}
            >
              <TimerReset className="mr-2 h-4 w-4" />
              Save to history
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function SettingRow({
  label,
  description,
  control
}: {
  label: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-sand-200 bg-white/80 p-4">
      <div>
        <p className="font-semibold text-ink">{label}</p>
        <p className="mt-1 text-sm text-sand-800">{description}</p>
      </div>
      {control}
    </div>
  );
}

function LabeledSelect({
  label,
  value,
  onValueChange,
  options
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="rounded-[1.5rem] border border-sand-200 bg-white/80 p-4">
      <label className="mb-2 block text-sm font-semibold text-ink">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
