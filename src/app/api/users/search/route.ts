import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    await dbConnect();

    // Escape special regex characters to prevent ReDoS
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Search in our local User collection first
    const localUsers = await User.find({
      clerkId: { $ne: userId },
      $or: [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ],
    })
      .select("clerkId name email avatar")
      .limit(10);

    // Also search Clerk for users who may not have synced yet
    try {
      const clerk = await clerkClient();
      const clerkUsers = await clerk.users.getUserList({
        query: q,
        limit: 10,
      });

      const localClerkIds = new Set(localUsers.map((u) => u.clerkId));

      // Sync any Clerk users we find that aren't in our DB yet
      for (const cu of clerkUsers.data) {
        if (cu.id !== userId && !localClerkIds.has(cu.id)) {
          const name = `${cu.firstName || ""} ${cu.lastName || ""}`.trim() || cu.username || "User";
          const email = cu.emailAddresses[0]?.emailAddress || "";
          const avatar = cu.imageUrl || "";

          // Upsert into our DB
          await User.findOneAndUpdate(
            { clerkId: cu.id },
            { clerkId: cu.id, name, email, avatar },
            { upsert: true, returnDocument: "after" }
          );

          localUsers.push({
            clerkId: cu.id,
            name,
            email,
            avatar,
          } as typeof localUsers[0]);
        }
      }
    } catch {
      // Clerk search failed, just use local results
    }

    return NextResponse.json(localUsers);
  } catch (error) {
    console.error("GET /api/users/search error:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
