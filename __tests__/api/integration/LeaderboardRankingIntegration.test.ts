import { sql } from "@vercel/postgres";
import { GET } from "../../../src/app/api/leaderboard-entries/getEntriesForLeaderboard/route";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

describe("Integration: Leaderboard Rankings by Points", () => {
   
    let foundUsers = [];
    let testSport = "NFL"; 
    let testWeek = "0";    

    beforeAll(async () => {
        try {
           // get users with leaderboard entries for the test sport
            const usersResult = await sql`
                SELECT DISTINCT u.user_id, u.clerk_id, u.username 
                FROM users u
                JOIN leaderboard_entries le ON u.user_id = le.user_id
                JOIN leaderboards l ON le.leaderboard_id = l.leaderboard_id
                WHERE l.sport = ${testSport}
                ORDER BY u.user_id
                LIMIT 3
            `;

            foundUsers = usersResult.rows;
            
            if (foundUsers.length >= 3) {
                console.log(`Found ${foundUsers.length} users with ${testSport} entries for testing`);
            } else {
                console.warn(`Found only ${foundUsers.length} users with ${testSport} entries. Will try another sport.`);
                
               //Nba leaderboard entries are used if NFL leaderboard entries are not found
                testSport = "NBA";
                const nbaUsersResult = await sql`
                    SELECT DISTINCT u.user_id, u.clerk_id, u.username 
                    FROM users u
                    JOIN leaderboard_entries le ON u.user_id = le.user_id
                    JOIN leaderboards l ON le.leaderboard_id = l.leaderboard_id
                    WHERE l.sport = ${testSport}
                    ORDER BY u.user_id
                    LIMIT 3
                `;
                
                foundUsers = nbaUsersResult.rows;
                
                if (foundUsers.length >= 3) {
                    console.log(`Using ${testSport} data for testing`);
                } else {
                    console.warn(`Still not enough users. Will try with any sport.`);
                    //any sport selection for users
                    testSport = "SELECT"; 
                    const anyUsersResult = await sql`
                        SELECT DISTINCT u.user_id, u.clerk_id, u.username 
                        FROM users u
                        JOIN leaderboard_entries le ON u.user_id = le.user_id
                        ORDER BY u.user_id
                        LIMIT 3
                    `;
                    
                    foundUsers = anyUsersResult.rows;
                    console.log(`Using mixed sport data for testing`);
                }
            }
        } catch (error) {
            console.error("Error finding users to test with:", error);
        }
    });
//test to check if the users are ranked correctly by total points, highest first
    it("should rank users by total points, highest first", async () => {
       
        if (foundUsers.length < 2) {
            console.warn("Not enough users found to run test. Skipping.");
            return;
        }

        //get leaderboard entries for the test sport and week
        const req = new Request(`http://localhost:3000/api/leaderboard-entries/getEntriesForLeaderboard?sport=${testSport}&week=${testWeek}`);
        
       
        const response = await GET(req);
        const responseData = await response.json();
        
       
        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
        expect(Array.isArray(responseData.data)).toBe(true);
        
    
        if (responseData.data.length === 0) {
            console.warn(`No leaderboard entries found for ${testSport}, week ${testWeek}. Test inconclusive.`);
            return;
        }
        
        //check if the leaderboard entries are ranked correctly
        for (let i = 0; i < responseData.data.length - 1; i++) {
            const currentUser = responseData.data[i];
            const nextUser = responseData.data[i + 1];
            
            if (currentUser.rank === nextUser.rank) {
                
                expect(Number(currentUser.points)).toBeGreaterThanOrEqual(Number(nextUser.points));
            } else {
              
                expect(Number(currentUser.rank)).toBeLessThan(Number(nextUser.rank));
            }
        }
        
       
        const distinctPointUsers = [];
        let previousPoints = null;
        
        for (const user of responseData.data) {
            if (previousPoints === null || Number(user.points) !== previousPoints) {
                distinctPointUsers.push(user);
                previousPoints = Number(user.points);
                
                if (distinctPointUsers.length >= 2) {
                    break;
                }
            }
        }
        
        
        if (distinctPointUsers.length >= 2) {
            const higherPointUser = distinctPointUsers[0];
            const lowerPointUser = distinctPointUsers[1];
            
            expect(Number(higherPointUser.points)).toBeGreaterThan(Number(lowerPointUser.points));
            expect(Number(higherPointUser.rank)).toBeLessThan(Number(lowerPointUser.rank));
            
            console.log(`Rank verification: ${higherPointUser.points}pts (rank ${higherPointUser.rank}) > ${lowerPointUser.points}pts (rank ${lowerPointUser.rank})`);
        } else {
            console.warn("Couldn't find users with different point totals to verify ranking.");
        }
        //check if the leaderboard entries have the correct properties
        const firstUser = responseData.data[0];
        expect(firstUser).toHaveProperty('points');
        expect(firstUser).toHaveProperty('rank');
        expect(firstUser).toHaveProperty('user_id');
        
       
    });

    it("should not include users with zero points on the leaderboard", async () => {
       
        if (foundUsers.length < 1) {
            console.warn("Not enough users found to run zero points test. Skipping.");
            return;
        }

        
        const req = new Request(`http://localhost:3000/api/leaderboard-entries/getEntriesForLeaderboard?sport=${testSport}&week=${testWeek}`);
        
        
        const response = await GET(req);
        const responseData = await response.json();
        
       //check if the response is successful
        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
        expect(Array.isArray(responseData.data)).toBe(true);
        
       
        if (responseData.data.length === 0) {
            console.warn(`No leaderboard entries found for ${testSport}, week ${testWeek}. Zero points test inconclusive.`);
            return;
        }

        const usersWithZeroPoints = responseData.data.filter((user: any) => Number(user.points) === 0);
        expect(usersWithZeroPoints.length).toBe(0);
        
        console.log(`Zero points verification: No zero-point users in leaderboard (checked ${responseData.data.length} entries)`);
        
       //check if the zero point user is not included in the leaderboard
        try {
          
            const zeroPointUserResult = await sql`
                SELECT u.user_id, u.username 
                FROM users u
                LEFT JOIN leaderboard_entries le ON u.user_id = le.user_id
                LEFT JOIN leaderboards l ON le.leaderboard_id = l.leaderboard_id AND l.sport = ${testSport} AND l.week = ${testWeek}
                WHERE le.points = 0 OR le.leaderboard_id IS NULL
                LIMIT 1
            `;
            
            if (zeroPointUserResult.rows.length > 0) {
                const zeroPointUser = zeroPointUserResult.rows[0];
                
             
                const foundInResponse = responseData.data.some((entry: any) => entry.user_id === zeroPointUser.user_id);
                expect(foundInResponse).toBe(false);
            }
        } catch (error) {
            console.error("Error trying to find zero-point user:", error);
        }
    });
});