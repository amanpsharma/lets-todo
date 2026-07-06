"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimerMode = "focus" | "shortBreak" | "longBreak";

const TIMER_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function PomodoroTimer({ isOpen, onClose }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback((newMode?: TimerMode) => {
    const m = newMode || mode;
    setTimeLeft(TIMER_DURATIONS[m]);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
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
        const nextMode = (sessions + 1) % 4 === 0 ? "longBreak" : "shortBreak";
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

  const modeConfig = {
    focus: { label: "Focus", icon: Brain, color: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
    shortBreak: { label: "Short Break", icon: Coffee, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    longBreak: { label: "Long Break", icon: Coffee, color: "from-blue-500 to-cyan-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="glass-card rounded-3xl shadow-2xl p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-violet-500" />
                  Pomodoro Timer
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

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
                          layoutId="pomodoroMode"
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
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <svg width="200" height="200" className="progress-ring">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <motion.circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="url(#pomodoroGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      animate={{ strokeDashoffset: circumference * (1 - progress) }}
                      transition={{ duration: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="pomodoroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={mode === "focus" ? "#8b5cf6" : mode === "shortBreak" ? "#10b981" : "#3b82f6"} />
                        <stop offset="100%" stopColor={mode === "focus" ? "#a855f7" : mode === "shortBreak" ? "#14b8a6" : "#06b6d4"} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white font-mono">
                      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
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
                  className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTimer}
                  className={`px-8 py-4 rounded-2xl font-semibold text-white shadow-lg transition-all bg-gradient-to-r ${modeConfig[mode].color} ${
                    isRunning ? "shadow-lg" : "shadow-xl"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isRunning ? "Pause" : "Start"}
                  </span>
                </motion.button>
              </div>

              {/* Sessions Counter */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sessions completed: <span className="font-bold text-violet-600 dark:text-violet-400">{sessions}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
