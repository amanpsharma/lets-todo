"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";

interface StreakCounterProps {
  todayCompleted: number;
}

export default function StreakCounter({ todayCompleted }: StreakCounterProps) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load streak from localStorage
    const stored = localStorage.getItem("taskflow-streak");
    const lastDate = localStorage.getItem("taskflow-streak-date");
    const today = new Date().toDateString();

    if (stored && lastDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate === today) {
        setStreak(parseInt(stored));
      } else if (lastDate === yesterday.toDateString()) {
        // Streak continues if completed tasks today
        if (todayCompleted > 0) {
          const newStreak = parseInt(stored) + 1;
          setStreak(newStreak);
          localStorage.setItem("taskflow-streak", newStreak.toString());
          localStorage.setItem("taskflow-streak-date", today);
        } else {
          setStreak(parseInt(stored));
        }
      } else {
        // Streak broken
        if (todayCompleted > 0) {
          setStreak(1);
          localStorage.setItem("taskflow-streak", "1");
          localStorage.setItem("taskflow-streak-date", today);
        } else {
          setStreak(0);
        }
      }
    } else if (todayCompleted > 0) {
      setStreak(1);
      localStorage.setItem("taskflow-streak", "1");
      localStorage.setItem("taskflow-streak-date", today);
    }
  }, [todayCompleted]);

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <motion.div
          animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`p-2 rounded-xl ${
            streak > 0
              ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/30"
              : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          <Flame className={`w-5 h-5 ${streak > 0 ? "text-white" : "text-gray-400"}`} />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{streak}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">day streak</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {todayCompleted > 0
              ? `${todayCompleted} task${todayCompleted > 1 ? "s" : ""} today`
              : "Complete a task to start!"}
          </p>
        </div>
        {streak >= 7 && (
          <Trophy className="w-5 h-5 text-amber-500" />
        )}
      </div>
    </div>
  );
}
