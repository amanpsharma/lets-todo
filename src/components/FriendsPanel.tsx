"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Drawer,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Badge,
  Tabs,
  Tab,
  Chip,
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

interface FriendsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendsPanel({ isOpen, onClose }: FriendsPanelProps) {
  const [tab, setTab] = useState(0);
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

  const pendingCount = friendsData.pendingRequests.length;

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      slotProps={{
        paper: { sx: { width: { xs: "100%", sm: 420 }, display: "flex", flexDirection: "column" } },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          pb: 0,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                borderRadius: 2,
                display: "flex",
              }}
            >
              <Users style={{ width: 20, height: 20, color: "white" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Friends
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X style={{ width: 20, height: 20 }} />
          </IconButton>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{ minHeight: 40 }}
        >
          <Tab
            label={`Friends (${friendsData.friends.length})`}
            sx={{ minHeight: 40, fontSize: "0.8rem" }}
          />
          <Tab
            label={
              <Badge badgeContent={pendingCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem" } }}>
                <span>Requests</span>
              </Badge>
            }
            sx={{ minHeight: 40, fontSize: "0.8rem" }}
          />
          <Tab label="Add" sx={{ minHeight: 40, fontSize: "0.8rem" }} />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {loading && tab !== 2 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} sx={{ color: "#6366f1" }} />
          </Box>
        ) : (
          <>
            {/* Friends List */}
            {tab === 0 && (
              <>
                {friendsData.friends.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Users style={{ width: 48, height: 48, color: "#d1d5db", margin: "0 auto 12px" }} />
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      No friends yet. Search and add friends to share todos!
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {friendsData.friends.map((friend) => (
                      <ListItem
                        key={friend.clerkId}
                        sx={{ borderRadius: 2, "&:hover": { bgcolor: "action.hover" }, px: 1 }}
                      >
                        <ListItemAvatar>
                          <Box sx={{ position: "relative", display: "inline-block" }}>
                            <Avatar
                              src={friend.avatar || undefined}
                              alt={friend.name}
                              sx={{
                                width: 40,
                                height: 40,
                                background: !friend.avatar
                                  ? "linear-gradient(135deg, #818cf8, #6366f1)"
                                  : undefined,
                                fontWeight: 700,
                              }}
                            >
                              {!friend.avatar && friend.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                width: 12,
                                height: 12,
                                bgcolor: "#34d399",
                                borderRadius: "50%",
                                border: "2px solid",
                                borderColor: "background.paper",
                              }}
                            />
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{friend.name}</Typography>}
                          secondary={<Typography variant="caption" noWrap sx={{ display: "block" }}>{friend.email}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}

            {/* Requests */}
            {tab === 1 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {friendsData.pendingRequests.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "text.secondary", display: "block", mb: 1 }}
                    >
                      Received
                    </Typography>
                    <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {friendsData.pendingRequests.map((req) => (
                        <ListItem
                          key={req._id}
                          sx={{ bgcolor: "action.hover", borderRadius: 2, px: 1.5 }}
                          secondaryAction={
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleRequest(req._id, "accept")}
                                sx={{
                                  color: "success.main",
                                  "&:hover": { bgcolor: "action.selected" },
                                }}
                              >
                                <Check style={{ width: 16, height: 16 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleRequest(req._id, "reject")}
                                sx={{
                                  color: "error.main",
                                  "&:hover": { bgcolor: "action.selected" },
                                }}
                              >
                                <X style={{ width: 16, height: 16 }} />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar
                              src={req.fromUser?.avatar || undefined}
                              sx={{
                                width: 40,
                                height: 40,
                                background: "linear-gradient(135deg, #60a5fa, #6366f1)",
                                fontWeight: 700,
                              }}
                            >
                              {req.fromUser?.name?.charAt(0)?.toUpperCase() || "?"}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{req.fromUser?.name || "Unknown"}</Typography>}
                            secondary={<Typography variant="caption">Wants to be friends</Typography>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {friendsData.sentRequests.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "text.secondary", display: "block", mb: 1 }}
                    >
                      Sent
                    </Typography>
                    <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {friendsData.sentRequests.map((req) => (
                        <ListItem
                          key={req._id}
                          sx={{ bgcolor: "action.hover", borderRadius: 2, px: 1.5 }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              src={req.toUser?.avatar || undefined}
                              sx={{
                                width: 40,
                                height: 40,
                                background: "linear-gradient(135deg, #fb923c, #f59e0b)",
                                fontWeight: 700,
                              }}
                            >
                              {req.toUser?.name?.charAt(0)?.toUpperCase() || "?"}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{req.toUser?.name || "Unknown"}</Typography>}
                            secondary={
                              <Typography variant="caption" component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Clock style={{ width: 12, height: 12 }} /> Pending
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {friendsData.pendingRequests.length === 0 && friendsData.sentRequests.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Clock style={{ width: 48, height: 48, color: "#d1d5db", margin: "0 auto 12px" }} />
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      No pending requests
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Search */}
            {tab === 2 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={searchQuery}
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="Search by name or email..."
                  autoFocus
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search style={{ width: 16, height: 16, color: "#9ca3af" }} />
                        </InputAdornment>
                      ),
                      endAdornment: searching ? (
                        <InputAdornment position="end">
                          <CircularProgress size={16} sx={{ color: "#6366f1" }} />
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />

                <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {searchResults.map((user) => {
                    const isFriend = friendsData.friends.some((f) => f.clerkId === user.clerkId);
                    const isPending = friendsData.sentRequests.some((r) => r.to === user.clerkId);

                    return (
                      <ListItem
                        key={user.clerkId}
                        sx={{ borderRadius: 2, "&:hover": { bgcolor: "action.hover" }, px: 1 }}
                        secondaryAction={
                          isFriend ? (
                            <Chip label="Friends" size="small" color="success" variant="outlined" />
                          ) : isPending ? (
                            <Chip
                              icon={<Send style={{ width: 12, height: 12 }} />}
                              label="Sent"
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          ) : (
                            <IconButton
                              size="small"
                              onClick={() => sendRequest(user.clerkId)}
                              sx={{ color: "primary.main", "&:hover": { bgcolor: "action.hover" } }}
                            >
                              <UserPlus style={{ width: 16, height: 16 }} />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={user.avatar || undefined}
                            sx={{
                              width: 40,
                              height: 40,
                              background: !user.avatar
                                ? "linear-gradient(135deg, #818cf8, #6366f1)"
                                : undefined,
                              fontWeight: 700,
                            }}
                          >
                            {!user.avatar && user.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{user.name}</Typography>}
                          secondary={<Typography variant="caption" noWrap sx={{ display: "block" }}>{user.email}</Typography>}
                        />
                      </ListItem>
                    );
                  })}
                </List>

                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                  <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 3 }}>
                    No users found
                  </Typography>
                )}

                {searchQuery.length < 2 && (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <UserPlus style={{ width: 48, height: 48, color: "#d1d5db", margin: "0 auto 12px" }} />
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Type at least 2 characters to search
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </Drawer>
  );
}
