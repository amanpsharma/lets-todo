"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Loader2,
  Check,
  CheckCheck,
  MessageCircle,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { format, isToday, isYesterday } from "date-fns";
import toast from "react-hot-toast";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

interface Message {
  _id: string;
  from: string;
  to: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface FriendInfo {
  clerkId: string;
  name: string;
  avatar: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { friendId } = useParams<{ friendId: string }>();
  const { user } = useUser();
  const userId = user?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [friend, setFriend] = useState<FriendInfo | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    fetch("/api/friends")
      .then((res) => res.json())
      .then((data) => {
        const f = data.friends?.find((f: FriendInfo) => f.clerkId === friendId);
        if (f) setFriend(f);
      })
      .catch(console.error);
  }, [friendId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${friendId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
      setHasMore(data.hasMore);
    } catch {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [friendId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom("instant");
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/${friendId}`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages((prev) => {
          if (data.messages.length !== prev.length) {
            setTimeout(() => scrollToBottom(), 100);
            return data.messages;
          }
          return prev;
        });
      } catch {}
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [friendId, scrollToBottom]);

  const loadMore = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = messages[0].createdAt;
      const res = await fetch(`/api/chat/${friendId}?before=${encodeURIComponent(oldest)}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
    } catch {
      console.error("Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending || !userId) return;

    const optimisticMsg: Message = {
      _id: `temp-${Date.now()}`,
      from: userId,
      to: friendId,
      content: text,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");
    setSending(true);
    if (inputRef.current) inputRef.current.style.height = "auto";
    setTimeout(() => scrollToBottom(), 50);

    try {
      const res = await fetch(`/api/chat/${friendId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const saved = await res.json();
        setMessages((prev) => prev.map((m) => (m._id === optimisticMsg._id ? saved : m)));
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const deleteChatHistory = () => {
    setShowMenu(false);
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm">Delete all messages?</span>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`/api/chat/${friendId}`, { method: "DELETE" });
                if (res.ok) {
                  setMessages([]);
                  toast.success("Chat history deleted");
                } else {
                  toast.error("Failed to delete");
                }
              } catch {
                toast.error("Failed to delete");
              }
            }}
            className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg"
          >
            Cancel
          </button>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const formatMessageTime = (date: string) => format(new Date(date), "h:mm a");

  const formatDateSeparator = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMMM d, yyyy");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateKey) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: { xs: "calc(100dvh - 8rem)", sm: "calc(100dvh - 7rem)" },
        maxWidth: 640,
        mx: "auto",
        mt: { xs: -1, sm: -2 },
        mb: { xs: "-80px", sm: 0 },
        pb: { xs: 0, sm: 0 },
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 1.5 },
          py: { xs: 1.25, sm: 1.5 },
          px: { xs: 1, sm: 1.5 },
          mb: 1,
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(30,41,59,0.85)"
              : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <IconButton
          onClick={() => router.push("/dashboard/chat")}
          size="small"
          sx={{ borderRadius: 2, color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }}
        >
          <ArrowLeft size={18} />
        </IconButton>

        {friend ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1, minWidth: 0 }}>
            <Box sx={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                src={friend.avatar}
                alt={friend.name}
                sx={{ width: 36, height: 36, fontSize: "0.875rem", background: "linear-gradient(135deg, #818cf8, #6366f1)" }}
              >
                {friend.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box
                sx={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 10,
                  height: 10,
                  bgcolor: "#34d399",
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: "background.paper",
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap>{friend.name}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#34d399" }} />
                <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 500, fontSize: "0.68rem" }}>Online</Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "action.hover" }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              <Box sx={{ height: 12, width: 96, borderRadius: 1, bgcolor: "action.hover" }} />
              <Box sx={{ height: 8, width: 64, borderRadius: 1, bgcolor: "action.hover" }} />
            </Box>
          </Box>
        )}

        {/* Menu */}
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={() => setShowMenu(!showMenu)}
            sx={{ borderRadius: 2, color: "text.disabled" }}
          >
            <MoreVertical size={20} />
          </IconButton>
          <AnimatePresence>
            {showMenu && (
              <>
                <Box
                  sx={{ position: "fixed", inset: 0, zIndex: 10 }}
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: 4,
                    width: 192,
                    zIndex: 20,
                  }}
                >
                  <Paper
                    elevation={8}
                    sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}
                  >
                    <Box
                      component="button"
                      onClick={deleteChatHistory}
                      disabled={messages.length === 0}
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        px: 2,
                        py: 1.5,
                        fontSize: "0.875rem",
                        color: "#dc2626",
                        cursor: messages.length === 0 ? "not-allowed" : "pointer",
                        opacity: messages.length === 0 ? 0.4 : 1,
                        bgcolor: "transparent",
                        border: "none",
                        textAlign: "left",
                        "&:hover": { bgcolor: "#fee2e2" },
                        transition: "background 0.15s",
                      }}
                    >
                      <Trash2 size={16} />
                      Delete chat
                    </Box>
                  </Paper>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        ref={scrollContainerRef}
        sx={{ flex: 1, overflowY: "auto", px: 0.5 }}
      >
        {/* Load more */}
        {hasMore && (
          <Box sx={{ textAlign: "center", py: 1.5 }}>
            <Box
              component="button"
              onClick={loadMore}
              disabled={loadingMore}
              sx={{
                px: 2,
                py: 1,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#6366f1",
                bgcolor: "#ede9fe",
                border: "none",
                borderRadius: 10,
                cursor: loadingMore ? "default" : "pointer",
                opacity: loadingMore ? 0.5 : 1,
                "&:hover": { bgcolor: "#ddd6fe" },
                transition: "background 0.15s",
              }}
            >
              {loadingMore ? <Loader2 size={16} className="animate-spin" /> : "Load older messages"}
            </Box>
          </Box>
        )}

        {/* Empty state */}
        {messages.length === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10, textAlign: "center" }}>
            <Box
              sx={{
                p: 2.5,
                background: "linear-gradient(135deg, #ede9fe, #fef3c7)",
                borderRadius: 4,
                mb: 2,
              }}
            >
              <MessageCircle size={40} color="#6366f1" />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }} gutterBottom>Start a conversation</Typography>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              Say hello to {friend?.name || "your friend"} 👋
            </Typography>
          </Box>
        )}

        {/* Message groups */}
        {groupedMessages.map((group) => (
          <Box key={group.date}>
            {/* Date separator */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
              <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: "action.hover",
                  borderRadius: 10,
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "text.secondary",
                }}
              >
                {formatDateSeparator(group.messages[0].createdAt)}
              </Typography>
              <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
            </Box>

            {group.messages.map((msg, i) => {
              const isMe = msg.from === userId;
              const prevMsg = group.messages[i - 1];
              const nextMsg = group.messages[i + 1];
              const isFirstInGroup = !prevMsg || prevMsg.from !== msg.from;
              const isLastInGroup = !nextMsg || nextMsg.from !== msg.from;

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 1,
                      mb: isLastInGroup ? 1.5 : 0.25,
                      justifyContent: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    {/* Friend avatar */}
                    {!isMe && (
                      <Box sx={{ width: 28, flexShrink: 0 }}>
                        {isLastInGroup && friend ? (
                          <Avatar
                            src={friend.avatar}
                            alt=""
                            sx={{ width: 28, height: 28, fontSize: "0.625rem", background: "linear-gradient(135deg, #818cf8, #6366f1)" }}
                          >
                            {friend.name.charAt(0).toUpperCase()}
                          </Avatar>
                        ) : null}
                      </Box>
                    )}

                    {/* Message bubble */}
                    <Paper
                      elevation={0}
                      sx={{
                        maxWidth: { xs: "78%", sm: "65%" },
                        px: 1.75,
                        py: 1.25,
                        bgcolor: isMe ? undefined : "background.paper",
                        background: isMe ? "linear-gradient(135deg, #4f46e5, #6366f1)" : undefined,
                        color: isMe ? "#fff" : "text.primary",
                        border: isMe ? "none" : "1px solid",
                        borderColor: "divider",
                        borderRadius: isMe
                          ? (isFirstInGroup && isLastInGroup ? "16px 16px 4px 16px"
                            : isFirstInGroup ? "16px 16px 4px 16px"
                            : isLastInGroup ? "16px 16px 4px 16px"
                            : "16px 4px 4px 16px")
                          : (isFirstInGroup && isLastInGroup ? "16px 16px 16px 4px"
                            : isFirstInGroup ? "16px 16px 16px 4px"
                            : isLastInGroup ? "4px 16px 16px 4px"
                            : "4px 16px 16px 4px"),
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "0.8125rem", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                      >
                        {msg.content}
                      </Typography>
                      {isLastInGroup && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 0.5,
                            justifyContent: isMe ? "flex-end" : "flex-start",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.625rem",
                              color: isMe ? "rgba(255,255,255,0.5)" : "text.disabled",
                            }}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </Typography>
                          {isMe && (
                            msg.read
                              ? <CheckCheck size={14} color="rgba(255,255,255,0.6)" />
                              : <Check size={14} color="rgba(255,255,255,0.4)" />
                          )}
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </motion.div>
              );
            })}
          </Box>
        ))}

        <div ref={messagesEndRef} style={{ height: 4 }} />
      </Box>

      {/* Message Input */}
      <Box sx={{ pt: 1, pb: { xs: 0.5, sm: 0.5 }, mt: "auto", flexShrink: 0, bgcolor: "background.default" }}>
        <Box
          component="form"
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          sx={{ display: "flex", gap: { xs: 0.75, sm: 1 }, alignItems: "flex-end" }}
        >
          <TextField
            key={messages.length}
            inputRef={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            multiline
            minRows={1}
            maxRows={4}
            size="small"
            fullWidth
            slotProps={{ htmlInput: { maxLength: 2000 } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "background.paper",
                fontSize: "0.875rem",
                py: 1,
                alignItems: "flex-end",
              },
              "& textarea": {
                overflow: "auto !important",
              },
            }}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flexShrink: 0 }}>
            <IconButton
              type="submit"
              disabled={!input.trim() || sending}
              sx={{
                width: { xs: 40, sm: 46 },
                height: { xs: 40, sm: 46 },
                borderRadius: 3,
                flexShrink: 0,
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                "&:hover": { background: "linear-gradient(135deg, #4338ca, #4f46e5)" },
                "&.Mui-disabled": { opacity: 0.4, background: "linear-gradient(135deg, #4f46e5, #6366f1)", color: "#fff" },
              }}
            >
              {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </IconButton>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
