// __tests__/api/admin.test.ts

import { POST as sendEmail } from "../../src/app/admin/send-email/route";
import { DELETE as deleteUser } from "../../src/app/admin/delete-user/route";
import { GET as getUsers } from "../../src/app/admin/get-users/route";

import { auth } from "@clerk/nextjs/server";
import sgMail from "@sendgrid/mail";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));
jest.mock("@vercel/postgres", () => ({
  sql: jest.fn(),
}));
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

global.fetch = jest.fn();

describe("🛠️ Admin Routes", () => {
  beforeAll(() => {
    process.env.SENDGRID_SENDER_EMAIL = "noreply@example.com";
    process.env.CLERK_SECRET_KEY = "clerk-secret-key";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------- Send Email ----------
  describe("POST /api/admin/send-email", () => {
    it("returns 400 if missing fields", async () => {
      const req = { json: async () => ({}) } as unknown as Request;
      const res = await sendEmail(req);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.error).toMatch(/missing/i);
    });

    it("returns 200 on success", async () => {
      (sgMail.send as jest.Mock).mockResolvedValue(undefined);
      const req = {
        json: async () => ({
          subject: "Hi",
          body: "Hello",
          recipients: ["test@example.com"],
        }),
      } as unknown as Request;
      const res = await sendEmail(req);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.message).toMatch(/sent/i);
    });

    it("returns 500 on failure", async () => {
      (sgMail.send as jest.Mock).mockRejectedValue(new Error("Send fail"));
      const req = {
        json: async () => ({
          subject: "Hi",
          body: "Hello",
          recipients: ["fail@example.com"],
        }),
      } as unknown as Request;
      const res = await sendEmail(req);
      const json = await res.json();
      expect(res.status).toBe(500);
      expect(json.error).toMatch(/failed/i);
    });
  });

  // ---------- Delete User ----------
  describe("DELETE /api/admin/delete-user", () => {
    it("returns 401 if unauthenticated", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });
      const req = { json: async () => ({ userId: "target123" }) } as any;
      const res = await deleteUser(req);
      const json = await res.json();
      expect(res.status).toBe(401);
    });

    it("returns 403 if not admin", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user1" });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ public_metadata: { role: "user" } }),
      });
      const req = { json: async () => ({ userId: "target123" }) } as any;
      const res = await deleteUser(req);
      const json = await res.json();
      expect(res.status).toBe(403);
    });

    it("returns 200 on successful deletion", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: "admin123" });

      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes("admin123")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ public_metadata: { role: "admin" } }),
          });
        }
        if (url.includes("target123")) {
          return Promise.resolve({ ok: true });
        }
      });

      const req = { json: async () => ({ userId: "target123" }) } as any;
      const res = await deleteUser(req);
      const json = await res.json();
      expect(res.status).toBe(200);
    });
  });

  // ---------- Get Users ----------
  describe("GET /api/admin/get-users", () => {
    it("returns 401 if unauthenticated", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });
      const res = await getUsers();
      const json = await res.json();
      expect(res.status).toBe(401);
    });

    it("returns 403 if not admin", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: "abc" });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ public_metadata: { role: "user" } }),
      });
      const res = await getUsers();
      const json = await res.json();
      expect(res.status).toBe(403);
    });

    it("returns list of formatted users", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: "admin123" });

      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes("admin123")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ public_metadata: { role: "admin" } }),
          });
        }
        if (url.includes("/v1/users?")) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              {
                id: "u1",
                first_name: "Jane",
                last_name: "Doe",
                username: "janedoe",
                email_addresses: [{ email_address: "jane@example.com" }],
              },
            ],
          });
        }
      });

      const res = await getUsers();
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
      expect(json[0].email).toBe("jane@example.com");
    });
  });
});
