import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";

// GET conversation list — friends with last message and unread count
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const currentUser = await User.findOne({ clerkId: userId });
    const friendIds = currentUser?.friends || [];

    if (friendIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get friend details
    const friends = await User.find({ clerkId: { $in: friendIds } })
      .select("clerkId name email avatar")
      .lean();

    // Get last message for each friend
    const conversations = await Promise.all(
      friends.map(async (friend) => {
        const lastMessage = await Message.findOne({
          $or: [
            { from: userId, to: friend.clerkId },
            { from: friend.clerkId, to: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await Message.countDocuments({
          from: friend.clerkId,
          to: userId,
          read: false,
        });

        return {
          friend: {
            clerkId: friend.clerkId,
            name: friend.name,
            avatar: friend.avatar,
          },
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                from: lastMessage.from,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
        };
      })
    );

    // Sort: unread first, then by last message time
    conversations.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("GET /api/chat error:", error);
    return NextResponse.json({ error: "Failed to get conversations" }, { status: 500 });
  }
}
