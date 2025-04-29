import { POST } from "../../../src/app/api/admin/syncSportsRadarData/route";
import { sql } from "@vercel/postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

describe("Integration: POST /api/admin/syncSportsRadarData (Live ESPN)", () => {
  let realGame: any;

  beforeAll(async () => {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard');
    const data = await res.json();

    if (!data.events || data.events.length === 0) {
      console.warn('⚠️ No MLB games found in ESPN API for today. Skipping test.');
      return;
    }

    const event = data.events.find((e: any) => e.status?.type?.completed === true);

    if (!event) {
      console.warn('⚠️ No completed MLB games available yet. Skipping test.');
      return;
    }

    realGame = {
      id: event.id,
      homeTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.team?.shortDisplayName || "Home",
      awayTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.team?.shortDisplayName || "Away",
      gameDate: new Date(event.date),
    };

    await sql`DELETE FROM "Game" WHERE id = ${realGame.id}`;
    await sql`
      INSERT INTO "Game" (id, "team1Name", "team2Name", "gameDate", sport)
      VALUES (${realGame.id}, ${realGame.homeTeam}, ${realGame.awayTeam}, ${realGame.gameDate.toISOString()}, 'MLB')
    `;
  });

  afterAll(async () => {
    if (realGame) {
      await sql`DELETE FROM "Game" WHERE id = ${realGame.id}`;
    }
  });

  it(
    "should update the real ESPN game with final score and winner if completed",
    async () => {
      if (!realGame) {
        console.warn('⚠️ No real game available. Skipping test.');
        return;
      }

      const req = {
        json: async () => ({
          gameIds: [], // sync all games
        }),
      } as any;

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      const updated = await sql`
        SELECT * FROM "Game"
        WHERE id = ${realGame.id}
      `;

      const updatedGame = updated.rows[0];

      expect(updatedGame).toBeDefined();

      if (updatedGame.final_score !== null) {
        expect(updatedGame.final_score).toMatch(/^\d+-\d+$/);
      } else {
        console.warn(`⚠️ Final score missing for game ID ${realGame.id}`);
      }

      expect(typeof updatedGame.winner).toBe("boolean");
    },
    20000
  );

  it(
    "should return 500 if ESPN fetch fails (mocked failure)",
    async () => {
      const originalFetch = global.fetch; // save the real fetch
  
      // Mock fetch failure
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "ESPN Server Error" }),
      });
  
      const req = {
        json: async () => ({
          gameIds: [],
        }),
      } as any;
  
      const res = await POST(req);
      const json = await res.json();
  
      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/Failed to fetch ESPN data/i);
  
      global.fetch = originalFetch; // 🔥 restore fetch back after test
    },
    10000
  );
  
});
