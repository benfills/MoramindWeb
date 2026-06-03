import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useAuth } from "../context/useAuth";
import type { Settings } from "../types";

type Phase = "work" | "shortBreak" | "longBreak";

const CYCLE_LENGTH = 4;

function getPhaseDuration(phase: Phase, settings: Settings) {
  switch (phase) {
    case "work":
      return settings.workMin * 60;
    case "shortBreak":
      return settings.shortBreakMin * 60;
    case "longBreak":
      return settings.longBreakMin * 60;
  }
}

function getPhaseLabel(phase: Phase) {
  switch (phase) {
    case "work":
      return "Focus session";
    case "shortBreak":
      return "Short break";
    case "longBreak":
      return "Long break";
  }
}

function getPhaseHint(phase: Phase, completedWorkSessions: number) {
  if (phase === "work") {
    const currentCycle = (completedWorkSessions % CYCLE_LENGTH) + 1;
    return `Cycle ${currentCycle} of ${CYCLE_LENGTH}`;
  }

  if (phase === "shortBreak") {
    return "Reset, then return to focus";
  }

  return "Long reset before the next cycle";
}

function getNextPhase(phase: Phase, completedWorkSessions: number): Phase {
  if (phase === "work") {
    const nextCompleted = completedWorkSessions + 1;
    return nextCompleted % CYCLE_LENGTH === 0 ? "longBreak" : "shortBreak";
  }

  return "work";
}

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

interface TimerState {
  phase: Phase;
  secondsLeft: number;
  isRunning: boolean;
  completedWorkSessions: number;
}

type TimerAction =
  | { type: "toggle" }
  | { type: "reset"; settings: Settings }
  | { type: "skip"; settings: Settings }
  | { type: "tick"; settings: Settings };

function createInitialState(settings: Settings): TimerState {
  return {
    phase: "work",
    secondsLeft: getPhaseDuration("work", settings),
    isRunning: false,
    completedWorkSessions: 0,
  };
}

function moveToNextPhase(
  state: TimerState,
  settings: Settings,
  keepRunning: boolean
): TimerState {
  if (state.phase === "work") {
    const completedWorkSessions = state.completedWorkSessions + 1;
    const phase = getNextPhase("work", state.completedWorkSessions);

    return {
      phase,
      secondsLeft: getPhaseDuration(phase, settings),
      isRunning: keepRunning,
      completedWorkSessions,
    };
  }

  return {
    phase: "work",
    secondsLeft: getPhaseDuration("work", settings),
    isRunning: keepRunning,
    completedWorkSessions: state.completedWorkSessions,
  };
}

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case "toggle":
      return { ...state, isRunning: !state.isRunning };

    case "reset":
      return {
        ...state,
        secondsLeft: getPhaseDuration(state.phase, action.settings),
        isRunning: false,
      };

    case "skip":
      return moveToNextPhase(state, action.settings, state.isRunning);

    case "tick":
      if (!state.isRunning) return state;

      if (state.secondsLeft > 1) {
        return { ...state, secondsLeft: state.secondsLeft - 1 };
      }

      return moveToNextPhase(state, action.settings, true);
  }
}

export default function Session({
  settings,
  onBack,
}: {
  settings: Settings;
  onBack: () => void;
}) {
  const { user, signOut } = useAuth();
  const [state, dispatch] = useReducer(
    timerReducer,
    settings,
    createInitialState
  );
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  });

  const { phase, secondsLeft, isRunning, completedWorkSessions } = state;

  const totalSeconds = useMemo(
    () => getPhaseDuration(phase, settings),
    [phase, settings]
  );

  const progress =
    totalSeconds === 0
      ? 0
      : ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const currentCycle = (completedWorkSessions % CYCLE_LENGTH) + 1;
  const nextPhase = getNextPhase(phase, completedWorkSessions);
  const nextPhaseLabel = getPhaseLabel(nextPhase);

  const theme =
    phase === "work"
      ? {
          accent: "#aa3bff",
          accentRgb: "170,59,255",
          surface: "rgba(170,59,255,0.08)",
          shadow: "0 0 40px rgba(170,59,255,0.18)",
        }
      : phase === "shortBreak"
      ? {
          accent: "#22c55e",
          accentRgb: "34,197,94",
          surface: "rgba(34,197,94,0.08)",
          shadow: "0 0 40px rgba(34,197,94,0.16)",
        }
      : {
          accent: "#f59e0b",
          accentRgb: "245,158,11",
          surface: "rgba(245,158,11,0.08)",
          shadow: "0 0 40px rgba(245,158,11,0.16)",
        };

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      dispatch({ type: "tick", settings });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning, settings]);

  const previousPhaseRef = useRef<Phase>(phase);

  function notify(title: string, body: string) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    new Notification(title, {
      body,
      icon: "/Logo.png",
    });
  }

  useEffect(() => {
    const previousPhase = previousPhaseRef.current;

    if (previousPhase !== phase) {
      if (previousPhase === "work") {
        notify(
          "Work session complete",
          phase === "longBreak"
            ? "Time for a long break."
            : "Time for a short break."
        );
      } else {
        notify("Break complete", "Back to focus.");
      }
    }

    previousPhaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    document.title = `${formatTime(secondsLeft)} · ${getPhaseLabel(
      phase
    )} · Moramind`;

    return () => {
      document.title = "Moramind";
    };
  }, [phase, secondsLeft]);

  const requestNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e0f14] px-5 py-8 text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(170,59,255,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Moramind timer
            </span>
            <span className="text-sm text-gray-400">{user?.email}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:bg-white/10"
            >
              Back
            </button>
            <button
              onClick={() => signOut()}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>

        <div
          className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(170,59,255,0.14)] backdrop-blur"
          style={{ boxShadow: theme.shadow }}
        >
          <div className="mb-6 flex flex-col gap-2">
            <span
              className="inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{
                color: theme.accent,
                background: theme.surface,
                border: `1px solid rgba(${theme.accentRgb},0.18)`,
              }}
            >
              {getPhaseLabel(phase)}
            </span>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              {getPhaseHint(phase, completedWorkSessions)}
            </h1>
            <p className="text-sm text-gray-400">
              Focus sessions rotate into short breaks, and every fourth
              completed work block becomes a long break.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-black/20 p-6">
              <div
                className="relative flex h-64 w-64 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(${theme.accent} ${progress}%, rgba(255,255,255,0.08) 0)`,
                }}
              >
                <div className="flex h-56 w-56 flex-col items-center justify-center rounded-full border border-white/10 bg-[#0e0f14]">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
                    Remaining
                  </span>
                  <span className="mt-3 text-6xl font-black tracking-tight text-white">
                    {formatTime(secondsLeft)}
                  </span>
                  <span className="mt-3 text-sm text-gray-400">
                    {isRunning ? "Running" : "Paused"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Completed pomodoros"
                  value={completedWorkSessions}
                />
                <StatCard
                  label="Cycle"
                  value={`${currentCycle} / ${CYCLE_LENGTH}`}
                />
                <StatCard label="Next phase" value={nextPhaseLabel} />
                <StatCard
                  label="Notifications"
                  value={
                    notificationPermission === "granted"
                      ? "Enabled"
                      : notificationPermission === "denied"
                      ? "Blocked"
                      : notificationPermission === "unsupported"
                      ? "Unavailable"
                      : "Off"
                  }
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
                  Current settings
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-gray-300">
                  <SettingChip label="Work" value={`${settings.workMin}m`} />
                  <SettingChip
                    label="Short"
                    value={`${settings.shortBreakMin}m`}
                  />
                  <SettingChip
                    label="Long"
                    value={`${settings.longBreakMin}m`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => dispatch({ type: "toggle" })}
                  className="h-12 flex-1 rounded-xl bg-[#aa3bff] px-4 text-sm font-bold text-white transition hover:bg-[#9b2df0]"
                >
                  {isRunning ? "Pause" : "Start"}
                </button>

                <button
                  onClick={() => dispatch({ type: "reset", settings })}
                  className="h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Reset
                </button>

                <button
                  onClick={() => dispatch({ type: "skip", settings })}
                  className="h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Skip
                </button>
              </div>

              {notificationPermission !== "granted" &&
                notificationPermission !== "unsupported" && (
                  <button
                    onClick={requestNotifications}
                    className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-gray-100 transition hover:bg-white/10"
                  >
                    {notificationPermission === "denied"
                      ? "Notifications blocked in browser"
                      : "Enable browser notifications"}
                  </button>
                )}

              {notificationPermission === "unsupported" && (
                <p className="text-xs text-gray-500">
                  Browser notifications are not available in this browser.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 text-center">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function SettingChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}
