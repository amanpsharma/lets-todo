"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";

type TimerMode = "focus" | "shortBreak" | "longBreak";

const TIMER_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const modeConfig: Record<TimerMode, { label: string; Icon: typeof Brain; gradient: string; color: string }> = {
  focus: {
    label: "Focus",
    Icon: Brain,
    gradient: "linear-gradient(to right, #6366f1, #4f46e5)",
    color: "#6366f1",
  },
  shortBreak: {
    label: "Short Break",
    Icon: Coffee,
    gradient: "linear-gradient(to right, #10b981, #0d9488)",
    color: "#10b981",
  },
  longBreak: {
    label: "Long Break",
    Icon: Coffee,
    gradient: "linear-gradient(to right, #3b82f6, #06b6d4)",
    color: "#3b82f6",
  },
};

const modeStrokeStart: Record<TimerMode, string> = {
  focus: "#8b5cf6",
  shortBreak: "#10b981",
  longBreak: "#3b82f6",
};
const modeStrokeEnd: Record<TimerMode, string> = {
  focus: "#a855f7",
  shortBreak: "#14b8a6",
  longBreak: "#06b6d4",
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

  const cfg = modeConfig[mode];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ maxWidth: 448, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, mb: { xs: 3, sm: 4 } }}>
          <Box
            sx={{
              p: { xs: 0.75, sm: 1 },
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              borderRadius: { xs: 1.5, sm: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Brain size={20} color="#fff" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.125rem" } }}>
              Pomodoro Timer
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Stay focused and productive
            </Typography>
          </Box>
        </Box>

        <Card variant="outlined" sx={{ borderRadius: 4, boxShadow: "none" }}>
          <CardContent sx={{ p: 4 }}>
            {/* Mode Switcher */}
            <Box
              sx={{
                display: "flex",
                gap: 0.75,
                p: 0.625,
                bgcolor: "action.hover",
                borderRadius: 3,
                mb: 4,
              }}
            >
              {(Object.keys(modeConfig) as TimerMode[]).map((m) => {
                const c = modeConfig[m];
                const isActive = mode === m;
                return (
                  <Box
                    key={m}
                    component="button"
                    onClick={() => switchMode(m)}
                    sx={{
                      position: "relative",
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.75,
                      px: 1.5,
                      py: 1.25,
                      borderRadius: 2.5,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      background: isActive ? c.gradient : "transparent",
                      color: isActive ? "#fff" : "text.secondary",
                      boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
                      transition: "all 0.2s",
                      "&:hover": { color: isActive ? "#fff" : "text.primary" },
                    }}
                  >
                    <c.Icon size={16} />
                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      {c.label}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Timer Display */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 3, sm: 4 } }}>
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 180, sm: 220 },
                  height: { xs: 180, sm: 220 },
                }}
              >
                <svg
                  viewBox="0 0 220 220"
                  style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx="110" cy="110" r="90" fill="none"
                    stroke="currentColor" strokeWidth="6"
                    style={{ color: "#e5e7eb" }}
                  />
                  <motion.circle
                    cx="110" cy="110" r="90" fill="none"
                    stroke={`url(#pomodoroPageGradient)`}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: circumference * (1 - progress) }}
                    transition={{ duration: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="pomodoroPageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={modeStrokeStart[mode]} />
                      <stop offset="100%" stopColor={modeStrokeEnd[mode]} />
                    </linearGradient>
                  </defs>
                </svg>
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: "2.5rem", sm: "3rem" },
                      fontWeight: 700,
                      fontFamily: "monospace",
                      lineHeight: 1,
                    }}
                  >
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </Typography>
                  <Chip
                    label={cfg.label}
                    size="small"
                    sx={{
                      mt: 1,
                      height: 22,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      bgcolor: `${cfg.color}18`,
                      color: cfg.color,
                      textTransform: "capitalize",
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Controls */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  onClick={() => resetTimer()}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "action.hover",
                    color: "text.secondary",
                    borderRadius: 2.5,
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  <RotateCcw size={20} />
                </IconButton>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  startIcon={isRunning ? <Pause size={20} /> : <Play size={20} />}
                  onClick={toggleTimer}
                  sx={{
                    px: 5,
                    py: 2,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "1rem",
                    background: cfg.gradient,
                    boxShadow: `0 4px 14px ${cfg.color}44`,
                    "&:hover": { background: cfg.gradient, filter: "brightness(0.92)" },
                  }}
                >
                  {isRunning ? "Pause" : "Start"}
                </Button>
              </motion.div>
            </Box>

            {/* Sessions counter */}
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Sessions completed:{" "}
                <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                  {sessions}
                </Typography>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
}
