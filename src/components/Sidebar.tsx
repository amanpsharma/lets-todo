"use client";

import {
  ListTodo,
  Clock,
  CheckCircle2,
  Timer,
  ChevronLeft,
  ChevronRight,
  Plus,
  FolderOpen,
  Zap,
  Share2,
  Users,
  MessageCircle,
  BarChart3,
  Columns3,
  Calendar,
  Target,
  StickyNote,
  Eye,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Stats, Todo } from "@/types/todo";
import {
  Badge,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WorkIcon from "@mui/icons-material/Work";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SchoolIcon from "@mui/icons-material/School";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { SvgIconComponent } from "@mui/icons-material";

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

const categoryIcons: Record<string, SvgIconComponent> = {
  general: AssignmentIcon,
  work: WorkIcon,
  personal: HomeIcon,
  shopping: ShoppingCartIcon,
  health: FitnessCenterIcon,
  learning: SchoolIcon,
  finance: AccountBalanceIcon,
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

  const drawerWidth = collapsed && !isMobile ? 80 : 320;

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: isMobile ? "flex" : { xs: "none", md: "flex" },
        width: drawerWidth,
        flexShrink: 0,
        transition: "width 0.3s",
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          transition: "width 0.3s",
          overflowX: "hidden",
          boxSizing: "border-box",
          position: "relative",
          height: "100%",
          border: "none",
          borderRight: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          bgcolor: isMobile ? "background.paper" : "transparent",
        },
      }}
    >
      {/* Collapse Toggle */}
      <List disablePadding sx={{ px: 1, pt: 1 }}>
        <ListItemButton
          sx={{ justifyContent: "flex-end", borderRadius: 2, px: 1 }}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <IconButton size="small" disableRipple>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </IconButton>
        </ListItemButton>
      </List>

      {/* New Task Button */}
      <List disablePadding sx={{ px: 2, mb: 1 }}>
        {!collapsed ? (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onNewTask}
            startIcon={<Plus size={18} />}
            sx={{
              borderRadius: 3,
              py: 1.25,
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              "&:hover": { boxShadow: "0 6px 20px rgba(99,102,241,0.45)" },
            }}
          >
            New Task
          </Button>
        ) : (
          <IconButton
            onClick={onNewTask}
            color="primary"
            sx={{
              mx: "auto",
              display: "flex",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: 2,
              "&:hover": { bgcolor: "primary.dark" },
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}
          >
            <Plus size={18} />
          </IconButton>
        )}
      </List>

      {/* Navigation — Tasks */}
      <List
        disablePadding
        sx={{ px: 1 }}
        subheader={
          !collapsed ? (
            <ListSubheader
              disableSticky
              sx={{
                lineHeight: 2,
                px: 1.5,
                bgcolor: "transparent",
              }}
            >
              <Typography variant="overline" sx={{ color: "text.secondary" }}>
                Tasks
              </Typography>
            </ListSubheader>
          ) : undefined
        }
      >
        {navItems.map((item) => {
          const isSharedActive = item.id === "shared";
          const hasSharedBadge = isSharedActive && (pendingShared ?? 0) > 0;
          return (
            <ListItemButton
              key={item.id}
              selected={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              sx={{
                borderRadius: 2,
                mb: 0.25,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1 : 1.5,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 36,
                  color: activeTab === item.id ? "inherit" : "text.secondary",
                }}
              >
                {collapsed && hasSharedBadge ? (
                  <Badge badgeContent={pendingShared} color="error" max={9}>
                    <item.icon size={20} />
                  </Badge>
                ) : (
                  <item.icon size={20} />
                )}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { variant: "body2", sx: { fontWeight: 500 } } }}
                />
              )}
              {!collapsed && item.count !== null && (
                <Chip
                  label={item.count}
                  size="small"
                  color={hasSharedBadge ? "error" : "default"}
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, ml: 0.5 }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Categories */}
      {!collapsed && categories.length > 0 && (
        <>
          <Divider sx={{ mx: 2, my: 1 }} />
          <List
            disablePadding
            sx={{ px: 1 }}
            subheader={
              <ListSubheader
                disableSticky
                sx={{ lineHeight: 2, px: 1.5, bgcolor: "transparent" }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <FolderOpen size={14} />
                  Categories
                </Typography>
              </ListSubheader>
            }
          >
            {/* All Categories */}
            <ListItemButton
              selected={selectedCategory === ""}
              onClick={() => setSelectedCategory("")}
              sx={{
                borderRadius: 2,
                mb: 0.25,
                px: 1.5,
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  fontWeight: 600,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <AssignmentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="All Categories"
                slotProps={{ primary: { variant: "body2" } }}
              />
            </ListItemButton>

            {categories.map((cat) => {
              const count = todos.filter((t) => t.category === cat).length;
              return (
                <ListItemButton
                  key={cat}
                  selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.25,
                    px: 1.5,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                      "&:hover": { bgcolor: "primary.dark" },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {(() => { const Icon = categoryIcons[cat] || AssignmentIcon; return <Icon fontSize="small" />; })()}
                  </ListItemIcon>
                  <ListItemText
                    primary={cat}
                    slotProps={{
                      primary: {
                        variant: "body2",
                        sx: { textTransform: "capitalize" },
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {count}
                  </Typography>
                </ListItemButton>
              );
            })}
          </List>
        </>
      )}

      {/* Quick Actions */}
      <Divider sx={{ mx: 2, my: 1 }} />
      <List
        disablePadding
        sx={{ px: 1 }}
        subheader={
          !collapsed ? (
            <ListSubheader
              disableSticky
              sx={{ lineHeight: 2, px: 1.5, bgcolor: "transparent" }}
            >
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Zap size={14} />
                Quick Actions
              </Typography>
            </ListSubheader>
          ) : undefined
        }
      >
        {/* Focus Timer */}
        <ListItemButton
          onClick={onOpenPomodoro}
          title="Focus Timer"
          sx={{
            borderRadius: 2,
            mb: 0.25,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 1 : 1.5,
            "&:hover": {
              bgcolor: "rgba(245,158,11,0.08)",
              color: "secondary.main",
              "& .MuiListItemIcon-root": { color: "secondary.main" },
            },
          }}
        >
          <ListItemIcon
            sx={{ minWidth: collapsed ? 0 : 36, color: "text.secondary" }}
          >
            <Timer size={20} />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary="Focus Timer"
              slotProps={{ primary: { variant: "body2", sx: { fontWeight: 500 } } }}
            />
          )}
        </ListItemButton>

        {/* Chat */}
        <ListItemButton
          onClick={onOpenChat}
          title="Chat"
          sx={{
            borderRadius: 2,
            mb: 0.25,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 1 : 1.5,
            "&:hover": {
              bgcolor: "rgba(99,102,241,0.08)",
              color: "primary.main",
              "& .MuiListItemIcon-root": { color: "primary.main" },
            },
          }}
        >
          <ListItemIcon
            sx={{ minWidth: collapsed ? 0 : 36, color: "text.secondary" }}
          >
            {collapsed && unreadChats > 0 ? (
              <Badge badgeContent={unreadChats} color="error" max={99}>
                <MessageCircle size={20} />
              </Badge>
            ) : (
              <MessageCircle size={20} />
            )}
          </ListItemIcon>
          {!collapsed && (
            <>
              <ListItemText
                primary="Chat"
                slotProps={{ primary: { variant: "body2", sx: { fontWeight: 500 } } }}
              />
              {unreadChats > 0 && (
                <Chip
                  label={unreadChats}
                  size="small"
                  color="error"
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, ml: 0.5 }}
                />
              )}
            </>
          )}
        </ListItemButton>

        {/* Friends */}
        <ListItemButton
          onClick={onOpenFriends}
          title="Friends"
          sx={{
            borderRadius: 2,
            mb: 0.25,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 1 : 1.5,
            "&:hover": {
              bgcolor: "rgba(99,102,241,0.08)",
              color: "primary.main",
              "& .MuiListItemIcon-root": { color: "primary.main" },
            },
          }}
        >
          <ListItemIcon
            sx={{ minWidth: collapsed ? 0 : 36, color: "text.secondary" }}
          >
            <Users size={20} />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary="Friends"
              slotProps={{ primary: { variant: "body2", sx: { fontWeight: 500 } } }}
            />
          )}
        </ListItemButton>
      </List>

      {/* Views */}
      <ViewLinks collapsed={collapsed} />
    </Drawer>
  );
}

function ViewLinks({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  const views = [
    { path: "/dashboard/kanban", label: "Kanban Board", icon: Columns3 },
    { path: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    { path: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/dashboard/habits", label: "Habits", icon: Target },
    { path: "/dashboard/notes", label: "Sticky Notes", icon: StickyNote },
    { path: "/dashboard/focus", label: "Focus Mode", icon: Eye },
    { path: "/dashboard/timeline", label: "Timeline", icon: Clock },
  ];

  return (
    <>
      <Divider sx={{ mx: 2, my: 1 }} />
      <List
        disablePadding
        sx={{ px: 1, pb: 2 }}
        subheader={
          !collapsed ? (
            <ListSubheader
              disableSticky
              sx={{ lineHeight: 2, px: 1.5, bgcolor: "transparent" }}
            >
              <Typography variant="overline" sx={{ color: "text.secondary" }}>
                Views
              </Typography>
            </ListSubheader>
          ) : undefined
        }
      >
        {views.map((view) => {
          const active = pathname === view.path;
          const Icon = view.icon;
          return (
            <ListItemButton
              key={view.path}
              selected={active}
              onClick={() => router.push(view.path)}
              title={view.label}
              sx={{
                borderRadius: 2,
                mb: 0.25,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1 : 1.5,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 36,
                  color: active ? "inherit" : "text.secondary",
                }}
              >
                <Icon size={20} />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={view.label}
                  slotProps={{ primary: { variant: "body2", sx: { fontWeight: 500 } } }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </>
  );
}
