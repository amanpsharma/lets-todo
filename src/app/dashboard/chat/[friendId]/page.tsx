"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Loader2,
  Check,
  CheckCheck,
  MessageCircle,
  Trash2,
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Scroll to bottom on initial load and new messages
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
            // New messages arrived, scroll down
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
        // Remove optimistic message on failure
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
    toast((t) => (
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
    ), { duration: 5000 });
  };

  const formatMessageTime = (date: string) => {
    const d = new Date(date);
    return format(d, "h:mm a");
  };

  const formatDateSeparator = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMMM d, yyyy");
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)] max-w-2xl mx-auto"
    >
      {/* Chat Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={() => router.push("/dashboard/chat")}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {friend ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {friend.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {friend.name}
              </h2>
              <p className="text-xs text-emerald-500">Online</p>
            </div>
          </div>
        ) : (
          <div className="h-10 w-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        )}
        {messages.length > 0 && (
          <button
            onClick={deleteChatHistory}
            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto py-4 space-y-1 scrollbar-thin"
      >
        {/* Load more */}
        {hasMore && (
          <div className="text-center pb-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-4 py-2 text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors disabled:opacity-50"
            >
              {loadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Load older messages"
              )}
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl mb-4">
              <MessageCircle className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              No messages yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Say hi to {friend?.name || "your friend"}!
            </p>
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 py-3">
              <div className="flex-1 h-px bg-gray-200/60 dark:bg-gray-700/60" />
              <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {formatDateSeparator(group.messages[0].createdAt)}
              </span>
              <div className="flex-1 h-px bg-gray-200/60 dark:bg-gray-700/60" />
            </div>

            {group.messages.map((msg, i) => {
              const isMe = msg.from === userId;
              const showAvatar =
                !isMe &&
                (i === 0 || group.messages[i - 1]?.from !== msg.from);

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 mb-1 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Friend avatar */}
                  {!isMe && (
                    <div className="w-7 flex-shrink-0">
                      {showAvatar && friend ? (
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
                    className={`max-w-[75%] sm:max-w-[65%] px-3.5 py-2 rounded-2xl ${
                      isMe
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        isMe ? "justify-end" : ""
                      }`}
                    >
                      <span
                        className={`text-[10px] ${
                          isMe
                            ? "text-white/60"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </span>
                      {isMe && (
                        msg.read ? (
                          <CheckCheck className="w-3 h-3 text-white/60" />
                        ) : (
                          <Check className="w-3 h-3 text-white/40" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            maxLength={2000}
            className="flex-1 px-4 py-3 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500/50 focus:border-transparent backdrop-blur-sm"
            autoFocus
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || sending}
            className="p-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
