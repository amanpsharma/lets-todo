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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-heading">
              Messages
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              {totalUnread > 0
                ? `${totalUnread} unread message${totalUnread > 1 ? "s" : ""}`
                : "Chat with your friends"}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/friends")}
          className="p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 text-gray-500 dark:text-gray-400 transition-colors"
          title="Find friends"
        >
          <Users className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      {conversations.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-700/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 dark:focus:border-indigo-700 transition-all"
          />
        </div>
      )}

      {/* Conversation List */}
      <div className="space-y-2">
        {conversations.length === 0 ? (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-5 bg-gradient-to-br from-indigo-100 to-amber-100 dark:from-indigo-900/30 dark:to-amber-900/20 rounded-3xl mb-5">
                <MessageCircle className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                No conversations yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xs">
                Add friends to start chatting with them
              </p>
              <button
                onClick={() => router.push("/dashboard/friends")}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Find Friends
                </span>
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No conversations match &ldquo;{search}&rdquo;
            </p>
          </div>
        ) : (
          filtered.map((conv, i) => (
            <motion.button
              key={conv.friend.clerkId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() =>
                router.push(`/dashboard/chat/${conv.friend.clerkId}`)
              }
              className={`w-full rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 text-left transition-all group ${
                conv.unreadCount > 0
                  ? "bg-indigo-50/80 dark:bg-indigo-900/15 border border-indigo-200/50 dark:border-indigo-800/30 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/25"
                  : "glass-card hover:shadow-md"
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {conv.friend.avatar ? (
                  <img
                    src={conv.friend.avatar}
                    alt={conv.friend.name}
                    className="w-12 h-12 sm:w-13 sm:h-13 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                    {conv.friend.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Online dot */}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-gray-900 rounded-full" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3
                    className={`text-sm sm:text-[15px] truncate ${
                      conv.unreadCount > 0
                        ? "font-bold text-gray-900 dark:text-white"
                        : "font-semibold text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {conv.friend.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {conv.lastMessage && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(
                          new Date(conv.lastMessage.createdAt),
                          { addSuffix: false }
                        )}
                      </span>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="min-w-[22px] h-[22px] px-1.5 flex items-center justify-center bg-indigo-600 text-white text-[11px] font-bold rounded-full shadow-sm">
                        {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                {conv.lastMessage ? (
                  <p
                    className={`text-[13px] truncate ${
                      conv.unreadCount > 0
                        ? "text-gray-700 dark:text-gray-300 font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {conv.lastMessage.from === userId && (
                      <span className="text-gray-400 dark:text-gray-500">
                        You:{" "}
                      </span>
                    )}
                    {conv.lastMessage.content}
                  </p>
                ) : (
                  <p className="text-[13px] text-gray-400 dark:text-gray-500 italic">
                    No messages yet — say hi!
                  </p>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
}
