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
import {
  Fab,
  Badge,
  Box,
  Paper,
} from "@mui/material";

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

export default function MobileNav({
  activeTab,
  onTabChange,
  onNewTask,
  pathname,
  unreadChats = 0,
  pendingShared = 0,
}: MobileNavProps) {
  const router = useRouter();
  const specialPages = [
    "/dashboard/friends",
    "/dashboard/pomodoro",
    "/dashboard/kanban",
    "/dashboard/calendar",
    "/dashboard/analytics",
    "/dashboard/habits",
    "/dashboard/notes",
    "/dashboard/focus",
    "/dashboard/timeline",
  ];
  const isSpecialPage =
    specialPages.includes(pathname) || pathname.startsWith("/dashboard/chat");

  // Determine the current bottom nav value
  // We need a composite value that covers tabs + extra nav items
  const currentValue = isSpecialPage
    ? pathname.startsWith("/dashboard/chat")
      ? "chat"
      : pathname === "/dashboard/friends"
      ? "friends"
      : false
    : activeTab;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: { md: "none" },
        zIndex: 30,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          backdropFilter: "blur(20px)",
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(15,23,42,0.85)"
              : "rgba(255,255,255,0.85)",
          borderTop: "1px solid",
          borderColor: "divider",
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 0.5,
            py: 0.5,
          }}
        >
          {/* All nav items in one row, equally spaced */}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = !isSpecialPage && activeTab === tab.id;
            return (
              <Box
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.25,
                  py: 0.75,
                  cursor: "pointer",
                  color: isActive ? "primary.main" : "text.secondary",
                  transition: "color 0.2s",
                }}
              >
                <Box sx={{ position: "relative" }}>
                  {isActive && (
                    <motion.div
                      layoutId="mobileNavActive"
                      style={{
                        position: "absolute",
                        top: -6,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 24,
                        height: 4,
                        backgroundColor: "#6366f1",
                        borderRadius: 9999,
                      }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    />
                  )}
                  <Badge
                    badgeContent={
                      tab.id === "shared" && pendingShared > 0
                        ? pendingShared > 9 ? "9+" : pendingShared
                        : 0
                    }
                    color="error"
                    max={9}
                    sx={{ "& .MuiBadge-badge": { fontSize: "0.5rem", minWidth: 14, height: 14 } }}
                  >
                    <Icon style={{ width: 18, height: 18 }} />
                  </Badge>
                </Box>
                <Box component="span" sx={{ fontSize: "0.6rem", fontWeight: isActive ? 600 : 400 }}>
                  {tab.label}
                </Box>
              </Box>
            );
          })}

          {/* Center FAB */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Fab
              color="primary"
              size="small"
              onClick={onNewTask}
              aria-label="New task"
              sx={{
                width: 38,
                height: 38,
                mt: -2,
                borderRadius: 2,
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
              }}
            >
              <Plus style={{ width: 18, height: 18 }} />
            </Fab>
            <Box
              component="span"
              sx={{ fontSize: "0.575rem", fontWeight: 500, color: "primary.main", mt: 0.25 }}
            >
              New
            </Box>
          </Box>

          {/* Chat */}
          <Box
            onClick={() => router.push("/dashboard/chat")}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.25,
              py: 0.75,
              cursor: "pointer",
              color: pathname.startsWith("/dashboard/chat") ? "primary.main" : "text.secondary",
              transition: "color 0.2s",
            }}
          >
            <Badge
              badgeContent={unreadChats > 0 ? (unreadChats > 9 ? "9+" : unreadChats) : 0}
              color="error"
              max={9}
              sx={{ "& .MuiBadge-badge": { fontSize: "0.5rem", minWidth: 14, height: 14 } }}
            >
              <MessageCircle style={{ width: 18, height: 18 }} />
            </Badge>
            <Box component="span" sx={{ fontSize: "0.6rem", fontWeight: pathname.startsWith("/dashboard/chat") ? 600 : 400 }}>
              Chat
            </Box>
          </Box>

          {/* Friends */}
          <Box
            onClick={() => router.push("/dashboard/friends")}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.25,
              py: 0.75,
              cursor: "pointer",
              color: pathname === "/dashboard/friends" ? "primary.main" : "text.secondary",
              transition: "color 0.2s",
            }}
          >
            <Users style={{ width: 18, height: 18 }} />
            <Box component="span" sx={{ fontSize: "0.6rem", fontWeight: pathname === "/dashboard/friends" ? 600 : 400 }}>
              Friends
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
