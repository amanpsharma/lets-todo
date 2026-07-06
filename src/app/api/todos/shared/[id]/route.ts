import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/models/Todo";
import User from "@/models/User";

interface SubtaskData {
  id: string;
  title: string;
  completed: boolean;
  addedBy?: unknown;
  completedBy?: unknown;
}

// Merge incoming subtasks with DB subtasks to prevent overwrites from stale clients.
// - New subtasks (in incoming but not in DB) are added with addedBy stamped.
// - Removed subtasks (in DB but not in incoming, AND were known to the client) are removed.
// - Subtasks added by OTHER users (in DB but not in incoming, unknown to client) are preserved.
// - Completion toggles are detected and completedBy is stamped.
async function mergeAndStampSubtasks(
  dbSubtasks: SubtaskData[],
  incomingSubtasks: SubtaskData[],
  userId: string
) {
  const user = await User.findOne({ clerkId: userId }).select("clerkId name avatar");
  const userInfo = user
    ? { userId: user.clerkId, name: user.name, avatar: user.avatar || "" }
    : { userId, name: "Unknown", avatar: "" };

  const incomingMap = new Map(incomingSubtasks.map((s) => [s.id, s]));
  const dbMap = new Map(dbSubtasks.map((s) => [s.id, s]));

  const merged: SubtaskData[] = [];

  // 1. Walk through DB subtasks — keep ones that still exist or were added by others
  for (const dbSub of dbSubtasks) {
    const incoming = incomingMap.get(dbSub.id);
    if (incoming) {
      // Subtask exists in both — check for completion toggle
      if (dbSub.completed !== incoming.completed) {
        merged.push({
          ...incoming,
          addedBy: dbSub.addedBy || null,
          completedBy: incoming.completed ? userInfo : null,
        });
      } else {
        // No change — preserve DB data
        merged.push({
          ...incoming,
          addedBy: dbSub.addedBy || null,
          completedBy: dbSub.completedBy || null,
        });
      }
    } else {
      // Not in incoming — was it a subtask the client knew about and removed,
      // or one added by another user that the client never saw?
      // If addedBy is the current user, they're removing their own — allow removal.
      // Otherwise, preserve it (another user added it, client just has stale data).
      const addedByUser = dbSub.addedBy && typeof dbSub.addedBy === "object" && "userId" in dbSub.addedBy
        ? (dbSub.addedBy as { userId: string }).userId
        : null;
      if (addedByUser === userId) {
        // User is intentionally removing their own subtask — skip it
      } else {
        // Preserve subtask added by another user
        merged.push(dbSub);
      }
    }
  }

  // 2. Add new subtasks (in incoming but not in DB)
  for (const incoming of incomingSubtasks) {
    if (!dbMap.has(incoming.id)) {
      merged.push({ ...incoming, addedBy: userInfo, completedBy: null });
    }
  }

  return merged;
}

// Shared user can update a todo (based on permission)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const todo = await Todo.findById(id);
    if (!todo) return NextResponse.json({ error: "Todo not found" }, { status: 404 });

    // Check if user is owner
    if (todo.userId === userId) {
      const body = await request.json();
      if (body.subtasks) {
        body.subtasks = await mergeAndStampSubtasks(todo.subtasks || [], body.subtasks, userId);
      }
      const updated = await Todo.findByIdAndUpdate(id, body, { new: true });
      return NextResponse.json(updated);
    }

    // Check shared permission
    const share = todo.sharedWith?.find(
      (s: { userId: string }) => s.userId === userId
    );
    if (!share) {
      return NextResponse.json({ error: "Not shared with you" }, { status: 403 });
    }
    if (share.permission === "view") {
      return NextResponse.json({ error: "View-only access" }, { status: 403 });
    }

    const body = await request.json();

    // Stamp subtask user info before filtering
    if (body.subtasks) {
      body.subtasks = await mergeAndStampSubtasks(todo.subtasks || [], body.subtasks, userId);
    }

    const allowedFields: Record<string, string[]> = {
      edit: ["subtasks", "completed"],
      admin: ["title", "description", "subtasks", "completed", "priority", "category", "dueDate", "tags"],
    };

    const allowed = allowedFields[share.permission] || [];
    const updates: Record<string, unknown> = {};

    for (const key of Object.keys(body)) {
      if (allowed.includes(key)) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No permitted changes" }, { status: 403 });
    }

    const updated = await Todo.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/todos/shared/[id] error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
