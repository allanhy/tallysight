// /api/user/postClerk-Database.ts
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let client;
  try {
    client = await db.connect();
    const data = await req.json();
    const { clerkId, email } = data;

    if (!clerkId || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: clerkId and email' },
        { status: 400 }
      );
    }

    // verify account is not already in database
    const findAccount = await client.query(`
    SELECT *
    FROM users
    WHERE clerk_id = $1`,[clerkId]);

    if(findAccount.rows.length === 0) {
      await client.query(`
        INSERT INTO users (clerk_id, email, username, password, role)
        VALUES (${clerkId}, ${email}, ${email.split('@')[0]}, ${'clerk-auth'}, ${1})
        ON CONFLICT (email) DO UPDATE 
        SET clerk_id = EXCLUDED.clerk_id
        RETURNING *;
      `);

      return NextResponse.json(
        { success: true, message: 'User created successfully' },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: true, message: 'User already in database' },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/user/post:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
