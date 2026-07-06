"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Tag,
  Flag,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Todo } from "@/types/todo";
import { format } from "date-fns";
import Link from "next/link";

const priorityColors = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  medium: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
};

export default function SharedTodoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/todos/share/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setTodo)
      .catch(() => setError("This todo doesn't exist or has been deleted."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full"
        />
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Circle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Todo Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to TaskFlow
          </Link>
        </div>
      </div>
    );
  }

  const subtasks = todo.subtasks || [];
  const tags = todo.tags || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200/30 dark:bg-violet-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to TaskFlow
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                Shared Task
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  todo.completed
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {todo.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <div>
                <h1
                  className={`text-2xl font-bold font-heading ${
                    todo.completed
                      ? "line-through text-gray-400 dark:text-gray-500"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {todo.title}
                </h1>
                {todo.description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {todo.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${priorityColors[todo.priority]}`}>
                <Flag className="w-3.5 h-3.5" />
                {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
              </span>

              <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300 capitalize">
                {todo.category}
              </span>

              {todo.dueDate && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Due {format(new Date(todo.dueDate), "MMM d, yyyy")}
                </span>
              )}

              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                todo.completed
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              }`}>
                {todo.completed ? "Completed" : "In Progress"}
              </span>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {subtasks.length > 0 && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Subtasks ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
                </h3>
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          subtask.completed
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {subtask.completed && (
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          subtask.completed
                            ? "line-through text-gray-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
              Created {format(new Date(todo.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
