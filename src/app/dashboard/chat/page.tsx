"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Loader2,
  Users,
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

  useEffect(() => {
    fetchConversations();
    // Poll for updates every 5s
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
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
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg sm:rounded-xl">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Messages
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              Chat with your friends
            </p>
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <div className="space-y-2">
        {conversations.length === 0 ? (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-2xl mb-4">
                <Users className="w-10 h-10 text-violet-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                No conversations yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4">
                Add friends to start chatting!
              </p>
              <button
                onClick={() => router.push("/dashboard/friends")}
                className="px-4 py-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
              >
                Find Friends
              </button>
            </div>
          </div>
        ) : (
          conversations.map((conv) => (
            <motion.button
              key={conv.friend.clerkId}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() =>
                router.push(`/dashboard/chat/${conv.friend.clerkId}`)
              }
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left hover:shadow-md transition-all"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {conv.friend.avatar ? (
                  <img
                    src={conv.friend.avatar}
                    alt={conv.friend.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {conv.friend.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm truncate ${
                      conv.unreadCount > 0
                        ? "font-bold text-gray-900 dark:text-white"
                        : "font-medium text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {conv.friend.name}
                  </h3>
                  {conv.lastMessage && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                      {formatDistanceToNow(
                        new Date(conv.lastMessage.createdAt),
                        { addSuffix: true }
                      )}
                    </span>
                  )}
                </div>
                {conv.lastMessage ? (
                  <p
                    className={`text-xs mt-0.5 truncate ${
                      conv.unreadCount > 0
                        ? "text-gray-700 dark:text-gray-300 font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {conv.lastMessage.from === userId ? (
                      <span className="text-gray-400 dark:text-gray-500">
                        You:{" "}
                      </span>
                    ) : null}
                    {conv.lastMessage.content}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">
                    No messages yet
                  </p>
                )}
              </div>
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
}
