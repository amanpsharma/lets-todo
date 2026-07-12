"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Loader2,
  Users,
  Search,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";

interface Conversation {
  friend: {
    clerkId: string;
    name: string;
    avatar: string;
  };
  lastMessage: {
    content: string;
    from: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

export default function ChatListPage() {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      console.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  const filtered = conversations.filter((c) =>
    c.friend.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ maxWidth: 640, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 1.25,
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
              }}
            >
              <MessageCircle size={22} color="#fff" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Messages</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {totalUnread > 0
                  ? `${totalUnread} unread message${totalUnread > 1 ? "s" : ""}`
                  : "Chat with your friends"}
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={() => router.push("/dashboard/friends")}
            variant="outlined"
            sx={{
              minWidth: 0,
              p: 1,
              borderRadius: 2,
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": { borderColor: "text.secondary" },
            }}
            title="Find friends"
          >
            <Users size={20} />
          </Button>
        </Box>

        {/* Search */}
        {conversations.length > 0 && (
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="#9ca3af" />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}

        {/* Conversation List */}
        {conversations.length === 0 ? (
          <Box
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, textAlign: "center" }}>
              <Box
                sx={{
                  p: 2.5,
                  background: "linear-gradient(135deg, #ede9fe, #fef3c7)",
                  borderRadius: 4,
                  mb: 2.5,
                }}
              >
                <MessageCircle size={40} color="#6366f1" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                No conversations yet
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, maxWidth: 280, color: "text.secondary" }}>
                Add friends to start chatting with them
              </Typography>
              <Button
                variant="contained"
                startIcon={<Users size={16} />}
                onClick={() => router.push("/dashboard/friends")}
                sx={{
                  background: "linear-gradient(to right, #4f46e5, #6366f1)",
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                }}
              >
                Find Friends
              </Button>
            </Box>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No conversations match &ldquo;{search}&rdquo;
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {filtered.map((conv, i) => (
              <motion.div
                key={conv.friend.clerkId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ListItemButton
                  onClick={() => router.push(`/dashboard/chat/${conv.friend.clerkId}`)}
                  sx={{
                    borderRadius: 3,
                    p: { xs: 1.5, sm: 2 },
                    border: "1px solid",
                    borderColor: conv.unreadCount > 0 ? "rgba(99,102,241,0.25)" : "divider",
                    bgcolor: conv.unreadCount > 0 ? "rgba(99,102,241,0.06)" : "background.paper",
                    "&:hover": {
                      bgcolor: conv.unreadCount > 0 ? "rgba(99,102,241,0.1)" : "action.hover",
                    },
                    gap: 2,
                  }}
                >
                  {/* Avatar with online dot */}
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          bgcolor: "#34d399",
                          borderRadius: "50%",
                          border: "2px solid",
                          borderColor: "background.paper",
                        }}
                      />
                    }
                    sx={{ flexShrink: 0 }}
                  >
                    <Avatar
                      src={conv.friend.avatar}
                      alt={conv.friend.name}
                      sx={{ width: 48, height: 48, background: "linear-gradient(135deg, #818cf8, #6366f1)" }}
                    >
                      {conv.friend.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>

                  {/* Text content */}
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography
                          component="span"
                          sx={{ fontWeight: conv.unreadCount > 0 ? 700 : 600, fontSize: "0.9375rem" }}
                          noWrap
                        >
                          {conv.friend.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, ml: 1.5 }}>
                          {conv.lastMessage && (
                            <Typography variant="caption" sx={{ color: "text.disabled" }}>
                              {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                            </Typography>
                          )}
                          {conv.unreadCount > 0 && (
                            <Badge
                              badgeContent={conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                              color="primary"
                              sx={{
                                "& .MuiBadge-badge": {
                                  position: "static",
                                  transform: "none",
                                  fontSize: "0.6875rem",
                                  fontWeight: 700,
                                  minWidth: 22,
                                  height: 22,
                                  borderRadius: 11,
                                },
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    }
                    secondary={
                      conv.lastMessage ? (
                        <Typography
                          component="span"
                          variant="body2"
                          noWrap
                          sx={{ display: "block", fontSize: "0.8125rem", color: conv.unreadCount > 0 ? "text.primary" : "text.secondary", fontWeight: conv.unreadCount > 0 ? 500 : 400 }}
                        >
                          {conv.lastMessage.from === userId && (
                            <Typography component="span" variant="body2" sx={{ fontSize: "inherit", color: "text.disabled" }}>
                              You:{" "}
                            </Typography>
                          )}
                          {conv.lastMessage.content}
                        </Typography>
                      ) : (
                        <Typography component="span" variant="body2" sx={{ fontStyle: "italic", fontSize: "0.8125rem", color: "text.disabled" }}>
                          No messages yet — say hi!
                        </Typography>
                      )
                    }
                    disableTypography
                  />

                  {/* Arrow */}
                  <ChevronRight size={16} color="#d1d5db" style={{ flexShrink: 0 }} />
                </ListItemButton>
              </motion.div>
            ))}
          </List>
        )}
      </Box>
    </motion.div>
  );
}
