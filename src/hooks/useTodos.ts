"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Todo, Stats } from "@/types/todo";

interface Filters {
  search: string;
  category: string;
  priority: string;
  status: string;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    priority: "",
    status: "",
  });

  // Debounce timer for search
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(filters);

  useEffect(() => {
    // Debounce search (300ms), apply other filters immediately
    if (filters.search !== debouncedFilters.search) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setDebouncedFilters(filters);
      }, 300);
    } else {
      setDebouncedFilters(filters);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTodos = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (debouncedFilters.search) params.set("search", debouncedFilters.search);
      if (debouncedFilters.category) params.set("category", debouncedFilters.category);
      if (debouncedFilters.priority) params.set("priority", debouncedFilters.priority);
      if (debouncedFilters.status) params.set("status", debouncedFilters.status);

      const res = await fetch(`/api/todos?${params}`);
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch todos";
      setError(msg);
      console.error("Failed to fetch todos:", msg);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/todos/stats");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStats(data);
    } catch {
      console.error("Failed to fetch stats");
    }
  }, []);

  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, [fetchTodos, fetchStats]);

  const addTodo = async (todo: Partial<Todo>) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    });
    if (!res.ok) throw new Error("Failed to create todo");
    const newTodo = await res.json();
    setTodos((prev) => [newTodo, ...prev]);
    fetchStats();
    return newTodo;
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update todo");
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
    fetchStats();
    return updated;
  };

  const deleteTodo = async (id: string) => {
    // Optimistic delete — remove from UI immediately
    const prev = todos;
    setTodos((t) => t.filter((todo) => todo._id !== id));

    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        // Rollback on failure
        setTodos(prev);
        throw new Error("Failed to delete todo");
      }
      fetchStats();
    } catch {
      setTodos(prev);
      throw new Error("Failed to delete todo");
    }
  };

  const reorderTodos = async (newOrder: Todo[]) => {
    const prev = todos;
    setTodos(newOrder);

    try {
      const res = await fetch("/api/todos/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newOrder.map((t) => t._id) }),
      });
      if (!res.ok) {
        setTodos(prev);
      }
    } catch {
      // Rollback on failure
      setTodos(prev);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t._id === id);
    if (todo) {
      // Optimistic toggle
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
      );

      try {
        const updated = await updateTodo(id, { completed: !todo.completed });
        return updated;
      } catch {
        // Rollback
        setTodos((prev) =>
          prev.map((t) => (t._id === id ? { ...t, completed: todo.completed } : t))
        );
      }
    }
  };

  return {
    todos,
    stats,
    loading,
    error,
    filters,
    setFilters,
    addTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
    toggleTodo,
    refresh: fetchTodos,
  };
}
