"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp } from "lucide-react";
import { Stats } from "@/types/todo";

interface StatsPanelProps {
  stats: Stats | null;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) return null;

  const cards = [
    {
      label: "Total",
      value: stats.total,
      icon: ListTodo,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      shadow: "shadow-blue-500/20",
    },
    {
      label: "Done",
      value: stats.completed,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      shadow: "shadow-emerald-500/20",
    },
    {
      label: "Active",
      value: stats.active,
      icon: Clock,
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      shadow: "shadow-amber-500/20",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      gradient: "from-red-500 to-red-600",
      bg: "bg-red-50 dark:bg-red-950/20",
      shadow: "shadow-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className={`${card.bg} rounded-xl p-3 border border-white/20 dark:border-white/5`}
        >
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${card.gradient} shadow-md ${card.shadow}`}>
              <card.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {card.value}
              </span>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-none">
                {card.label}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
