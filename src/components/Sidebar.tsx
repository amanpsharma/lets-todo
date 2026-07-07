"use client";

import { motion } from "framer-motion";
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Flame,
  Timer,
  ChevronLeft,
  ChevronRight,
  Plus,
  FolderOpen,
  Zap,
  Share2,
  Users,
  MessageCircle,
} from "lucide-react";
import { Stats, Todo } from "@/types/todo";
import ProgressRing from "./ProgressRing";
import StreakCounter from "./StreakCounter";
import MotivationalQuote from "./MotivationalQuote";

type TabType = "all" | "active" | "completed" | "shared";

interface SidebarProps {
  stats: Stats | null;
  todos: Todo[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onNewTask: () => void;
  onOpenPomodoro: () => void;
  onOpenFriends: () => void;
  onOpenChat: () => void;
  isMobile?: boolean;
  unreadChats?: number;
  pendingShared?: number;
}

const categoryIcons: Record<string, string> = {
  general: "📋",
  work: "💼",
  personal: "🏠",
  shopping: "🛒",
  health: "💪",
  learning: "📚",
  finance: "💰",
};

export default function Sidebar({
  stats,
  todos,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  collapsed,
  setCollapsed,
  onNewTask,
  onOpenPomodoro,
  onOpenFriends,
  onOpenChat,
  isMobile,
  unreadChats = 0,
  pendingShared = 0,
}: SidebarProps) {
  const navItems = [
    { id: "all" as TabType, label: "All Tasks", icon: ListTodo, count: stats?.total || 0 },
    { id: "active" as TabType, label: "In Progress", icon: Clock, count: stats?.active || 0 },
    { id: "completed" as TabType, label: "Completed", icon: CheckCircle2, count: stats?.completed || 0 },
    { id: "shared" as TabType, label: "Shared with Me", icon: Share2, count: pendingShared || null },
  ];

  const categories = stats?.categories || [];
  const completionRate = stats?.completionRate || 0;

  // Calculate streak from todos
  const todayCompleted = todos.filter(
    (t) => t.completed && new Date(t.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <motion.aside
      initial={isMobile ? false : { x: -20, opacity: 0 }}
      animate={isMobile ? undefined : { x: 0, opacity: 1 }}
      className={`flex-shrink-0 h-full flex flex-col border-r border-white/20 dark:border-white/5 glass transition-all duration-300 ${
        collapsed && !isMobile ? "w-20" : "w-80"
      } ${isMobile ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl" : "hidden md:flex"}`}
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-end p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Add Button */}
      {!collapsed && (
        <div className="px-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewTask}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
            <kbd className="ml-auto px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-mono">Ctrl+N</kbd>
          </motion.button>
        </div>
      )}

      {collapsed && (
        <div className="px-3 mb-4 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNewTask}
            className="p-3 bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-xl shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        {!collapsed && (
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Tasks
          </p>
        )}
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === item.id
                ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
            } ${collapsed ? "justify-center" : ""}`}
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="sidebarActiveTab"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-600 rounded-r-full"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            <div className="relative flex-shrink-0">
              <item.icon className="w-5 h-5" />
              {collapsed && item.id === "shared" && pendingShared > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full">
                  {pendingShared > 9 ? "9+" : pendingShared}
                </span>
              )}
            </div>
            {!collapsed && (
              <>
                <span>{item.label}</span>
                {item.count !== null && (
                  <span className={`ml-auto px-2 py-0.5 rounded-lg text-xs font-bold ${
                    item.id === "shared" && pendingShared > 0
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }`}>
                    {item.count}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Categories */}
      {!collapsed && categories.length > 0 && (
        <div className="px-3 mt-6">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5" />
            Categories
          </p>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory("")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                selectedCategory === ""
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <span>📁</span>
              <span>All Categories</span>
            </button>
            {categories.map((cat) => {
              const count = todos.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                    selectedCategory === cat
                      ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-medium"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <span>{categoryIcons[cat] || "📌"}</span>
                  <span className="capitalize">{cat}</span>
                  <span className="ml-auto text-xs text-gray-400">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!collapsed && (
        <div className="px-3 mt-6">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            Quick Actions
          </p>
          <button
            onClick={onOpenPomodoro}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400 transition-all"
          >
            <Timer className="w-5 h-5" />
            <span>Focus Timer</span>
            <kbd className="ml-auto px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-mono text-gray-400">Ctrl+P</kbd>
          </button>
          <button
            onClick={onOpenChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              {unreadChats > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                  {unreadChats > 99 ? "99+" : unreadChats}
                </span>
              )}
            </div>
            <span>Chat</span>
            {unreadChats > 0 && (
              <span className="ml-auto px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold">
                {unreadChats}
              </span>
            )}
          </button>
          <button
            onClick={onOpenFriends}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
          >
            <Users className="w-5 h-5" />
            <span>Friends</span>
          </button>
        </div>
      )}

      {/* Bottom Section - Stats */}
      <div className="mt-auto p-4 space-y-4">
        {!collapsed && (
          <>
            {/* Progress Ring */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <ProgressRing percentage={completionRate} size={56} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {completionRate}% Done
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stats?.completed || 0} of {stats?.total || 0} tasks
                  </p>
                </div>
              </div>
            </div>

            {/* Streak */}
            <StreakCounter todayCompleted={todayCompleted} />

            {/* Motivational Quote */}
            <MotivationalQuote />
          </>
        )}

        {collapsed && stats && (
          <div className="flex flex-col items-center gap-3">
            <ProgressRing percentage={completionRate} size={40} strokeWidth={4} />
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{todayCompleted}</span>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
