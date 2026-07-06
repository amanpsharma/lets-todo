import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Todo from "@/models/Todo";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const [total, completed, categories, priorities] = await Promise.all([
      Todo.countDocuments({ userId }),
      Todo.countDocuments({ userId, completed: true }),
      Todo.distinct("category", { userId }),
      Todo.aggregate([
        { $match: { userId } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
    ]);

    const overdue = await Todo.countDocuments({
      userId,
      completed: false,
      dueDate: { $lt: new Date(), $ne: null },
    });

    return NextResponse.json({
      total,
      completed,
      active: total - completed,
      overdue,
      categories,
      priorities: priorities.reduce(
        (acc, p) => ({ ...acc, [p._id]: p.count }),
        {}
      ),
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  } catch (error) {
    console.error("GET /api/todos/stats error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}
