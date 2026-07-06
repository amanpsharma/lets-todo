import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/models/Todo";

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const { orderedIds } = await request.json();

    const operations = orderedIds.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: id, userId },
        update: { order: index },
      },
    }));

    await Todo.bulkWrite(operations);
    return NextResponse.json({ message: "Reordered" });
  } catch (error) {
    console.error("PUT /api/todos/reorder error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}
