"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Share2, Eye, Pencil, Shield } from "lucide-react";
import toast from "react-hot-toast";
import {
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Chip,
  FormControl,
  Divider,
} from "@mui/material";

interface Friend {
  clerkId: string;
  name: string;
  email: string;
  avatar: string;
}

interface ShareWithFriendsProps {
  todoId: string;
  sharedWith: { userId: string; permission?: string; sharedAt: string }[];
  onShared: (updatedTodo?: Record<string, unknown>) => void;
}

const permissions = [
  { value: "view", label: "View", icon: Eye, desc: "Can only view" },
  { value: "edit", label: "Edit", icon: Pencil, desc: "Can add subtasks & toggle" },
  { value: "admin", label: "Full", icon: Shield, desc: "Can edit everything" },
];

export default function ShareWithFriends({
  todoId,
  sharedWith,
  onShared,
}: ShareWithFriendsProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState<string | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<string>("edit");

  useEffect(() => {
    fetch("/api/friends")
      .then((res) => res.json())
      .then((data) => setFriends(data.friends || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const shareTodo = async (friendId: string) => {
    setSharing(friendId);
    try {
      const res = await fetch(`/api/todos/${todoId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId, permission: selectedPermission }),
      });
      if (res.ok) {
        const updatedTodo = await res.json();
        toast.success("Todo shared!");
        onShared(updatedTodo);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to share");
      }
    } catch {
      toast.error("Failed to share");
    } finally {
      setSharing(null);
    }
  };

  const getSharedPermission = (friendId: string) => {
    const shared = sharedWith?.find((s) => s.userId === friendId);
    return shared?.permission;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={16} sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  if (friends.length === 0) {
    return (
      <Box sx={{ px: 2, py: 2, textAlign: "center" }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Add friends to share todos
        </Typography>
      </Box>
    );
  }

  const selectedPermDesc = permissions.find((p) => p.value === selectedPermission)?.desc;

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 2, py: 1 }}>
        <Share2 style={{ width: 12, height: 12 }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "text.secondary" }}
        >
          Share with friend
        </Typography>
      </Box>

      {/* Permission selector */}
      <Box sx={{ px: 2, pb: 1 }}>
        <FormControl fullWidth size="small">
          <Select
            value={selectedPermission}
            onChange={(e) => setSelectedPermission(e.target.value)}
            sx={{ borderRadius: "10px", fontSize: "0.8rem" }}
          >
            {permissions.map((perm) => {
              const Icon = perm.icon;
              return (
                <MenuItem key={perm.value} value={perm.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Icon style={{ width: 14, height: 14 }} />
                    <span>{perm.label}</span>
                    <Typography variant="caption" sx={{ color: "text.secondary", ml: 0.5 }}>
                      — {perm.desc}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>

      <Divider />

      {/* Friends list */}
      <List disablePadding>
        {friends.map((friend) => {
          const existingPerm = getSharedPermission(friend.clerkId);
          return (
            <ListItemButton
              key={friend.clerkId}
              onClick={() => !sharing && shareTodo(friend.clerkId)}
              disabled={sharing === friend.clerkId}
              sx={{
                "&.Mui-disabled": { opacity: 0.6 },
                px: 2,
                py: 1,
                display: "flex",
                gap: 1.5,
              }}
            >
              <ListItemAvatar sx={{ minWidth: 44 }}>
                <Avatar
                  src={friend.avatar || undefined}
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: "0.7rem",
                    background: !friend.avatar
                      ? "linear-gradient(135deg, #818cf8, #6366f1)"
                      : undefined,
                  }}
                >
                  {!friend.avatar && friend.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant="body2" noWrap>{friend.name}</Typography>}
                sx={{ flex: 1 }}
              />
              {sharing === friend.clerkId ? (
                <CircularProgress size={16} sx={{ color: "#6366f1", flexShrink: 0 }} />
              ) : existingPerm ? (
                <Chip
                  size="small"
                  icon={<Check style={{ width: 12, height: 12 }} />}
                  label={existingPerm}
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: "0.65rem", flexShrink: 0 }}
                />
              ) : null}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
