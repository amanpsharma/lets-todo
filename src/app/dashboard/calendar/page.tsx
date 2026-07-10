"use client";

import { useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Plus,
  X,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { TodoContext } from "@/context/TodoContext";
import { Todo } from "@/types/todo";
import toast from "react-hot-toast";

const priorityDot: Record<string, string> = {
  low: "bg-emerald-400",
  medium: "bg-blue-400",
  high: "bg-orange-400",
  urgent: "bg-red-500",
};

export default function CalendarPage() {
  const ctx = useContext(TodoContext);
  if (!ctx) return null;
  const { todos, addTodo } = ctx;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<Todo["priority"]>("medium");
  const [quickCategory, setQuickCategory] = useState("general");
  const [adding, setAdding] = useState(false);

  const handleQuickAdd = async () => {
    if (!quickTitle.trim() || !selectedDate) return;
    setAdding(true);
    try {
      await addTodo({
        title: quickTitle.trim(),
        priority: quickPriority,
        category: quickCategory,
        dueDate: format(selectedDate, "yyyy-MM-dd"),
      });
      toast.success("Task added!");
      setQuickTitle("");
      setQuickPriority("medium");
      setQuickCategory("general");
      setShowQuickAdd(false);
    } catch {
      toast.error("Failed to add task");
    } finally {
      setAdding(false);
    }
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setShowQuickAdd(false);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const todosByDate = useMemo(() => {
    const map = new Map<string, Todo[]>();
    for (const todo of todos) {
      if (todo.dueDate) {
        const key = format(new Date(todo.dueDate), "yyyy-MM-dd");
        const list = map.get(key) || [];
        list.push(todo);
        map.set(key, list);
      }
    }
    return map;
  }, [todos]);

  const selectedTodos = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return todosByDate.get(key) || [];
  }, [selectedDate, todosByDate]);

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
          Calendar
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View your tasks by due date
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* Calendar grid */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTodos = todosByDate.get(key) || [];
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const selected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={key}
                  onClick={() => handleDateClick(day)}
                  className={`relative p-2 rounded-xl text-sm transition-all min-h-[52px] sm:min-h-[64px] flex flex-col items-center ${
                    !inMonth
                      ? "text-gray-300 dark:text-gray-600"
                      : selected
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500"
                      : today
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="text-xs sm:text-sm">{format(day, "d")}</span>
                  {dayTodos.length > 0 && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {dayTodos.slice(0, 3).map((t) => (
                        <span
                          key={t._id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.completed
                              ? "bg-gray-300 dark:bg-gray-600"
                              : priorityDot[t.priority]
                          }`}
                        />
                      ))}
                      {dayTodos.length > 3 && (
                        <span className="text-[9px] text-gray-400">
                          +{dayTodos.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar: selected day's tasks */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              {selectedDate
                ? format(selectedDate, "EEEE, MMM d")
                : "Select a date"}
            </h3>
            {selectedDate && !showQuickAdd && (
              <button
                onClick={() => setShowQuickAdd(true)}
                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Add Form */}
          <AnimatePresence>
            {showQuickAdd && selectedDate && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Add task for {format(selectedDate, "MMM d")}</span>
                    <button onClick={() => setShowQuickAdd(false)} className="p-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/20 text-gray-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                    placeholder="Task title..."
                    autoFocus
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  {/* Priority */}
                  <div className="flex gap-1.5">
                    {(["low", "medium", "high", "urgent"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setQuickPriority(p)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                          quickPriority === p
                            ? `${priorityDot[p].replace("bg-", "text-")} ring-1 ring-current bg-white dark:bg-gray-800`
                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  {/* Category */}
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="general">General</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="shopping">Shopping</option>
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="finance">Finance</option>
                  </select>
                  <button
                    onClick={handleQuickAdd}
                    disabled={!quickTitle.trim() || adding}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {adding ? "Adding..." : "Add Task"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedDate ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              Click on a date to see tasks
            </p>
          ) : selectedTodos.length === 0 && !showQuickAdd ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">
                No tasks due on this date
              </p>
              <button
                onClick={() => setShowQuickAdd(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add a task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedTodos.map((todo, i) => (
                <motion.div
                  key={todo._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-3 rounded-xl border ${
                    todo.completed
                      ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200/50 dark:border-white/5 opacity-60"
                      : "bg-white dark:bg-gray-800 border-gray-200/50 dark:border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {todo.completed && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    )}
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[todo.priority]}`}
                    />
                    <p
                      className={`text-sm font-medium truncate ${
                        todo.completed
                          ? "line-through text-gray-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {todo.title}
                    </p>
                  </div>
                  {todo.category && todo.category !== "general" && (
                    <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {todo.category}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
