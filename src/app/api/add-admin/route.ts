import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const client = await db.connect();
  const { searchParams } = new URL(req.url);
  const admin_id = searchParams.get('admin_id');
 
  try {
    if (!admin_id) throw new Error('admin_id required');

    const parsedadmin_id = parseInt(admin_id);
    await client.sql`INSERT INTO admins (admin_id) VALUES (${parsedadmin_id}) ON CONFLICT (admin_id) DO NOTHING;`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
 
  const admins = await client.sql`SELECT * FROM admins;`;
  client.release();
  return NextResponse.json({ admins: admins.rows}, { status: 200 });
}