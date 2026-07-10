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
  { value: "indigo", bg: "bg-indigo-500", light: "bg-indigo-100 dark:bg-indigo-900/30" },
  { value: "blue", bg: "bg-blue-500", light: "bg-blue-100 dark:bg-blue-900/30" },
  { value: "emerald", bg: "bg-emerald-500", light: "bg-emerald-100 dark:bg-emerald-900/30" },
  { value: "orange", bg: "bg-orange-500", light: "bg-orange-100 dark:bg-orange-900/30" },
  { value: "pink", bg: "bg-pink-500", light: "bg-pink-100 dark:bg-pink-900/30" },
  { value: "cyan", bg: "bg-cyan-500", light: "bg-cyan-100 dark:bg-cyan-900/30" },
];

const emojiOptions = ["✅", "💪", "📚", "🧘", "💧", "🏃", "🎯", "🌅", "💤", "🥗", "✍️", "🧠"];

const colorClasses: Record<string, { ring: string; bg: string; text: string }> = {
  indigo: { ring: "ring-indigo-500", bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
  blue: { ring: "ring-blue-500", bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
  emerald: { ring: "ring-emerald-500", bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  orange: { ring: "ring-orange-500", bg: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  pink: { ring: "ring-pink-500", bg: "bg-pink-500", text: "text-pink-600 dark:text-pink-400" },
  cyan: { ring: "ring-cyan-500", bg: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400" },
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
    // Optimistic update
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

  return (
    <div className="h-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
            <Target className="w-6 h-6 text-indigo-500" />
            Habit Tracker
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Build consistency, one day at a time
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Habit</span>
        </motion.button>
      </div>

      {/* Today's progress */}
      {totalHabits > 0 && (
        <div className="glass-card rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today&apos;s Progress</p>
              <p className="text-3xl font-bold font-heading text-gray-900 dark:text-white mt-1">
                {totalToday}/{totalHabits}
              </p>
            </div>
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#habitGrad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${totalHabits > 0 ? (totalToday / totalHabits) * 264 : 0} 264`}
                />
                <defs>
                  <linearGradient id="habitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {totalHabits > 0 ? Math.round((totalToday / totalHabits) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add habit form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHabit()}
                  placeholder="e.g., Drink 8 glasses of water"
                  className="flex-1 px-4 py-3 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
                  autoFocus
                />
                <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Emoji picker */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Icon</p>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((e) => (
                    <button key={e} onClick={() => setNewEmoji(e)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        newEmoji === e ? "bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >{e}</button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Color</p>
                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button key={c.value} onClick={() => setNewColor(c.value)}
                      className={`w-8 h-8 rounded-full ${c.bg} transition-all ${
                        newColor === c.value ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-gray-400" : "opacity-60 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button onClick={addHabit} disabled={!newTitle.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
              >
                Create Habit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16">
          <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No habits yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Start building good habits today</p>
          <button onClick={() => setShowAdd(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25"
          >
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit, idx) => {
            const cc = colorClasses[habit.color] || colorClasses.indigo;
            const completedToday = habit.completedDates.includes(today);
            return (
              <motion.div
                key={habit._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{habit.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{habit.title}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        {habit.streak > 0 && (
                          <span className={`flex items-center gap-1 text-xs font-medium ${cc.text}`}>
                            <Flame className="w-3 h-3" />
                            {habit.streak} day streak
                          </span>
                        )}
                        {habit.bestStreak > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Trophy className="w-3 h-3" />
                            Best: {habit.bestStreak}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteHabit(habit._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 7-day grid */}
                <div className="flex items-center gap-2">
                  {last7Days.map((day) => {
                    const done = habit.completedDates.includes(day.date);
                    return (
                      <button
                        key={day.date}
                        onClick={() => toggleDay(habit._id, day.date)}
                        className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                          done
                            ? `${cc.bg} text-white shadow-md`
                            : day.isToday
                            ? "bg-gray-100 dark:bg-gray-800 ring-2 ring-indigo-500/30"
                            : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span className="text-[10px] font-medium opacity-70">{day.label}</span>
                        <span className="text-xs font-bold">{day.day}</span>
                        {done && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
