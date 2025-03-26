// Import necessary modules
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Authorization check
  const authHeader = req.headers.get("Authorization");
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {    
      const reminderRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-pick-reminders`, {
        method: "GET",
        headers: {
          Authorization: expectedToken,
        },
      });
      
      const reminderResult = await reminderRes.json();

    return NextResponse.json({
      success: true,
      message: "Automated pick reminders completed successfully",
      reminder: reminderResult,
    });
  } catch (error) {
    console.error("Automated sync error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to run automated reminders",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}