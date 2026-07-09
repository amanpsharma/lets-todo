import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/models/Todo";
import User from "@/models/User";
import { createNotification } from "@/lib/notify";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const friendId = body.friendId;
    const permission = body.permission || "view";

    if (!friendId) {
      return NextResponse.json({ error: "Friend ID required" }, { status: 400 });
    }

    if (!["view", "edit", "admin"].includes(permission)) {
      return NextResponse.json({ error: "Invalid permission" }, { status: 400 });
    }

    await dbConnect();

    const todo = await Todo.findOne({ _id: id, userId });
    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser?.friends?.includes(friendId)) {
      return NextResponse.json({ error: "Can only share with friends" }, { status: 403 });
    }

    // Remove existing share entry for this friend if any, then add fresh one
    await Todo.findByIdAndUpdate(id, {
      $pull: { sharedWith: { userId: friendId } },
    });

    const updated = await Todo.findByIdAndUpdate(
      id,
      {
        $push: {
          sharedWith: {
            userId: friendId,
            permission: permission,
            sharedAt: new Date(),
          },
        },
      },
      { returnDocument: "after" }
    );

    // Notify the friend that a todo was shared with them
    await createNotification({
      userId: friendId,
      type: "shared",
      title: todo.title,
      body: `${currentUser.name || "Someone"} shared a task with you`,
      link: "/dashboard/shared",
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/todos/[id]/share error:", error);
    return NextResponse.json({ error: "Failed to share todo" }, { status: 500 });
  }
}
