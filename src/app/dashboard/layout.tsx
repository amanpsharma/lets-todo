"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Users, Menu, X } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useTodos } from "@/hooks/useTodos";
import { TodoContext } from "@/context/TodoContext";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";
import AddTodoModal from "@/components/AddTodoModal";
import PomodoroTimer from "@/components/PomodoroTimer";
import CommandPalette from "@/components/CommandPalette";
import FriendsPanel from "@/components/FriendsPanel";
import UserSync from "@/components/UserSync";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import toast from "react-hot-toast";

type TabType = "all" | "active" | "completed" | "shared";

const pathToTab: Record<string, TabType> = {
  "/dashboard": "all",
  "/dashboard/active": "active",
  "/dashboard/completed": "completed",
  "/dashboard/shared": "shared",
};

const tabToPath: Record<TabType, string> = {
  all: "/dashboard",
  active: "/dashboard/active",
  completed: "/dashboard/completed",
  shared: "/dashboard/shared",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const todoHook = useTodos();
  const { todos, stats, addTodo } = todoHook;

  const [showModal, setShowModal] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync category filter with useTodos
  useEffect(() => {
    todoHook.setFilters({ ...todoHook.filters, category: selectedCategory });
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const activeTab = pathToTab[pathname] || "all";

  const setActiveTab = (tab: TabType) => {
    router.push(tabToPath[tab]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "n":
            e.preventDefault();
            setShowModal(true);
            break;
          case "k":
            e.preventDefault();
            setShowCommandPalette(true);
            break;
          case "p":
            e.preventDefault();
            setShowPomodoro((v) => !v);
            break;
        }
      }
      if (e.key === "Escape") {
        setShowModal(false);
        setShowCommandPalette(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAdd = async (todo: Parameters<typeof addTodo>[0]) => {
    try {
      const result = await addTodo(todo);
      toast.success("Task created successfully!");
      return result;
    } catch {
      toast.error("Failed to create task.");
      throw new Error("Failed");
    }
  };

  return (
    <TodoContext.Provider value={todoHook}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50 dark:from-gray-950 dark:via-slate-950 dark:to-violet-950/50 transition-colors duration-500">
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "!bg-white/90 !backdrop-blur-xl dark:!bg-gray-800/90 !text-gray-900 dark:!text-white !shadow-2xl !rounded-2xl !border !border-white/20 dark:!border-white/5 !text-sm",
          duration: 2500,
        }}
      />

      {/* Background orbs - smaller on mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-br from-violet-300/20 to-purple-400/20 dark:from-violet-600/10 dark:to-purple-700/10 rounded-full blur-3xl animate-pulse-ring" />
        <div
          className="absolute top-1/3 -left-32 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-to-br from-blue-300/20 to-cyan-400/20 dark:from-blue-600/10 dark:to-cyan-700/10 rounded-full blur-3xl animate-pulse-ring"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          stats={stats}
          todos={todos}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onNewTask={() => setShowModal(true)}
          onOpenPomodoro={() => router.push("/dashboard/pomodoro")}
          onOpenFriends={() => router.push("/dashboard/friends")}
          onOpenChat={() => router.push("/dashboard/chat")}
        />

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-80 z-50 md:hidden"
              >
                <Sidebar
                  stats={stats}
                  todos={todos}
                  activeTab={activeTab}
                  setActiveTab={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  collapsed={false}
                  setCollapsed={() => setMobileMenuOpen(false)}
                  onNewTask={() => { setMobileMenuOpen(false); setShowModal(true); }}
                  onOpenPomodoro={() => { setMobileMenuOpen(false); router.push("/dashboard/pomodoro"); }}
                  onOpenFriends={() => { setMobileMenuOpen(false); router.push("/dashboard/friends"); }}
                  onOpenChat={() => { setMobileMenuOpen(false); router.push("/dashboard/chat"); }}
                  isMobile
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-white/20 dark:border-white/5 glass"
          >
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="p-1.5 sm:p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg shadow-violet-500/30"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white font-heading">
                    TaskFlow
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-mono">
                      Ctrl+K
                    </kbd>{" "}
                    for commands
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/pomodoro")}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors border border-orange-200/50 dark:border-orange-800/30"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Focus Mode
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/friends")}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-sm font-medium hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors border border-violet-200/50 dark:border-violet-800/30"
              >
                <Users className="w-4 h-4" />
                Friends
              </motion.button>
              <ThemeToggle />
              <UserButton
                appearance={{
                  elements: { avatarBox: "w-8 h-8 sm:w-9 sm:h-9 ring-2 ring-violet-500/20" },
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:from-violet-500 hover:to-purple-500"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </motion.button>
            </div>
          </motion.header>

          {/* Page Content — extra bottom padding on mobile for bottom nav */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewTask={() => setShowModal(true)}
        pathname={pathname}
      />

      {/* Modals */}
      <AddTodoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
      />

      <PomodoroTimer
        isOpen={showPomodoro}
        onClose={() => setShowPomodoro(false)}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNewTask={() => {
          setShowCommandPalette(false);
          setShowModal(true);
        }}
        onTogglePomodoro={() => {
          setShowCommandPalette(false);
          router.push("/dashboard/pomodoro");
        }}
        onToggleTheme={() => {
          document.documentElement.classList.toggle("dark");
        }}
      />

      <FriendsPanel
        isOpen={showFriends}
        onClose={() => setShowFriends(false)}
      />

      <UserSync />
      <PWAInstallPrompt />
    </div>
    </TodoContext.Provider>
  );
}
