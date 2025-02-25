/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image'
import styles from '../styles/leaderboardProfiles.module.css';

interface user {
    rank: number;
    username: string;
    img: string;
    points: number;
    max_points: number;
    performance: string;
}

interface leaderboardProfileProps {
    userIds: number[];
}

export default function LeaderboardProfiles({ userIds = []}: leaderboardProfileProps) {
    const [users, setUsers] = useState<user[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<number>(0); // Timestamp for updating leaderboard

    useEffect(() =>{
        if (userIds.length === 0){
            setLoading(false);
            setError('No user_ids provided');
            return;
        }

        const fetchUsers = async () => {
            try {
                const queryStr = `user_id=${userIds.join(',')}`;
                const res = await fetch(`/api/user/getUsersLeaderboard?${queryStr}`);
                const data = await res.json();

                if (res.ok) {
                    setUsers(data.data); // { success: true, data: [...] }
                } else {
                    setError(data.message || 'Users Fetch: Failed');
                }
            } catch (error) {
                setError(`Network error fetching users: ${error}`);
            }
            setLoading(false);
        };

        fetchUsers();
    }, [userIds]);

    const updateUserPerformance = async(username: string, points: number, max_points: number) => {
        try {
            const response = await fetch('/api/user/updatePerformance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, points, max_points }),
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'Failed to update performance');
            }

            console.log('Performance updated:', data.message);
            return {success: true, data: data};
        } catch (error) {
            setError(`Failed to update performance: ${error}`);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error updating performance' };
        }
    };

    const updateAllUserPerformance = useCallback(async() => {
        try{
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const updatedUsers = await Promise.all(users.map(user => updateUserPerformance(user.username, user.points, user.max_points)));
            setLastUpdated(Date.now());
            console.log('Daily performance update complete:');
        } catch (error) {
            console.error('Error updating performance for users:', error);
        }
    }, [users]);

    // Update leaderboard daily
    useEffect(() => { 
        const currentTime = Date.now();
        const sinceUpdate = currentTime - lastUpdated;

        if (sinceUpdate > 86400000) // More than 24hrs
            updateAllUserPerformance();

        const interval = setInterval(() => {
            updateAllUserPerformance();
        }, 86400000)

        return () => clearInterval(interval);
    }, [lastUpdated, updateAllUserPerformance]);


    if (loading) return <div>Loading users...</div>;
    if (error) return <div className='error'>{error}</div>;

    return (
        <div id='profile' className='profile'>
            {users?.length > 0 ? <Item data={users}/> : <div>No data available</div>}
        </div>
    );
}

function Item({ data }: { data: user[] }) {
    // Double check sorting
    const sortedData = [...data].sort((a, b) => a.rank - b.rank);
    
    return(
        <>
            {sortedData.map((user) => (
                <div className={styles.profile} key={`${user.username}-${user.rank}`}>
                    <div className={styles.rank}>{user.rank}</div>
                    <Image 
                        src={getImageSrc(user.img)} 
                        alt={`Profile image of ${user.username}`} 
                        loading='lazy'
                        width={60} 
                        height={60}
                        className={styles.image}/>
                    <div className={styles.username}>{user.username}</div>
                    <div className={styles.performance}>{user.performance}%</div>
                    <div className={styles.points}>{user.points}</div>
                </div>
            ))}
        </>
    );
}

function getImageSrc(img: string){
    return img?.startsWith('data:image') || img?.startsWith('http') ? img : '/default-profile.png';
}