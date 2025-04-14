/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

const Sport = ['NBA', 'NFL', 'MLB', 'NHL', 'MLS', 'EPL', 'LALIGA', 'LIGUE_1', 'BUNDESLIGA', 'SERIE_A'];
 
export async function POST(req: Request) {
  let client;
  
  try{
    client = await db.connect();

    const currentWeek = getCurrentWeek();
    const startDate = new Date();

    for (const sport of Sport) {
      // Check if leaderboard has been created
      const checkExist = await client.query(
        `SELECT leaderboard_id FROM leaderboards WHERE sport = $1 AND week = $2`,
        [sport, currentWeek]
      );

      if(checkExist.rowCount === 0){
        await client.query(
          `INSERT INTO leaderboards (name, sport, week, start_date, description)
          VALUES ($1, $2, $3, $4, $5)`,
          [`${sport} - Week ${currentWeek}`, sport, currentWeek, startDate, `Leaderboard for ${sport} - Week ${currentWeek}`]
        );
        console.log(`Leaderboard created for ${sport} - Week ${currentWeek}`);
      }
    }

    return NextResponse.json({ success: true, data: 'Weekly Leaderboards Verified'}, {status: 201});
  } catch (error) {
      console.error('Error creating leaderboards:', error);
      return NextResponse.json(
        {sucess: false, message: 'Internal Server Error,', error}, {status: 500}
      );
  } finally {
    if(client) client.release();
  }
}

// Function to calculate current week of the year
function getCurrentWeek(): number {
  const date = new Date();
  const startDate = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + 1) / 7);
}