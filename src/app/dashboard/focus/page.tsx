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
import { Todo } from "@/types/todo";
import toast from "react-hot-toast";

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
    // Index stays the same since completed task leaves activeTodos
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

  if (activeTodos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/30 mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-2">
            All caught up!
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            No active tasks to focus on. Nice work!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Eye className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Focus Mode
          </span>
          <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
            {currentIndex + 1}/{activeTodos.length}
          </span>
        </div>

        {/* Timer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTodo?._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="relative w-48 h-48 mx-auto mb-8">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                <circle
                  cx="100" cy="100" r="88" fill="none"
                  stroke="currentColor" strokeWidth="4"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="100" cy="100" r="88" fill="none"
                  stroke="url(#focusGrad)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${Math.min(elapsed / 15, 1) * 553} 553`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Clock className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-3xl font-bold font-heading text-gray-900 dark:text-white font-mono">
                  {formatTime(elapsed)}
                </span>
              </div>
            </div>

            {/* Current task */}
            <div className="glass-card rounded-2xl p-6 mb-8">
              {currentTodo && (
                <>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      currentTodo.priority === "urgent" ? "bg-red-500" :
                      currentTodo.priority === "high" ? "bg-orange-400" :
                      currentTodo.priority === "medium" ? "bg-blue-400" : "bg-emerald-400"
                    }`} />
                    {currentTodo.category && currentTodo.category !== "general" && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 capitalize">
                        {currentTodo.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                    {currentTodo.title}
                  </h2>
                  {currentTodo.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                      {currentTodo.description}
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={skip}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            Skip
          </motion.button>

          {!running ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startFocus}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/30"
            >
              <Sparkles className="w-4 h-4" />
              Start Focusing
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRunning(false)}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg"
            >
              Pause
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={completeAndNext}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30"
          >
            <CheckCircle2 className="w-4 h-4" />
            Done
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
