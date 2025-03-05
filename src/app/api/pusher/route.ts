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
      const { gameId, homeTeamPercentage, awayTeamPercentage } = await req.json();
  
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