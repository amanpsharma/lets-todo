"use client";

import { motion } from "framer-motion";
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Share2,
  Plus,
  MessageCircle,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

type TabType = "all" | "active" | "completed" | "shared";

interface MobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onNewTask: () => void;
  pathname: string;
  unreadChats?: number;
  pendingShared?: number;
}

const tabs: { id: TabType; label: string; icon: typeof ListTodo }[] = [
  { id: "all", label: "All", icon: ListTodo },
  { id: "active", label: "Active", icon: Clock },
  { id: "completed", label: "Done", icon: CheckCircle2 },
  { id: "shared", label: "Shared", icon: Share2 },
];

export default function MobileNav({ activeTab, onTabChange, onNewTask, pathname, unreadChats = 0, pendingShared = 0 }: MobileNavProps) {
  const router = useRouter();
  const specialPages = ["/dashboard/friends", "/dashboard/pomodoro", "/dashboard/kanban", "/dashboard/calendar", "/dashboard/analytics", "/dashboard/habits", "/dashboard/notes", "/dashboard/focus", "/dashboard/timeline"];
  const isSpecialPage = specialPages.includes(pathname) || pathname.startsWith("/dashboard/chat");

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-30">
      {/* Gradient fade above nav */}
      <div className="h-6 bg-gradient-to-t from-white/80 dark:from-gray-950/80 to-transparent pointer-events-none" />

      <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-1.5">
          {tabs.map((tab) => {
            const isActive = !isSpecialPage && activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px] ${
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActive"
                    className="absolute -top-1.5 w-6 h-1 bg-violet-500 rounded-full"
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                )}
                <div className="relative">
                  <tab.icon className="w-5 h-5" />
                  {tab.id === "shared" && pendingShared > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                      {pendingShared > 99 ? "99+" : pendingShared}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}

          {/* Center FAB for new task */}
          <button
            onClick={onNewTask}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/30 flex items-center justify-center -mt-4">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">New</span>
          </button>

          {/* Extra shortcuts */}
          <button
            onClick={() => router.push("/dashboard/chat")}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px] ${
              pathname.startsWith("/dashboard/chat")
                ? "text-violet-600 dark:text-violet-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              {unreadChats > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                  {unreadChats > 99 ? "99+" : unreadChats}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Chat</span>
          </button>
          <button
            onClick={() => router.push("/dashboard/friends")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px] ${
              pathname === "/dashboard/friends"
                ? "text-violet-600 dark:text-violet-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Friends</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
