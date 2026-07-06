import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/models/Todo";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const todo = await Todo.findById(id);
    if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("GET /api/todos/share/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch shared todo" }, { status: 500 });
  }
}
