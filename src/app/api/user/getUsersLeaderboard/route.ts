import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(req: Request) {
  let client;

  try {
    client = await db.connect();
    const { searchParams } = new URL(req.url);
    const userIds = searchParams.get('user_id');

    // Updating rank before getting users
    await client.query(`
      UPDATE users
      SET rank = subquery.rank
      FROM (
          SELECT user_id, DENSE_RANK() OVER (ORDER BY points DESC) AS rank
          FROM users
      ) AS subquery
      WHERE users.user_id = subquery.user_id;
    `);

    let query = `SELECT * FROM users`;
    let values;

    if(userIds){
      const idArray = userIds.split(',').map(id => parseInt(id.trimEnd(), 10));
      query += ` WHERE user_id = ANY($1)`;
      values = [idArray];
    }

    // Making sure ranking/points order is correct
    query += ` ORDER BY rank ASC, points DESC`;
    
    const users = await client.query(query, values);
    

    if (users.rows.length == 0){
      return NextResponse.json({ success: false, message: 'No users available' }, { status: 404});
    }
    return NextResponse.json({ success: true, data: users.rows }, { status:200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error Fetching Users' + error }, { status: 500 });
  } finally {
    if(client) client.release();
  }
}