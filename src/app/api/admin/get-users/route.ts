import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function GET() {
  try {
    const { userId } = await auth();
    console.log('[API] Auth check - userId:', userId);

    if (!userId) {
      console.log('[API] No userId found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user details to verify admin status
    console.log('[API] Fetching user details for:', userId);
    const adminUser = await clerkClient.users.getUser(userId);
    console.log('[API] Admin check - user details:', {
      id: adminUser.id,
      publicMetadata: adminUser.publicMetadata,
      hasMetadata: !!adminUser.publicMetadata,
      role: adminUser.publicMetadata?.role
    });

    if (!adminUser?.publicMetadata?.role || adminUser.publicMetadata.role !== "admin") {
      console.log('[API] Access denied - Invalid role:', {
        hasMetadata: !!adminUser.publicMetadata,
        role: adminUser.publicMetadata?.role
      });
      return NextResponse.json(
        { error: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    try {
      // Fetch all users from Clerk
      console.log('[API] Fetching user list');
      const usersResponse = await clerkClient.users.getUserList();
      console.log('[API] Raw users response:', usersResponse);

      if (!Array.isArray(usersResponse)) {
        console.error('[API] Invalid response from Clerk API - not an array');
        throw new Error("Invalid response from Clerk API");
      }

      if (usersResponse.length === 0) {
        console.log('[API] No users found in Clerk');
        return NextResponse.json([]);
      }

      console.log(`[API] Found ${usersResponse.length} users`);
      
      // Format users
      const formattedUsers = usersResponse.map((user: any) => {
        const emailAddress = user.emailAddresses?.[0]?.emailAddress || "No email";
        console.log(`[API] Formatting user:`, {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: emailAddress
        });
        
        return {
          id: user.id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          username: user.username || "",
          email: emailAddress,
        };
      });

      console.log('[API] Returning formatted users:', formattedUsers);
      return NextResponse.json(formattedUsers);
    } catch (clerkError) {
      console.error('[API] Error fetching users from Clerk:', clerkError);
      throw clerkError;
    }
  } catch (error) {
    console.error("[API] Error in GET handler:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
} 