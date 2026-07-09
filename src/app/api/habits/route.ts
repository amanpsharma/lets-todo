import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Habit from "@/models/Habit";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const habits = await Habit.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(habits);
  } catch (error) {
    console.error("GET /api/habits error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    const habit = await Habit.create({ ...body, userId });
    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("POST /api/habits error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
