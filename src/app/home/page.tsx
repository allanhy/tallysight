{/* this is the home page also known as the contests page that wil let you enter into the picks
as well as go to the leaderboards and MyPicks page
*/}

import Leaderboard from "../components/leaderboard";

export default function Home() {
    return (
        <div className="grid grid-rows-[20px_1fr_300px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-white">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <div className="flex flex-col gap-4">
                    <div className="bg-white h-32 w-full" style={{height: '200px ', width: '750px', opacity: 1, transform: 'translateY(100px)'}}/> {/* the most white container */}
                    <div className="bg-gray-200 h-32 w-full" style={{height: '200px ', width: '750px',opacity: 0.75, transform: 'translateY(150px)'}}/> {/* the second most white container */}
                    <div className="bg-gray-400 h-32 w-96" style={{height: '200px ',width: '750px',opacity: 0.5, transform: 'translateY(200px)'}}/>    {/* the third most white container */}
                    <div className="bg-gray-600 h-32 w-96" style={{height: '200px ',width: '750px', opacity: 0.25, transform: 'translateY(250px)'}}/>   
                    
                    <div className="relative transform translate-y-56">
                        <Leaderboard />
                    </div>
                </div>
            </main>
        </div>
    );
}