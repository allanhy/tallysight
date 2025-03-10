import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres"; // Ensure this is correct for your setup

export async function GET() {
  try {
    const now = new Date();

    // Convert UTC time to EST (UTC-5)
    // EST is UTC-5 for non daylight saving, -4 for during daylight saving
    const estOffset =
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        timeZoneName: "short",
      })
        .formatToParts(now)
        .find((part) => part.type === "timeZoneName")?.value === "EST"
        ? -5
        : -4;

    const today = new Date(now.getTime() + estOffset * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Calculate tomorrow based on today
    const tomorrow = new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const userCountResult = await sql`
    SELECT COUNT(DISTINCT p."userId") AS uniqueUsers
    FROM "Pick" p
    JOIN "Game" g ON p."gameId" = g.id
    WHERE DATE(g."gameDate") = ${today}
    OR DATE(g."gameDate") = ${tomorrow}
;
  `;

    const uniqueUsers = userCountResult.rows[0]?.uniqueusers || 0;

    if (uniqueUsers < 2) {
      return NextResponse.json({
        message: "There is not enough data",
        data: [],
      });
    }

    // Query to get all game picks for today's games
    const picksData = await sql`
        SELECT 
          g.id AS gameId,
          g."team1Name" AS homeTeamId,
          g."team2Name" AS awayTeamId,
          COUNT(CASE WHEN recent_picks."teamIndex" = 0 THEN 1 END) AS homePicks,
          COUNT(CASE WHEN recent_picks."teamIndex" = 1 THEN 1 END) AS awayPicks,
          COUNT(recent_picks.id) AS totalPicks
        FROM "Game" g
        JOIN (
            SELECT DISTINCT ON (p."userId", p."gameId") 
                p.id, p."gameId", p."userId", p."teamIndex", p."createdAt"
            FROM "Pick" p
            ORDER BY p."userId", p."gameId", p."createdAt" DESC
        ) AS recent_picks ON g.id = recent_picks."gameId"
        WHERE DATE(g."gameDate") = ${today} 
            OR DATE(g."gameDate") = ${tomorrow}
        GROUP BY g.id, g."team1Name", g."team2Name";
        `;

    // Transform data into percentages
    const percentageData = picksData.rows.map((row) => ({
      gameId: row.gameid,
      homeTeamPercentage:
        row.totalpicks > 0
          ? ((row.homepicks / row.totalpicks) * 100).toFixed(2) + "%"
          : "0%",
      awayTeamPercentage:
        row.totalpicks > 0
          ? ((row.awaypicks / row.totalpicks) * 100).toFixed(2) + "%"
          : "0%",
    }));

    return NextResponse.json({ data: percentageData });
  } catch (error) {
    console.error("Error fetching pick percentages:", error);
    return NextResponse.json(
      { error: "Failed to retrieve pick percentages" },
      { status: 500 }
    );
  }
}
