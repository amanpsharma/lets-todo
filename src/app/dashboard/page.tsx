"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ListChecks, AlertCircle, RotateCcw } from "lucide-react";
import { Box, Typography, Alert, Button } from "@mui/material";
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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 10 }}>
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 } }}>
          <Box
            sx={{
              p: { xs: 0.75, sm: 1 },
              bgcolor: "indigo.50",
              borderRadius: { xs: 2, sm: 3 },
              display: "flex",
            }}
          >
            <ListChecks className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              All Tasks
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: { xs: "0.6875rem", sm: "0.75rem" } }}
            >
              {todos.length} tasks total
            </Typography>
          </Box>
        </Box>
        <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
      </Box>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            severity="error"
            icon={<AlertCircle className="w-5 h-5" />}
            sx={{ mb: 2, borderRadius: 3 }}
            action={
              <Button
                color="error"
                size="small"
                onClick={() => refresh()}
                startIcon={<RotateCcw className="w-3 h-3" />}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </motion.div>
      )}

      {/* AI Smart Input */}
      <SmartInput />

      {/* Filter Bar */}
      <Box sx={{ mb: 3 }}>
        <FilterBar filters={filters} setFilters={setFilters} categories={categories} />
      </Box>

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
