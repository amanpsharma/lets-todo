"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface UserResult {
  clerkId: string;
  name: string;
  email: string;
  avatar: string;
}

interface FriendRequest {
  _id: string;
  from: string;
  fromUser: { name: string; email: string; avatar: string } | null;
  status: string;
  createdAt: string;
}

interface SentRequest {
  _id: string;
  to: string;
  toUser: { name: string; email: string; avatar: string } | null;
  status: string;
  createdAt: string;
}

interface FriendsData {
  friends: UserResult[];
  pendingRequests: FriendRequest[];
  sentRequests: SentRequest[];
}

interface FriendsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendsPanel({ isOpen, onClose }: FriendsPanelProps) {
  const [tab, setTab] = useState<"friends" | "requests" | "search">("friends");
  const [friendsData, setFriendsData] = useState<FriendsData>({
    friends: [],
    pendingRequests: [],
    sentRequests: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setFriendsData(data);
      }
    } catch {
      console.error("Failed to fetch friends");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchFriends();
  }, [isOpen, fetchFriends]);

  const searchUsers = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch {
      console.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (toUserId: string) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId }),
      });
      if (res.ok) {
        toast.success("Friend request sent!");
        fetchFriends();
        setSearchResults((prev) => prev.filter((u) => u.clerkId !== toUserId));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send request");
      }
    } catch {
      toast.error("Failed to send request");
    }
  };

  const handleRequest = async (requestId: string, action: "accept" | "reject") => {
    try {
      const res = await fetch(`/api/friends/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(action === "accept" ? "Friend added!" : "Request declined");
        fetchFriends();
      } else {
        toast.error("Failed to process request");
      }
    } catch {
      toast.error("Failed to process request");
    }
  };

  if (!isOpen) return null;

  const pendingCount = friendsData.pendingRequests.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md glass-card rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/10 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Friends
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl p-1">
              <button
                onClick={() => setTab("friends")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === "friends"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Friends ({friendsData.friends.length})
              </button>
              <button
                onClick={() => setTab("requests")}
                className={`relative flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === "requests"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Requests
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTab("search")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === "search"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Add
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pt-4">
            {loading && tab !== "search" ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Friends List */}
                {tab === "friends" && (
                  <div className="space-y-2">
                    {friendsData.friends.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No friends yet. Search and add friends to share todos!
                        </p>
                      </div>
                    ) : (
                      friendsData.friends.map((friend) => (
                        <div
                          key={friend.clerkId}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="relative">
                            {friend.avatar ? (
                              <img
                                src={friend.avatar}
                                alt={friend.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                {friend.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {friend.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {friend.email}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Requests */}
                {tab === "requests" && (
                  <div className="space-y-4">
                    {friendsData.pendingRequests.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                          Received
                        </p>
                        <div className="space-y-2">
                          {friendsData.pendingRequests.map((req) => (
                            <div
                              key={req._id}
                              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                            >
                              {req.fromUser?.avatar ? (
                                <img
                                  src={req.fromUser.avatar}
                                  alt={req.fromUser.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                  {req.fromUser?.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {req.fromUser?.name || "Unknown"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Wants to be friends
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleRequest(req._id, "accept")}
                                  className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRequest(req._id, "reject")}
                                  className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {friendsData.sentRequests.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                          Sent
                        </p>
                        <div className="space-y-2">
                          {friendsData.sentRequests.map((req) => (
                            <div
                              key={req._id}
                              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                            >
                              {req.toUser?.avatar ? (
                                <img
                                  src={req.toUser.avatar}
                                  alt={req.toUser.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                                  {req.toUser?.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {req.toUser?.name || "Unknown"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Pending
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {friendsData.pendingRequests.length === 0 &&
                      friendsData.sentRequests.length === 0 && (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No pending requests
                          </p>
                        </div>
                      )}
                  </div>
                )}

                {/* Search */}
                {tab === "search" && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => searchUsers(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        autoFocus
                      />
                      {searching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
                      )}
                    </div>

                    <div className="space-y-2">
                      {searchResults.map((user) => {
                        const isFriend = friendsData.friends.some(
                          (f) => f.clerkId === user.clerkId
                        );
                        const isPending = friendsData.sentRequests.some(
                          (r) => r.to === user.clerkId
                        );

                        return (
                          <div
                            key={user.clerkId}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </p>
                            </div>
                            {isFriend ? (
                              <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-lg">
                                Friends
                              </span>
                            ) : isPending ? (
                              <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-lg flex items-center gap-1">
                                <Send className="w-3 h-3" /> Sent
                              </span>
                            ) : (
                              <button
                                onClick={() => sendRequest(user.clerkId)}
                                className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                        <div className="text-center py-6">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No users found
                          </p>
                        </div>
                      )}

                      {searchQuery.length < 2 && (
                        <div className="text-center py-6">
                          <UserPlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Type at least 2 characters to search
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
