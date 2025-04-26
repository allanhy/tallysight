import { GET } from "../../../src/app/api/all-espn-games/route";
import { NextRequest } from "next/server";

// 🎯 Supported sports and endpoints
const sportsToTest = {
  MLB: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb",
  NBA: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba",
  NFL: "https://site.api.espn.com/apis/site/v2/sports/football/nfl",
  NHL: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl",
  MLS: "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1",
  EPL: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1",
  LALIGA: "https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1",
  BUNDESLIGA: "https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1",
  SERIE_A: "https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1",
  LIGUE_1: "https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1",
};

describe("Integration (Live): GET /api/all-espn-games", () => {
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const todayStr = formatDate(new Date());
  const tomorrowStr = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)); // +1 day

  const validDateVariants = [todayStr, tomorrowStr];
  const sportKeys = Object.keys(sportsToTest);

  // ✅ Valid Tests
  test.each(
    sportKeys.flatMap((sport) => validDateVariants.map((date) => [sport, date]))
  )(
    "✅ Valid Input: fetches %s games correctly for %s",
    async (sportKey, dateStr) => {
      const sport = sportKey.toLowerCase();
      const url = new URL(
        `http://localhost/api/all-espn-games?sport=${sport}&specificDate=${dateStr}`
      );
      const req = { url: url.toString() } as Request;

      const res = await GET(req as NextRequest);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(json.games)).toBe(true);

      if (json.games.length > 0) {
        const game = json.games[0];
        expect(game).toHaveProperty("homeTeam");
        expect(game).toHaveProperty("awayTeam");
        expect(game).toHaveProperty("status");
        expect(game).toHaveProperty("fullDate");
      } else {
        expect(json.message).toMatch(/no games/i);
      }
    },
    20000
  );

  // ❌ Invalid Tests

  test("❌ Invalid sport returns 400", async () => {
    const url = new URL(
      "http://localhost/api/all-espn-games?sport=invalidsport"
    );
    const req = { url: url.toString() } as Request;

    const res = await GET(req as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toMatch(/invalid sport/i);
  });

  test("❌ Invalid date format returns 400", async () => {
    const url = new URL(
      "http://localhost/api/all-espn-games?sport=nba&specificDate=04-25-2025"
    );
    const req = { url: url.toString() } as Request;

    const res = await GET(req as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toMatch(/invalid date format/i);
  });

  test("❌ Missing sport parameter returns 400", async () => {
    const url = new URL(
      "http://localhost/api/all-espn-games?specificDate=2025-04-25"
    );
    const req = { url: url.toString() } as Request;

    const res = await GET(req as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toMatch(/invalid sport/i);
  });

  test("✅ Valid sport but empty games returns empty array", async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    const futureStr = futureDate.toISOString().split("T")[0];

    const url = new URL(
      `http://localhost/api/all-espn-games?sport=nba&specificDate=${futureStr}`
    );
    const req = { url: url.toString() } as Request;

    const res = await GET(req as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.games).toEqual([]);
    expect(json.message).toMatch(/no games/i);
  });

  test("✅ With today returns games for that today", async () => {
    const sport = "mlb";
    const url = new URL(
      `http://localhost/api/all-espn-games?sport=${sport}&day=$today`
    );
    const req = { url: url.toString() } as Request;

    const res = await GET(req as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json.games)).toBe(true);
  });
   test("✅ With specificDate returns games for that day", async () => {
    const sport = "mlb";
    const url = new URL(
      `http://localhost/api/all-espn-games?sport=${sport}&specificDate=${todayStr}`
    );
    const req = { url: url.toString() } as Request;

    const res = await GET(req as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json.games)).toBe(true);
  });

  test("❌ ESPN fetch error returns 500", async () => {
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockRejectedValueOnce(new Error("ESPN API is down"));

    const url = new URL(
      "http://localhost/api/all-espn-games?sport=nba"
    );
    const req = { url: url.toString() } as Request;

    const res = await GET(req as NextRequest);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.message || json.error).toMatch(/error fetching games/i);

    fetchSpy.mockRestore();
  });
});
