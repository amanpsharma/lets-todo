import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/models/Todo";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const priority = searchParams.get("priority") || "";
    const status = searchParams.get("status") || "";

    const filter: Record<string, unknown> = { userId };

    if (search) {
      // Escape special regex characters to prevent ReDoS
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
        { tags: { $elemMatch: { $regex: escaped, $options: "i" } } },
      ];
    }

    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status === "completed") filter.completed = true;
    if (status === "active") filter.completed = false;

    const todos = await Todo.find(filter).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(todos);
  } catch (error) {
    console.error("GET /api/todos error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const body = await request.json();
    const count = await Todo.countDocuments({ userId });
    body.order = count;
    body.userId = userId;

    // Stamp addedBy on any subtasks created with the todo
    if (body.subtasks && body.subtasks.length > 0) {
      const user = await User.findOne({ clerkId: userId }).select("clerkId name avatar");
      const userInfo = user
        ? { userId: user.clerkId, name: user.name, avatar: user.avatar || "" }
        : { userId, name: "You", avatar: "" };
      body.subtasks = body.subtasks.map((s: { id: string; title: string; completed: boolean }) => ({
        ...s,
        addedBy: userInfo,
        completedBy: null,
      }));
    }

    const todo = await Todo.create(body);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("POST /api/todos error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}
