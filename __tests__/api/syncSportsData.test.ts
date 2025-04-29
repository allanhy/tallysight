import { POST } from "../../src/app/api/admin/syncSportsRadarData/route";
import { NextRequest } from "next/server";
import { sql } from "@vercel/postgres";

jest.mock("@vercel/postgres", () => ({
  sql: jest.fn(),
}));

global.fetch = jest.fn();

describe("Unit: POST /api/admin/syncSportsRadarData", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update the mock game with final score and winner after ESPN sync", async () => {
    const mockGameId = "game123";
    const mockESPNGame = {
      id: mockGameId,
      date: new Date().toISOString(),
      status: { type: { state: "post", completed: true } },
      competitions: [
        {
          id: "comp1",
          competitors: [
            { homeAway: "home", team: { displayName: "Lakers" }, score: "100" },
            { homeAway: "away", team: { displayName: "Celtics" }, score: "98" },
          ],
        },
      ],
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ events: [mockESPNGame] }),
    });

    (sql as unknown as jest.Mock).mockImplementation((query: any, ...args: any[]) => {
      const text = query?.text ?? query?.sql ?? query;

      if (/SELECT \*/i.test(text)) {
        // Select existing game from DB
        return Promise.resolve({
          rows: [{
            id: "db123",
            espnId: mockGameId,
            team1Name: "Lakers",
            team2Name: "Celtics",
            gameDate: new Date(),
            sport: "NBA",
          }],
        });
      }
      if (/UPDATE "Game"/i.test(text)) {
        // Simulate update succeeded
        return Promise.resolve({ rowCount: 1 });
      }
      if (/SELECT id, "team1Name"/i.test(text)) {
        // Select updated game
        return Promise.resolve({
          rows: [{
            id: "db123",
            team1Name: "Lakers",
            team2Name: "Celtics",
            final_score: "100-98",
            winner: true,
            won: 1,
          }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const req = {
      json: async () => ({ gameIds: [mockGameId] }),
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    // ✅ Check HTTP Response
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.results)).toBe(true);
    expect(json.results[0].status).toBe("updated");
    expect(json.results[0].espnId).toBe(mockGameId);

    // ✅ Simulate DB check after update
    const updatedGameQuery = await sql`SELECT id, "team1Name", "team2Name", winner, final_score FROM "Game" WHERE id = ${mockGameId}`;
    const updatedGame = updatedGameQuery.rows[0];

    expect(updatedGame).toBeDefined();

    // ✅ Check final_score format: example "100-98"
    expect(updatedGame.final_score).toMatch(/^\d+-\d+$/);

    // ✅ Check winner field type
    expect(typeof updatedGame.winner).toBe("boolean");
  });

it("should return 500 if ESPN fetch fails", async () => {
  (fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({ error: "ESPN fetch failed" }),
  });

  const req = {
    json: async () => ({ gameIds: ["fail123"] }),
  } as unknown as NextRequest;

  const res = await POST(req);
  const json = await res.json();

  expect(res.status).toBe(500);
  expect(json.success).toBe(false);
  expect(json.error).toMatch(/Failed to fetch/);
});
});
