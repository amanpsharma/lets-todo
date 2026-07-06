"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      className="relative p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all backdrop-blur-sm shadow-sm"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: dark ? 180 : 0, scale: dark ? 0.9 : 1 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
      >
        {dark ? (
          <Moon className="w-4.5 h-4.5 text-violet-400" />
        ) : (
          <Sun className="w-4.5 h-4.5 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
