import { GET } from "../../src/app/api/automated-syncing/route";
import { NextRequest } from "next/server";

jest.mock("node-fetch", () => jest.fn());
global.fetch = jest.fn();

const mockEnvToken = "my-secret-token";
process.env.CRON_SECRET = mockEnvToken;
process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";

describe("GET /api/automated-syncing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if authorization token is missing or incorrect", async () => {
    const url = new URL("http://localhost/api/admin/cron-sync");
    const req = {
      url: url.toString(),
      headers: new Headers({ Authorization: "Bearer wrong-token" }),
    } as unknown as NextRequest;

    const res = await GET(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toMatch(/unauthorized/i);
  });

  it("returns 200 and syncs successfully if authorized", async () => {
    const mockSyncResponse = { synced: true, syncedGames: 3 };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSyncResponse,
    });

    const url = new URL("http://localhost/api/admin/cron-sync");
    const req = {
      url: url.toString(),
      headers: new Headers({ Authorization: `Bearer ${mockEnvToken}` }),
    } as unknown as NextRequest;

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/automated sync completed/i);
    expect(json.sync).toEqual(mockSyncResponse);
  });

  it("returns 500 if fetch to sync route fails", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("Internal sync error"));

    const url = new URL("http://localhost/api/admin/cron-sync");
    const req = {
      url: url.toString(),
      headers: new Headers({ Authorization: `Bearer ${mockEnvToken}` }),
    } as unknown as NextRequest;

    const res = await GET(req);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/failed to run/i);
    expect(json.error).toMatch(/internal sync error/i);
  });
});
