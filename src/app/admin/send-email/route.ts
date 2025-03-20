import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    const { subject, body, recipients } = await req.json();

    if (!subject || !body || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const msg = {
      to: recipients, // Array of recipient emails
      from: process.env.SENDGRID_SENDER_EMAIL!, // Verified sender email in SendGrid
      subject: subject,
      text: body,
      html: `<p>${body}</p>`, // Supports HTML formatting
    };

    await sgMail.send(msg);

    return NextResponse.json({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
  }
}
