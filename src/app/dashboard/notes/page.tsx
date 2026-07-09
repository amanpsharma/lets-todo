"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pin, PinOff, Trash2, StickyNote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface Note {
  _id: string;
  content: string;
  color: string;
  pinned: boolean;
  updatedAt: string;
}

const noteColors: { value: string; bg: string; border: string; text: string }[] = [
  { value: "yellow", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800/40", text: "text-amber-900 dark:text-amber-100" },
  { value: "green", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/40", text: "text-emerald-900 dark:text-emerald-100" },
  { value: "blue", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800/40", text: "text-blue-900 dark:text-blue-100" },
  { value: "pink", bg: "bg-pink-50 dark:bg-pink-900/20", border: "border-pink-200 dark:border-pink-800/40", text: "text-pink-900 dark:text-pink-100" },
  { value: "violet", bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-200 dark:border-violet-800/40", text: "text-violet-900 dark:text-violet-100" },
  { value: "orange", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800/40", text: "text-orange-900 dark:text-orange-100" },
];

function getColorClasses(color: string) {
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
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
            <StickyNote className="w-6 h-6 text-amber-500" />
            Sticky Notes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quick capture your thoughts and ideas
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addNote}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Note</span>
        </motion.button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <StickyNote className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notes yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Capture ideas, reminders, and quick thoughts</p>
          <button onClick={addNote}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25"
          >
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {notes.map((note, idx) => {
              const cc = getColorClasses(note.color);
              return (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`group relative rounded-2xl border ${cc.bg} ${cc.border} p-4 min-h-[180px] flex flex-col`}
                >
                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Color switcher */}
                    <div className="flex items-center gap-0.5 p-1 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                      {noteColors.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => updateNote(note._id, { color: c.value })}
                          className={`w-4 h-4 rounded-full border-2 transition-all ${
                            c.value === "yellow" ? "bg-amber-400" :
                            c.value === "green" ? "bg-emerald-400" :
                            c.value === "blue" ? "bg-blue-400" :
                            c.value === "pink" ? "bg-pink-400" :
                            c.value === "violet" ? "bg-violet-400" : "bg-orange-400"
                          } ${note.color === c.value ? "border-gray-600 dark:border-white scale-110" : "border-transparent"}`}
                        />
                      ))}
                    </div>
                    <button onClick={() => togglePin(note)}
                      className="p-1.5 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                    >
                      {note.pinned ? <PinOff className="w-3.5 h-3.5 text-violet-500" /> : <Pin className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                    <button onClick={() => deleteNote(note._id)}
                      className="p-1.5 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>

                  {note.pinned && (
                    <Pin className="w-3.5 h-3.5 text-violet-500 absolute top-3 left-3" />
                  )}

                  <textarea
                    defaultValue={note.content}
                    onBlur={(e) => {
                      if (e.target.value !== note.content) {
                        updateNote(note._id, { content: e.target.value });
                      }
                    }}
                    placeholder="Type something..."
                    className={`flex-1 w-full bg-transparent border-none resize-none focus:outline-none text-sm leading-relaxed ${cc.text} placeholder:opacity-40 ${note.pinned ? "mt-4" : ""}`}
                  />

                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
