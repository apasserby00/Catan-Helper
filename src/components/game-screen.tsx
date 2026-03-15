import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { History, Pause, Play, Settings2, SkipForward, TimerReset, Trash2, Trophy } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useElapsedTime, useGame } from "@/app/game-store";
import type { AppLanguage, GameHistoryRecord } from "@/types";
import { getTurnReconciliation } from "@/lib/timer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

const motionProps = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }
};

const HEADER_LOGO_SRC = `${import.meta.env.BASE_URL}catan-clock-logo-transparent.png`;

const copy = {
  en: {
    appTitle: "Catan Clock",
    openHistory: "Open game history",
    openSettings: "Open settings",
    loading: "Getting things ready...",
    historyTitle: "Past games",
    historyDescription: "Your last 30 finished games are saved on this device.",
    noGames: "You have not finished a game yet.",
    winner: "Winner",
    noWinner: "No winner saved",
    started: "Started",
    finished: "Finished",
    turnReminderLabel: "Turn timer",
    settingsTitle: "Settings",
    settingsDescription: "Choose how the clock sounds and reads.",
    languageLabel: "Language",
    buttonSoundsLabel: "Button sounds",
    buttonSoundsDescription: "Play a small tap sound when you press a button.",
    musicLabel: "Background music",
    musicDescription: "Play your loop while the game is running.",
    musicStyleLabel: "Music track",
    turnReminderDescription: "Play a sound when it is time to pass the turn.",
    timePerTurnLabel: "Time per turn",
    gameTime: "Game time",
    gameInProgress: "Game in progress",
    gamePaused: "Game paused",
    readyToStart: "Tap start when everyone is ready",
    everySeconds: (seconds: number) => `Every ${seconds} seconds`,
    turnRemindersOff: "Turn timer is off",
    turnsFinished: (count: number) => `${count} ${count === 1 ? "turn finished" : "turns finished"}`,
    turnsPlayed: (count: number) => `Turns played: ${count}`,
    nextTurnHint: "Use Next turn if someone finishes early.",
    startGame: "Start game",
    nextTurn: "Next turn",
    pause: "Pause",
    resume: "Resume",
    finish: "Finish",
    finishTitle: "End this game?",
    finishDescription: "Save this game to your history. You can add the winner if you want.",
    optional: "Optional",
    goBack: "Go back",
    saveToHistory: "Save to history",
    deleteHistoryTitle: "Delete this game?",
    deleteHistoryDescription: "This will remove the saved game from your history.",
    cancel: "Cancel",
    delete: "Delete",
    turnTimerValue: (seconds: number | null) => (seconds ? `Turn timer: ${formatStaticDuration(seconds * 1000, "en")}` : "Turn timer: Off")
  },
  tr: {
    appTitle: "Catan Clock",
    openHistory: "Oyun geçmişini aç",
    openSettings: "Ayarları aç",
    loading: "Hazırlanıyor...",
    historyTitle: "Geçmiş oyunlar",
    historyDescription: "Son 30 tamamlanan oyun bu cihazda saklanır.",
    noGames: "Henüz bitirdiğin bir oyun yok.",
    winner: "Kazanan",
    noWinner: "Kazanan kaydedilmedi",
    started: "Başladı",
    finished: "Bitti",
    turnReminderLabel: "Tur sayacı",
    settingsTitle: "Ayarlar",
    settingsDescription: "Saatin nasıl duyulacağını ve görüneceğini seç.",
    languageLabel: "Dil",
    buttonSoundsLabel: "Tuş sesleri",
    buttonSoundsDescription: "Bir düğmeye bastığında kısa bir ses çal.",
    musicLabel: "Arka plan müziği",
    musicDescription: "Oyun sırasında döngü müziğini çal.",
    musicStyleLabel: "Müzik parçası",
    turnReminderDescription: "Sırayı geçme zamanı geldiğinde ses çal.",
    timePerTurnLabel: "Tur süresi",
    gameTime: "Oyun süresi",
    gameInProgress: "Oyun devam ediyor",
    gamePaused: "Oyun duraklatıldı",
    readyToStart: "Herkes hazır olduğunda başlat",
    everySeconds: (seconds: number) => `Her ${seconds} saniyede bir`,
    turnRemindersOff: "Tur sayacı kapalı",
    turnsFinished: (count: number) => `${count} tur tamamlandı`,
    turnsPlayed: (count: number) => `Oynanan tur: ${count}`,
    nextTurnHint: "Biri erken bitirirse Sonraki turu kullan.",
    startGame: "Oyunu başlat",
    nextTurn: "Sonraki tur",
    pause: "Duraklat",
    resume: "Devam et",
    finish: "Bitir",
    finishTitle: "Bu oyun bitsin mi?",
    finishDescription: "Bu oyunu geçmişe kaydet. İstersen kazananı ekleyebilirsin.",
    optional: "İsteğe bağlı",
    goBack: "Geri dön",
    saveToHistory: "Geçmişe kaydet",
    deleteHistoryTitle: "Bu oyunu sil?",
    deleteHistoryDescription: "Bu kayıt oyun geçmişinden silinecek.",
    cancel: "Vazgeç",
    delete: "Sil",
    turnTimerValue: (seconds: number | null) => (seconds ? `Tur sayacı: ${formatStaticDuration(seconds * 1000, "tr")}` : "Tur sayacı: Kapalı")
  }
} as const;

function formatDateTime(timestamp: number, language: AppLanguage) {
  return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(timestamp);
}

function formatStaticDuration(ms: number, language: AppLanguage) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const units = language === "tr" ? { h: "sa", m: "dk", s: "sn" } : { h: "h", m: "m", s: "s" };
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}${units.h}`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}${units.m}`);
  }
  parts.push(`${seconds}${units.s}`);

  return parts.join(" ");
}

function formatLiveDuration(ms: number, language: AppLanguage) {
  return formatStaticDuration(ms, language);
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
    nextTurn,
    finishGame,
    deleteHistoryRecord,
    winnerDraft,
    setWinnerDraft,
    clearWinnerDraft
  } = useGame();
  const elapsedMs = useElapsedTime();
  const turnState = useMemo(() => getTurnReconciliation(session, now), [session, now]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<GameHistoryRecord | null>(null);

  const t = copy[settings.language];

  if (!hydrated) {
    return <main className="flex min-h-screen items-center justify-center p-6 text-sm text-sand-800">{t.loading}</main>;
  }

  const isRunning = session?.status === "running";
  const isPaused = session?.status === "paused";

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen px-4 py-5 text-ink">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-md flex-col gap-4">
          <motion.div className="flex items-center justify-between px-1" {...motionProps}>
            <img src={HEADER_LOGO_SRC} alt={t.appTitle} className="h-12 w-auto object-contain" />
            <div className="flex items-center gap-2">
              <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label={t.openHistory}
                    className="rounded-full border border-sand-300 bg-white/80 p-3 text-sand-800 shadow-sm transition hover:bg-sand-50"
                  >
                    <History className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <SheetContent className="max-h-[88vh] overflow-y-auto">
                  <SheetTitle className="font-display text-3xl text-ink">{t.historyTitle}</SheetTitle>
                  <SheetDescription className="mt-2 text-sm text-sand-800">{t.historyDescription}</SheetDescription>

                  <motion.div className="mt-5 space-y-3" initial={false}>
                    {history.length === 0 && (
                      <motion.div
                        layout
                        className="rounded-[1.5rem] border border-dashed border-sand-300 bg-white/70 px-4 py-5 text-sm text-sand-800"
                      >
                        {t.noGames}
                      </motion.div>
                    )}
                    <AnimatePresence initial={false}>
                      {history.map((record, index) => (
                        <motion.div
                          key={record.id}
                          layout
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.22, delay: index * 0.02 }}
                          className="rounded-[1.5rem] border border-sand-200 bg-white/80 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-display text-2xl text-ink">
                                {formatStaticDuration(record.durationMs, settings.language)}
                              </div>
                              <p className="mt-1 text-sm text-sand-800">
                                {record.winner ? `${t.winner}: ${record.winner}` : t.noWinner}
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label={`Delete history ${record.id}`}
                              className="rounded-full bg-sand-100 p-2 text-sand-800"
                              onClick={() => {
                                setPendingDelete(record);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-3 text-xs text-sand-700">
                            {t.started}: {formatDateTime(record.startedAt, settings.language)}
                          </p>
                          <p className="mt-1 text-xs text-sand-700">
                            {t.finished}: {formatDateTime(record.finishedAt, settings.language)}
                          </p>
                          <p className="mt-2 text-xs text-sand-700">{t.turnTimerValue(record.turnDurationSec)}</p>
                          <p className="mt-1 text-xs text-sand-700">{t.turnsPlayed(record.completedTurns ?? 0)}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </SheetContent>
              </Sheet>

              <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label={t.openSettings}
                    className="rounded-full border border-sand-300 bg-white/80 p-3 text-sand-800 shadow-sm transition hover:bg-sand-50"
                  >
                    <Settings2 className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <SheetContent className="max-h-[88vh] overflow-y-auto">
                  <SheetTitle className="font-display text-3xl text-ink">{t.settingsTitle}</SheetTitle>
                  <SheetDescription className="mt-2 text-sm text-sand-800">{t.settingsDescription}</SheetDescription>

                  <motion.div className="mt-6 space-y-5" initial={false}>
                    <LabeledSelect
                      label={t.languageLabel}
                      value={settings.language}
                      onValueChange={(value) => {
                        setSettings((current) => ({
                          ...current,
                          language: value as AppLanguage
                        }));
                      }}
                      options={[
                        { value: "en", label: "English" },
                        { value: "tr", label: "Türkçe" }
                      ]}
                    />

                    <SettingRow
                      label={t.musicLabel}
                      description={t.musicDescription}
                      control={
                        <Switch
                          checked={settings.musicEnabled}
                          onCheckedChange={(checked) => {
                            setSettings((current) => ({
                              ...current,
                              musicEnabled: checked
                            }));
                          }}
                        />
                      }
                    />

                    <SettingRow
                      label={t.turnReminderLabel}
                      description={t.turnReminderDescription}
                      control={
                        <Switch
                          checked={settings.turnTimerEnabled}
                          onCheckedChange={(checked) => {
                            setSettings((current) => ({
                              ...current,
                              turnTimerEnabled: checked
                            }));
                          }}
                        />
                      }
                    />

                    <LabeledSelect
                      label={t.timePerTurnLabel}
                      value={String(settings.turnDurationSec)}
                      onValueChange={(value) => {
                        setSettings((current) => ({
                          ...current,
                          turnDurationSec: Number(value)
                        }));
                      }}
                      options={[
                        { value: "60", label: settings.language === "tr" ? "1 dakika" : "1 minute" },
                        { value: "75", label: settings.language === "tr" ? "1 dakika 15 saniye" : "1 minute 15 seconds" },
                        { value: "90", label: settings.language === "tr" ? "1 dakika 30 saniye" : "1 minute 30 seconds" },
                        { value: "120", label: settings.language === "tr" ? "2 dakika" : "2 minutes" }
                      ]}
                    />

                  </motion.div>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>

          <motion.div {...motionProps}>
            <Card className="flex-1 bg-[linear-gradient(180deg,rgba(255,252,247,0.95),rgba(244,234,213,0.9))]">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sand-700">{t.gameTime}</p>
                <motion.div
                  initial={{ opacity: 0.7, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16 }}
                  className="mt-2 font-display text-5xl leading-tight text-ink"
                >
                  {formatLiveDuration(elapsedMs, settings.language)}
                </motion.div>
                <p className="mt-2 text-sm text-sand-800">
                  {session ? (isRunning ? t.gameInProgress : t.gamePaused) : t.readyToStart}
                </p>
              </div>

              <AnimatePresence initial={false}>
                {session && (
                  <motion.div
                    key="turn-card"
                    {...motionProps}
                    className="mt-6 rounded-[1.5rem] bg-ink px-4 py-4 text-sand-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-sand-200">{t.turnReminderLabel}</p>
                        <p className="mt-1 text-xs text-sand-200">
                          {settings.turnTimerEnabled ? t.everySeconds(settings.turnDurationSec) : t.turnRemindersOff}
                        </p>
                      </div>
                      {settings.turnTimerEnabled && (
                        <div className="text-right">
                          <motion.div
                            initial={{ opacity: 0.7, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.16 }}
                            className="font-display text-2xl text-sand-50"
                          >
                            {formatLiveDuration(turnState.msUntilNextAlert ?? 0, settings.language)}
                          </motion.div>
                          <p className="text-xs text-sand-200">{t.turnsFinished(turnState.completedCycles)}</p>
                        </div>
                      )}
                    </div>

                    {settings.turnTimerEnabled && (
                      <>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-sand-900/60">
                          <motion.div
                            className="h-full rounded-full bg-sand-200"
                            animate={{
                              width: `${Math.max(4, (turnState.currentCycleElapsedMs / turnState.durationMs) * 100)}%`
                            }}
                            transition={{ duration: 0.16 }}
                          />
                        </div>
                        <p className="mt-3 text-sm text-sand-200">{t.nextTurnHint}</p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          <motion.div
            layout
            className="mt-auto rounded-[1.75rem] border border-white/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(249,239,218,0.96)_55%,rgba(236,216,182,0.94))] p-3 shadow-float backdrop-blur"
            {...motionProps}
          >
            {!session && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  void startGame();
                }}
              >
                <Play className="mr-2 h-4 w-4" />
                {t.startGame}
              </Button>
            )}

            {isRunning && (
              <motion.div layout className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    void pauseGame();
                  }}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  {t.pause}
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={() => {
                    void nextTurn();
                  }}
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  {t.nextTurn}
                </Button>
              </motion.div>
            )}

            {isPaused && (
              <motion.div layout className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  onClick={() => {
                    void resumeGame();
                  }}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {t.resume}
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={() => {
                    setFinishOpen(true);
                  }}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  {t.finish}
                </Button>
              </motion.div>
            )}
          </motion.div>
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
            <DialogTitle className="font-display text-3xl text-ink">{t.finishTitle}</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-sand-800">
              {t.finishDescription}
            </DialogDescription>
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-sand-800" htmlFor="winner">
                {t.winner}
              </label>
              <Input
                id="winner"
                placeholder={t.optional}
                value={winnerDraft}
                onChange={(event) => setWinnerDraft(event.target.value)}
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setFinishOpen(false);
                }}
              >
                {t.goBack}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  void finishGame(winnerDraft);
                  setFinishOpen(false);
                }}
              >
                <TimerReset className="mr-2 h-4 w-4" />
                {t.saveToHistory}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={pendingDelete !== null}
          onOpenChange={(open) => {
            if (!open) {
              setPendingDelete(null);
            }
          }}
        >
          <DialogContent>
            <DialogTitle className="font-display text-3xl text-ink">{t.deleteHistoryTitle}</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-sand-800">
              {t.deleteHistoryDescription}
            </DialogDescription>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setPendingDelete(null);
                }}
              >
                {t.cancel}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (!pendingDelete) {
                    return;
                  }
                  void deleteHistoryRecord(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                {t.delete}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </MotionConfig>
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
    <motion.div
      layout
      className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-sand-200 bg-white/80 p-4"
    >
      <div>
        <p className="font-semibold text-ink">{label}</p>
        <p className="mt-1 text-sm text-sand-800">{description}</p>
      </div>
      {control}
    </motion.div>
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
    <motion.div layout className="rounded-[1.5rem] border border-sand-200 bg-white/80 p-4">
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
    </motion.div>
  );
}
