import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres"; // Ensure this is correct for your setup

export async function GET() {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    const userCountResult = await sql`
    SELECT COUNT(DISTINCT p."userId") AS uniqueUsers
    FROM "Pick" p
    JOIN "Game" g ON p."gameId" = g.id
    WHERE DATE(g."gameDate") = ${today};
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
