import { History, Pause, Play, Settings2, TimerReset, Trophy } from "lucide-react";
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
    return <main className="flex min-h-screen items-center justify-center p-6 text-sm text-sand-800">Loading game state...</main>;
  }

  const isRunning = session?.status === "running";
  const isPaused = session?.status === "paused";

  return (
    <main className="min-h-screen px-4 py-5 text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col gap-4">
        <section className="rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(245,232,206,0.7))] p-5 shadow-float">
          <p className="font-body text-xs uppercase tracking-[0.28em] text-sand-700">Catan Helper</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-4xl leading-none text-ink">Game Clock</h1>
              <p className="mt-2 max-w-[18rem] text-sm text-sand-800">
                Best-effort iPhone PWA. Background alerts can drift while locked, but the app reconciles immediately when you return.
              </p>
            </div>
            <div className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-moss">
              {session ? session.status : "idle"}
            </div>
          </div>
        </section>

        <Card className="flex-1 bg-[linear-gradient(180deg,rgba(255,252,247,0.95),rgba(244,234,213,0.9))]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sand-700">Elapsed Play</p>
              <div className="mt-2 font-display text-6xl tabular-nums text-ink">{formatDuration(elapsedMs)}</div>
            </div>
            <button
              type="button"
              onClick={() => void unlockAudio()}
              className="rounded-full border border-sand-300 bg-white/80 px-3 py-2 text-xs font-semibold text-sand-700"
            >
              Unlock audio
            </button>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-ink px-4 py-4 text-sand-50">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-sand-200">Turn Cycle</p>
              <span className="text-xs text-sand-200">{settings.turnTimerEnabled ? `${settings.turnDurationSec}s turns` : "disabled"}</span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="font-display text-4xl tabular-nums">
                  {turnState.enabled ? formatDuration(turnState.msUntilNextAlert ?? 0) : "--:--:--"}
                </div>
                <p className="mt-1 text-xs text-sand-200">
                  {turnState.enabled
                    ? `${turnState.completedCycles} completed turn ${turnState.completedCycles === 1 ? "cycle" : "cycles"}`
                    : "Turn timer is off"}
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

        <div className="grid grid-cols-2 gap-3">
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg">
                <Settings2 className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent className="max-h-[88vh] overflow-y-auto">
              <SheetTitle className="font-display text-3xl text-ink">Settings</SheetTitle>
              <SheetDescription className="mt-2 text-sm text-sand-800">
                Preferences save locally. In-progress sessions restore after refresh or app reopen.
              </SheetDescription>

              <div className="mt-6 space-y-5">
                <SettingRow
                  label="Background music"
                  description="Audio begins only after user interaction and browser permission."
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
                  label="Music preset"
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
                  label="Turn timer"
                  description="Repeats continuously during active play and pauses with the game."
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
                  label="Turn duration"
                  value={String(settings.turnDurationSec)}
                  onValueChange={(value) =>
                    setSettings((current) => ({
                      ...current,
                      turnDurationSec: Number(value)
                    }))
                  }
                  options={[
                    { value: "60", label: "60 seconds" },
                    { value: "75", label: "75 seconds" },
                    { value: "90", label: "90 seconds" },
                    { value: "120", label: "120 seconds" }
                  ]}
                />

                <LabeledSelect
                  label="Alert sound"
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

          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg">
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </SheetTrigger>
            <SheetContent className="max-h-[88vh] overflow-y-auto">
              <SheetTitle className="font-display text-3xl text-ink">Recent Games</SheetTitle>
              <SheetDescription className="mt-2 text-sm text-sand-800">
                Local-only history, limited to the 30 most recently finished games.
              </SheetDescription>

              <div className="mt-5 space-y-3">
                {history.length === 0 && (
                  <div className="rounded-[1.5rem] border border-dashed border-sand-300 bg-white/70 px-4 py-5 text-sm text-sand-800">
                    No finished games yet.
                  </div>
                )}
                {history.map((record) => (
                  <div key={record.id} className="rounded-[1.5rem] border border-sand-200 bg-white/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-display text-2xl text-ink">{formatDuration(record.durationMs)}</div>
                        <p className="mt-1 text-sm text-sand-800">
                          {record.winner ? `Winner: ${record.winner}` : "Winner not recorded"}
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
                    <p className="mt-3 text-xs text-sand-700">Started {formatDateTime(record.startedAt)}</p>
                    <p className="mt-1 text-xs text-sand-700">Finished {formatDateTime(record.finishedAt)}</p>
                    <p className="mt-2 text-xs text-sand-700">
                      {record.turnTimerEnabled ? `${record.turnDurationSec}s turns` : "Turn timer off"} ·{" "}
                      {record.musicEnabled ? `Music ${record.musicPresetId}` : "Music off"} · Alert {record.turnSoundId}
                    </p>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
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
          <DialogTitle className="font-display text-3xl text-ink">Finish game?</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-sand-800">
            Save the finished session and optionally attach a winner. This stops timers, stops audio, and clears the active session.
          </DialogDescription>
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-sand-800" htmlFor="winner">
              Winner
            </label>
            <Input
              id="winner"
              placeholder="Optional name"
              value={winnerDraft}
              onChange={(event) => setWinnerDraft(event.target.value)}
            />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => setFinishOpen(false)}>
              Keep playing
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                void finishGame(winnerDraft);
                setFinishOpen(false);
              }}
            >
              <TimerReset className="mr-2 h-4 w-4" />
              Save game
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
