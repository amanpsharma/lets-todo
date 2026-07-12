"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { IconButton, Tooltip } from "@mui/material";

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
    <Tooltip title={dark ? "Switch to light mode" : "Switch to dark mode"} arrow>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <IconButton
          onClick={toggle}
          aria-label="Toggle theme"
          size="small"
          sx={{ borderRadius: 3 }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: dark ? 180 : 0, scale: dark ? 0.9 : 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
            style={{ display: "flex", alignItems: "center" }}
          >
            {dark ? (
              <Moon style={{ width: 18, height: 18, color: "#818cf8" }} />
            ) : (
              <Sun style={{ width: 18, height: 18, color: "#f59e0b" }} />
            )}
          </motion.div>
        </IconButton>
      </motion.div>
    </Tooltip>
  );
}
