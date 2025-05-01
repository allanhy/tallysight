// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import { handleAllGamesDone } from '@/lib/handleAllGamesDone/handleAllGamesDone';

export async function GET(req: NextRequest) {
  // Authorization check
  const authHeader = req.headers.get("Authorization");
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const syncRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/syncSportsRadarData`, {
        method: "POST",
        headers: {
          Authorization: expectedToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameIds: [] }), // or any actual value
    });    
    const syncResult = await syncRes.json();

    // for point handling
    await handleAllGamesDone();
    console.log('Cron for auto update points: success');

    return NextResponse.json({
      success: true,
      message: "Automated sync completed successfully",
      sync: syncResult,
    });
  } catch (error) {
    console.error("Automated sync/points update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to run automated sync/points update",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}