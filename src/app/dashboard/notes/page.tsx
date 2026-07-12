"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pin, PinOff, Trash2, StickyNote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  TextField,
  Typography,
  Button,
} from "@mui/material";

interface Note {
  _id: string;
  content: string;
  color: string;
  pinned: boolean;
  updatedAt: string;
}

const noteColors: { value: string; bg: string; border: string; hex: string }[] = [
  { value: "yellow", bg: "#fffbeb", border: "#fde68a", hex: "#fbbf24" },
  { value: "green", bg: "#ecfdf5", border: "#a7f3d0", hex: "#34d399" },
  { value: "blue", bg: "#eff6ff", border: "#bfdbfe", hex: "#60a5fa" },
  { value: "pink", bg: "#fdf2f8", border: "#fbcfe8", hex: "#f472b6" },
  { value: "indigo", bg: "#eef2ff", border: "#c7d2fe", hex: "#818cf8" },
  { value: "orange", bg: "#fff7ed", border: "#fed7aa", hex: "#fb923c" },
];

function getNoteColor(color: string) {
  return noteColors.find((c) => c.value === color) || noteColors[0];
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) setNotes(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addNote = async () => {
    const colors = noteColors.map((c) => c.value);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "", color: randomColor }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes((prev) => [note, ...prev]);
      }
    } catch {
      toast.error("Failed to create note");
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, ...updates } : n)));
    try {
      await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch {
      fetchNotes();
    }
  };

  const deleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n._id !== id));
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      toast.success("Note deleted");
    } catch {
      fetchNotes();
    }
  };

  const togglePin = async (note: Note) => {
    await updateNote(note._id, { pinned: !note.pinned });
  };

  return (
    <Box sx={{ height: "100%" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <StickyNote size={22} color="#f59e0b" />
            Sticky Notes
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            Quick capture your thoughts and ideas
          </Typography>
        </Box>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={addNote}
            sx={{
              background: "linear-gradient(to right, #f59e0b, #ea580c)",
              borderRadius: 3,
              boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { background: "linear-gradient(to right, #d97706, #c2410c)" },
            }}
          >
            New Note
          </Button>
        </motion.div>
      </Box>

      {/* Loading skeletons */}
      {loading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ height: 180, borderRadius: 3, bgcolor: "action.hover", animation: "pulse 1.5s infinite" }} />
          ))}
        </Box>
      ) : notes.length === 0 ? (
        /* Empty state */
        <Box sx={{ textAlign: "center", py: 8 }}>
          <StickyNote size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>No notes yet</Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            Capture ideas, reminders, and quick thoughts
          </Typography>
          <Button
            variant="contained"
            onClick={addNote}
            sx={{
              background: "linear-gradient(to right, #f59e0b, #ea580c)",
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Create Your First Note
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
          <AnimatePresence>
            {notes.map((note, idx) => {
              const cc = getNoteColor(note.color);
              return (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card
                    className="group"
                    sx={{
                      bgcolor: cc.bg,
                      border: `1px solid ${cc.border}`,
                      borderRadius: 3,
                      minHeight: 180,
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      "&:hover .note-actions": { opacity: 1 },
                      "@media (hover: none)": {
                        "& .note-actions": { opacity: 1 },
                      },
                      boxShadow: "none",
                    }}
                  >
                    <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2, "&:last-child": { pb: 2 } }}>
                      {/* Actions overlay */}
                      <Box
                        className="note-actions"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          opacity: 0,
                          transition: "opacity 0.2s",
                        }}
                      >
                        {/* Color picker */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.25,
                            p: 0.5,
                            borderRadius: 2,
                            bgcolor: "rgba(255,255,255,0.85)",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          {noteColors.map((c) => (
                            <Box
                              key={c.value}
                              component="button"
                              onClick={() => updateNote(note._id, { color: c.value })}
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                bgcolor: c.hex,
                                border: note.color === c.value ? "2px solid #374151" : "2px solid transparent",
                                cursor: "pointer",
                                transform: note.color === c.value ? "scale(1.15)" : "scale(1)",
                                transition: "all 0.15s",
                                p: 0,
                              }}
                            />
                          ))}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => togglePin(note)}
                          sx={{ bgcolor: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)", borderRadius: 2, width: 28, height: 28 }}
                        >
                          {note.pinned
                            ? <PinOff size={14} color="#6366f1" />
                            : <Pin size={14} color="#9ca3af" />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteNote(note._id)}
                          sx={{ bgcolor: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)", borderRadius: 2, width: 28, height: 28, "&:hover": { bgcolor: "#fee2e2" } }}
                        >
                          <Trash2 size={14} color="#9ca3af" />
                        </IconButton>
                      </Box>

                      {note.pinned && (
                        <Pin size={14} color="#6366f1" style={{ position: "absolute", top: 12, left: 12 }} />
                      )}

                      <TextField
                        multiline
                        defaultValue={note.content}
                        onBlur={(e) => {
                          if (e.target.value !== note.content) {
                            updateNote(note._id, { content: e.target.value });
                          }
                        }}
                        placeholder="Type something..."
                        variant="standard"
                        fullWidth
                        sx={{
                          flex: 1,
                          mt: note.pinned ? 2.5 : 0,
                          "& .MuiInput-root": {
                            fontSize: "0.875rem",
                            lineHeight: 1.6,
                            "&:before, &:after": { display: "none" },
                          },
                          "& textarea": { resize: "none", background: "transparent" },
                        }}
                        slotProps={{ input: { disableUnderline: true } }}
                      />

                      <Typography variant="caption" sx={{ mt: 1, fontSize: "0.625rem", color: "text.disabled" }}>
                        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>
      )}
    </Box>
  );
}
