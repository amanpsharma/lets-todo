"use client";

import { createContext, useContext } from "react";
import { Todo, Stats } from "@/types/todo";

interface Filters {
  search: string;
  category: string;
  priority: string;
  status: string;
}

interface TodoContextType {
  todos: Todo[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  addTodo: (todo: Partial<Todo>) => Promise<Todo>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<Todo>;
  deleteTodo: (id: string) => Promise<void>;
  reorderTodos: (todos: Todo[]) => Promise<void>;
  toggleTodo: (id: string) => Promise<Todo | undefined>;
  refresh: () => Promise<void>;
}

export const TodoContext = createContext<TodoContextType | null>(null);

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodoContext must be used within a TodoProvider");
  }
  return context;
}
