import { POST } from "../../src/app/api/admin/syncSportsRadarData/route";
import { NextRequest } from "next/server";
import { sql } from "@vercel/postgres";

jest.mock("@vercel/postgres", () => ({
  sql: jest.fn(),
}));

global.fetch = jest.fn();

describe("POST /api/admin/syncSportsRadarData", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns success and updates game from ESPN data", async () => {
    const mockGameId = "game123";
    const mockESPNGame = {
      id: mockGameId,
      date: new Date().toISOString(),
      status: { type: { state: "post", completed: true } },
      competitions: [{
        id: "comp1",
        competitors: [
          { homeAway: "home", team: { displayName: "Lakers" }, score: "100" },
          { homeAway: "away", team: { displayName: "Celtics" }, score: "98" },
        ],
      }],
    };

    // Mock ESPN fetch calls for all 10 leagues
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ events: [mockESPNGame] }),
    });

    // Mock SQL query returning one matching game from DB
    (sql as unknown as jest.Mock).mockImplementation((query: any, ...args: any[]) => {
      const text = query?.text ?? query?.sql ?? query;
      if (/SELECT \*/i.test(text)) {
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
        return Promise.resolve({ rowCount: 1 });
      }
      if (/SELECT id, "team1Name"/i.test(text)) {
        return Promise.resolve({
          rows: [{
            id: "db123",
            team1Name: "Lakers",
            team2Name: "Celtics",
            winner: false,
            won: 0,
            final_score: "100-98",
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

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.results)).toBe(true);
    expect(json.results[0].status).toBe("updated");
    expect(json.results[0].espnId).toBe(mockGameId);
  });

  it("returns 500 on ESPN fetch failure", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("ESPN fetch failed"));

    const req = {
      json: async () => ({ gameIds: ["fail123"] }),
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/ESPN fetch failed/);
  });
});
