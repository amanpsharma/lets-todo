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
import {
  Box,
  Typography,
  Paper,
  Card,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
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
    <Box sx={{ height: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          Calendar
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          View your tasks by due date
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" },
          gap: 3,
        }}
      >
        {/* Calendar grid */}
        <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <IconButton
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {format(currentMonth, "MMMM yyyy")}
            </Typography>
            <IconButton
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              <ChevronRight className="w-5 h-5" />
            </IconButton>
          </Box>

          {/* Day headers */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.25,
              mb: 0.5,
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <Typography
                key={d}
                variant="caption"
                align="center"
                sx={{ display: "block", color: "text.secondary", fontWeight: "medium", py: 1 }}
              >
                {d}
              </Typography>
            ))}
          </Box>

          {/* Days */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.25,
            }}
          >
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTodos = todosByDate.get(key) || [];
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const selected = selectedDate && isSameDay(day, selectedDate);

              return (
                <Box
                  key={key}
                  component="button"
                  onClick={() => handleDateClick(day)}
                  sx={{
                    position: "relative",
                    p: 1,
                    borderRadius: 2,
                    minHeight: { xs: 52, sm: 64 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    color: !inMonth
                      ? "text.disabled"
                      : selected
                      ? "primary.dark"
                      : today
                      ? "primary.main"
                      : "text.primary",
                    bgcolor: selected
                      ? "primary.50"
                      : today
                      ? "primary.50"
                      : "transparent",
                    outline: selected ? "2px solid" : "none",
                    outlineColor: selected ? "primary.main" : "transparent",
                    fontWeight: today ? "bold" : "normal",
                    "&:hover": {
                      bgcolor: !selected ? "action.hover" : undefined,
                    },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    {format(day, "d")}
                  </Typography>
                  {dayTodos.length > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mt: 0.5 }}>
                      {dayTodos.slice(0, 3).map((t) => (
                        <span
                          key={t._id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.completed ? "bg-gray-300" : priorityDot[t.priority]
                          }`}
                        />
                      ))}
                      {dayTodos.length > 3 && (
                        <Typography component="span" sx={{ fontSize: "0.5625rem", color: "text.disabled" }}>
                          +{dayTodos.length - 3}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* Sidebar: selected day's tasks */}
        <Card variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: "600", display: "flex", alignItems: "center", gap: 1 }}
            >
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a date"}
            </Typography>
            {selectedDate && !showQuickAdd && (
              <IconButton
                onClick={() => setShowQuickAdd(true)}
                size="small"
                color="primary"
                sx={{ borderRadius: 2 }}
              >
                <Plus className="w-4 h-4" />
              </IconButton>
            )}
          </Box>

          {/* Quick Add Form */}
          <AnimatePresence>
            {showQuickAdd && selectedDate && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: "hidden" }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: "primary.50",
                    borderColor: "primary.100",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "primary.main", fontWeight: "medium" }}>
                      Add task for {format(selectedDate, "MMM d")}
                    </Typography>
                    <IconButton
                      onClick={() => setShowQuickAdd(false)}
                      size="small"
                      sx={{ p: 0.5 }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </IconButton>
                  </Box>

                  <TextField
                    size="small"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                    placeholder="Task title..."
                    autoFocus
                    fullWidth
                    sx={{ bgcolor: "background.paper", borderRadius: 1 }}
                  />

                  {/* Priority buttons */}
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {(["low", "medium", "high", "urgent"] as const).map((p) => (
                      <Button
                        key={p}
                        size="small"
                        variant={quickPriority === p ? "outlined" : "text"}
                        onClick={() => setQuickPriority(p)}
                        sx={{
                          textTransform: "capitalize",
                          fontSize: "0.6875rem",
                          minWidth: 0,
                          px: 0.75,
                          py: 0.5,
                        }}
                      >
                        {p}
                      </Button>
                    ))}
                  </Box>

                  {/* Category */}
                  <Select
                    size="small"
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    fullWidth
                    sx={{ bgcolor: "background.paper", fontSize: "0.75rem" }}
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="work">Work</MenuItem>
                    <MenuItem value="personal">Personal</MenuItem>
                    <MenuItem value="shopping">Shopping</MenuItem>
                    <MenuItem value="health">Health</MenuItem>
                    <MenuItem value="learning">Learning</MenuItem>
                    <MenuItem value="finance">Finance</MenuItem>
                  </Select>

                  <Button
                    variant="contained"
                    onClick={handleQuickAdd}
                    disabled={!quickTitle.trim() || adding}
                    fullWidth
                    size="small"
                  >
                    {adding ? "Adding..." : "Add Task"}
                  </Button>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedDate ? (
            <Typography
              variant="body2"
              align="center"
              sx={{ color: "text.secondary", py: 4 }}
            >
              Click on a date to see tasks
            </Typography>
          ) : selectedTodos.length === 0 && !showQuickAdd ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
                No tasks due on this date
              </Typography>
              <Button
                size="small"
                startIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setShowQuickAdd(true)}
                sx={{ textTransform: "none" }}
              >
                Add a task
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {selectedTodos.map((todo, i) => (
                <motion.div
                  key={todo._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      opacity: todo.completed ? 0.6 : 1,
                      bgcolor: todo.completed ? "action.hover" : "background.paper",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {todo.completed && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      )}
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[todo.priority]}`}
                      />
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: "medium",
                          textDecoration: todo.completed ? "line-through" : "none",
                          color: todo.completed ? "text.disabled" : "text.primary",
                        }}
                      >
                        {todo.title}
                      </Typography>
                    </Box>
                    {todo.category && todo.category !== "general" && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          display: "inline-block",
                          mt: 0.75,
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          bgcolor: "action.selected",
                          color: "text.secondary",
                          textTransform: "capitalize",
                        }}
                      >
                        {todo.category}
                      </Typography>
                    )}
                  </Paper>
                </motion.div>
              ))}
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
