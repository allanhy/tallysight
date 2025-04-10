import { POST } from "../../../src/app/api/admin/syncSportsRadarData/route";
import { sql } from "@vercel/postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

describe("Integration: POST /api/syncSportsRadarData", () => {
  const mockGame = {
    id: "integration_test_rockies_brewers",
    team1Name: "Colorado Rockies", // must match ESPN team names
    team2Name: "Milwaukee Brewers",
    gameDate: new Date("2025-04-10T00:40:00.000Z"),
    sport: "MLB",
  };

  beforeAll(async () => {
    // Clean up any previous test entries
    await sql`DELETE FROM "Game" WHERE id = ${mockGame.id}`;

    await sql`
      INSERT INTO "Game" (id, "team1Name", "team2Name", "gameDate", sport)
      VALUES (
        ${mockGame.id},
        ${mockGame.team1Name},
        ${mockGame.team2Name},
        ${mockGame.gameDate.toISOString()},
        ${mockGame.sport}
      )
    `;
  });

  afterAll(async () => {
    await sql`DELETE FROM "Game" WHERE id = ${mockGame.id}`;
  });

  it(
    "updates a real game record after syncing ESPN",
    async () => {
      const req = {
        json: async () => ({
          gameIds: [], // allow sync to process all ESPN games
        }),
      } as any;

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.results)).toBe(true);

      const updatedGame = await sql`
        SELECT * FROM "Game"
        WHERE "team1Name" = ${mockGame.team1Name}
          AND "team2Name" = ${mockGame.team2Name}
          AND DATE("gameDate") = DATE(${mockGame.gameDate.toISOString()})
      `;

      expect(updatedGame.rows.length).toBeGreaterThan(0);
      expect(updatedGame.rows[0].winner).not.toBeNull();
      expect(updatedGame.rows[0].final_score).toMatch(/\d+-\d+/);
    },
    20000 // ⏱ Extend timeout
  );
});
