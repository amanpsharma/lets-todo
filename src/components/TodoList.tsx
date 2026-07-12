"use client";

import { AnimatePresence, motion } from "framer-motion";
import TodoItem from "./TodoItem";
import { Todo } from "@/types/todo";
import { ClipboardList, Sparkles } from "lucide-react";
import { Stack, Box, Typography } from "@mui/material";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onReorder: (todos: Todo[]) => void;
}

export default function TodoList({
  todos,
  onToggle,
  onDelete,
  onUpdate,
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              width: 112,
              height: 112,
              background: "linear-gradient(135deg, #e0e7ff 0%, #fef3c7 100%)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <ClipboardList style={{ width: 48, height: 48, color: "#818cf8" }} />
          </Box>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              padding: 8,
              background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(251,191,36,0.4)",
            }}
          >
            <Sparkles style={{ width: 16, height: 16, color: "white" }} />
          </motion.div>
        </Box>
        <Typography
          variant="h6"
          sx={{ color: "text.primary", mt: 3, fontWeight: 700 }}
        >
          No tasks here yet
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 1, textAlign: "center", maxWidth: 280 }}
        >
          Press{" "}
          <Box
            component="kbd"
            sx={{
              px: 0.75,
              py: 0.25,
              bgcolor: "grey.100",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.7rem",
            }}
          >
            Ctrl+N
          </Box>{" "}
          or click the + button to create your first task
        </Typography>
      </motion.div>
    );
  }

  return (
    <Stack spacing={1.5}>
      <AnimatePresence mode="popLayout">
        {todos.map((todo, index) => (
          <motion.div
            key={todo._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            transition={{ delay: index * 0.03, type: "spring", damping: 25, stiffness: 300 }}
          >
            <TodoItem
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </Stack>
  );
}
