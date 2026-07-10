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
import { TodoContext } from "@/context/TodoContext";
import { Todo } from "@/types/todo";

type Column = "todo" | "in-progress" | "done";

const columnDefs: {
  id: Column;
  label: string;
  icon: typeof CircleDashed;
  color: string;
  dropBg: string;
}[] = [
  {
    id: "todo",
    label: "To Do",
    icon: CircleDashed,
    color: "from-blue-500 to-cyan-500",
    dropBg: "border-blue-300 dark:border-blue-700 bg-blue-50/40 dark:bg-blue-900/10",
  },
  {
    id: "in-progress",
    label: "In Progress",
    icon: Loader2,
    color: "from-amber-500 to-orange-500",
    dropBg: "border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-900/10",
  },
  {
    id: "done",
    label: "Done",
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-500",
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
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
          Kanban Board
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Drag tasks between columns to update their status
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {columnDefs.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={grouped[col.id]}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
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
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-2 rounded-xl bg-gradient-to-br ${column.color} shadow-lg`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {column.label}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

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
              <div className="flex items-center justify-center h-32 text-sm text-gray-400 dark:text-gray-500">
                Drop tasks here
              </div>
            )}
            {tasks.map((todo, i) => (
              <Draggable key={todo._id} draggableId={todo._id} index={i}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={`group relative p-4 rounded-xl bg-white dark:bg-gray-800/80 border shadow-sm transition-shadow select-none cursor-grab active:cursor-grabbing ${
                      dragSnapshot.isDragging
                        ? "shadow-xl ring-2 ring-indigo-500/40 border-indigo-300 dark:border-indigo-600 rotate-[2deg]"
                        : "border-gray-200/50 dark:border-white/5 hover:shadow-md"
                    } ${todo.completed ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            todo.completed
                              ? "line-through text-gray-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {todo.title}
                        </p>
                        {todo.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {todo.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span
                            className={`w-2 h-2 rounded-full ${priorityDot[todo.priority]}`}
                          />
                          {todo.dueDate && (
                            <span className="flex items-center gap-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(todo.dueDate), "MMM d")}
                            </span>
                          )}
                          {todo.category && todo.category !== "general" && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                              {todo.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
