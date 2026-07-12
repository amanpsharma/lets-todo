"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { Todo } from "@/types/todo";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WorkIcon from "@mui/icons-material/Work";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SchoolIcon from "@mui/icons-material/School";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { SvgIconComponent } from "@mui/icons-material";

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (todo: Partial<Todo>) => Promise<Todo>;
}

export default function AddTodoModal({ isOpen, onClose, onAdd }: AddTodoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");
  const [category, setCategory] = useState("general");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const priorities: { value: Todo["priority"]; label: string; color: string }[] = [
    { value: "low", label: "Low", color: "#10b981" },
    { value: "medium", label: "Medium", color: "#6366f1" },
    { value: "high", label: "High", color: "#f97316" },
    { value: "urgent", label: "Urgent", color: "#ef4444" },
  ];

  const categories: { value: string; label: string; icon: SvgIconComponent }[] = [
    { value: "general", label: "General", icon: AssignmentIcon },
    { value: "work", label: "Work", icon: WorkIcon },
    { value: "personal", label: "Personal", icon: HomeIcon },
    { value: "shopping", label: "Shopping", icon: ShoppingCartIcon },
    { value: "health", label: "Health", icon: FitnessCenterIcon },
    { value: "learning", label: "Learning", icon: SchoolIcon },
    { value: "finance", label: "Finance", icon: AccountBalanceIcon },
  ];

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const finalTags =
      tagInput.trim() && !tags.includes(tagInput.trim())
        ? [...tags, tagInput.trim()]
        : [...tags];

    await onAdd({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate: dueDate ? dueDate.toISOString().split("T")[0] : null,
      tags: finalTags,
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory("general");
    setDueDate(null);
    setTags([]);
    setTagInput("");
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Animated backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              zIndex: 1299,
            }}
          />

          {/* Animated dialog wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1300,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: "8vh",
              paddingLeft: 16,
              paddingRight: 16,
              pointerEvents: "none",
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                width: "100%",
                maxWidth: 520,
                maxHeight: "84vh",
                overflowY: "auto",
                bgcolor: "background.paper",
                borderRadius: 3,
                boxShadow: 24,
                p: { xs: 2.5, sm: 3.5 },
                pointerEvents: "auto",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: { xs: 2.5, sm: 3 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1,
                      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                    }}
                  >
                    <Sparkles size={18} color="#fff" />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      Create Task
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Add a new task to your list
                    </Typography>
                  </Box>
                </Box>

                <IconButton size="small" onClick={onClose} aria-label="close">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Stack spacing={2.5}>
                {/* Title */}
                <TextField
                  fullWidth
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  slotProps={{ htmlInput: { style: { fontWeight: 500, fontSize: "1rem" } } }}
                />

                {/* Description */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description (optional)..."
                />

                {/* Priority */}
                <Box>
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{ fontWeight: 600, color: "text.secondary" }}
                  >
                    Priority
                  </Typography>
                  <ToggleButtonGroup
                    value={priority}
                    exclusive
                    onChange={(_e, val) => val && setPriority(val)}
                    size="small"
                    sx={{ flexWrap: "wrap", gap: 0.5 }}
                  >
                    {priorities.map((p) => (
                      <ToggleButton
                        key={p.value}
                        value={p.value}
                        sx={{
                          borderRadius: "10px !important",
                          border: "1px solid",
                          borderColor: "divider",
                          px: 1.5,
                          py: 0.75,
                          gap: 0.75,
                          "&.Mui-selected": {
                            borderColor: p.color,
                            color: p.color,
                            bgcolor: `${p.color}18`,
                            "&:hover": { bgcolor: `${p.color}28` },
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: p.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {p.label}
                        </Typography>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>

                {/* Category */}
                <Box>
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{ fontWeight: 600, color: "text.secondary" }}
                  >
                    Category
                  </Typography>
                  <ToggleButtonGroup
                    value={category}
                    exclusive
                    onChange={(_e, val) => val && setCategory(val)}
                    size="small"
                    sx={{ flexWrap: "wrap", gap: 0.5 }}
                  >
                    {categories.map((c) => (
                      <ToggleButton
                        key={c.value}
                        value={c.value}
                        sx={{
                          borderRadius: "10px !important",
                          border: "1px solid",
                          borderColor: "divider",
                          px: 1.5,
                          py: 0.75,
                          gap: 0.75,
                          "&.Mui-selected": {
                            borderColor: "primary.main",
                            color: "primary.main",
                            bgcolor: "rgba(99,102,241,0.08)",
                            "&:hover": { bgcolor: "rgba(99,102,241,0.14)" },
                          },
                        }}
                      >
                        <c.icon fontSize="small" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {c.label}
                        </Typography>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>

                {/* Due Date */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due Date"
                    value={dueDate}
                    onChange={(val) => setDueDate(val)}
                    slotProps={{ textField: { fullWidth: true }, field: { clearable: true } }}
                  />
                </LocalizationProvider>

                {/* Tags */}
                <Box>
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{ fontWeight: 600, color: "text.secondary" }}
                  >
                    Tags
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Add tags..."
                    />
                    <IconButton
                      onClick={addTag}
                      color="primary"
                      aria-label="add tag"
                      sx={{
                        border: "1px solid",
                        borderColor: "primary.light",
                        borderRadius: 2,
                        bgcolor: "rgba(99,102,241,0.06)",
                        "&:hover": { bgcolor: "rgba(99,102,241,0.12)" },
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>

                  {tags.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                      {tags.map((tag) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Chip
                            label={`#${tag}`}
                            onDelete={() => removeTag(tag)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </motion.div>
                      ))}
                    </Box>
                  )}
                </Box>
              </Stack>

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 1.5, mt: { xs: 3, sm: 3.5 } }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onClose}
                  sx={{ py: 1.5 }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={!title.trim() || loading}
                  sx={{ py: 1.5 }}
                  startIcon={
                    loading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : undefined
                  }
                >
                  {loading ? "Creating..." : "Create Task"}
                </Button>
              </Box>
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
