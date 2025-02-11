import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
//import bcrypt from 'bcryptjs';
 
export async function GET(req: Request) {
  let client;

  try {
    client = await db.connect();
    const data = await req.json();
    const { username, email, password, role, points = 0, rank, start_date } = data;

    if ( !username || !role || !email || !password || !start_date ){
      return NextResponse.json({ success: false, message: 'Missing fields required: username, email, password, role, and start_date' }, { status: 404 });
    }

    //const hashedPass = await bcrypt.hash(password, 10);

    await client.query(
      `INSERT INTO users (username, email, password, role, points, ranking, start_date)
      VALUES (${username}, ${email}, ${password}, ${role}, ${points}, ${rank}, ${start_date})
      ON CONFLICT (email) DO NOTHING;`);

    return NextResponse.json({ success: true, message: 'User creation: Success' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  } finally {
    if(client) client.release();
  }

}