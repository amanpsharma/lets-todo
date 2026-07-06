"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, CheckCheck, Trash2 } from "lucide-react";

interface BulkActionsProps {
  todosCount: number;
  completedCount: number;
  onMarkAllComplete: () => void;
  onDeleteCompleted: () => void;
}

export default function BulkActions({
  todosCount,
  completedCount,
  onMarkAllComplete,
  onDeleteCompleted,
}: BulkActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
      >
        <MoreHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">Actions</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl shadow-xl overflow-hidden z-30"
          >
            <div className="p-1">
              <button
                onClick={() => { onMarkAllComplete(); setOpen(false); }}
                disabled={todosCount === completedCount}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCheck className="w-4 h-4" />
                <div className="text-left">
                  <p className="font-medium">Mark All Complete</p>
                  <p className="text-xs text-gray-400">{todosCount - completedCount} tasks remaining</p>
                </div>
              </button>
              <button
                onClick={() => { onDeleteCompleted(); setOpen(false); }}
                disabled={completedCount === 0}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-700 dark:hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <div className="text-left">
                  <p className="font-medium">Delete Completed</p>
                  <p className="text-xs text-gray-400">{completedCount} completed tasks</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
