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
import {
  Box,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WorkIcon from "@mui/icons-material/Work";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SchoolIcon from "@mui/icons-material/School";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { SvgIconComponent } from "@mui/icons-material";
import { TodoContext } from "@/context/TodoContext";
import { Todo } from "@/types/todo";
import { isPast, isToday, format, subDays, startOfDay } from "date-fns";

const priorityColors: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const categoryIconMap: Record<string, SvgIconComponent> = {
  general: AssignmentIcon,
  work: WorkIcon,
  personal: HomeIcon,
  shopping: ShoppingCartIcon,
  health: FitnessCenterIcon,
  learning: SchoolIcon,
  finance: AccountBalanceIcon,
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
      color: "from-indigo-500 to-indigo-600",
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
    <Box sx={{ height: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <BarChart3 className="w-6 h-6 text-indigo-500" />
          Analytics
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Track your productivity and progress
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                    <Box
                      className={`p-2 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}
                      sx={{ display: "flex" }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "medium" }}>
                      {card.label}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    noWrap
                    sx={{ fontWeight: "bold", fontSize: { xs: "1.25rem", sm: "1.875rem" } }}
                  >
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 3,
        }}
      >
        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Target className="w-4 h-4 text-indigo-500" />
                Completion Rate
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 3 }, flexWrap: { xs: "wrap", sm: "nowrap" }, justifyContent: { xs: "center", sm: "flex-start" } }}>
                <Box sx={{ position: "relative", width: { xs: 96, sm: 112 }, height: { xs: 96, sm: 112 }, flexShrink: 0 }}>
                  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      style={{ color: "#e5e7eb" }}
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
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {analytics.completionRate}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {analytics.completed} of {analytics.total} tasks completed
                  </Typography>
                  {analytics.overdue > 0 && (
                    <Typography variant="caption" sx={{ color: "error.main", display: "block", mt: 0.5 }}>
                      {analytics.overdue} overdue
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Last 7 Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Last 7 Days
              </Typography>
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, height: 128 }}>
                {analytics.last7.map((day) => (
                  <Box
                    key={day.label}
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.25,
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: "medium", fontSize: "0.6875rem" }}>
                      {day.count}
                    </Typography>
                    <Box
                      sx={{
                        width: "100%",
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        background: "linear-gradient(to top, #6366f1, #818cf8)",
                        transition: "height 0.3s",
                        height: `${Math.max((day.count / maxDailyCount) * 100, 4)}%`,
                      }}
                    />
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.625rem" }}>
                      {day.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                Categories
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {analytics.categories.map(([cat, data]) => (
                  <Box key={cat}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.75, textTransform: "capitalize" }}
                      >
                        {(() => { const Icon = categoryIconMap[cat] || AssignmentIcon; return <Icon fontSize="small" />; })()}
                        {cat}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {data.done}/{data.total}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 8,
                        bgcolor: "action.hover",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          borderRadius: 4,
                          background: "linear-gradient(to right, #6366f1, #818cf8)",
                          transition: "width 0.3s",
                          width: `${data.total > 0 ? (data.done / data.total) * 100 : 0}%`,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Priority Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Flame className="w-4 h-4 text-indigo-500" />
                By Priority
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {["urgent", "high", "medium", "low"].map((p) => {
                  const data = analytics.priorities.find(([k]) => k === p)?.[1] || {
                    total: 0,
                    done: 0,
                  };
                  return (
                    <Box key={p} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <span className={`w-3 h-3 rounded-full ${priorityColors[p]}`} />
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", flex: 1, textTransform: "capitalize" }}
                      >
                        {p}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {data.total}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        ({data.done} done)
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
}
