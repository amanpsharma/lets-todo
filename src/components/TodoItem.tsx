"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Todo } from "@/types/todo";
import { format, isPast, isToday } from "date-fns";
import ShareWithFriends from "./ShareWithFriends";

import {
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Tooltip,
  TextField,
  Chip,
  Button,
  Collapse,
  Typography,
  Box,
  Stack,
  Popover,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WorkIcon from "@mui/icons-material/Work";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SchoolIcon from "@mui/icons-material/School";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { SvgIconComponent } from "@mui/icons-material";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
}

const priorityConfig = {
  low: {
    borderColor: "#34d399",
    badgeBg: "rgba(52,211,153,0.12)",
    badgeColor: "#059669",
    dot: "#34d399",
  },
  medium: {
    borderColor: "#60a5fa",
    badgeBg: "rgba(96,165,250,0.12)",
    badgeColor: "#2563eb",
    dot: "#60a5fa",
  },
  high: {
    borderColor: "#fb923c",
    badgeBg: "rgba(251,146,60,0.12)",
    badgeColor: "#ea580c",
    dot: "#fb923c",
  },
  urgent: {
    borderColor: "#ef4444",
    badgeBg: "rgba(239,68,68,0.12)",
    badgeColor: "#dc2626",
    dot: "#ef4444",
  },
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

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [expanded, setExpandedRaw] = useState(() => getExpandedState(todo._id));
  const setExpanded = useCallback(
    (val: boolean) => {
      setExpandedRaw(val);
      saveExpandedState(todo._id, val);
    },
    [todo._id]
  );
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || "");
  const [editPriority, setEditPriority] = useState<Todo["priority"]>(todo.priority);
  const [editCategory, setEditCategory] = useState(todo.category);
  const [editDueDate, setEditDueDate] = useState(
    todo.dueDate ? format(new Date(todo.dueDate), "yyyy-MM-dd") : ""
  );
  const [editTags, setEditTags] = useState<string[]>(todo.tags || []);
  const [editTagInput, setEditTagInput] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLButtonElement | null>(null);
  const showShare = Boolean(shareAnchorEl);

  const subtasks = todo.subtasks || [];
  const tags = todo.tags || [];

  const config = priorityConfig[todo.priority];
  const isOverdue =
    todo.dueDate &&
    !todo.completed &&
    isPast(new Date(todo.dueDate)) &&
    !isToday(new Date(todo.dueDate));

  const handleSaveEdit = () => {
    onUpdate(todo._id, {
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      category: editCategory,
      dueDate: editDueDate || null,
      tags: editTags,
    });
    setEditing(false);
  };

  const startEditing = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description || "");
    setEditPriority(todo.priority);
    setEditCategory(todo.category);
    setEditDueDate(todo.dueDate ? format(new Date(todo.dueDate), "yyyy-MM-dd") : "");
    setEditTags(todo.tags || []);
    setEditTagInput("");
    setEditing(true);
  };

  const addEditTag = () => {
    if (editTagInput.trim() && !editTags.includes(editTagInput.trim())) {
      setEditTags([...editTags, editTagInput.trim()]);
      setEditTagInput("");
    }
  };

  const priorities: { value: Todo["priority"]; label: string; color: string; dot: string }[] = [
    {
      value: "low",
      label: "Low",
      color: "rgba(52,211,153,0.15)",
      dot: "#34d399",
    },
    {
      value: "medium",
      label: "Medium",
      color: "rgba(96,165,250,0.15)",
      dot: "#60a5fa",
    },
    {
      value: "high",
      label: "High",
      color: "rgba(251,146,60,0.15)",
      dot: "#fb923c",
    },
    {
      value: "urgent",
      label: "Urgent",
      color: "rgba(239,68,68,0.15)",
      dot: "#ef4444",
    },
  ];

  const categoryOptions: { value: string; label: string; icon: SvgIconComponent }[] = [
    { value: "general", label: "General", icon: AssignmentIcon },
    { value: "work", label: "Work", icon: WorkIcon },
    { value: "personal", label: "Personal", icon: HomeIcon },
    { value: "shopping", label: "Shopping", icon: ShoppingCartIcon },
    { value: "health", label: "Health", icon: FitnessCenterIcon },
    { value: "learning", label: "Learning", icon: SchoolIcon },
    { value: "finance", label: "Finance", icon: AccountBalanceIcon },
  ];

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    const newSubtask = {
      id: Date.now().toString(),
      title: subtaskInput.trim(),
      completed: false,
    };
    onUpdate(todo._id, { subtasks: [...subtasks, newSubtask] });
    setSubtaskInput("");
  };

  const toggleSubtask = (subtaskId: string) => {
    const updated = subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    onUpdate(todo._id, { subtasks: updated });
  };

  const removeSubtask = (subtaskId: string) => {
    onUpdate(todo._id, {
      subtasks: subtasks.filter((s) => s.id !== subtaskId),
    });
  };

  const subtaskProgress =
    subtasks.length > 0
      ? Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100)
      : 0;

  const handleDeleteClick = () => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm">Delete this task?</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onDelete(todo._id);
            }}
            className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600"
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
      ),
      { duration: 5000 }
    );
  };

  return (
    <motion.div layout>
      <Card
        component={motion.div as React.ElementType}
        sx={{
          borderLeft: `4px solid ${config.borderColor}`,
          borderRadius: "16px",
          opacity: todo.completed ? 0.6 : 1,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
          transition: "box-shadow 0.3s",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(99,102,241,0.08)",
          },
          position: "relative",
        }}
        className="group glass-card"
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            {/* Checkbox */}
            <Checkbox
              checked={todo.completed}
              onChange={() => onToggle(todo._id)}
              aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
              size="small"
              sx={{
                mt: 0.25,
                flexShrink: 0,
                p: 0,
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: todo.completed ? "none" : "2px solid",
                borderColor: "grey.400",
                background: todo.completed
                  ? "linear-gradient(135deg, #34d399 0%, #059669 100%)"
                  : "transparent",
                boxShadow: todo.completed ? "0 2px 8px rgba(52,211,153,0.35)" : "none",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "indigo.500",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.2)",
                  transform: "scale(1.1)",
                },
                "& .MuiSvgIcon-root": { display: "none" },
                "&.Mui-checked": {
                  border: "none",
                },
              }}
              checkedIcon={
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 10, stiffness: 400 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Check size={14} color="white" />
                </motion.div>
              }
              icon={<span />}
            />

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {editing ? (
                <Stack spacing={1.5}>
                  {/* Title */}
                  <TextField
                    fullWidth
                    size="small"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Task title"
                    autoFocus
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                  />

                  {/* Description */}
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Description (optional)"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                  />

                  {/* Priority */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 500, color: "text.secondary", display: "block", mb: 0.75 }}
                    >
                      Priority
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      {priorities.map((p) => (
                        <Chip
                          key={p.value}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Box
                                component="span"
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  bgcolor: p.dot,
                                  flexShrink: 0,
                                }}
                              />
                              {p.label}
                            </Box>
                          }
                          size="small"
                          onClick={() => setEditPriority(p.value)}
                          sx={{
                            bgcolor: p.color,
                            fontWeight: 500,
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            outline:
                              editPriority === p.value ? "2px solid #6366f1" : "none",
                            outlineOffset: 1,
                            opacity: editPriority === p.value ? 1 : 0.55,
                            "&:hover": { opacity: 1 },
                            transition: "opacity 0.2s",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Category */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 500, color: "text.secondary", display: "block", mb: 0.75 }}
                    >
                      Category
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                      {categoryOptions.map((c) => (
                        <Chip
                          key={c.value}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <c.icon fontSize="small" />
                              {c.label}
                            </Box>
                          }
                          size="small"
                          onClick={() => setEditCategory(c.value)}
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            bgcolor:
                              editCategory === c.value
                                ? "rgba(99,102,241,0.12)"
                                : "rgba(0,0,0,0.05)",
                            color:
                              editCategory === c.value ? "#6366f1" : "text.secondary",
                            outline:
                              editCategory === c.value ? "2px solid #6366f1" : "none",
                            outlineOffset: 1,
                            opacity: editCategory === c.value ? 1 : 0.6,
                            "&:hover": { opacity: 1 },
                            transition: "all 0.2s",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Due Date */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 500, color: "text.secondary", display: "block", mb: 0.75 }}
                    >
                      Due Date
                    </Typography>
                    <TextField
                      type="date"
                      size="small"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Box>

                  {/* Tags */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 500, color: "text.secondary", display: "block", mb: 0.75 }}
                    >
                      Tags
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
                      {editTags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          icon={<Tag size={10} />}
                          onDelete={() => setEditTags(editTags.filter((t) => t !== tag))}
                          deleteIcon={<X size={12} />}
                          sx={{ fontSize: "0.7rem" }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        size="small"
                        value={editTagInput}
                        onChange={(e) => setEditTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addEditTag();
                          }
                        }}
                        placeholder="Add tag..."
                        sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "0.75rem" } }}
                        slotProps={{ htmlInput: { style: { padding: "6px 10px" } } }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={addEditTag}
                        sx={{ borderRadius: "10px", fontSize: "0.7rem", minWidth: "auto", px: 1.5 }}
                      >
                        Add
                      </Button>
                    </Box>
                  </Box>

                  {/* Save / Cancel */}
                  <Box sx={{ display: "flex", gap: 1, pt: 0.5 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSaveEdit}
                      sx={{
                        borderRadius: "10px",
                        background: "linear-gradient(90deg, #6366f1, #818cf8)",
                        boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": { boxShadow: "0 4px 12px rgba(99,102,241,0.4)" },
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setEditing(false)}
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 500,
                        color: "text.secondary",
                        borderColor: "divider",
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Stack>
              ) : (
                <>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      lineHeight: 1.4,
                      textDecoration: todo.completed ? "line-through" : "none",
                      color: todo.completed ? "text.disabled" : "text.primary",
                      transition: "all 0.2s",
                    }}
                  >
                    {todo.title}
                  </Typography>
                  {todo.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mt: 0.5,
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {todo.description}
                    </Typography>
                  )}
                </>
              )}

              {/* Meta badges — view mode only */}
              {!editing && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.5, flexWrap: "wrap" }}>
                  {/* Priority badge */}
                  <Chip
                    size="small"
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Box
                          component="span"
                          sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: config.dot }}
                        />
                        {todo.priority}
                      </Box>
                    }
                    sx={{
                      bgcolor: config.badgeBg,
                      color: config.badgeColor,
                      fontWeight: 600,
                      fontSize: "0.68rem",
                      height: 22,
                      textTransform: "capitalize",
                    }}
                  />

                  {/* Category badge */}
                  <Chip
                    size="small"
                    label={todo.category}
                    sx={{
                      bgcolor: "rgba(99,102,241,0.1)",
                      color: "#6366f1",
                      fontWeight: 600,
                      fontSize: "0.68rem",
                      height: 22,
                      textTransform: "capitalize",
                    }}
                  />

                  {/* Due date badge */}
                  {todo.dueDate && (
                    <Chip
                      size="small"
                      icon={<Calendar size={11} />}
                      label={format(new Date(todo.dueDate), "MMM d")}
                      sx={{
                        height: 22,
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        bgcolor: isOverdue
                          ? "rgba(239,68,68,0.1)"
                          : isToday(new Date(todo.dueDate))
                          ? "rgba(251,191,36,0.1)"
                          : "rgba(0,0,0,0.05)",
                        color: isOverdue
                          ? "#dc2626"
                          : isToday(new Date(todo.dueDate))
                          ? "#d97706"
                          : "text.secondary",
                        "& .MuiChip-icon": { fontSize: 11, ml: 0.5 },
                      }}
                    />
                  )}

                  {/* Tag badges */}
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      size="small"
                      icon={<Tag size={10} />}
                      label={tag}
                      sx={{
                        height: 22,
                        fontSize: "0.68rem",
                        bgcolor: "rgba(0,0,0,0.04)",
                        color: "text.secondary",
                        "& .MuiChip-icon": { fontSize: 10, ml: 0.5 },
                      }}
                    />
                  ))}

                  {/* Subtask count */}
                  {subtasks.length > 0 && (
                    <Typography variant="caption" sx={{ color: "text.disabled", display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        {subtasks.filter((s) => s.completed).length}/{subtasks.length}
                      </Box>
                      subtasks
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Action buttons — desktop hover, always mobile */}
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 0.25,
                opacity: { xs: 1, sm: 0 },
                ".group:hover &": { opacity: 1 },
                transition: "opacity 0.2s",
                flexShrink: 0,
              }}
              className="sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
            >
              <Tooltip title={expanded ? "Collapse subtasks" : "Expand subtasks"}>
                <IconButton
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  aria-label={expanded ? "Collapse subtasks" : "Expand subtasks"}
                  sx={{ color: "text.disabled", "&:hover": { color: "text.secondary", bgcolor: "action.hover" } }}
                >
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Share task">
                <IconButton
                  size="small"
                  onClick={(e) => setShareAnchorEl(showShare ? null : e.currentTarget)}
                  aria-label="Share task"
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    color: showShare ? "#6366f1" : "text.disabled",
                    bgcolor: showShare ? "rgba(99,102,241,0.08)" : "transparent",
                    "&:hover": { color: "#6366f1", bgcolor: "rgba(99,102,241,0.08)" },
                  }}
                >
                  <Share2 size={16} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Edit task">
                <IconButton
                  size="small"
                  onClick={startEditing}
                  aria-label="Edit task"
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    color: "text.disabled",
                    "&:hover": { color: "#3b82f6", bgcolor: "rgba(59,130,246,0.08)" },
                  }}
                >
                  <Edit3 size={16} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete task">
                <IconButton
                  size="small"
                  onClick={handleDeleteClick}
                  aria-label="Delete task"
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    color: "text.disabled",
                    "&:hover": { color: "#ef4444", bgcolor: "rgba(239,68,68,0.08)" },
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Tooltip>

            </Box>

            {/* Share popover */}
            <Popover
              open={showShare}
              anchorEl={shareAnchorEl}
              onClose={() => setShareAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    width: { xs: "calc(100vw - 32px)", sm: 300 },
                    maxWidth: 300,
                    borderRadius: 3,
                    mt: 1,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  },
                },
              }}
            >
              <ShareWithFriends
                todoId={todo._id}
                sharedWith={todo.sharedWith || []}
                onShared={(updatedTodo) => {
                  setShareAnchorEl(null);
                  if (updatedTodo) onUpdate(todo._id, updatedTodo);
                }}
              />
            </Popover>
          </Box>

          {/* Mobile action bar */}
          {!editing && (
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                alignItems: "center",
                gap: 0.5,
                mt: 1,
                ml: { xs: 0, sm: 4.5 },
                flexWrap: "wrap",
              }}
            >
              <Button
                size="small"
                startIcon={<Share2 size={14} />}
                onClick={(e) => setShareAnchorEl(showShare ? null : e.currentTarget as HTMLButtonElement)}
                sx={{
                  fontSize: "0.7rem",
                  textTransform: "none",
                  color: "text.secondary",
                  bgcolor: "action.hover",
                  borderRadius: "8px",
                  px: 1.25,
                  py: 0.5,
                  minWidth: "auto",
                }}
              >
                Share
              </Button>
              <Button
                size="small"
                startIcon={<Edit3 size={14} />}
                onClick={startEditing}
                sx={{
                  fontSize: "0.7rem",
                  textTransform: "none",
                  color: "text.secondary",
                  bgcolor: "action.hover",
                  borderRadius: "8px",
                  px: 1.25,
                  py: 0.5,
                  minWidth: "auto",
                }}
              >
                Edit
              </Button>
              <Button
                size="small"
                startIcon={<Trash2 size={14} />}
                onClick={handleDeleteClick}
                sx={{
                  fontSize: "0.7rem",
                  textTransform: "none",
                  color: "#ef4444",
                  bgcolor: "rgba(239,68,68,0.08)",
                  borderRadius: "8px",
                  px: 1.25,
                  py: 0.5,
                  minWidth: "auto",
                }}
              >
                Delete
              </Button>
            </Box>
          )}

          {/* Subtask progress bar */}
          {subtasks.length > 0 && !expanded && (
            <Box sx={{ mt: 1.5, ml: 4.5 }}>
              <Box
                sx={{
                  height: 6,
                  bgcolor: "rgba(0,0,0,0.06)",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subtaskProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #6366f1, #f59e0b)",
                    borderRadius: 99,
                  }}
                />
              </Box>
            </Box>
          )}
        </CardContent>

        {/* Expanded subtasks section */}
        <Collapse in={expanded}>
          <Box
            sx={{
              px: { xs: 1.5, sm: 2.5 },
              pb: { xs: 2, sm: 2.5 },
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ pt: 2, ml: { xs: 0, sm: 4.5 } }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.primary", mb: 1.5 }}
              >
                Subtasks
              </Typography>

              <Stack spacing={0.5}>
                {subtasks.map((subtask) => (
                  <Box key={subtask.id} className="group/sub" sx={{ py: 0.75 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Checkbox
                        size="small"
                        checked={subtask.completed}
                        onChange={() => toggleSubtask(subtask.id)}
                        sx={{
                          p: 0,
                          width: 18,
                          height: 18,
                          borderRadius: "4px",
                          border: subtask.completed ? "none" : "2px solid",
                          borderColor: subtask.completed ? "transparent" : "grey.400",
                          bgcolor: subtask.completed ? "#10b981" : "transparent",
                          flexShrink: 0,
                          boxShadow: subtask.completed ? "0 1px 4px rgba(16,185,129,0.3)" : "none",
                          transition: "all 0.2s",
                          "&:hover": { borderColor: "#6366f1" },
                          "& .MuiSvgIcon-root": { display: "none" },
                          "&.Mui-checked": { border: "none" },
                        }}
                        checkedIcon={
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                            <Check size={10} color="white" />
                          </Box>
                        }
                        icon={<span />}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          fontSize: "0.8rem",
                          textDecoration: subtask.completed ? "line-through" : "none",
                          color: subtask.completed ? "text.disabled" : "text.primary",
                        }}
                      >
                        {subtask.title}
                      </Typography>
                      <Tooltip title="Remove subtask">
                        <IconButton
                          size="small"
                          onClick={() => removeSubtask(subtask.id)}
                          sx={{
                            opacity: { xs: 1, sm: 0 },
                            ".group\\/sub:hover &": { opacity: 1 },
                            color: "text.disabled",
                            p: 0.5,
                            "&:hover": { color: "#ef4444", bgcolor: "rgba(239,68,68,0.08)" },
                            transition: "all 0.2s",
                          }}
                          className="sm:opacity-0 group-hover/sub:opacity-100"
                        >
                          <X size={12} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* User info: added by / completed by */}
                    <Box sx={{ ml: 3.5, mt: 0.25, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                      {subtask.addedBy && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {subtask.addedBy.avatar ? (
                            <img
                              src={subtask.addedBy.avatar}
                              alt=""
                              style={{ width: 14, height: 14, borderRadius: "50%" }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                bgcolor: "#818cf8",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "7px",
                                fontWeight: 700,
                              }}
                            >
                              {subtask.addedBy.name.charAt(0).toUpperCase()}
                            </Box>
                          )}
                          <Typography sx={{ fontSize: "10px", color: "text.disabled" }}>
                            added by {subtask.addedBy.name}
                          </Typography>
                        </Box>
                      )}
                      {subtask.completed && subtask.completedBy && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {subtask.completedBy.avatar ? (
                            <img
                              src={subtask.completedBy.avatar}
                              alt=""
                              style={{ width: 14, height: 14, borderRadius: "50%" }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                bgcolor: "#34d399",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "7px",
                                fontWeight: 700,
                              }}
                            >
                              {subtask.completedBy.name.charAt(0).toUpperCase()}
                            </Box>
                          )}
                          <Typography sx={{ fontSize: "10px", color: "#34d399" }}>
                            done by {subtask.completedBy.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>

              {/* Add subtask input */}
              <Box sx={{ display: "flex", gap: 1, mt: 1.5, pt: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  placeholder="Add subtask..."
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "0.875rem" } }}
                />
                <Tooltip title="Add subtask">
                  <IconButton
                    onClick={addSubtask}
                    sx={{
                      bgcolor: "rgba(99,102,241,0.1)",
                      color: "#6366f1",
                      borderRadius: "12px",
                      "&:hover": { bgcolor: "rgba(99,102,241,0.2)" },
                    }}
                  >
                    <Plus size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Card>
    </motion.div>
  );
}
