import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import FriendRequest from "@/models/FriendRequest";
import User from "@/models/User";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { action } = await request.json();

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await dbConnect();

    const friendRequest = await FriendRequest.findById(id);
    if (!friendRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (friendRequest.to !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (friendRequest.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    if (action === "accept") {
      friendRequest.status = "accepted";
      await friendRequest.save();

      // Add each user to the other's friends list
      await User.findOneAndUpdate(
        { clerkId: userId },
        { $addToSet: { friends: friendRequest.from } }
      );
      await User.findOneAndUpdate(
        { clerkId: friendRequest.from },
        { $addToSet: { friends: userId } }
      );
    } else {
      friendRequest.status = "rejected";
      await friendRequest.save();
    }

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error("PUT /api/friends/[id] error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
