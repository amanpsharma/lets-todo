import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import FriendRequest from "@/models/FriendRequest";
import User from "@/models/User";
import { createNotification } from "@/lib/notify";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { toUserId } = await request.json();

    if (!toUserId) {
      return NextResponse.json({ error: "Target user ID required" }, { status: 400 });
    }

    if (toUserId === userId) {
      return NextResponse.json({ error: "Cannot send request to yourself" }, { status: 400 });
    }

    await dbConnect();

    // Check if target user exists
    const targetUser = await User.findOne({ clerkId: toUserId });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already friends
    const currentUser = await User.findOne({ clerkId: userId });
    if (currentUser?.friends?.includes(toUserId)) {
      return NextResponse.json({ error: "Already friends" }, { status: 400 });
    }

    // Check for existing request in either direction
    const existing = await FriendRequest.findOne({
      $or: [
        { from: userId, to: toUserId, status: "pending" },
        { from: toUserId, to: userId, status: "pending" },
      ],
    });

    if (existing) {
      return NextResponse.json({ error: "Request already exists" }, { status: 400 });
    }

    const friendRequest = await FriendRequest.create({
      from: userId,
      to: toUserId,
      status: "pending",
    });

    // Notify the recipient about the friend request
    await createNotification({
      userId: toUserId,
      type: "shared",
      title: "Friend Request",
      body: `${currentUser?.name || "Someone"} sent you a friend request`,
      link: "/dashboard/friends",
    });

    return NextResponse.json(friendRequest, { status: 201 });
  } catch (error) {
    console.error("POST /api/friends/request error:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
