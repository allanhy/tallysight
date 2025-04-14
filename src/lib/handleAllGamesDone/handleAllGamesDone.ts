type Sport = 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'MLS' | 'EPL' | 'LALIGA' | 'LIGUE_1' | 'BUNDESLIGA' | 'SERIE_A'

export async function handleAllGamesDone() {
    const getCurrentWeek = () => {
        const date: Date = new Date();
        const startDate: Date = new Date(date.getFullYear(), 0, 1);
        const days: number = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    };

    // Sports to cycle through
    const sports: Sport[] = [
        'NBA', 'NFL', 'MLB', 'NHL', 'MLS',
        'EPL', 'LALIGA', 'LIGUE_1', 'BUNDESLIGA', 'SERIE_A'
    ];

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Update points for all sports
    for(const currSport of sports){
        try {
            // Get list of users who made picks 
            const usersMadePicksRes = await fetch(`${BASE_URL}/api/userPicks/getUsersMadePicks?sport=${currSport}`);
            const madePicksClerkIds = await usersMadePicksRes.json();

            let clerkIds;
            if(usersMadePicksRes.status !== 404 && !usersMadePicksRes.ok){
                throw new Error('Failed to get users who made picks this week');
            } else if(usersMadePicksRes.status === 404) {
                console.warn("No users found who made picks for this sport and week");
                continue;
            } else {
                clerkIds = madePicksClerkIds.data;
            }

            if(clerkIds.length !== 0){
                for(let i = 0; i < clerkIds.length; i++){
                    try{
                        // Check if each user has leaderboard entry, if not create one
                        const updateEntryResponse = await fetch(`${BASE_URL}/api/leaderboard-entries/verifyEntry`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ clerk_id: clerkIds[i].clerkId, sport: currSport, week: getCurrentWeek() }),
                        });

                        const updateEntryData = await updateEntryResponse.json();
                        if (!updateEntryResponse.ok) {
                            throw new Error(updateEntryData.message || 'Failed to update user entry in leaderboard');
                        }
                    } catch(error){
                        console.error('Error in verifying/creating leaderboard entries', error instanceof Error ? error.message : 'Failed to verify/create user leaderboard entry');
                    }
                }
            }

            // Execute points updates
            const [updateUserPointsResponse] = await Promise.all([
                fetch(`${BASE_URL}/api/leaderboard-entries/updateEntryPoints`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sport: currSport, week: getCurrentWeek() }),
                }),
            ]);

            const updateUserPointsData = await updateUserPointsResponse.json();
            if (!updateUserPointsResponse.ok) {
                throw new Error(updateUserPointsData.message || 'Failed to update user total & entry points');
            }
        } catch (error) {
            console.error('Error in handleAllGamesDone:', error instanceof Error ? error.message : 'Failed to submit picks');
        }
    }
}
