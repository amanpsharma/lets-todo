"use client";

import { useContext, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Flame,
  ListChecks,
  AlertTriangle,
} from "lucide-react";
import { TodoContext } from "@/context/TodoContext";
import { Todo } from "@/types/todo";
import { isPast, isToday, format, subDays, startOfDay } from "date-fns";

const priorityColors: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const categoryEmoji: Record<string, string> = {
  general: "📋",
  work: "💼",
  personal: "🏠",
  shopping: "🛒",
  health: "💪",
  learning: "📚",
  finance: "💰",
};

export default function AnalyticsPage() {
  const ctx = useContext(TodoContext);
  if (!ctx) return null;
  const { todos, stats } = ctx;

  const analytics = useMemo(() => {
    const completed = todos.filter((t) => t.completed);
    const active = todos.filter((t) => !t.completed);
    const overdue = active.filter(
      (t) => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))
    );

    // Category breakdown
    const categoryMap = new Map<string, { total: number; done: number }>();
    for (const t of todos) {
      const cat = t.category || "general";
      const entry = categoryMap.get(cat) || { total: 0, done: 0 };
      entry.total++;
      if (t.completed) entry.done++;
      categoryMap.set(cat, entry);
    }

    // Priority breakdown
    const priorityMap = new Map<string, { total: number; done: number }>();
    for (const t of todos) {
      const entry = priorityMap.get(t.priority) || { total: 0, done: 0 };
      entry.total++;
      if (t.completed) entry.done++;
      priorityMap.set(t.priority, entry);
    }

    // Last 7 days completions
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStart = startOfDay(date);
      const count = completed.filter((t) => {
        const updated = new Date(t.updatedAt);
        return startOfDay(updated).getTime() === dayStart.getTime();
      }).length;
      return { date, count, label: format(date, "EEE") };
    });

    const completionRate =
      todos.length > 0 ? Math.round((completed.length / todos.length) * 100) : 0;

    return {
      total: todos.length,
      completed: completed.length,
      active: active.length,
      overdue: overdue.length,
      completionRate,
      categories: Array.from(categoryMap.entries()).sort(
        (a, b) => b[1].total - a[1].total
      ),
      priorities: Array.from(priorityMap.entries()),
      last7,
    };
  }, [todos]);

  const statCards = [
    {
      label: "Total Tasks",
      value: analytics.total,
      icon: ListChecks,
      color: "from-violet-500 to-purple-600",
    },
    {
      label: "Completed",
      value: analytics.completed,
      icon: CheckCircle2,
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "Active",
      value: analytics.active,
      icon: Clock,
      color: "from-blue-500 to-cyan-600",
    },
    {
      label: "Overdue",
      value: analytics.overdue,
      icon: AlertTriangle,
      color: "from-red-500 to-rose-600",
    },
  ];

  const maxDailyCount = Math.max(...analytics.last7.map((d) => d.count), 1);

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-violet-500" />
          Analytics
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track your productivity and progress
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-4 sm:p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {card.label}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
                {card.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 sm:p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-500" />
            Completion Rate
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${analytics.completionRate * 2.64} 264`}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                  {analytics.completionRate}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {analytics.completed} of {analytics.total} tasks completed
              </p>
              {analytics.overdue > 0 && (
                <p className="text-xs text-red-500 mt-1">
                  {analytics.overdue} overdue
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Last 7 Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5 sm:p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            Last 7 Days
          </h3>
          <div className="flex items-end gap-2 h-32">
            {analytics.last7.map((day) => (
              <div
                key={day.label}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[11px] font-medium text-gray-900 dark:text-white">
                  {day.count}
                </span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-violet-500 to-purple-500 transition-all"
                  style={{
                    height: `${Math.max((day.count / maxDailyCount) * 100, 4)}%`,
                  }}
                />
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5 sm:p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Categories
          </h3>
          <div className="space-y-3">
            {analytics.categories.map(([cat, data]) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <span>{categoryEmoji[cat] || "📋"}</span>
                    <span className="capitalize">{cat}</span>
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {data.done}/{data.total}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                    style={{
                      width: `${data.total > 0 ? (data.done / data.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Priority Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-5 sm:p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-violet-500" />
            By Priority
          </h3>
          <div className="space-y-3">
            {["urgent", "high", "medium", "low"].map((p) => {
              const data = analytics.priorities.find(([k]) => k === p)?.[1] || {
                total: 0,
                done: 0,
              };
              return (
                <div key={p} className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${priorityColors[p]}`}
                  />
                  <span className="text-sm capitalize text-gray-700 dark:text-gray-300 flex-1">
                    {p}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {data.total}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({data.done} done)
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
