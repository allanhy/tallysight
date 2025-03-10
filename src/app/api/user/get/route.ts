import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Extract clerkId from query parameters
    const url = new URL(req.url);
    const clerkId = url.searchParams.get("clerkId");

    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: "Missing clerkId parameter" },
        { status: 400 }
      );
    }

    // Check if the user exists in the database
    const result = await sql`
      SELECT EXISTS (
        SELECT 1 FROM users WHERE clerk_id = ${clerkId}
      ) AS user_exists;
    `;

    const userExists = result.rows[0]?.user_exists ?? false;

    return NextResponse.json({ success: true, exists: userExists });
  } catch (error) {
    console.error("Error in GET /api/user/check:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
