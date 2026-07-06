"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, AlertCircle, RotateCcw } from "lucide-react";
import { useTodoContext } from "@/context/TodoContext";
import TodoList from "@/components/TodoList";
import FilterBar from "@/components/FilterBar";
import SortDropdown from "@/components/SortDropdown";
import { Todo } from "@/types/todo";

type SortType = "date" | "priority" | "name" | "dueDate";

const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

export default function ActiveTasksPage() {
  const { todos, loading, error, filters, setFilters, toggleTodo, deleteTodo, updateTodo, reorderTodos, refresh } = useTodoContext();
  const [sortBy, setSortBy] = useState<SortType>("date");

  const activeTodos = useMemo(() => todos.filter((t) => !t.completed), [todos]);

  const categories = useMemo(() => {
    const cats = new Set(activeTodos.map((t) => t.category));
    return Array.from(cats);
  }, [activeTodos]);

  const sortedTodos = useMemo(() => {
    const sorted = [...activeTodos];
    switch (sortBy) {
      case "priority":
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case "name":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "dueDate":
        sorted.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [activeTodos, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">In Progress</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{activeTodos.length} active tasks</p>
          </div>
        </div>
        <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
          <button onClick={() => refresh()} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
            <RotateCcw className="w-3 h-3" /> Retry
          </button>
        </motion.div>
      )}

      <div className="mb-6">
        <FilterBar filters={filters} setFilters={setFilters} categories={categories} />
      </div>

      <TodoList
        todos={sortedTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onUpdate={(id: string, updates: Partial<Todo>) => updateTodo(id, updates)}
        onReorder={reorderTodos}
      />
    </motion.div>
  );
}
