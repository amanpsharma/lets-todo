"use client";

import { useContext, useMemo, useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  CircleDashed,
  Loader2,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { TodoContext } from "@/context/TodoContext";
import { Todo } from "@/types/todo";

type Column = "todo" | "in-progress" | "done";

const columnDefs: {
  id: Column;
  label: string;
  icon: typeof CircleDashed;
  color: string;
  chipColor: "primary" | "warning" | "success";
  dropBg: string;
}[] = [
  {
    id: "todo",
    label: "To Do",
    icon: CircleDashed,
    color: "from-blue-500 to-cyan-500",
    chipColor: "primary",
    dropBg: "border-blue-300 dark:border-blue-700 bg-blue-50/40 dark:bg-blue-900/10",
  },
  {
    id: "in-progress",
    label: "In Progress",
    icon: Loader2,
    color: "from-amber-500 to-orange-500",
    chipColor: "warning",
    dropBg: "border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-900/10",
  },
  {
    id: "done",
    label: "Done",
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-500",
    chipColor: "success",
    dropBg: "border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/10",
  },
];

const priorityDot: Record<string, string> = {
  low: "bg-emerald-400",
  medium: "bg-blue-400",
  high: "bg-orange-400",
  urgent: "bg-red-500",
};

// Determine which column a todo belongs to based on its fields
function getColumn(todo: Todo): Column {
  if (todo.completed) return "done";
  if (todo.priority === "high" || todo.priority === "urgent") return "in-progress";
  return "todo";
}

export default function KanbanPage() {
  const ctx = useContext(TodoContext);
  if (!ctx) return null;
  const { todos, updateTodo } = ctx;

  // Local overrides: todoId → target column (for instant drag feedback)
  const [columnOverrides, setColumnOverrides] = useState<Record<string, Column>>({});

  const grouped = useMemo(() => {
    const map: Record<Column, Todo[]> = {
      todo: [],
      "in-progress": [],
      done: [],
    };
    for (const t of todos) {
      const col = columnOverrides[t._id] || getColumn(t);
      map[col].push(t);
    }
    return map;
  }, [todos, columnOverrides]);

  const moveTask = useCallback(async (todoId: string, from: Column, to: Column) => {
    // 1. Immediately move in UI via local override
    setColumnOverrides((prev) => ({ ...prev, [todoId]: to }));

    // 2. Build the actual field updates for the API
    const todo = todos.find((t) => t._id === todoId);
    if (!todo) return;

    const updates: Partial<Todo> = {};
    if (to === "done") {
      updates.completed = true;
    } else if (to === "todo") {
      updates.completed = false;
      if (todo.priority === "high" || todo.priority === "urgent") {
        updates.priority = "medium";
      }
    } else {
      updates.completed = false;
      if (todo.priority !== "high" && todo.priority !== "urgent") {
        updates.priority = "high";
      }
    }

    try {
      await updateTodo(todoId, updates);
    } catch {
      // Rollback: remove override so it goes back to its real column
      setColumnOverrides((prev) => {
        const next = { ...prev };
        delete next[todoId];
        return next;
      });
      return;
    }

    // 3. Clear override — the context todos now have the correct values
    setColumnOverrides((prev) => {
      const next = { ...prev };
      delete next[todoId];
      return next;
    });
  }, [todos, updateTodo]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceCol = source.droppableId as Column;
    const destCol = destination.droppableId as Column;

    if (sourceCol === destCol) return;

    moveTask(draggableId, sourceCol, destCol);
  };

  return (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          Kanban Board
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Drag tasks between columns to update their status
        </Typography>
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 2, lg: 3 },
          }}
        >
          {columnDefs.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={grouped[col.id]}
            />
          ))}
        </Box>
      </DragDropContext>
    </Box>
  );
}

function KanbanColumn({
  column,
  tasks,
}: {
  column: (typeof columnDefs)[0];
  tasks: Todo[];
}) {
  const Icon = column.icon;

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Box
          className={`p-2 rounded-xl bg-gradient-to-br ${column.color} shadow-lg`}
          sx={{ display: "flex" }}
        >
          <Icon className="w-4 h-4 text-white" />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: "600" }}>
            {column.label}
          </Typography>
          <Chip
            label={`${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
            size="small"
            color={column.chipColor}
            variant="outlined"
            sx={{ height: 18, fontSize: "0.6875rem" }}
          />
        </Box>
      </Box>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-3 p-3 rounded-2xl border-2 border-dashed min-h-[200px] transition-colors duration-200 ${
              snapshot.isDraggingOver
                ? column.dropBg
                : "border-gray-200/50 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/30"
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <Typography
                variant="body2"
                align="center"
                sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 128, color: "text.secondary" }}
              >
                Drop tasks here
              </Typography>
            )}
            {tasks.map((todo, i) => (
              <Draggable key={todo._id} draggableId={todo._id} index={i}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        opacity: todo.completed ? 0.6 : 1,
                        cursor: "grab",
                        userSelect: "none",
                        boxShadow: dragSnapshot.isDragging ? 6 : 1,
                        transform: dragSnapshot.isDragging ? "rotate(2deg)" : "none",
                        borderColor: dragSnapshot.isDragging ? "primary.main" : undefined,
                        transition: "box-shadow 0.15s",
                        "&:hover": { boxShadow: 3 },
                        "&:active": { cursor: "grabbing" },
                      }}
                    >
                      <CardContent sx={{ p: "12px !important" }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "medium",
                                textDecoration: todo.completed ? "line-through" : "none",
                                color: todo.completed ? "text.disabled" : "text.primary",
                              }}
                            >
                              {todo.title}
                            </Typography>
                            {todo.description && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  color: "text.secondary",
                                  mt: 0.5,
                                }}
                              >
                                {todo.description}
                              </Typography>
                            )}

                            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75, mt: 1 }}>
                              <span
                                className={`w-2 h-2 rounded-full ${priorityDot[todo.priority]}`}
                              />
                              {todo.dueDate && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.25 }}
                                >
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(todo.dueDate), "MMM d")}
                                </Typography>
                              )}
                              {todo.category && todo.category !== "general" && (
                                <Chip
                                  label={todo.category}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.6875rem",
                                    textTransform: "capitalize",
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Box>
  );
}
