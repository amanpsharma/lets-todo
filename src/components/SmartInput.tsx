"use client";

import { useState, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  ArrowRight,
  Calendar,
  Flag,
  Tag,
  X,
  Loader2,
} from "lucide-react";
import { TodoContext } from "@/context/TodoContext";
import toast from "react-hot-toast";
import {
  TextField,
  InputAdornment,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Typography,
  Box,
  IconButton,
} from "@mui/material";

interface ParsedTask {
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  dueDate: string | null;
  tags: string[];
}

const priorityLabel: Record<string, { label: string; color: "success" | "primary" | "warning" | "error" }> = {
  low: { label: "Low", color: "success" },
  medium: { label: "Medium", color: "primary" },
  high: { label: "High", color: "warning" },
  urgent: { label: "Urgent", color: "error" },
};

export default function SmartInput() {
  const ctx = useContext(TodoContext);
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedTask | null>(null);
  const [parsing, setParsing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const parseInput = async (text: string) => {
    if (!text.trim() || text.length < 3) {
      setParsed(null);
      setShowPreview(false);
      return;
    }

    setParsing(true);
    try {
      const res = await fetch("/api/ai/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setParsed(data);
        setShowPreview(true);
      }
    } catch {} finally {
      setParsing(false);
    }
  };

  const handleChange = (text: string) => {
    setInput(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => parseInput(text), 400);
  };

  const createTask = async () => {
    if (!parsed || !ctx) return;
    try {
      await ctx.addTodo({
        title: parsed.title,
        priority: parsed.priority,
        category: parsed.category,
        dueDate: parsed.dueDate,
        tags: parsed.tags,
      });
      toast.success("Task created with AI!");
      setInput("");
      setParsed(null);
      setShowPreview(false);
    } catch {
      toast.error("Failed to create task");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && parsed) {
      e.preventDefault();
      createTask();
    }
    if (e.key === "Escape") {
      setShowPreview(false);
      setParsed(null);
      setInput("");
    }
  };

  return (
    <Box sx={{ position: "relative", mb: 2 }}>
      <TextField
        inputRef={inputRef}
        fullWidth
        size="small"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Try: "Buy groceries tomorrow high priority #shopping"'
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Wand2 style={{ width: 16, height: 16, color: "#6366f1" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {parsing ? (
                  <CircularProgress size={16} sx={{ color: "#6366f1" }} />
                ) : input ? (
                  <IconButton
                    size="small"
                    onClick={() => { setInput(""); setParsed(null); setShowPreview(false); }}
                    edge="end"
                  >
                    <X style={{ width: 16, height: 16 }} />
                  </IconButton>
                ) : null}
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "16px",
            bgcolor: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(8px)",
          },
        }}
      />

      {/* AI Preview */}
      <AnimatePresence>
        {showPreview && parsed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 8, zIndex: 20 }}
          >
            <Paper
              elevation={8}
              sx={{ borderRadius: "16px", p: 2, border: "1px solid", borderColor: "divider" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Wand2 style={{ width: 14, height: 14, color: "#6366f1" }} />
                <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>
                  AI Parsed
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
                {parsed.title}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
                <Chip
                  size="small"
                  icon={<Flag style={{ width: 12, height: 12 }} />}
                  label={priorityLabel[parsed.priority].label}
                  color={priorityLabel[parsed.priority].color}
                  variant="outlined"
                />

                {parsed.category !== "general" && (
                  <Chip
                    size="small"
                    label={parsed.category}
                    variant="outlined"
                    sx={{ textTransform: "capitalize" }}
                  />
                )}

                {parsed.dueDate && (
                  <Chip
                    size="small"
                    icon={<Calendar style={{ width: 12, height: 12 }} />}
                    label={parsed.dueDate}
                    color="warning"
                    variant="outlined"
                  />
                )}

                {parsed.tags.map((tag) => (
                  <Chip
                    key={tag}
                    size="small"
                    icon={<Tag style={{ width: 10, height: 10 }} />}
                    label={tag}
                    variant="outlined"
                  />
                ))}
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => { setShowPreview(false); setParsed(null); }}
                  sx={{ borderRadius: "12px", py: 1 }}
                >
                  Cancel
                </Button>
                <motion.div style={{ flex: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={createTask}
                    endIcon={<ArrowRight style={{ width: 14, height: 14 }} />}
                    sx={{
                      borderRadius: "12px",
                      py: 1,
                      background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                      fontWeight: 600,
                    }}
                  >
                    Create Task
                  </Button>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
