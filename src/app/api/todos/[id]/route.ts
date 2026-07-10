import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/models/Todo";
import User from "@/models/User";
import { notifyCollaborators } from "@/lib/notify";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Merge subtasks with DB to prevent stale overwrites from concurrent users
    if (body.subtasks) {
      const existingTodo = await Todo.findOne({ _id: id, userId });
      if (existingTodo) {
        const user = await User.findOne({ clerkId: userId }).select("clerkId name avatar");
        const userInfo = user
          ? { userId: user.clerkId, name: user.name, avatar: user.avatar || "" }
          : { userId, name: "You", avatar: "" };

        const dbSubtasks = existingTodo.subtasks || [];
        const incomingSubtasks = body.subtasks;
        const incomingMap = new Map(incomingSubtasks.map((s: { id: string }) => [s.id, s]));
        const dbMap = new Map(dbSubtasks.map((s: { id: string }) => [s.id, s]));

        const merged: unknown[] = [];

        // Walk DB subtasks — preserve ones added by other users
        for (const dbSub of dbSubtasks) {
          const incoming = incomingMap.get(dbSub.id) as { id: string; completed: boolean } | undefined;
          if (incoming) {
            // Exists in both — check completion toggle
            if (dbSub.completed !== incoming.completed) {
              merged.push({
                ...incoming,
                addedBy: dbSub.addedBy || null,
                completedBy: incoming.completed ? userInfo : null,
              });
            } else {
              merged.push({
                ...incoming,
                addedBy: dbSub.addedBy || null,
                completedBy: dbSub.completedBy || null,
              });
            }
          } else {
            // Owner explicitly removed this subtask — allow removal
            // But preserve subtasks the owner never saw (added by others after owner's last fetch)
            // We can't reliably detect this without a version counter, so for the owner
            // endpoint we trust their intent: if they didn't send it, they removed it.
            // However, to prevent losing subtasks added by others concurrently,
            // preserve subtasks that don't exist in the incoming set AND were added
            // by a different user (the owner likely has stale data).
            const addedByUserId = dbSub.addedBy?.userId;
            if (addedByUserId && addedByUserId !== userId) {
              // Another user added this — owner's client probably doesn't know about it
              merged.push(dbSub);
            }
            // Owner's own subtask removed — skip
          }
        }

        // Add new subtasks (in incoming but not in DB)
        for (const incoming of incomingSubtasks) {
          if (!dbMap.has((incoming as { id: string }).id)) {
            merged.push({ ...incoming, addedBy: userInfo, completedBy: null });
          }
        }

        body.subtasks = merged;
      }
    }

    // Fetch original todo before update to detect changes for notifications
    const originalTodo = await Todo.findOne({ _id: id, userId });
    if (!originalTodo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      body,
      { returnDocument: "after" }
    );
    if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Notify collaborators if this is a shared todo
    if (originalTodo.sharedWith?.length > 0) {
      const actorUser = await User.findOne({ clerkId: userId }).select("name");
      const actorName = actorUser?.name || "Someone";

      let notifBody = `${actorName} updated this task`;
      let notifType: "completed" | "subtask" | "shared" = "shared";

      if (body.completed === true && !originalTodo.completed) {
        notifBody = `${actorName} marked this task as done`;
        notifType = "completed";
      } else if (body.completed === false && originalTodo.completed) {
        notifBody = `${actorName} reopened this task`;
      } else if (body.subtasks) {
        const oldCount = originalTodo.subtasks?.length || 0;
        const newCount = body.subtasks.length;
        if (newCount > oldCount) {
          notifBody = `${actorName} added a subtask`;
          notifType = "subtask";
        } else {
          const newlyDone = body.subtasks.find(
            (s: { id: string; completed: boolean }) =>
              s.completed &&
              originalTodo.subtasks?.find(
                (old: { id: string; completed: boolean }) =>
                  old.id === s.id && !old.completed
              )
          );
          if (newlyDone) {
            notifBody = `${actorName} completed a subtask`;
            notifType = "subtask";
          }
        }
      }

      await notifyCollaborators({
        todoId: id,
        todoTitle: todo.title,
        actorUserId: userId,
        actorName,
        ownerUserId: todo.userId,
        sharedWith: originalTodo.sharedWith,
        type: notifType,
        body: notifBody,
        link: "/dashboard/shared",
      });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("PUT /api/todos/[id] error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;

    const todo = await Todo.findOneAndDelete({ _id: id, userId });
    if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE /api/todos/[id] error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}
