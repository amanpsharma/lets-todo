"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <AnimatePresence>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-red-500/30"
      >
        {count > 99 ? "99+" : count}
      </motion.span>
    </AnimatePresence>
  );
}
