import { POST } from "../../../src/app/api/admin/syncSportsRadarData/route";
import { sql } from "@vercel/postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

describe("Integration: POST /api/admin/syncSportsRadarData", () => {
  const mockGame = {
    id: "401695149",
    team1Name: "Team A", 
    team2Name: "Team B",
    gameDate: new Date("2025-04-14T00:00:00.000Z"), 
    sport: "MLB",
  };

  beforeAll(async () => {
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
    "updates a game record with final score and winner from ESPN sync",
    async () => {
      const req = {
        json: async () => ({
          gameIds: [], // sync all games, not filtered by ID
        }),
      } as any;

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.results)).toBe(true);

      const updated = await sql`
        SELECT * FROM "Game"
        WHERE id = ${mockGame.id}
      `;

      const updatedGame = updated.rows[0];

      expect(updatedGame).toBeDefined();
      expect(updatedGame.final_score).toMatch(/^\d+-\d+$/);
      expect(typeof updatedGame.winner).toBe("boolean");
    },
    20000
  );
});
