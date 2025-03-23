import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user details to verify admin status
    const adminUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then((res) => res.json());

    if (
      !adminUser.public_metadata?.role ||
      adminUser.public_metadata.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    let allUsers: any[] = [];
    let offset = 0;
    const limit = 100; // Clerk allows a maximum of 100 users per request

    // Fetch all users from Clerk
    const usersResponse = await fetch(
        `https://api.clerk.dev/v1/users?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        }
      );

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users from Clerk");
      }

      const users = await usersResponse.json();

      allUsers = [...allUsers, ...users];
      offset += limit;
    
    // Format users
    const formattedUsers = allUsers.map((user: any) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      email: user.email_addresses[0]?.email_address || "No email",
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}