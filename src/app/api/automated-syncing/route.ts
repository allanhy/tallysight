// Import necessary modules
import { NextRequest, NextResponse } from "next/server";

import { POST as syncGames } from "@/app/api/admin/syncSportsRadarData/route";
import { GET as sendReminders } from "@/app/api/send-pick-reminders/route"; 
export async function GET(req: NextRequest) {
  // Authorization check
  const authHeader = req.headers.get("Authorization");
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const syncResult = await syncGames(req);
    const reminderResult = await sendReminders(req);

    return NextResponse.json({
      success: true,
      message: "Automated sync and pick reminders completed successfully",
      sync: syncResult,
      reminder: reminderResult,
    });
  } catch (error) {
    console.error("Automated sync error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to run automated sync or reminders",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
