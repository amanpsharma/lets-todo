"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
