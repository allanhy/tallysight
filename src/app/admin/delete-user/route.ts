import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@vercel/postgres";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body to get the userId to delete
    const { userId: targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get admin user details
    const adminUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then(res => res.json());

    // Check if the requesting user is an admin
    if (!adminUser.public_metadata?.role || adminUser.public_metadata.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Admins only." }, { status: 403 });
    }

    // Delete the user from Clerk
    const deleteResponse = await fetch(`https://api.clerk.dev/v1/users/${targetUserId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!deleteResponse.ok) {
      throw new Error("Failed to delete user from Clerk");
    }

    await sql`
      DELETE FROM users WHERE clerk_id = ${targetUserId}
    `;
    
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
