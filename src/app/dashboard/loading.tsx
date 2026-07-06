"use client";

import { motion } from "framer-motion";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
          <div>
            <div className="w-32 h-5 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="w-20 h-3 rounded-lg bg-gray-200 dark:bg-gray-800 mt-1.5" />
          </div>
        </div>
        <div className="w-28 h-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-3">
        <div className="flex-1 max-w-sm h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="w-32 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 hidden sm:block" />
      </div>

      {/* Todo card skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card rounded-2xl border-l-4 border-l-gray-200 dark:border-l-gray-700 p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 mt-0.5" />
            <div className="flex-1">
              <div className="w-3/4 h-5 rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="w-1/2 h-3.5 rounded-lg bg-gray-200 dark:bg-gray-800 mt-2" />
              <div className="flex gap-2 mt-3">
                <div className="w-16 h-5 rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="w-20 h-5 rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="w-24 h-5 rounded-lg bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
