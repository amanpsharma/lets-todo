import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/models/Todo";
import User from "@/models/User";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const todos = await Todo.find({
      "sharedWith.userId": userId,
    }).sort({ createdAt: -1 });

    const ownerIds = [...new Set(todos.map((t) => t.userId))];
    const owners = await User.find({ clerkId: { $in: ownerIds } }).select(
      "clerkId name avatar"
    );

    const todosWithOwner = todos.map((todo) => {
      const owner = owners.find((o) => o.clerkId === todo.userId);
      const myShare = todo.sharedWith?.find(
        (s: { userId: string }) => s.userId === userId
      );
      return {
        ...todo.toObject(),
        ownerName: owner?.name || "Unknown",
        myPermission: myShare?.permission || "view",
      };
    });

    return NextResponse.json(todosWithOwner);
  } catch (error) {
    console.error("GET /api/todos/shared-with-me error:", error);
    return NextResponse.json({ error: "Failed to get shared todos" }, { status: 500 });
  }
}
