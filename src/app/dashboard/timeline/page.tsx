"use client";

import { useContext, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  Plus,
  Edit3,
  Share2,
} from "lucide-react";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import {
  Box,
  Typography,
  Paper,
  Card,
  Chip,
  Divider,
} from "@mui/material";
import { TodoContext } from "@/context/TodoContext";
import { Todo } from "@/types/todo";

interface TimelineEvent {
  id: string;
  type: "created" | "completed" | "shared";
  title: string;
  date: Date;
  priority: string;
  category?: string;
}

export default function TimelinePage() {
  const ctx = useContext(TodoContext);
  if (!ctx) return null;
  const { todos } = ctx;

  const events = useMemo(() => {
    const list: TimelineEvent[] = [];

    for (const todo of todos) {
      // Created event
      list.push({
        id: `created-${todo._id}`,
        type: "created",
        title: todo.title,
        date: new Date(todo.createdAt),
        priority: todo.priority,
        category: todo.category,
      });

      // Completed event
      if (todo.completed) {
        list.push({
          id: `completed-${todo._id}`,
          type: "completed",
          title: todo.title,
          date: new Date(todo.updatedAt),
          priority: todo.priority,
          category: todo.category,
        });
      }

      // Shared event
      if (todo.sharedWith && todo.sharedWith.length > 0) {
        list.push({
          id: `shared-${todo._id}`,
          type: "shared",
          title: todo.title,
          date: new Date(todo.sharedWith[0].sharedAt),
          priority: todo.priority,
          category: todo.category,
        });
      }
    }

    list.sort((a, b) => b.date.getTime() - a.date.getTime());
    return list.slice(0, 50);
  }, [todos]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: { label: string; events: TimelineEvent[] }[] = [];
    let currentLabel = "";

    for (const event of events) {
      let label: string;
      if (isToday(event.date)) label = "Today";
      else if (isYesterday(event.date)) label = "Yesterday";
      else label = format(event.date, "EEEE, MMM d");

      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, events: [] });
      }
      groups[groups.length - 1].events.push(event);
    }
    return groups;
  }, [events]);

  const iconForType = (type: string) => {
    switch (type) {
      case "created":
        return { icon: Plus, color: "bg-blue-500" };
      case "completed":
        return { icon: CheckCircle2, color: "bg-emerald-500" };
      case "shared":
        return { icon: Share2, color: "bg-indigo-500" };
      default:
        return { icon: Edit3, color: "bg-gray-500" };
    }
  };

  const labelForType = (type: string) => {
    switch (type) {
      case "created": return "Created";
      case "completed": return "Completed";
      case "shared": return "Shared";
      default: return "Updated";
    }
  };

  const chipColorForType = (type: string): "primary" | "success" | "secondary" | "default" => {
    switch (type) {
      case "created": return "primary";
      case "completed": return "success";
      case "shared": return "secondary";
      default: return "default";
    }
  };

  return (
    <Box sx={{ height: "100%", maxWidth: 672, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <Clock className="w-6 h-6 text-indigo-500" />
          Activity Timeline
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          See everything that happened with your tasks
        </Typography>
      </Box>

      {events.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            No activity yet
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Create your first task to see activity here
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {grouped.map((group) => (
            <Box key={group.label}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  display: "block",
                  mb: 2,
                  py: 1,
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  bgcolor: "background.default",
                }}
              >
                {group.label}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  position: "relative",
                  pl: 4,
                  borderLeft: "2px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {group.events.map((event, idx) => {
                  const { icon: Icon, color } = iconForType(event.type);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      style={{ position: "relative" }}
                    >
                      {/* Dot on timeline */}
                      <Box
                        className={`absolute w-3 h-3 rounded-full ${color}`}
                        sx={{
                          left: "calc(-2rem - 5px)",
                          top: 16,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          position: "absolute",
                        }}
                      />

                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <Box sx={{ p: 2, display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                          <Box
                            className={`p-1.5 rounded-lg ${color} flex-shrink-0`}
                            sx={{ display: "flex" }}
                          >
                            <Icon className="w-3 h-3 text-white" />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                              <Chip
                                label={labelForType(event.type)}
                                size="small"
                                color={chipColorForType(event.type)}
                                variant="outlined"
                                sx={{ height: 20, fontSize: "0.6875rem" }}
                              />
                              {event.category && event.category !== "general" && (
                                <Chip
                                  label={event.category}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.625rem",
                                    textTransform: "capitalize",
                                  }}
                                />
                              )}
                            </Box>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ fontWeight: "medium", mt: 0.5 }}
                            >
                              {event.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 0.5 }}>
                              {formatDistanceToNow(event.date, { addSuffix: true })}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </motion.div>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
