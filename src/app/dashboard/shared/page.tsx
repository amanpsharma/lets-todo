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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
          <Share2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shared with Me</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tasks others have shared with you</p>
        </div>
      </div>

      <SharedWithMe />
    </motion.div>
  );
}
