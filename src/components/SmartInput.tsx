"use client";

import { useState, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  ArrowRight,
  Calendar,
  Flag,
  Tag,
  X,
  Loader2,
} from "lucide-react";
import { TodoContext } from "@/context/TodoContext";
import toast from "react-hot-toast";

interface ParsedTask {
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  dueDate: string | null;
  tags: string[];
}

const priorityLabel: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
  medium: { label: "Medium", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
  high: { label: "High", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400" },
  urgent: { label: "Urgent", color: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" },
};

export default function SmartInput() {
  const ctx = useContext(TodoContext);
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedTask | null>(null);
  const [parsing, setParsing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const parseInput = async (text: string) => {
    if (!text.trim() || text.length < 3) {
      setParsed(null);
      setShowPreview(false);
      return;
    }

    setParsing(true);
    try {
      const res = await fetch("/api/ai/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setParsed(data);
        setShowPreview(true);
      }
    } catch {} finally {
      setParsing(false);
    }
  };

  const handleChange = (text: string) => {
    setInput(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => parseInput(text), 400);
  };

  const createTask = async () => {
    if (!parsed || !ctx) return;
    try {
      await ctx.addTodo({
        title: parsed.title,
        priority: parsed.priority,
        category: parsed.category,
        dueDate: parsed.dueDate,
        tags: parsed.tags,
      });
      toast.success("Task created with AI!");
      setInput("");
      setParsed(null);
      setShowPreview(false);
    } catch {
      toast.error("Failed to create task");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && parsed) {
      e.preventDefault();
      createTask();
    }
    if (e.key === "Escape") {
      setShowPreview(false);
      setParsed(null);
      setInput("");
    }
  };

  return (
    <div className="relative mb-4">
      <div className="relative">
        <Wand2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Try: "Buy groceries tomorrow high priority #shopping"'
          className="w-full pl-11 pr-12 py-3 bg-white/60 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/10 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 text-sm backdrop-blur-sm"
        />
        {parsing && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
        )}
        {input && !parsing && (
          <button
            onClick={() => { setInput(""); setParsed(null); setShowPreview(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* AI Preview */}
      <AnimatePresence>
        {showPreview && parsed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 right-0 top-full mt-2 z-20 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">AI Parsed</span>
            </div>

            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {parsed.title}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${priorityLabel[parsed.priority].color}`}>
                <Flag className="w-3 h-3" />
                {priorityLabel[parsed.priority].label}
              </span>

              {parsed.category !== "general" && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                  {parsed.category}
                </span>
              )}

              {parsed.dueDate && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                  <Calendar className="w-3 h-3" />
                  {parsed.dueDate}
                </span>
              )}

              {parsed.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowPreview(false); setParsed(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createTask}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/25"
              >
                Create Task
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
