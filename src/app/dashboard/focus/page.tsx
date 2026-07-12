"use client";

import { useContext, useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  CheckCircle2,
  SkipForward,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { TodoContext } from "@/context/TodoContext";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";

export default function FocusPage() {
  const ctx = useContext(TodoContext);
  if (!ctx) return null;
  const { todos, toggleTodo } = ctx;

  const activeTodos = useMemo(
    () => todos.filter((t) => !t.completed),
    [todos]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTodo = activeTodos[currentIndex] || null;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const completeAndNext = () => {
    if (currentTodo) {
      toggleTodo(currentTodo._id);
      toast.success("Task completed!");
    }
    setElapsed(0);
    setRunning(false);
  };

  const skip = () => {
    setCurrentIndex((prev) =>
      prev + 1 >= activeTodos.length ? 0 : prev + 1
    );
    setElapsed(0);
    setRunning(false);
  };

  const startFocus = () => {
    setRunning(true);
  };

  const priorityColor: Record<string, string> = {
    urgent: "#ef4444",
    high: "#fb923c",
    medium: "#60a5fa",
    low: "#34d399",
  };

  if (activeTodos.length === 0) {
    return (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "inline-flex",
              p: 3,
              borderRadius: 4,
              background: "linear-gradient(135deg, #10b981, #0d9488)",
              boxShadow: "0 20px 40px rgba(16,185,129,0.3)",
              mb: 3,
            }}
          >
            <CheckCircle2 size={48} color="#fff" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
            All caught up!
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            No active tasks to focus on. Nice work!
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Box sx={{ width: "100%", maxWidth: 512, textAlign: "center" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 4 }}>
          <Eye size={20} color="#6366f1" />
          <Typography variant="body2" sx={{ fontWeight: 500, color: "text.secondary", textTransform: "uppercase", letterSpacing: 1.5 }}>
            Focus Mode
          </Typography>
          <Chip
            label={`${currentIndex + 1}/${activeTodos.length}`}
            size="small"
            sx={{ bgcolor: "#ede9fe", color: "#6366f1", fontWeight: 600, height: 22, fontSize: "0.75rem" }}
          />
        </Box>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTodo?._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Timer circle */}
            <Box sx={{ position: "relative", width: 192, height: 192, mx: "auto", mb: 4 }}>
              <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle
                  cx="100" cy="100" r="88" fill="none"
                  stroke="currentColor" strokeWidth="4"
                  style={{ color: "#e5e7eb" }}
                />
                <circle
                  cx="100" cy="100" r="88" fill="none"
                  stroke="url(#focusGrad)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${Math.min(elapsed / 15, 1) * 553} 553`}
                  style={{ transition: "stroke-dasharray 1s linear" }}
                />
                <defs>
                  <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
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
                <Clock size={20} color="#9ca3af" style={{ marginBottom: 4 }} />
                <Typography
                  variant="h1"
                  sx={{ fontSize: "1.875rem", fontWeight: 700, fontFamily: "monospace" }}
                >
                  {formatTime(elapsed)}
                </Typography>
              </Box>
            </Box>

            {/* Current task card */}
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 4, boxShadow: "none" }}>
              <CardContent>
                {currentTodo && (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: priorityColor[currentTodo.priority] || "#34d399",
                        }}
                      />
                      {currentTodo.category && currentTodo.category !== "general" && (
                        <Chip
                          label={currentTodo.category}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.6875rem",
                            textTransform: "capitalize",
                            bgcolor: "action.hover",
                            color: "text.secondary",
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                      {currentTodo.title}
                    </Typography>
                    {currentTodo.description && (
                      <Typography variant="body2" sx={{ mt: 1.5, lineHeight: 1.6, color: "text.secondary" }}>
                        {currentTodo.description}
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: { xs: 1, sm: 2 }, flexWrap: "wrap" }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<SkipForward size={16} />}
              onClick={skip}
              sx={{
                px: { xs: 1.5, sm: 2.5 },
                py: 1.25,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                bgcolor: "action.hover",
                color: "text.secondary",
                boxShadow: "none",
                "&:hover": { bgcolor: "action.selected", boxShadow: "none" },
              }}
            >
              Skip
            </Button>
          </motion.div>

          {!running ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                startIcon={<Sparkles size={16} />}
                onClick={startFocus}
                sx={{
                  px: { xs: 2, sm: 4 },
                  py: 1.25,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  background: "linear-gradient(to right, #4f46e5, #6366f1)",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                  "&:hover": { background: "linear-gradient(to right, #4338ca, #4f46e5)" },
                }}
              >
                Start
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={() => setRunning(false)}
                sx={{
                  px: { xs: 2, sm: 4 },
                  py: 1.25,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  background: "linear-gradient(to right, #4b5563, #374151)",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                  "&:hover": { background: "linear-gradient(to right, #374151, #1f2937)" },
                }}
              >
                Pause
              </Button>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<CheckCircle2 size={16} />}
              endIcon={<ArrowRight size={14} />}
              onClick={completeAndNext}
              sx={{
                px: { xs: 1.5, sm: 2.5 },
                py: 1.25,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                background: "linear-gradient(to right, #10b981, #0d9488)",
                boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                "&:hover": { background: "linear-gradient(to right, #059669, #0f766e)" },
              }}
            >
              Done
            </Button>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
