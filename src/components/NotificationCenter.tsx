"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, Share2, CheckCircle2, ListChecks } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  MenuList,
} from "@mui/material";
import {
  NotificationsNone as BellIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface Notification {
  _id: string;
  type: "chat" | "shared" | "completed" | "subtask" | "mention";
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const open = Boolean(anchorEl);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const linkForNotification = (n: Notification): string => {
    if (n.link) return n.link;
    switch (n.type) {
      case "chat":
        return "/dashboard/chat";
      case "shared":
      case "completed":
      case "subtask":
        return "/dashboard/shared";
      default:
        return "/dashboard";
    }
  };

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
    if (unreadCount > 0) markAllRead();
  };

  const handleClose = () => setAnchorEl(null);

  const handleNotificationClick = (n: Notification) => {
    handleClose();
    router.push(linkForNotification(n));
  };

  const iconForType = (type: string) => {
    switch (type) {
      case "chat":
        return <MessageCircle style={{ width: 16, height: 16, color: "#3b82f6" }} />;
      case "shared":
        return <Share2 style={{ width: 16, height: 16, color: "#6366f1" }} />;
      case "completed":
        return <CheckCircle2 style={{ width: 16, height: 16, color: "#10b981" }} />;
      case "subtask":
        return <ListChecks style={{ width: 16, height: 16, color: "#f97316" }} />;
      default:
        return <Bell style={{ width: 16, height: 16, color: "#9ca3af" }} />;
    }
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        onClick={handleOpen}
        size="small"
        aria-label="notifications"
      >
        <Badge
          badgeContent={unreadCount > 99 ? "99+" : unreadCount}
          color="error"
          max={99}
        >
          <BellIcon fontSize="small" />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 320, sm: 384 },
              maxHeight: "70vh",
              overflowY: "auto",
              borderRadius: 3,
              mt: 1,
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            position: "sticky",
            top: 0,
            bgcolor: "background.paper",
            zIndex: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <IconButton size="small" onClick={handleClose} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Bell
              style={{ width: 32, height: 32, color: "#9ca3af", margin: "0 auto 12px" }}
            />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <MenuList disablePadding>
          {notifications.map((n, i) => (
            <Box key={n._id}>
              <MenuItem
                onClick={() => handleNotificationClick(n)}
                sx={{
                  alignItems: "flex-start",
                  gap: 1.5,
                  py: 1.5,
                  bgcolor: !n.read ? "action.selected" : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemIcon sx={{ minWidth: "unset", mt: 0.25 }}>
                  {iconForType(n.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                      {n.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block" }}
                      >
                        {n.body}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ color: "text.disabled", display: "block", mt: 0.25 }}
                      >
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </Typography>
                    </>
                  }
                  disableTypography={false}
                />
                {!n.read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      flexShrink: 0,
                      mt: 0.75,
                    }}
                  />
                )}
              </MenuItem>
              {i < notifications.length - 1 && <Divider />}
            </Box>
          ))}
          </MenuList>
        )}
      </Popover>
    </>
  );
}
