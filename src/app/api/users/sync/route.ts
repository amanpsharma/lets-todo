import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await dbConnect();

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        clerkId: userId,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "User",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        avatar: clerkUser.imageUrl || "",
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error("POST /api/users/sync error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
