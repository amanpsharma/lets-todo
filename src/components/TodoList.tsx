"use client";

import { AnimatePresence, motion } from "framer-motion";
import TodoItem from "./TodoItem";
import { Todo } from "@/types/todo";
import { ClipboardList, Sparkles } from "lucide-react";

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
        <div className="relative">
          <div className="w-28 h-28 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-3xl flex items-center justify-center shadow-inner">
            <ClipboardList className="w-12 h-12 text-violet-400 dark:text-violet-500" />
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute -top-2 -right-2 p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6">
          No tasks here yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center max-w-xs">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Ctrl+N</kbd> or click the + button to create your first task
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
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
    </div>
  );
}
