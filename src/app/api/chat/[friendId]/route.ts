import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import { createNotification } from "@/lib/notify";

// GET messages between current user and friend
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ friendId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { friendId } = await params;
    await dbConnect();

    // Verify they are friends
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser?.friends?.includes(friendId)) {
      return NextResponse.json({ error: "Not friends" }, { status: 403 });
    }

    // Get cursor for pagination
    const { searchParams } = new URL(req.url);
    const before = searchParams.get("before");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const query: Record<string, unknown> = {
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId },
      ],
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Mark unread messages from friend as read
    await Message.updateMany(
      { from: friendId, to: userId, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({
      messages: messages.reverse(),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error("GET /api/chat error:", error);
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 });
  }
}

// DELETE chat history with a friend
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ friendId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { friendId } = await params;
    await dbConnect();

    // Delete all messages between the two users
    const result = await Message.deleteMany({
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId },
      ],
    });

    return NextResponse.json({ deleted: result.deletedCount });
  } catch (error) {
    console.error("DELETE /api/chat error:", error);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}

// POST a new message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ friendId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { friendId } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    await dbConnect();

    // Verify they are friends
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser?.friends?.includes(friendId)) {
      return NextResponse.json({ error: "Not friends" }, { status: 403 });
    }

    const message = await Message.create({
      from: userId,
      to: friendId,
      content: content.trim(),
    });

    // Notify the recipient
    await createNotification({
      userId: friendId,
      type: "chat",
      title: "New message",
      body: `${currentUser.name || "Someone"}: ${content.trim().slice(0, 80)}${content.trim().length > 80 ? "..." : ""}`,
      link: `/dashboard/chat/${userId}`,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
