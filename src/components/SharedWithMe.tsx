"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Share2,
  Calendar,
  Tag,
  Check,
  Loader2,
  Inbox,
  Plus,
  X,
  Eye,
  Pencil,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Todo } from "@/types/todo";
import { format, isPast, isToday } from "date-fns";
import toast from "react-hot-toast";

const priorityConfig = {
  low: {
    color: "border-l-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    dot: "bg-emerald-400",
  },
  medium: {
    color: "border-l-blue-400",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    dot: "bg-blue-400",
  },
  high: {
    color: "border-l-orange-400",
    badge: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    dot: "bg-orange-400",
  },
  urgent: {
    color: "border-l-red-500",
    badge: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    dot: "bg-red-500",
  },
};

const permissionIcons = {
  view: { icon: Eye, label: "View only", color: "text-gray-500 bg-gray-50 dark:bg-gray-800" },
  edit: { icon: Pencil, label: "Can edit", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  admin: { icon: Shield, label: "Full access", color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" },
};

function getExpandedState(id: string): boolean {
  try {
    const stored = localStorage.getItem("todo-expanded");
    if (stored) {
      const map = JSON.parse(stored);
      return map[id] === true;
    }
  } catch {}
  return false;
}

function saveExpandedState(id: string, value: boolean) {
  try {
    const stored = localStorage.getItem("todo-expanded");
    const map = stored ? JSON.parse(stored) : {};
    if (value) {
      map[id] = true;
    } else {
      delete map[id];
    }
    localStorage.setItem("todo-expanded", JSON.stringify(map));
  } catch {}
}

function SharedTodoItem({ todo, onUpdate }: { todo: Todo; onUpdate: (updated: Todo) => void }) {
  const [expanded, setExpandedRaw] = useState(() => getExpandedState(todo._id));
  const setExpanded = useCallback((val: boolean) => {
    setExpandedRaw(val);
    saveExpandedState(todo._id, val);
  }, [todo._id]);
  const [subtaskInput, setSubtaskInput] = useState("");

  const config = priorityConfig[todo.priority];
  const perm = todo.myPermission || "view";
  const permInfo = permissionIcons[perm];
  const canEdit = perm === "edit" || perm === "admin";
  const subtasks = todo.subtasks || [];
  const tags = todo.tags || [];
  const isOverdue =
    todo.dueDate && !todo.completed && isPast(new Date(todo.dueDate)) && !isToday(new Date(todo.dueDate));

  const subtaskProgress =
    subtasks.length > 0
      ? Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100)
      : 0;

  const updateSharedTodo = async (updates: Partial<Todo>) => {
    try {
      const res = await fetch(`/api/todos/shared/${todo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
        return;
      }
      const updated = await res.json();
      onUpdate(updated);
    } catch {
      toast.error("Failed to update");
    }
  };

  const toggleComplete = () => {
    if (!canEdit) return;
    updateSharedTodo({ completed: !todo.completed });
  };

  const addSubtask = () => {
    if (!subtaskInput.trim() || !canEdit) return;
    const newSubtask = {
      id: Date.now().toString(),
      title: subtaskInput.trim(),
      completed: false,
    };
    updateSharedTodo({ subtasks: [...subtasks, newSubtask] });
    setSubtaskInput("");
  };

  const toggleSubtask = (subtaskId: string) => {
    if (!canEdit) return;
    const updated = subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    updateSharedTodo({ subtasks: updated });
  };

  const removeSubtask = (subtaskId: string) => {
    if (!canEdit) return;
    updateSharedTodo({ subtasks: subtasks.filter((s) => s.id !== subtaskId) });
  };

  return (
    <div
      className={`group glass-card rounded-2xl border-l-4 ${config.color} overflow-hidden transition-all duration-300 ${
        todo.completed ? "opacity-60" : ""
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={toggleComplete}
            disabled={!canEdit}
            className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              todo.completed
                ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/30"
                : canEdit
                ? "border-gray-300 dark:border-gray-600 hover:border-indigo-500 hover:scale-110 cursor-pointer"
                : "border-gray-200 dark:border-gray-700 cursor-default"
            }`}
          >
            {todo.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 400 }}
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </motion.div>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-gray-900 dark:text-white leading-snug ${
                todo.completed ? "line-through text-gray-400 dark:text-gray-500" : ""
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {todo.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${config.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                {todo.priority}
              </span>
              {todo.dueDate && (
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${
                    isOverdue
                      ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      : isToday(new Date(todo.dueDate))
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {format(new Date(todo.dueDate), "MMM d")}
                </span>
              )}
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 font-medium">
                <Share2 className="w-3 h-3" />
                from {todo.ownerName}
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${permInfo.color}`}>
                <permInfo.icon className="w-3 h-3" />
                {permInfo.label}
              </span>
            </div>
          </div>

          {/* Expand button */}
          {canEdit && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Subtask progress */}
        {subtasks.length > 0 && !expanded && (
          <div className="mt-3 ml-0 sm:ml-9">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">
                {subtasks.filter((s) => s.completed).length}/{subtasks.length} subtasks
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${subtaskProgress}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded subtasks section */}
      {expanded && canEdit && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-3 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100/50 dark:border-gray-800/50"
        >
          <div className="pt-4 ml-0 sm:ml-9 space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Subtasks
            </p>

            {subtasks.map((subtask) => (
              <div key={subtask.id} className="group/sub py-1.5">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleSubtask(subtask.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      subtask.completed
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-300 dark:border-gray-600 hover:border-indigo-500"
                    }`}
                  >
                    {subtask.completed && <Check className="w-2.5 h-2.5 text-white" />}
                  </button>
                  <span
                    className={`text-sm flex-1 ${
                      subtask.completed
                        ? "line-through text-gray-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => removeSubtask(subtask.id)}
                    className="sm:opacity-0 sm:group-hover/sub:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {/* User info: added by / completed by */}
                <div className="ml-6.5 mt-0.5 flex items-center gap-3 flex-wrap">
                  {subtask.addedBy && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                      {subtask.addedBy.avatar ? (
                        <img src={subtask.addedBy.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-indigo-400 text-white flex items-center justify-center text-[7px] font-bold">
                          {subtask.addedBy.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      added by {subtask.addedBy.name}
                    </span>
                  )}
                  {subtask.completed && subtask.completedBy && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-500 dark:text-emerald-400">
                      {subtask.completedBy.avatar ? (
                        <img src={subtask.completedBy.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 text-white flex items-center justify-center text-[7px] font-bold">
                          {subtask.completedBy.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      done by {subtask.completedBy.name}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Add subtask input */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                placeholder="Add a subtask..."
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
              />
              <button
                onClick={addSubtask}
                disabled={!subtaskInput.trim()}
                className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function SharedWithMe() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/todos/shared-with-me")
      .then((res) => res.json())
      .then((data) => setTodos(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (updated: Todo) => {
    setTodos((prev) => prev.map((t) => (t._id === updated._id ? { ...updated, ownerName: t.ownerName, myPermission: t.myPermission } : t)));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Loading shared todos...
        </p>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl mb-4">
          <Inbox className="w-10 h-10 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Nothing shared yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
          When friends share todos with you, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo, index) => (
        <motion.div
          key={todo._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <SharedTodoItem todo={todo} onUpdate={handleUpdate} />
        </motion.div>
      ))}
    </div>
  );
}
