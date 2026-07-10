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
        return { icon: Plus, color: "bg-blue-500", ring: "ring-blue-200 dark:ring-blue-900" };
      case "completed":
        return { icon: CheckCircle2, color: "bg-emerald-500", ring: "ring-emerald-200 dark:ring-emerald-900" };
      case "shared":
        return { icon: Share2, color: "bg-indigo-500", ring: "ring-indigo-200 dark:ring-indigo-900" };
      default:
        return { icon: Edit3, color: "bg-gray-500", ring: "ring-gray-200 dark:ring-gray-800" };
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

  return (
    <div className="h-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
          <Clock className="w-6 h-6 text-indigo-500" />
          Activity Timeline
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          See everything that happened with your tasks
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No activity yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create your first task to see activity here</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 sticky top-0 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50 dark:from-gray-950 dark:via-slate-950 dark:to-indigo-950/50 py-2 z-10">
                {group.label}
              </h3>
              <div className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-800 space-y-4">
                {group.events.map((event, idx) => {
                  const { icon: Icon, color, ring } = iconForType(event.type);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="relative"
                    >
                      {/* Dot on timeline */}
                      <div className={`absolute -left-[calc(2rem+5px)] w-3 h-3 rounded-full ${color} ring-4 ${ring}`} />

                      <div className="glass-card rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-lg ${color} flex-shrink-0`}>
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {labelForType(event.type)}
                              </span>
                              {event.category && event.category !== "general" && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 capitalize">
                                  {event.category}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5 truncate">
                              {event.title}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                              {formatDistanceToNow(event.date, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
