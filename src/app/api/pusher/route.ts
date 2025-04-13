import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "",
  useTLS: true
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.type === "bulk-update" && Array.isArray(body.updates)) {
      await pusher.trigger("selection-updates", "bulk-update", {
        updates: body.updates,
      });

      return NextResponse.json({ message: "Bulk update sent" }, { status: 200 });
    }

    const { gameId, homeTeamPercentage, awayTeamPercentage } = body;

    if (!gameId || homeTeamPercentage === undefined || awayTeamPercentage === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await pusher.trigger("selection-updates", "update", {
      gameId,
      homeTeamPercentage,
      awayTeamPercentage
    });

    return NextResponse.json({ message: "Update sent" }, { status: 200 });
  } catch (error) {
    console.error("Error triggering Pusher:", error);
    return NextResponse.json({ error: "Failed to send update" }, { status: 500 });
  }
}
