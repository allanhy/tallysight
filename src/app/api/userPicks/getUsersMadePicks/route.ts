import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(req: Request){
    let client;

    try {
        client = await db.connect();
        const { searchParams } = new URL(req.url);
        const sport = searchParams.get('sport');

        if(!sport){
            return NextResponse.json({ success: false, message: 'Missing required field: sport'});
        }
        
        // Get picks made this sport, week and year
        const clerkIds = await client.query(
            `SELECT DISTINCT p."userId" AS "clerkId"
            FROM "Pick" p
            JOIN "Game" g ON p."gameId" = g.id
            WHERE p.sport = $1
             AND EXTRACT(WEEK FROM g."gameDate") = EXTRACT(WEEK FROM CURRENT_DATE)
             AND EXTRACT(YEAR FROM g."gameDate") = EXTRACT(YEAR FROM CURRENT_DATE)
            `
        , [sport]);

        console.log("who made picks?");
        for(let i = 0; i < clerkIds.rows.length; i++){
            console.log(clerkIds.rows[i]);
        }

        if(clerkIds.rows.length === 0){
            return NextResponse.json({ success: false, message: 'No users found that made picks for this sport and week' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: clerkIds.rows }, { status: 200 });
    } catch (error) {
        console.error("Error fetching users who made picks", error);
        return NextResponse.json({ success: false, message: 'Internal Server Error: ' + error }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}