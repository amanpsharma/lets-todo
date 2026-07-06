import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import FriendRequest from "@/models/FriendRequest";
import User from "@/models/User";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    // Get current user's friends list
    const currentUser = await User.findOne({ clerkId: userId });
    const friendIds = currentUser?.friends || [];

    // Get friend user details
    const friends = await User.find({ clerkId: { $in: friendIds } }).select(
      "clerkId name email avatar"
    );

    // Get pending requests received
    const pendingReceived = await FriendRequest.find({
      to: userId,
      status: "pending",
    });

    // Get sender details for pending requests
    const senderIds = pendingReceived.map((r) => r.from);
    const senders = await User.find({ clerkId: { $in: senderIds } }).select(
      "clerkId name email avatar"
    );

    const pendingRequests = pendingReceived.map((req) => {
      const sender = senders.find((s) => s.clerkId === req.from);
      return {
        _id: req._id,
        from: req.from,
        fromUser: sender
          ? { name: sender.name, email: sender.email, avatar: sender.avatar }
          : null,
        status: req.status,
        createdAt: req.createdAt,
      };
    });

    // Get pending requests sent
    const pendingSent = await FriendRequest.find({
      from: userId,
      status: "pending",
    });

    const recipientIds = pendingSent.map((r) => r.to);
    const recipients = await User.find({ clerkId: { $in: recipientIds } }).select(
      "clerkId name email avatar"
    );

    const sentRequests = pendingSent.map((req) => {
      const recipient = recipients.find((r) => r.clerkId === req.to);
      return {
        _id: req._id,
        to: req.to,
        toUser: recipient
          ? { name: recipient.name, email: recipient.email, avatar: recipient.avatar }
          : null,
        status: req.status,
        createdAt: req.createdAt,
      };
    });

    return NextResponse.json({
      friends,
      pendingRequests,
      sentRequests,
    });
  } catch (error) {
    console.error("GET /api/friends error:", error);
    return NextResponse.json({ error: "Failed to get friends" }, { status: 500 });
  }
}
