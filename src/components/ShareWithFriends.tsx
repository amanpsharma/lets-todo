"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Share2, Eye, Pencil, Shield } from "lucide-react";
import toast from "react-hot-toast";

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
  { value: "view", label: "View", icon: Eye, desc: "Can only view", color: "text-gray-500" },
  { value: "edit", label: "Edit", icon: Pencil, desc: "Can add subtasks & toggle", color: "text-blue-500" },
  { value: "admin", label: "Full", icon: Shield, desc: "Can edit everything", color: "text-violet-500" },
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
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="px-4 py-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Add friends to share todos
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
        <Share2 className="w-3 h-3" />
        Share with friend
      </p>

      {/* Permission selector */}
      <div className="px-4 pb-2">
        <div className="flex gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {permissions.map((perm) => (
            <button
              key={perm.value}
              onClick={() => setSelectedPermission(perm.value)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                selectedPermission === perm.value
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              <perm.icon className={`w-3 h-3 ${selectedPermission === perm.value ? perm.color : ""}`} />
              {perm.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-1 text-center">
          {permissions.find((p) => p.value === selectedPermission)?.desc}
        </p>
      </div>

      {/* Friends list */}
      {friends.map((friend) => {
        const existingPerm = getSharedPermission(friend.clerkId);
        return (
          <button
            key={friend.clerkId}
            onClick={() => shareTodo(friend.clerkId)}
            disabled={sharing === friend.clerkId}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                {friend.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="flex-1 text-left truncate text-sm">{friend.name}</span>
            {sharing === friend.clerkId ? (
              <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
            ) : existingPerm ? (
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <Check className="w-3 h-3" />
                {existingPerm}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
