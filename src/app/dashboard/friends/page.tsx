"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  Clock,
  Send,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

export default function FriendsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"friends" | "requests" | "search">("friends");
  const [friendsData, setFriendsData] = useState<FriendsData>({
    friends: [],
    pendingRequests: [],
    sentRequests: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

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
    fetchFriends();
  }, [fetchFriends]);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchUsers = (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);

    // Debounce API calls by 300ms
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
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
    }, 300);
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

  const pendingCount = friendsData.pendingRequests.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg sm:rounded-xl">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Friends</h2>
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
            Manage your friends and share tasks
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl p-1 mb-4 sm:mb-6">
        <button
          onClick={() => setTab("friends")}
          className={`flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            tab === "friends"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Friends ({friendsData.friends.length})
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`relative flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
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
          className={`flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            tab === "search"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Add Friends
        </button>
      </div>

      {/* Content */}
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        {loading && tab !== "search" ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Friends List */}
            {tab === "friends" && (
              <div className="space-y-2">
                {friendsData.friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No friends yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Search and add friends to share todos!
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
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {friend.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {friend.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {friend.email}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/chat/${friend.clerkId}`)}
                        className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
                        title="Chat"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Requests */}
            {tab === "requests" && (
              <div className="space-y-6">
                {friendsData.pendingRequests.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
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
                              className="w-11 h-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                              {req.fromUser?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {req.fromUser?.name || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Wants to be friends
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRequest(req._id, "accept")}
                              className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRequest(req._id, "reject")}
                              className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
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
                              className="w-11 h-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
                              {req.toUser?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {req.toUser?.name || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
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
                    <div className="text-center py-12">
                      <Clock className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
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
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => searchUsers(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    autoFocus
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 animate-spin" />
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
                            className="w-11 h-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
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
                            className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No users found
                      </p>
                    </div>
                  )}

                  {searchQuery.length < 2 && (
                    <div className="text-center py-8">
                      <UserPlus className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
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
  );
}
