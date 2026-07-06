import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/models/Todo";
import User from "@/models/User";

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

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      body,
      { new: true }
    );
    if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
