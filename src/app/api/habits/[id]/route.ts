import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Habit from "@/models/Habit";
import { format, subDays } from "date-fns";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // If toggling completion for a date, recalculate streak
    if (body.toggleDate) {
      const habit = await Habit.findOne({ _id: id, userId });
      if (!habit)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

      const dateStr = body.toggleDate;
      const idx = habit.completedDates.indexOf(dateStr);
      if (idx >= 0) {
        habit.completedDates.splice(idx, 1);
      } else {
        habit.completedDates.push(dateStr);
      }

      // Calculate current streak
      let streak = 0;
      let checkDate = new Date();
      const completedSet = new Set(habit.completedDates);

      // If today isn't completed, start checking from yesterday
      const todayStr = format(checkDate, "yyyy-MM-dd");
      if (!completedSet.has(todayStr)) {
        checkDate = subDays(checkDate, 1);
      }

      while (completedSet.has(format(checkDate, "yyyy-MM-dd"))) {
        streak++;
        checkDate = subDays(checkDate, 1);
      }

      habit.streak = streak;
      if (streak > habit.bestStreak) {
        habit.bestStreak = streak;
      }

      await habit.save();
      return NextResponse.json(habit);
    }

    const habit = await Habit.findOneAndUpdate({ _id: id, userId }, body, {
      returnDocument: "after",
    });
    if (!habit)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(habit);
  } catch (error) {
    console.error("PUT /api/habits/[id] error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;

    const habit = await Habit.findOneAndDelete({ _id: id, userId });
    if (!habit)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE /api/habits/[id] error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
