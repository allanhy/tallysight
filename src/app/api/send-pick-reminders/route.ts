import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import sgMail, { MailDataRequired } from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(req: NextRequest) {
  const client = await pool.connect();

  try {
    const now = new Date();

    // Fetch today's games
    const { rows: games } = await client.query<{
      id: string;
      team1Name: string;
      team2Name: string;
      gameTime: string;
    }>(
      `
      SELECT "id", "team1Name", "team2Name", "gameTime"
      FROM "Game"
      WHERE "gameDate" = CURRENT_DATE
    `
    );

    if (!games.length) {
      return NextResponse.json({ message: 'No games today.' });
    }

    // Get all users from Clerk
    const userRes = await fetch('https://api.clerk.com/v1/users', {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY || ''}`,
      },
    });

    if (!userRes.ok) throw new Error('Failed to fetch users from Clerk');

    const clerkUsers = await userRes.json();
    const gameIds = games.map((g) => g.id);

    let emailsSent = 0;

    for (const user of clerkUsers) {
      const userId = user.id;
      const email = user.email_addresses?.[0]?.email_address;
      const name = user.first_name || 'there';
      if (!email) continue;

      const { rows: picks } = await client.query<{ gameId: string }>(
        `
        SELECT "gameId" FROM "Pick"
        WHERE "userId" = $1 AND "gameId" = ANY($2::text[])
      `,
        [userId, gameIds]
      );

      const pickedGameIds = picks.map((p) => p.gameId);
      const missedGames = games.filter((g) => !pickedGameIds.includes(g.id));

      const reminderGames = missedGames.filter((g) => {
        const gameTime = new Date(`${now.toDateString()} ${g.gameTime}`);
        const diff = gameTime.getTime() - now.getTime();
        return diff > 60 * 60 * 1000 && diff <= 2 * 60 * 60 * 1000;
      });

      if (!reminderGames.length) continue;

      const personalizedList = reminderGames.map((g) => {
        const timeStr = new Date(`${now.toDateString()} ${g.gameTime}`).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `${g.team1Name} vs ${g.team2Name} at ${timeStr}`;
      });

      const msg: MailDataRequired = {
        to: email,
        from: 'olivegardencsus@gmail.com',
        templateId: process.env.SENDGRID_TEMPLATE_ID || '',
        dynamicTemplateData: {
          name,
          games: personalizedList,
          picksLink: 'https://tallysight-og.vercel.app/daily-picks',
          unsubscribeLink: 'https://tallysight-og.vercel.app/unsubscribe',
        },
      };

      try {
        await sgMail.send(msg);
        console.log(`✅ Email sent to ${email} (${name}) with ${personalizedList.length} games`);
        emailsSent++;
      } catch (error: any) {
        console.error(` Failed to send email to ${email}:`, error?.response?.body || error.message);
      }
    }

    return NextResponse.json({ message: ` Sent ${emailsSent} reminder email(s).` });
  } catch (err) {
    console.error('[Reminder Email Error]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
