import { DELETE } from "../../src/app/admin/delete-user/route";
import { NextRequest } from "next/server";
import { sql } from "@vercel/postgres";
import { auth as mockAuth } from "@clerk/nextjs/server";

// Mocks
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

jest.mock("@vercel/postgres", () => ({
  sql: jest.fn(),
}));

describe("DELETE /api/admin/delete-user", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    (mockAuth as unknown as jest.Mock).mockResolvedValue({ userId: null });

    const req = {
      json: async () => ({ userId: "targetUser123" }),
    } as unknown as NextRequest;

    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toMatch(/unauthorized/i);
  });

  it("returns 400 if target user ID is missing", async () => {
    (mockAuth as unknown as jest.Mock).mockResolvedValue({ userId: "admin123" });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ public_metadata: { role: "admin" } }),
    });

    const req = {
      json: async () => ({}),
    } as unknown as NextRequest;

    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/user id is required/i);
  });

  it("returns 403 if authenticated user is not an admin", async () => {
    (mockAuth as unknown as jest.Mock).mockResolvedValue({ userId: "notadmin123" });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ public_metadata: { role: "user" } }), // <-- not admin
    });

    const req = {
      json: async () => ({ userId: "targetUser123" }),
    } as unknown as NextRequest;

    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/access denied/i);
  });

  it("returns 200 if user is successfully deleted", async () => {
    (mockAuth as unknown as jest.Mock).mockResolvedValue({ userId: "admin123" });

    global.fetch = jest.fn()
      // Admin check
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ public_metadata: { role: "admin" } }),
      })
      // Deletion call
      .mockResolvedValueOnce({ ok: true });

    const req = {
      json: async () => ({ userId: "targetUser123" }),
    } as unknown as NextRequest;

    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toMatch(/deleted successfully/i);
    expect((sql as unknown as jest.Mock).mock.calls[0][0][0]).toMatch(/DELETE FROM users/);
  });

  it("returns 500 if Clerk user deletion fails", async () => {
    (mockAuth as unknown as jest.Mock).mockResolvedValue({ userId: "admin123" });

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ public_metadata: { role: "admin" } }),
      })
      .mockResolvedValueOnce({ ok: false });

    const req = {
      json: async () => ({ userId: "targetUser123" }),
    } as unknown as NextRequest;

    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toMatch(/internal server error/i);
  });
});
