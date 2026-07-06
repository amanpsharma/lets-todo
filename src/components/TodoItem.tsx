"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Todo } from "@/types/todo";
import { format, isPast, isToday } from "date-fns";
import ShareWithFriends from "./ShareWithFriends";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
}

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

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [expanded, setExpandedRaw] = useState(() => getExpandedState(todo._id));
  const setExpanded = useCallback((val: boolean) => {
    setExpandedRaw(val);
    saveExpandedState(todo._id, val);
  }, [todo._id]);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || "");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [showShare, setShowShare] = useState(false);


  const subtasks = todo.subtasks || [];
  const tags = todo.tags || [];

  const config = priorityConfig[todo.priority];
  const isOverdue =
    todo.dueDate && !todo.completed && isPast(new Date(todo.dueDate)) && !isToday(new Date(todo.dueDate));

  const handleSaveEdit = () => {
    onUpdate(todo._id, { title: editTitle, description: editDesc });
    setEditing(false);
  };

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    const newSubtask = {
      id: Date.now().toString(),
      title: subtaskInput.trim(),
      completed: false,
    };
    onUpdate(todo._id, { subtasks: [...subtasks, newSubtask] });
    setSubtaskInput("");
  };

  const toggleSubtask = (subtaskId: string) => {
    const updated = subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    onUpdate(todo._id, { subtasks: updated });
  };

  const removeSubtask = (subtaskId: string) => {
    onUpdate(todo._id, {
      subtasks: subtasks.filter((s) => s.id !== subtaskId),
    });
  };

  const subtaskProgress =
    subtasks.length > 0
      ? Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100)
      : 0;

  return (
    <div
      className={`group glass-card rounded-2xl border-l-4 ${config.color} hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 overflow-hidden ${
        todo.completed ? "opacity-60" : ""
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(todo._id)}
            aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
            className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              todo.completed
                ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/30"
                : "border-gray-300 dark:border-gray-600 hover:border-violet-500 hover:shadow-md hover:shadow-violet-500/20 hover:scale-110"
            }`}
          >
            {todo.completed && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10, stiffness: 400 }}
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </motion.div>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white font-medium text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white text-sm resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3
                  className={`font-semibold text-gray-900 dark:text-white transition-all leading-snug ${
                    todo.completed ? "line-through text-gray-400 dark:text-gray-500" : ""
                  }`}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {todo.description}
                  </p>
                )}
              </>
            )}

            {/* Meta */}
            {!editing && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${config.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                  {todo.priority}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300 capitalize">
                  {todo.category}
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
                {subtasks.length > 0 && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="font-medium">{subtasks.filter((s) => s.completed).length}/{subtasks.length}</span>
                    subtasks
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions — always visible on mobile, hover on desktop */}
          <div className="relative flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Collapse subtasks" : "Expand subtasks"}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowShare(!showShare)}
              aria-label="Share task"
              className="p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 text-gray-400 hover:text-violet-500 transition-colors hidden sm:block"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setEditing(true); setEditTitle(todo.title); setEditDesc(todo.description || ""); }}
              aria-label="Edit task"
              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-500 transition-colors hidden sm:block"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                toast((t) => (
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Delete this task?</span>
                    <button
                      onClick={() => { toast.dismiss(t.id); onDelete(todo._id); }}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ), { duration: 5000 });
              }}
              aria-label="Delete task"
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors hidden sm:block"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Share dropdown */}
            {showShare && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute top-full right-0 mt-2 w-56 glass-card rounded-xl shadow-xl overflow-hidden z-50"
              >
                <ShareWithFriends
                  todoId={todo._id}
                  sharedWith={todo.sharedWith || []}
                  onShared={(updatedTodo) => {
                    setShowShare(false);
                    if (updatedTodo) onUpdate(todo._id, updatedTodo);
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile action bar — share, edit, delete on a separate row */}
        {!editing && (
          <div className="flex items-center gap-1 mt-2 ml-9 sm:hidden">
            <button
              onClick={() => setShowShare(!showShare)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button
              onClick={() => { setEditing(true); setEditTitle(todo.title); setEditDesc(todo.description || ""); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => {
                toast((t) => (
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Delete this task?</span>
                    <button
                      onClick={() => { toast.dismiss(t.id); onDelete(todo._id); }}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ), { duration: 5000 });
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}

        {/* Subtask progress bar */}
        {subtasks.length > 0 && !expanded && (
          <div className="mt-3 ml-9">
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${subtaskProgress}%` }}
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Subtasks */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-3 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100/50 dark:border-gray-800/50"
        >
          <div className="pt-4 ml-0 sm:ml-9 space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Subtasks</p>
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="group/sub py-1.5">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleSubtask(subtask.id)}
                    className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all ${
                      subtask.completed
                        ? "bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/30"
                        : "border-gray-300 dark:border-gray-600 hover:border-violet-500"
                    }`}
                  >
                    {subtask.completed && <Check className="w-2.5 h-2.5 text-white" />}
                  </button>
                  <span
                    className={`text-sm flex-1 ${
                      subtask.completed
                        ? "line-through text-gray-400 dark:text-gray-500"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => removeSubtask(subtask.id)}
                    className="sm:opacity-0 sm:group-hover/sub:opacity-100 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {/* User info: added by / completed by */}
                <div className="ml-7 mt-0.5 flex items-center gap-3 flex-wrap">
                  {subtask.addedBy && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                      {subtask.addedBy.avatar ? (
                        <img src={subtask.addedBy.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-violet-400 text-white flex items-center justify-center text-[7px] font-bold">
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
            <div className="flex gap-2 mt-3 pt-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                placeholder="Add subtask..."
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
              />
              <button
                onClick={addSubtask}
                className="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
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
