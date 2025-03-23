import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function GET() {
  try {
    const { userId } = await auth();
    console.log('Auth check - userId:', userId);

    if (!userId) {
      console.log('No userId found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user details to verify admin status
    console.log('Fetching user details for:', userId);
    const adminUser = await clerkClient.users.getUser(userId);
    console.log('Admin check - user details:', {
      id: adminUser.id,
      publicMetadata: adminUser.publicMetadata,
      hasMetadata: !!adminUser.publicMetadata,
      role: adminUser.publicMetadata?.role
    });

    if (!adminUser?.publicMetadata?.role || adminUser.publicMetadata.role !== "admin") {
      console.log('Access denied - Invalid role:', {
        hasMetadata: !!adminUser.publicMetadata,
        role: adminUser.publicMetadata?.role
      });
      return NextResponse.json(
        { error: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    let allUsers: any[] = [];

    // Fetch all users from Clerk
    const usersResponse = await clerkClient.users.getUserList({
      limit: 100,
      offset: 0
    });

    if (!Array.isArray(usersResponse)) {
      throw new Error("Invalid response from Clerk API");
    }

    allUsers = usersResponse;
    
    // Format users
    const formattedUsers = allUsers.map((user: any) => ({
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.emailAddresses[0]?.emailAddress || "No email",
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
