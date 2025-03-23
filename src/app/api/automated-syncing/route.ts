// Import necessary modules
import { NextRequest, NextResponse } from "next/server";

// Import your existing sync logic
import { POST as syncGames } from "@/app/api/admin/syncSportsRadarData/route";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Trigger the sync logic directly
    const syncResult = await syncGames(req);

    return NextResponse.json({
      success: true,
      message: "Automated sync completed successfully",
      result: syncResult,
    });
  } catch (error) {
    console.error("Automated sync error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to run automated sync",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
