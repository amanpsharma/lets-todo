"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ListChecks, AlertCircle, RotateCcw } from "lucide-react";
import { useTodoContext } from "@/context/TodoContext";
import TodoList from "@/components/TodoList";
import FilterBar from "@/components/FilterBar";
import SortDropdown from "@/components/SortDropdown";
import SmartInput from "@/components/SmartInput";
import { Todo } from "@/types/todo";

type SortType = "date" | "priority" | "name" | "dueDate";

const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

export default function AllTasksPage() {
  const { todos, loading, error, filters, setFilters, toggleTodo, deleteTodo, updateTodo, reorderTodos, refresh } = useTodoContext();
  const [sortBy, setSortBy] = useState<SortType>("date");

  const categories = useMemo(() => {
    const cats = new Set(todos.map((t) => t.category));
    return Array.from(cats);
  }, [todos]);

  const sortedTodos = useMemo(() => {
    const sorted = [...todos];
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
  }, [todos, sortBy]);

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
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg sm:rounded-xl">
            <ListChecks className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">All Tasks</h2>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">{todos.length} tasks total</p>
          </div>
        </div>
        <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
          <button
            onClick={() => refresh()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Retry
          </button>
        </motion.div>
      )}

      {/* AI Smart Input */}
      <SmartInput />

      {/* Filter Bar */}
      <div className="mb-6">
        <FilterBar filters={filters} setFilters={setFilters} categories={categories} />
      </div>

      {/* Todo List */}
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
