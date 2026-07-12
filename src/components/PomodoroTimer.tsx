"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  IconButton,
  Box,
  ButtonGroup,
} from "@mui/material";

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
    focus: { label: "Focus", icon: Brain, gradientStart: "#8b5cf6", gradientEnd: "#a855f7" },
    shortBreak: { label: "Short Break", icon: Coffee, gradientStart: "#10b981", gradientEnd: "#14b8a6" },
    longBreak: { label: "Long Break", icon: Coffee, gradientStart: "#3b82f6", gradientEnd: "#06b6d4" },
  };

  const currentConfig = modeConfig[mode];

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open={isOpen}
          onClose={onClose}
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: { sx: { borderRadius: 4, overflow: "hidden" } },
          }}
        >
          <DialogContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                <Brain style={{ width: 20, height: 20, color: "#6366f1" }} />
                Pomodoro Timer
              </Typography>
              <IconButton onClick={onClose} size="small">
                <X style={{ width: 20, height: 20 }} />
              </IconButton>
            </Box>

            {/* Mode Switcher */}
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                p: 0.5,
                bgcolor: "grey.100",
                borderRadius: 3,
                mb: 4,
              }}
            >
              {(Object.keys(modeConfig) as TimerMode[]).map((m) => {
                const config = modeConfig[m];
                const Icon = config.icon;
                const isActive = mode === m;
                return (
                  <Box
                    key={m}
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
                      cursor: "pointer",
                      color: isActive ? "white" : "text.secondary",
                      background: isActive
                        ? `linear-gradient(135deg, ${config.gradientStart}, ${config.gradientEnd})`
                        : "transparent",
                      boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                      transition: "all 0.2s",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      "&:hover": !isActive ? { bgcolor: "grey.200" } : {},
                    }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      {config.label}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Timer Display */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Box sx={{ position: "relative" }}>
                <svg width="200" height="200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke={`url(#pomodoroGradient)`}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: circumference * (1 - progress) }}
                    transition={{ duration: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="pomodoroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={currentConfig.gradientStart} />
                      <stop offset="100%" stopColor={currentConfig.gradientEnd} />
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
                    variant="h3"
                    sx={{ fontWeight: 700, fontFamily: "monospace", lineHeight: 1 }}
                  >
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, textTransform: "capitalize" }}>
                    {currentConfig.label}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Controls */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  onClick={() => resetTimer()}
                  sx={{ bgcolor: "grey.100", "&:hover": { bgcolor: "grey.200" } }}
                >
                  <RotateCcw style={{ width: 20, height: 20 }} />
                </IconButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={toggleTimer}
                  startIcon={isRunning ? <Pause style={{ width: 20, height: 20 }} /> : <Play style={{ width: 20, height: 20 }} />}
                  sx={{
                    px: 5,
                    py: 1.75,
                    borderRadius: 3,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${currentConfig.gradientStart}, ${currentConfig.gradientEnd})`,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    "&:hover": {
                      background: `linear-gradient(135deg, ${currentConfig.gradientEnd}, ${currentConfig.gradientStart})`,
                    },
                  }}
                >
                  {isRunning ? "Pause" : "Start"}
                </Button>
              </motion.div>
            </Box>

            {/* Sessions Counter */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Sessions completed:{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
                  {sessions}
                </Box>
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
