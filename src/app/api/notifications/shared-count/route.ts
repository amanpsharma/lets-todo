import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/models/Todo";

// GET count of todos shared with the current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const count = await Todo.countDocuments({
      "sharedWith.userId": userId,
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("GET /api/notifications/shared-count error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
