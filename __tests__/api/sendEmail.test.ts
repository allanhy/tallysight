import { POST } from "../../src/app/admin/send-email/route"; 
import sgMail from "@sendgrid/mail";

jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe("POST /admin/send-email", () => {
  const mockRecipients = ["test@example.com"];
  const mockSubject = "Test Subject";
  const mockBody = "Test email content";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if required fields are missing", async () => {
    const req = {
      json: async () => ({
        subject: "",
        body: "",
        recipients: [],
      }),
    } as unknown as Request;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/missing required fields/i);
  });

  it("sends email successfully and returns 200", async () => {
    (sgMail.send as jest.Mock).mockResolvedValueOnce(true);

    const req = {
      json: async () => ({
        subject: mockSubject,
        body: mockBody,
        recipients: mockRecipients,
      }),
    } as unknown as Request;

    process.env.SENDGRID_SENDER_EMAIL = "admin@yourapp.com";

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toMatch(/emails sent successfully/i);

    expect(sgMail.send).toHaveBeenCalledWith({
      to: mockRecipients,
      from: "admin@yourapp.com",
      subject: mockSubject,
      text: mockBody,
      html: `<p>${mockBody}</p>`,
    });
  });

  it("returns 500 if SendGrid fails", async () => {
    (sgMail.send as jest.Mock).mockRejectedValueOnce(new Error("SendGrid failure"));

    const req = {
      json: async () => ({
        subject: mockSubject,
        body: mockBody,
        recipients: mockRecipients,
      }),
    } as unknown as Request;

    process.env.SENDGRID_SENDER_EMAIL = "admin@yourapp.com";

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toMatch(/failed to send emails/i);
  });
});
