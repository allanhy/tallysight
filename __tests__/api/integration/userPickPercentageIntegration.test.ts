import { sql } from "@vercel/postgres";
import * as postgres from "@vercel/postgres";
import { GET } from "../../../src/app/api/userPickPercentage/route";
import { POST as POSTSelectionUpdate } from "../../../src/app/api/pusher/route";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

jest.mock("pusher", () => {
    return jest.fn().mockImplementation(() => ({
        trigger: jest.fn().mockResolvedValue({}),
    }));
});

const originalSql = postgres.sql; // Save the real sql function

describe("Integration: User Pick Percentages (Real or Mock Games)", () => {
    let gameIdsToUse: string[] = [];
    let insertedMockGames = false;

    beforeAll(async () => {
        // Try to find at least 2 real games today or tomorrow
        const gamesResult = await sql`
        SELECT id, sport FROM "Game"
        WHERE "gameDate" >= NOW() AND "gameDate" <= NOW() + INTERVAL '2 days'
        ORDER BY "gameDate" ASC
        LIMIT 2
        `;    

        const realGames = gamesResult.rows;

        if (realGames.length >= 2) {
            console.log("✅ Found real games:", realGames.map((g) => g.id));
            gameIdsToUse = realGames.map((g) => g.id);

            // Insert test picks for each real game
            await Promise.all(
                gameIdsToUse.map(async (gameId, idx) => {
                    await sql`
                        INSERT INTO "Pick" (id, "userId", "gameId", "teamIndex", "createdAt", sport)
                        VALUES 
                        (${`testpick_${idx}_1`}, ${`testuser_${idx}_1`}, ${gameId}, 0, NOW(), 'NBA'),
                        (${`testpick_${idx}_2`}, ${`testuser_${idx}_2`}, ${gameId}, 1, NOW(), 'NBA')
                    `;
                })
            );
        } else {
            console.log("⚠️ Not enough real games found. Inserting mock games...");

            insertedMockGames = true;
            gameIdsToUse = ["mock_game_1", "mock_game_2"];

            // Insert two mock games (different sports)
            await sql`
                INSERT INTO "Game" (id, "team1Name", "team2Name", "gameDate", sport)
                VALUES
                ('mock_game_1', 'Mock Lakers', 'Mock Celtics', NOW(), 'NBA'),
                ('mock_game_2', 'Mock Dodgers', 'Mock Yankees', NOW(), 'MLB')
            `;

            // Insert test picks for each mock game
            await sql`
                INSERT INTO "Pick" (id, "userId", "gameId", "teamIndex", "createdAt", sport)
                VALUES 
                ('testpick_0_1', 'testuser_0_1', 'mock_game_1', 0, NOW(), 'NBA'),
                ('testpick_0_2', 'testuser_0_2', 'mock_game_1', 1, NOW(), 'NBA'),
                ('testpick_1_1', 'testuser_1_1', 'mock_game_2', 0, NOW(), 'MLB'),
                ('testpick_1_2', 'testuser_1_2', 'mock_game_2', 1, NOW(), 'MLB')
            `;
        }
    });

    afterAll(async () => {
        // Clean up test picks
        const pickIds = gameIdsToUse.flatMap((_, idx) => [
            `testpick_${idx}_1`,
            `testpick_${idx}_2`,
        ]);

        await sql`
            DELETE FROM "Pick"
            WHERE id = ANY(${pickIds as any})
        `;

        // If we inserted mock games, clean them up too
        if (insertedMockGames) {
            await sql`
            DELETE FROM "Game"
            WHERE id IN ('mock_game_1', 'mock_game_2')
        `;
        }
    });

    it("should correctly calculate pick percentages for multiple games", async () => {
        const res = await GET();
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.data.length).toBeGreaterThanOrEqual(gameIdsToUse.length);

        for (const gameId of gameIdsToUse) {
            const gamePick = json.data.find((g: any) => g.gameId === gameId);
            expect(gamePick).toBeDefined();
            expect(gamePick.homeTeamPercentage).toBeDefined();
            expect(gamePick.awayTeamPercentage).toBeDefined();

            console.log("✅ Pick percentages for game:", gameId, gamePick);
        }
    });

    it("❌ should return 500 if database cannot be accessed", async () => {
        // Temporarily mock sql to simulate a database failure
        (postgres.sql as any) = jest.fn(async () => {
            throw new Error("Simulated database failure");
        });
    
        const res = await GET();
        const json = await res.json();
    
        console.log("❌ Simulated DB failure response:", json);
    
        expect(res.status).toBe(500);
        expect(json).toHaveProperty("error", "Failed to retrieve pick percentages");
    
        // Restore the real sql after the test
        (postgres.sql as any) = originalSql;
    });
    

    it("should handle a bulk update correctly", async () => {
        const req = new Request("http://localhost/api/selectionUpdate", {
            method: "POST",
            body: JSON.stringify({
                type: "bulk-update",
                updates: [
                    { gameId: "game1", homeTeamPercentage: 50, awayTeamPercentage: 50 },
                    { gameId: "game2", homeTeamPercentage: 65, awayTeamPercentage: 35 },
                ],
            }),
            headers: { "Content-Type": "application/json" },
        });

        const res = await POSTSelectionUpdate(req);
        const json = await res.json();
        console.log("🧪 Bulk update response:", json);
        expect(res.status).toBe(200);
        expect(json.message).toBe("Bulk update sent");
    });

    it("❌ should return 400 for invalid bulk update payload", async () => {
        const req = new Request("http://localhost/api/selectionUpdate", {
            method: "POST",
            body: JSON.stringify({
                type: "bulk-update",
                updates: "not-an-array", // ❌ Invalid payload
            }),
            headers: { "Content-Type": "application/json" },
        });

        const res = await POSTSelectionUpdate(req);
        const json = await res.json();

        console.log("❌ Invalid bulk update response:", json);

        expect(res.status).toBe(400);
        expect(json).toHaveProperty("error");
    });

});
