"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Users, Menu, X, MessageCircle } from "lucide-react";
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
import NotificationCenter from "@/components/NotificationCenter";
import OnboardingModal from "@/components/OnboardingModal";
import { useNotifications } from "@/hooks/useNotifications";
import toast from "react-hot-toast";
import { AppBar, Toolbar, Button, IconButton, Badge, Chip } from "@mui/material";

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
  const { unreadChats, pendingShared } = useNotifications();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-amber-50/20 dark:from-gray-950 dark:via-slate-950 dark:to-indigo-950/30 transition-colors duration-500">
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
        <div className="absolute -top-40 -right-40 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-br from-indigo-300/15 to-indigo-400/15 dark:from-indigo-600/10 dark:to-indigo-700/10 rounded-full blur-3xl animate-pulse-ring" />
        <div
          className="absolute top-1/3 -left-32 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-to-br from-amber-200/15 to-amber-300/15 dark:from-amber-700/8 dark:to-amber-800/8 rounded-full blur-3xl animate-pulse-ring"
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
          unreadChats={unreadChats}
          pendingShared={pendingShared}
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
                className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-80 z-50 md:hidden"
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
                  unreadChats={unreadChats}
                  pendingShared={pendingShared}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <AppBar
            component={motion.header}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            position="static"
            elevation={0}
            sx={{
              flexShrink: 0,
              backgroundColor: "transparent",
              borderBottom: "1px solid",
              borderColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(12px)",
            }}
            className="glass"
          >
            <Toolbar
              disableGutters
              className="flex items-center justify-between px-3 sm:px-6 lg:px-8 py-2 sm:py-4"
              sx={{ minHeight: "unset !important" }}
            >
              <div className="flex items-center gap-1.5 sm:gap-4">
                {/* Mobile hamburger */}
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  size="small"
                  className="md:hidden text-gray-600 dark:text-gray-400"
                  sx={{
                    borderRadius: "0.75rem",
                    "&:hover": { backgroundColor: "rgba(156,163,175,0.1)" },
                  }}
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </IconButton>

                <div className="flex items-center gap-1.5 sm:gap-3">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-500/30"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white font-heading">
                      TaskFlow
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      Press{" "}
                      <Chip
                        label="Ctrl+K"
                        size="small"
                        variant="outlined"
                        component="span"
                        sx={{
                          height: "18px",
                          fontSize: "10px",
                          fontFamily: "monospace",
                          borderRadius: "4px",
                          "& .MuiChip-label": { px: "6px", py: 0 },
                        }}
                        className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                      />{" "}
                      for commands
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-3">
                {/* Focus Mode */}
                <Button
                  onClick={() => router.push("/dashboard/pomodoro")}
                  size="small"
                  startIcon={
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  }
                  className="hidden lg:flex"
                  sx={{
                    textTransform: "none",
                    borderRadius: "0.75rem",
                    border: "1px solid",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    px: 1.5,
                    py: 1,
                    color: "rgb(217 119 6)",
                    borderColor: "rgba(253,230,138,0.5)",
                    backgroundColor: "rgb(255 251 235 / 1)",
                    "&:hover": { backgroundColor: "rgb(254 243 199 / 1)" },
                    ".dark &": {
                      color: "rgb(251 191 36)",
                      borderColor: "rgba(120,53,15,0.3)",
                      backgroundColor: "rgba(120,53,15,0.2)",
                      "&:hover": { backgroundColor: "rgba(120,53,15,0.3)" },
                    },
                  }}
                >
                  Focus Mode
                </Button>

                {/* Chat */}
                <Badge
                  badgeContent={unreadChats > 99 ? "99+" : unreadChats}
                  color="error"
                  max={99}
                  className="hidden lg:flex"
                  sx={{ "& .MuiBadge-badge": { fontSize: "10px", height: "18px", minWidth: "18px" } }}
                >
                  <Button
                    onClick={() => router.push("/dashboard/chat")}
                    size="small"
                    startIcon={<MessageCircle className="w-4 h-4" />}
                    sx={{
                      textTransform: "none",
                      borderRadius: "0.75rem",
                      border: "1px solid",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      px: 1.5,
                      py: 1,
                      color: "rgb(99 102 241)",
                      borderColor: "rgba(199,210,254,0.5)",
                      backgroundColor: "rgb(238 242 255 / 1)",
                      "&:hover": { backgroundColor: "rgb(224 231 255 / 1)" },
                      ".dark &": {
                        color: "rgb(165 180 252)",
                        borderColor: "rgba(49,46,129,0.3)",
                        backgroundColor: "rgba(49,46,129,0.2)",
                        "&:hover": { backgroundColor: "rgba(49,46,129,0.3)" },
                      },
                    }}
                  >
                    Chat
                  </Button>
                </Badge>

                {/* Friends */}
                <Badge
                  badgeContent={pendingShared > 99 ? "99+" : pendingShared}
                  color="error"
                  max={99}
                  className="hidden lg:flex"
                  sx={{ "& .MuiBadge-badge": { fontSize: "10px", height: "18px", minWidth: "18px" } }}
                >
                  <Button
                    onClick={() => router.push("/dashboard/friends")}
                    size="small"
                    startIcon={<Users className="w-4 h-4" />}
                    sx={{
                      textTransform: "none",
                      borderRadius: "0.75rem",
                      border: "1px solid",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      px: 1.5,
                      py: 1,
                      color: "rgb(99 102 241)",
                      borderColor: "rgba(199,210,254,0.5)",
                      backgroundColor: "rgb(238 242 255 / 1)",
                      "&:hover": { backgroundColor: "rgb(224 231 255 / 1)" },
                      ".dark &": {
                        color: "rgb(165 180 252)",
                        borderColor: "rgba(49,46,129,0.3)",
                        backgroundColor: "rgba(49,46,129,0.2)",
                        "&:hover": { backgroundColor: "rgba(49,46,129,0.3)" },
                      },
                    }}
                  >
                    Friends
                  </Button>
                </Badge>

                <NotificationCenter />
                <span className="hidden sm:inline-flex">
                  <ThemeToggle />
                </span>
                <UserButton
                  appearance={{
                    elements: { avatarBox: "w-7 h-7 sm:w-9 sm:h-9 ring-2 ring-indigo-500/20" },
                  }}
                />

                {/* New Task - hidden on mobile, MobileNav has FAB */}
                <Button
                  onClick={() => setShowModal(true)}
                  variant="contained"
                  startIcon={<Plus className="w-4 h-4" />}
                  className="hidden sm:flex"
                  sx={{
                    textTransform: "none",
                    borderRadius: "0.75rem",
                    fontWeight: 500,
                    px: { sm: 2, lg: 2.5 },
                    py: { sm: 1, lg: 1.25 },
                    background: "linear-gradient(to right, #4f46e5, #6366f1)",
                    boxShadow: "0 4px 14px 0 rgba(99,102,241,0.3)",
                    "&:hover": {
                      background: "linear-gradient(to right, #6366f1, #818cf8)",
                      boxShadow: "0 4px 20px 0 rgba(99,102,241,0.5)",
                    },
                  }}
                >
                  New Task
                </Button>
              </div>
            </Toolbar>
          </AppBar>

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
        unreadChats={unreadChats}
        pendingShared={pendingShared}
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
      <OnboardingModal />
    </div>
    </TodoContext.Provider>
  );
}
