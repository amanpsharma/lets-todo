"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

type TimerMode = "focus" | "shortBreak" | "longBreak";

const TIMER_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const modeConfig = {
  focus: {
    label: "Focus",
    icon: Brain,
    color: "from-indigo-500 to-indigo-600",
  },
  shortBreak: {
    label: "Short Break",
    icon: Coffee,
    color: "from-emerald-500 to-teal-600",
  },
  longBreak: {
    label: "Long Break",
    icon: Coffee,
    color: "from-blue-500 to-cyan-600",
  },
};

export default function PomodoroPage() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(
    (newMode?: TimerMode) => {
      const m = newMode || mode;
      setTimeLeft(TIMER_DURATIONS[m]);
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [mode]
  );

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);

      if (mode === "focus") {
        setSessions((s) => s + 1);
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("Focus session complete! Time for a break.");
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission();
          }
        }
        const nextMode =
          (sessions + 1) % 4 === 0 ? "longBreak" : "shortBreak";
        setMode(nextMode);
        setTimeLeft(TIMER_DURATIONS[nextMode]);
      } else {
        setMode("focus");
        setTimeLeft(TIMER_DURATIONS.focus);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode, sessions]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    resetTimer(newMode);
    setTimeLeft(TIMER_DURATIONS[newMode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / TIMER_DURATIONS[mode];
  const circumference = 2 * Math.PI * 90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg sm:rounded-xl">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Pomodoro Timer
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
            Stay focused and productive
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-8">
        {/* Mode Switcher */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-8">
          {(Object.keys(modeConfig) as TimerMode[]).map((m) => {
            const config = modeConfig[m];
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  mode === m
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="pomodoroPageMode"
                    className={`absolute inset-0 bg-gradient-to-r ${config.color} rounded-xl shadow-lg`}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <config.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Timer Display */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]">
            <svg viewBox="0 0 220 220" className="w-full h-full progress-ring">
              <circle
                cx="110"
                cy="110"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-gray-200 dark:text-gray-700"
              />
              <motion.circle
                cx="110"
                cy="110"
                r="90"
                fill="none"
                stroke="url(#pomodoroPageGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{
                  strokeDashoffset: circumference * (1 - progress),
                }}
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient
                  id="pomodoroPageGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      mode === "focus"
                        ? "#8b5cf6"
                        : mode === "shortBreak"
                        ? "#10b981"
                        : "#3b82f6"
                    }
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      mode === "focus"
                        ? "#a855f7"
                        : mode === "shortBreak"
                        ? "#14b8a6"
                        : "#06b6d4"
                    }
                  />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white font-mono">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 capitalize">
                {modeConfig[mode].label}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => resetTimer()}
            className="p-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={`px-10 py-4 rounded-2xl font-semibold text-white shadow-lg transition-all bg-gradient-to-r ${modeConfig[mode].color}`}
          >
            <span className="flex items-center gap-2">
              {isRunning ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {isRunning ? "Pause" : "Start"}
            </span>
          </motion.button>
        </div>

        {/* Sessions Counter */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sessions completed:{" "}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {sessions}
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
