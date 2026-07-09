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

  // Fetch friend info
  useEffect(() => {
    fetch("/api/friends")
      .then((res) => res.json())
      .then((data) => {
        const f = data.friends?.find(
          (f: FriendInfo) => f.clerkId === friendId
        );
        if (f) setFriend(f);
      })
      .catch(console.error);
  }, [friendId]);

  // Fetch messages
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

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom("instant");
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll for new messages every 3s
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

  // Load older messages
  const loadMore = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = messages[0].createdAt;
      const res = await fetch(
        `/api/chat/${friendId}?before=${encodeURIComponent(oldest)}`
      );
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
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMsg._id ? saved : m))
        );
      } else {
        setMessages((prev) =>
          prev.filter((m) => m._id !== optimisticMsg._id)
        );
      }
    } catch {
      setMessages((prev) =>
        prev.filter((m) => m._id !== optimisticMsg._id)
      );
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
                const res = await fetch(`/api/chat/${friendId}`, {
                  method: "DELETE",
                });
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

  const formatMessageTime = (date: string) => {
    return format(new Date(date), "h:mm a");
  };

  const formatDateSeparator = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMMM d, yyyy");
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-7rem)] max-w-2xl mx-auto -mt-2 sm:-mt-4">
      {/* Chat Header — glass sticky bar */}
      <div className="flex items-center gap-3 py-3 px-1 mb-1 sticky top-0 z-10 bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl rounded-2xl">
        <button
          onClick={() => router.push("/dashboard/chat")}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {friend ? (
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-default"
          >
            <div className="relative flex-shrink-0">
              {friend.avatar ? (
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {friend.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-gray-900 rounded-full" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {friend.name}
              </h2>
              <p className="text-[11px] text-emerald-500 font-medium">Active now</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        )}

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden z-20"
                >
                  <button
                    onClick={deleteChatHistory}
                    disabled={messages.length === 0}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete chat
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-1 space-y-0.5 scrollbar-thin"
      >
        {/* Load more */}
        {hasMore && (
          <div className="text-center py-3">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-4 py-2 text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors disabled:opacity-50 font-medium"
            >
              {loadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Load older messages"
              )}
            </button>
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-5 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-3xl mb-4">
              <MessageCircle className="w-10 h-10 text-violet-500 dark:text-violet-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Start a conversation
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Say hello to {friend?.name || "your friend"} 👋
            </p>
          </div>
        )}

        {/* Message groups */}
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 py-4">
              <div className="flex-1 h-px bg-gray-200/50 dark:bg-gray-700/50" />
              <span className="px-3 py-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-full text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {formatDateSeparator(group.messages[0].createdAt)}
              </span>
              <div className="flex-1 h-px bg-gray-200/50 dark:bg-gray-700/50" />
            </div>

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
                  className={`flex items-end gap-2 ${isLastInGroup ? "mb-3" : "mb-0.5"} ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Friend avatar — only on last msg in group */}
                  {!isMe && (
                    <div className="w-7 flex-shrink-0">
                      {isLastInGroup && friend ? (
                        friend.avatar ? (
                          <img
                            src={friend.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                            {friend.name.charAt(0).toUpperCase()}
                          </div>
                        )
                      ) : null}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`max-w-[78%] sm:max-w-[65%] px-3.5 py-2.5 ${
                      isMe
                        ? `bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-500/10 ${
                            isFirstInGroup && isLastInGroup
                              ? "rounded-2xl rounded-br-lg"
                              : isFirstInGroup
                              ? "rounded-2xl rounded-br-md"
                              : isLastInGroup
                              ? "rounded-2xl rounded-tr-md rounded-br-lg"
                              : "rounded-2xl rounded-r-md"
                          }`
                        : `bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white border border-gray-100/80 dark:border-gray-700/50 shadow-sm ${
                            isFirstInGroup && isLastInGroup
                              ? "rounded-2xl rounded-bl-lg"
                              : isFirstInGroup
                              ? "rounded-2xl rounded-bl-md"
                              : isLastInGroup
                              ? "rounded-2xl rounded-tl-md rounded-bl-lg"
                              : "rounded-2xl rounded-l-md"
                          }`
                    }`}
                  >
                    <p className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    {isLastInGroup && (
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          isMe ? "justify-end" : ""
                        }`}
                      >
                        <span
                          className={`text-[10px] ${
                            isMe
                              ? "text-white/50"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isMe &&
                          (msg.read ? (
                            <CheckCheck className="w-3.5 h-3.5 text-white/60" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-white/40" />
                          ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Message Input — fixed above mobile nav */}
      <div className="pt-3 pb-1 sticky bottom-0 bg-transparent">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
          style={{ alignItems: "flex-end" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            maxLength={2000}
            rows={1}
            className="flex-1 min-w-0 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 dark:focus:border-violet-700 transition-all resize-none overflow-hidden box-border"
            style={{ minHeight: "46px", maxHeight: "120px", paddingTop: "11px", paddingBottom: "11px", lineHeight: "24px" }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || sending}
            className="flex items-center justify-center bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex-shrink-0 box-border"
            style={{ width: "46px", height: "46px" }}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
