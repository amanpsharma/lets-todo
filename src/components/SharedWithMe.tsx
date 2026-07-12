"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Share2,
  Calendar,
  Tag,
  Check,
  Loader2,
  Inbox,
  Plus,
  X,
  Eye,
  Pencil,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Todo } from "@/types/todo";
import { format, isPast, isToday } from "date-fns";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  Chip,
  Typography,
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  LinearProgress,
  Stack,
} from "@mui/material";

const priorityConfig = {
  low: {
    borderColor: "#34d399",
    chipColor: "success" as const,
    dotColor: "#34d399",
  },
  medium: {
    borderColor: "#60a5fa",
    chipColor: "primary" as const,
    dotColor: "#60a5fa",
  },
  high: {
    borderColor: "#fb923c",
    chipColor: "warning" as const,
    dotColor: "#fb923c",
  },
  urgent: {
    borderColor: "#f87171",
    chipColor: "error" as const,
    dotColor: "#f87171",
  },
};

const permissionIcons = {
  view: { icon: Eye, label: "View only" },
  edit: { icon: Pencil, label: "Can edit" },
  admin: { icon: Shield, label: "Full access" },
};

function getExpandedState(id: string): boolean {
  try {
    const stored = localStorage.getItem("todo-expanded");
    if (stored) {
      const map = JSON.parse(stored);
      return map[id] === true;
    }
  } catch {}
  return false;
}

function saveExpandedState(id: string, value: boolean) {
  try {
    const stored = localStorage.getItem("todo-expanded");
    const map = stored ? JSON.parse(stored) : {};
    if (value) {
      map[id] = true;
    } else {
      delete map[id];
    }
    localStorage.setItem("todo-expanded", JSON.stringify(map));
  } catch {}
}

function SharedTodoItem({ todo, onUpdate }: { todo: Todo; onUpdate: (updated: Todo) => void }) {
  const [expanded, setExpandedRaw] = useState(() => getExpandedState(todo._id));
  const setExpanded = useCallback((val: boolean) => {
    setExpandedRaw(val);
    saveExpandedState(todo._id, val);
  }, [todo._id]);
  const [subtaskInput, setSubtaskInput] = useState("");

  const config = priorityConfig[todo.priority];
  const perm = todo.myPermission || "view";
  const permInfo = permissionIcons[perm];
  const PermIcon = permInfo.icon;
  const canEdit = perm === "edit" || perm === "admin";
  const subtasks = todo.subtasks || [];
  const tags = todo.tags || [];
  const isOverdue =
    todo.dueDate && !todo.completed && isPast(new Date(todo.dueDate)) && !isToday(new Date(todo.dueDate));

  const subtaskProgress =
    subtasks.length > 0
      ? Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100)
      : 0;

  const updateSharedTodo = async (updates: Partial<Todo>) => {
    try {
      const res = await fetch(`/api/todos/shared/${todo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
        return;
      }
      const updated = await res.json();
      onUpdate(updated);
    } catch {
      toast.error("Failed to update");
    }
  };

  const toggleComplete = () => {
    if (!canEdit) return;
    updateSharedTodo({ completed: !todo.completed });
  };

  const addSubtask = () => {
    if (!subtaskInput.trim() || !canEdit) return;
    const newSubtask = {
      id: Date.now().toString(),
      title: subtaskInput.trim(),
      completed: false,
    };
    updateSharedTodo({ subtasks: [...subtasks, newSubtask] });
    setSubtaskInput("");
  };

  const toggleSubtask = (subtaskId: string) => {
    if (!canEdit) return;
    const updated = subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    updateSharedTodo({ subtasks: updated });
  };

  const removeSubtask = (subtaskId: string) => {
    if (!canEdit) return;
    updateSharedTodo({ subtasks: subtasks.filter((s) => s.id !== subtaskId) });
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderLeft: "4px solid",
        borderLeftColor: config.borderColor,
        opacity: todo.completed ? 0.6 : 1,
        transition: "all 0.3s",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {/* Checkbox */}
          <Box
            component="button"
            onClick={toggleComplete}
            disabled={!canEdit}
            sx={{
              mt: 0.25,
              flexShrink: 0,
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "2px solid",
              borderColor: todo.completed ? "success.main" : canEdit ? "grey.300" : "grey.200",
              background: todo.completed
                ? "linear-gradient(135deg, #34d399, #059669)"
                : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: canEdit ? "pointer" : "default",
              transition: "all 0.3s",
              boxShadow: todo.completed ? "0 2px 8px rgba(52,211,153,0.4)" : "none",
              "&:hover": canEdit && !todo.completed ? { borderColor: "primary.main", transform: "scale(1.1)" } : {},
            }}
          >
            {todo.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 400 }}
              >
                <Check style={{ width: 14, height: 14, color: "white" }} />
              </motion.div>
            )}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                lineHeight: 1.4,
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "text.disabled" : "text.primary",
              }}
            >
              {todo.title}
            </Typography>
            {todo.description && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
              >
                {todo.description}
              </Typography>
            )}

            {/* Meta chips */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5 }}>
              <Chip
                size="small"
                label={
                  <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: config.dotColor, display: "inline-block" }} />
                    {todo.priority}
                  </Box>
                }
                color={config.chipColor}
                variant="outlined"
                sx={{ textTransform: "capitalize", fontSize: "0.7rem", height: 22 }}
              />

              {todo.dueDate && (
                <Chip
                  size="small"
                  icon={<Calendar style={{ width: 12, height: 12 }} />}
                  label={format(new Date(todo.dueDate), "MMM d")}
                  color={isOverdue ? "error" : isToday(new Date(todo.dueDate)) ? "warning" : "default"}
                  variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 22 }}
                />
              )}

              {tags.map((tag) => (
                <Chip
                  key={tag}
                  size="small"
                  icon={<Tag style={{ width: 10, height: 10 }} />}
                  label={tag}
                  variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 22 }}
                />
              ))}

              <Chip
                size="small"
                icon={<Share2 style={{ width: 12, height: 12 }} />}
                label={`from ${todo.ownerName}`}
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 22 }}
              />

              <Chip
                size="small"
                icon={<PermIcon style={{ width: 12, height: 12 }} />}
                label={permInfo.label}
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 22 }}
              />
            </Box>
          </Box>

          {/* Expand button */}
          {canEdit && (
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }}
            >
              {expanded ? (
                <ChevronUp style={{ width: 16, height: 16 }} />
              ) : (
                <ChevronDown style={{ width: 16, height: 16 }} />
              )}
            </IconButton>
          )}
        </Box>

        {/* Subtask progress */}
        {subtasks.length > 0 && !expanded && (
          <Box sx={{ mt: 1.5, ml: { xs: 0, sm: 4.5 } }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
              {subtasks.filter((s) => s.completed).length}/{subtasks.length} subtasks
            </Typography>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ transformOrigin: "left" }}
              transition={{ duration: 0.5 }}
            >
              <LinearProgress
                variant="determinate"
                value={subtaskProgress}
                sx={{
                  borderRadius: 4,
                  height: 6,
                  bgcolor: "grey.100",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #6366f1, #818cf8)",
                    borderRadius: 4,
                  },
                }}
              />
            </motion.div>
          </Box>
        )}
      </CardContent>

      {/* Expanded subtasks */}
      {expanded && canEdit && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              pb: { xs: 2, sm: 2.5 },
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ pt: 2, ml: { xs: 0, sm: 4.5 } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Subtasks
              </Typography>

              <Stack spacing={1}>
                {subtasks.map((subtask) => (
                  <Box key={subtask.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Box
                        component="button"
                        onClick={() => toggleSubtask(subtask.id)}
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: 0.5,
                          border: "2px solid",
                          borderColor: subtask.completed ? "success.main" : "grey.300",
                          bgcolor: subtask.completed ? "success.main" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "all 0.2s",
                          "&:hover": { borderColor: "primary.main" },
                        }}
                      >
                        {subtask.completed && <Check style={{ width: 10, height: 10, color: "white" }} />}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          textDecoration: subtask.completed ? "line-through" : "none",
                          color: subtask.completed ? "text.disabled" : "text.primary",
                        }}
                      >
                        {subtask.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => removeSubtask(subtask.id)}
                        sx={{ color: "text.disabled", "&:hover": { color: "error.main" }, opacity: { xs: 1, sm: 0 }, ".group:hover &": { opacity: 1 } }}
                      >
                        <X style={{ width: 12, height: 12 }} />
                      </IconButton>
                    </Box>
                    <Box sx={{ ml: 3.5, mt: 0.25, display: "flex", gap: 2, flexWrap: "wrap" }}>
                      {subtask.addedBy && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Avatar
                            src={subtask.addedBy.avatar || undefined}
                            sx={{ width: 14, height: 14, fontSize: "0.45rem", bgcolor: "#818cf8" }}
                          >
                            {!subtask.addedBy.avatar && subtask.addedBy.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.65rem" }}>
                            added by {subtask.addedBy.name}
                          </Typography>
                        </Box>
                      )}
                      {subtask.completed && subtask.completedBy && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Avatar
                            src={subtask.completedBy.avatar || undefined}
                            sx={{ width: 14, height: 14, fontSize: "0.45rem", bgcolor: "#34d399" }}
                          >
                            {!subtask.completedBy.avatar && subtask.completedBy.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="caption" sx={{ color: "success.main", fontSize: "0.65rem" }}>
                            done by {subtask.completedBy.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>

              {/* Add subtask input */}
              <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  placeholder="Add a subtask..."
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "0.875rem" } }}
                />
                <IconButton
                  onClick={addSubtask}
                  disabled={!subtaskInput.trim()}
                  sx={{
                    bgcolor: "primary.50",
                    color: "primary.main",
                    borderRadius: "12px",
                    "&:hover": { bgcolor: "primary.100" },
                    "&.Mui-disabled": { opacity: 0.4 },
                  }}
                >
                  <Plus style={{ width: 16, height: 16 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </motion.div>
      )}
    </Card>
  );
}

export default function SharedWithMe() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/todos/shared-with-me")
      .then((res) => res.json())
      .then((data) => setTodos(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (updated: Todo) => {
    setTodos((prev) =>
      prev.map((t) => (t._id === updated._id ? { ...updated, ownerName: t.ownerName, myPermission: t.myPermission } : t))
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#6366f1" }} />
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
          Loading shared todos...
        </Typography>
      </Box>
    );
  }

  if (todos.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10 }}>
        <Box
          sx={{
            p: 2,
            bgcolor: "primary.50",
            borderRadius: 3,
            mb: 2,
          }}
        >
          <Inbox style={{ width: 40, height: 40, color: "#818cf8" }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          Nothing shared yet
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", maxWidth: 280 }}>
          When friends share todos with you, they will appear here.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {todos.map((todo, index) => (
        <motion.div
          key={todo._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <SharedTodoItem todo={todo} onUpdate={handleUpdate} />
        </motion.div>
      ))}
    </Stack>
  );
}
