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
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

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
  const [tab, setTab] = useState(0); // 0=friends, 1=requests, 2=search
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
    >
      <Box sx={{ maxWidth: 640, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              p: 1,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={20} color="#fff" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Friends</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Manage your friends and share tasks
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 3,
            bgcolor: "action.hover",
            borderRadius: 2,
            p: 0.5,
            minHeight: 40,
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTab-root": {
              minHeight: 36,
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              transition: "all 0.2s",
            },
            "& .Mui-selected": {
              bgcolor: "background.paper",
              color: "text.primary",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Tab label={`Friends (${friendsData.friends.length})`} />
          <Tab
            label={
              <Badge badgeContent={pendingCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem" } }}>
                <Box sx={{ pr: pendingCount > 0 ? 1.5 : 0 }}>Requests</Box>
              </Badge>
            }
          />
          <Tab label="Add Friends" />
        </Tabs>

        {/* Content Card */}
        <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: "none" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {loading && tab !== 2 ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {/* Friends List */}
                {tab === 0 && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {friendsData.friends.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 8 }}>
                        <Users size={56} color="#d1d5db" style={{ marginBottom: 12 }} />
                        <Typography sx={{ fontWeight: 600, color: "text.secondary" }}>No friends yet</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: "text.disabled" }}>
                          Search and add friends to share todos!
                        </Typography>
                      </Box>
                    ) : (
                      friendsData.friends.map((friend) => (
                        <Box
                          key={friend.clerkId}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            "&:hover": { bgcolor: "action.hover" },
                            transition: "background 0.15s",
                          }}
                        >
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            badgeContent={
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  bgcolor: "#34d399",
                                  borderRadius: "50%",
                                  border: "2px solid",
                                  borderColor: "background.paper",
                                }}
                              />
                            }
                          >
                            <Avatar
                              src={friend.avatar}
                              alt={friend.name}
                              sx={{ width: 44, height: 44, background: "linear-gradient(135deg, #818cf8, #6366f1)" }}
                            >
                              {friend.name.charAt(0).toUpperCase()}
                            </Avatar>
                          </Badge>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600 }} noWrap>{friend.name}</Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>{friend.email}</Typography>
                          </Box>
                          <IconButton
                            onClick={() => router.push(`/dashboard/chat/${friend.clerkId}`)}
                            sx={{ bgcolor: "#ede9fe", color: "#6366f1", "&:hover": { bgcolor: "#ddd6fe" } }}
                          >
                            <MessageCircle size={16} />
                          </IconButton>
                        </Box>
                      ))
                    )}
                  </Box>
                )}

                {/* Requests Tab */}
                {tab === 1 && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {friendsData.pendingRequests.length > 0 && (
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, mb: 1.5, display: "block" }}>
                          Received
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {friendsData.pendingRequests.map((req) => (
                            <Box
                              key={req._id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: "action.hover",
                              }}
                            >
                              <Avatar
                                src={req.fromUser?.avatar}
                                alt={req.fromUser?.name}
                                sx={{ width: 44, height: 44, background: "linear-gradient(135deg, #60a5fa, #818cf8)" }}
                              >
                                {req.fromUser?.name?.charAt(0)?.toUpperCase() || "?"}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600 }} noWrap>{req.fromUser?.name || "Unknown"}</Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>Wants to be friends</Typography>
                              </Box>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <IconButton
                                  onClick={() => handleRequest(req._id, "accept")}
                                  sx={{ bgcolor: "#d1fae5", color: "#059669", "&:hover": { bgcolor: "#a7f3d0" } }}
                                >
                                  <Check size={16} />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleRequest(req._id, "reject")}
                                  sx={{ bgcolor: "#fee2e2", color: "#dc2626", "&:hover": { bgcolor: "#fecaca" } }}
                                >
                                  <X size={16} />
                                </IconButton>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {friendsData.sentRequests.length > 0 && (
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, mb: 1.5, display: "block" }}>
                          Sent
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {friendsData.sentRequests.map((req) => (
                            <Box
                              key={req._id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: "action.hover",
                              }}
                            >
                              <Avatar
                                src={req.toUser?.avatar}
                                alt={req.toUser?.name}
                                sx={{ width: 44, height: 44, background: "linear-gradient(135deg, #fb923c, #fbbf24)" }}
                              >
                                {req.toUser?.name?.charAt(0)?.toUpperCase() || "?"}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600 }} noWrap>{req.toUser?.name || "Unknown"}</Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Clock size={12} /> Pending
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {friendsData.pendingRequests.length === 0 && friendsData.sentRequests.length === 0 && (
                      <Box sx={{ textAlign: "center", py: 8 }}>
                        <Clock size={56} color="#d1d5db" style={{ marginBottom: 12 }} />
                        <Typography sx={{ fontWeight: 600, color: "text.secondary" }}>No pending requests</Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Search Tab */}
                {tab === 2 && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                      value={searchQuery}
                      onChange={(e) => searchUsers(e.target.value)}
                      placeholder="Search by name or email..."
                      variant="outlined"
                      size="small"
                      fullWidth
                      autoFocus
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search size={16} color="#9ca3af" />
                            </InputAdornment>
                          ),
                          endAdornment: searching ? (
                            <InputAdornment position="end">
                              <CircularProgress size={16} />
                            </InputAdornment>
                          ) : null,
                        },
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                    />

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {searchResults.map((user) => {
                        const isFriend = friendsData.friends.some((f) => f.clerkId === user.clerkId);
                        const isPending = friendsData.sentRequests.some((r) => r.to === user.clerkId);

                        return (
                          <Box
                            key={user.clerkId}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              p: 1.5,
                              borderRadius: 2,
                              "&:hover": { bgcolor: "action.hover" },
                              transition: "background 0.15s",
                            }}
                          >
                            <Avatar
                              src={user.avatar}
                              alt={user.name}
                              sx={{ width: 44, height: 44, background: "linear-gradient(135deg, #818cf8, #6366f1)" }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 600 }} noWrap>{user.name}</Typography>
                              <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>{user.email}</Typography>
                            </Box>
                            {isFriend ? (
                              <Button
                                size="small"
                                disabled
                                sx={{ borderRadius: 2, textTransform: "none", bgcolor: "#d1fae5", color: "#059669" }}
                              >
                                Friends
                              </Button>
                            ) : isPending ? (
                              <Button
                                size="small"
                                disabled
                                startIcon={<Send size={12} />}
                                sx={{ borderRadius: 2, textTransform: "none", bgcolor: "#fef3c7", color: "#d97706" }}
                              >
                                Sent
                              </Button>
                            ) : (
                              <IconButton
                                onClick={() => sendRequest(user.clerkId)}
                                sx={{ bgcolor: "#ede9fe", color: "#6366f1", "&:hover": { bgcolor: "#ddd6fe" } }}
                              >
                                <UserPlus size={16} />
                              </IconButton>
                            )}
                          </Box>
                        );
                      })}

                      {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                        <Box sx={{ textAlign: "center", py: 5 }}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>No users found</Typography>
                        </Box>
                      )}

                      {searchQuery.length < 2 && (
                        <Box sx={{ textAlign: "center", py: 5 }}>
                          <UserPlus size={56} color="#d1d5db" style={{ marginBottom: 12 }} />
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Type at least 2 characters to search
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
}
