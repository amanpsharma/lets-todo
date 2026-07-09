"use client";

import { useContext, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
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

const priorityDot: Record<string, string> = {
  low: "bg-emerald-400",
  medium: "bg-blue-400",
  high: "bg-orange-400",
  urgent: "bg-red-500",
};

export default function CalendarPage() {
  const ctx = useContext(TodoContext);
  if (!ctx) return null;
  const { todos } = ctx;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
                  onClick={() => setSelectedDate(day)}
                  className={`relative p-2 rounded-xl text-sm transition-all min-h-[52px] sm:min-h-[64px] flex flex-col items-center ${
                    !inMonth
                      ? "text-gray-300 dark:text-gray-600"
                      : selected
                      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500"
                      : today
                      ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-bold"
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
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-violet-500" />
            {selectedDate
              ? format(selectedDate, "EEEE, MMM d")
              : "Select a date"}
          </h3>

          {!selectedDate ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              Click on a date to see tasks
            </p>
          ) : selectedTodos.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              No tasks due on this date
            </p>
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
