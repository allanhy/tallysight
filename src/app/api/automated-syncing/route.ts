// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import { handleAllGamesDone } from '@/lib/handleAllGamesDone/handleAllGamesDone';

export async function GET(req: NextRequest) {
  try {
          await handleAllGamesDone();
          console.log('Cron for auto update points: success');
          //return NextResponse.json({ message: 'Points updated successfully' });
    } catch (error) {
        console.error('Cron for auto update points failed:', error);
        /*return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to update points', 
                error: error instanceof Error ? error.message : String(error),
            }, 
            { status: 500 }
        );
        */
    }
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

    return NextResponse.json({
      success: true,
      message: "Automated sync completed successfully",
      sync: syncResult,
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