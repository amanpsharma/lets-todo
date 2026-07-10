"use client";

import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import SharedWithMe from "@/components/SharedWithMe";

export default function SharedPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg sm:rounded-xl">
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Shared with Me</h2>
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Tasks others have shared with you</p>
        </div>
      </div>

      <SharedWithMe />
    </motion.div>
  );
}
