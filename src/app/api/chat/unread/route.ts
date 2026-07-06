import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";

// GET unread message counts grouped by sender
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const unreadCounts = await Message.aggregate([
      { $match: { to: userId, read: false } },
      { $group: { _id: "$from", count: { $sum: 1 } } },
    ]);

    // Convert to { friendId: count } map
    const counts: Record<string, number> = {};
    let total = 0;
    for (const item of unreadCounts) {
      counts[item._id] = item.count;
      total += item.count;
    }

    return NextResponse.json({ counts, total });
  } catch (error) {
    console.error("GET /api/chat/unread error:", error);
    return NextResponse.json({ error: "Failed to get unread counts" }, { status: 500 });
  }
}
