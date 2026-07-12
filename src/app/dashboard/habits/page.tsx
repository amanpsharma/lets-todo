"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Flame,
  Trophy,
  Check,
  X,
  Trash2,
  Target,
} from "lucide-react";
import { format, subDays, isToday } from "date-fns";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";

interface Habit {
  _id: string;
  title: string;
  emoji: string;
  color: string;
  frequency: "daily" | "weekly";
  completedDates: string[];
  streak: number;
  bestStreak: number;
}

const colorOptions = [
  { value: "indigo", bg: "#6366f1" },
  { value: "blue", bg: "#3b82f6" },
  { value: "emerald", bg: "#10b981" },
  { value: "orange", bg: "#f97316" },
  { value: "pink", bg: "#ec4899" },
  { value: "cyan", bg: "#06b6d4" },
];

const emojiOptions = ["✅", "💪", "📚", "🧘", "💧", "🏃", "🎯", "🌅", "💤", "🥗", "✍️", "🧠"];

const colorHex: Record<string, string> = {
  indigo: "#6366f1",
  blue: "#3b82f6",
  emerald: "#10b981",
  orange: "#f97316",
  pink: "#ec4899",
  cyan: "#06b6d4",
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("✅");
  const [newColor, setNewColor] = useState("indigo");
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return { date: format(d, "yyyy-MM-dd"), label: format(d, "EEE"), day: format(d, "d"), isToday: isToday(d) };
  });

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      if (res.ok) setHabits(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const addHabit = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), emoji: newEmoji, color: newColor }),
      });
      if (res.ok) {
        const habit = await res.json();
        setHabits((prev) => [habit, ...prev]);
        setNewTitle("");
        setNewEmoji("✅");
        setNewColor("indigo");
        setShowAdd(false);
        toast.success("Habit created!");
      }
    } catch {
      toast.error("Failed to create habit");
    }
  };

  const toggleDay = async (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h._id !== habitId) return h;
        const has = h.completedDates.includes(date);
        return {
          ...h,
          completedDates: has
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date],
        };
      })
    );

    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleDate: date }),
      });
      if (res.ok) {
        const updated = await res.json();
        setHabits((prev) => prev.map((h) => (h._id === habitId ? updated : h)));
      }
    } catch {
      fetchHabits();
    }
  };

  const deleteHabit = async (id: string) => {
    setHabits((prev) => prev.filter((h) => h._id !== id));
    try {
      await fetch(`/api/habits/${id}`, { method: "DELETE" });
      toast.success("Habit deleted");
    } catch {
      fetchHabits();
    }
  };

  const totalToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? (totalToday / totalHabits) * 100 : 0;

  return (
    <Box sx={{ height: "100%", maxWidth: 768, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <Target size={22} color="#6366f1" />
            Habit Tracker
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            Build consistency, one day at a time
          </Typography>
        </Box>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => setShowAdd(true)}
            sx={{
              background: "linear-gradient(to right, #4f46e5, #6366f1)",
              borderRadius: 3,
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { background: "linear-gradient(to right, #4338ca, #4f46e5)" },
            }}
          >
            New Habit
          </Button>
        </motion.div>
      </Box>

      {/* Today's progress */}
      {totalHabits > 0 && (
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 3, boxShadow: "none" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Box>
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>Today&apos;s Progress</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {totalToday}/{totalHabits}
                </Typography>
              </Box>
              <Chip
                label={`${Math.round(progressPercent)}%`}
                sx={{
                  fontWeight: 700,
                  bgcolor: "#ede9fe",
                  color: "#7c3aed",
                  fontSize: "0.875rem",
                  height: 36,
                  px: 1,
                }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(to right, #8b5cf6, #a855f7)",
                  borderRadius: 4,
                },
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Add habit form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <Card variant="outlined" sx={{ borderRadius: 3, mb: 3, boxShadow: "none" }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <TextField
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addHabit()}
                    placeholder="e.g., Drink 8 glasses of water"
                    variant="outlined"
                    size="small"
                    fullWidth
                    autoFocus
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                  <IconButton onClick={() => setShowAdd(false)}>
                    <X size={20} />
                  </IconButton>
                </Box>

                {/* Emoji picker */}
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mb: 1, display: "block" }}>Icon</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {emojiOptions.map((e) => (
                      <Box
                        key={e}
                        component="button"
                        onClick={() => setNewEmoji(e)}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          fontSize: "1.125rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          bgcolor: newEmoji === e ? "#ede9fe" : "action.hover",
                          border: newEmoji === e ? "2px solid #6366f1" : "2px solid transparent",
                          transition: "all 0.15s",
                        }}
                      >{e}</Box>
                    ))}
                  </Box>
                </Box>

                {/* Color picker */}
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mb: 1, display: "block" }}>Color</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {colorOptions.map((c) => (
                      <Box
                        key={c.value}
                        component="button"
                        onClick={() => setNewColor(c.value)}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: c.bg,
                          cursor: "pointer",
                          border: newColor === c.value ? "3px solid rgba(0,0,0,0.3)" : "3px solid transparent",
                          outline: newColor === c.value ? "2px solid rgba(0,0,0,0.15)" : "none",
                          outlineOffset: 2,
                          opacity: newColor === c.value ? 1 : 0.6,
                          transition: "all 0.15s",
                          "&:hover": { opacity: 1 },
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  onClick={addHabit}
                  disabled={!newTitle.trim()}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 700,
                    background: "linear-gradient(to right, #4f46e5, #6366f1)",
                    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                    "&:hover": { background: "linear-gradient(to right, #4338ca, #4f46e5)" },
                  }}
                >
                  Create Habit
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits list */}
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="outlined" sx={{ borderRadius: 3, boxShadow: "none" }}>
              <CardContent>
                <Box sx={{ height: 24, width: "33%", borderRadius: 1, bgcolor: "action.hover" }} />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : habits.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Target size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>No habits yet</Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            Start building good habits today
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowAdd(true)}
            sx={{
              background: "linear-gradient(to right, #4f46e5, #6366f1)",
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Create Your First Habit
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {habits.map((habit, idx) => {
            const hex = colorHex[habit.color] || colorHex.indigo;
            const completedToday = habit.completedDates.includes(today);
            return (
              <motion.div
                key={habit._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: "none" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography sx={{ fontSize: "1.5rem" }}>{habit.emoji}</Typography>
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>{habit.title}</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.25 }}>
                            {habit.streak > 0 && (
                              <Chip
                                icon={<Flame size={12} />}
                                label={`${habit.streak} day streak`}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: `${hex}18`,
                                  color: hex,
                                  "& .MuiChip-icon": { color: hex, ml: 0.5 },
                                }}
                              />
                            )}
                            {habit.bestStreak > 0 && (
                              <Chip
                                icon={<Trophy size={12} />}
                                label={`Best: ${habit.bestStreak}`}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: "0.7rem",
                                  fontWeight: 500,
                                  bgcolor: "action.hover",
                                  color: "text.secondary",
                                  "& .MuiChip-icon": { color: "inherit", ml: 0.5 },
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => deleteHabit(habit._id)}
                        sx={{ "&:hover": { bgcolor: "#fee2e2", color: "#ef4444" } }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>

                    {/* 7-day grid */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 0.75 } }}>
                      {last7Days.map((day) => {
                        const done = habit.completedDates.includes(day.date);
                        return (
                          <Box
                            key={day.date}
                            component="button"
                            onClick={() => toggleDay(habit._id, day.date)}
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 0.25,
                              py: { xs: 0.75, sm: 1 },
                              minWidth: 0,
                              borderRadius: 2,
                              cursor: "pointer",
                              border: day.isToday && !done ? `2px solid ${hex}4d` : "2px solid transparent",
                              bgcolor: done ? hex : "action.hover",
                              color: done ? "#fff" : "text.secondary",
                              transition: "all 0.15s",
                              "&:hover": { opacity: 0.85 },
                            }}
                          >
                            <Typography variant="caption" sx={{ fontSize: "0.625rem", fontWeight: 500, opacity: 0.7 }}>
                              {day.label}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
                              {day.day}
                            </Typography>
                            {done && <Check size={12} />}
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
