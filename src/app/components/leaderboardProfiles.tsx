/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image'
import styles from '../styles/leaderboardProfiles.module.css';
//import { useUser } from '@clerk/nextjs';

interface user {
    rank: number;
    username: string;
    img: string;
    points: number;
    max_points: number;
    performance: string;
    bio?: string;
    fav_team?: string;
    user_id: number;
    clerk_id: string;
    imageUrl: string;
}

interface leaderboardProfileProps {
    userIds: number[];
}

export default function LeaderboardProfiles({ userIds = []}: leaderboardProfileProps) {
    const [users, setUsers] = useState<user[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<number>(0); // Timestamp for updating leaderboard
    const [selectedUser, setSelectedUser] = useState<user | null>(null);

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
                    const updatedUsers = data.data.map((user: user) => ({
                        ...user,
                        imageUrl: user.imageUrl || "/default-profile.png", // Ensure fallback image
                    }));
                    setUsers(updatedUsers);
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

    // Close profile popout when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const popout = document.getElementById('profilePopout');
            if (popout && !popout.contains(event.target as Node) && selectedUser) {
                setSelectedUser(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedUser]);

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

    const handleUserClick = (user: user) => {
        setSelectedUser(user);
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div className='error'>{error}</div>;

    return (
        <div id='profile' className='profile'>
            {users?.length > 0 ? <Item data={users} onUserClick={handleUserClick}/> : <div>No data available</div>}
            
            {selectedUser && (
                <div className={styles.popoutOverlay}>
                    <div id="profilePopout" className={styles.profilePopout}>
                        <button 
                            className={styles.closeButton}
                            onClick={() => setSelectedUser(null)}
                        >
                            ×
                        </button>
                        <div className={styles.popoutHeader}>
                        <Image 
                            src={getImageSrc(selectedUser.imageUrl)} 
                            alt={`Profile image of ${selectedUser.username}`} 
                            width={100} 
                            height={100}
                            className={styles.popoutImage}
                        />

                            <h2>{selectedUser.username}</h2>
                            <div className={styles.popoutRank}>Rank: {selectedUser.rank}</div>
                        </div>
                        <div className={styles.popoutDetails}>
                            {selectedUser.bio && (
                                <div className={styles.popoutBio}>
                                    <h3>Bio</h3>
                                    <p>{selectedUser.bio}</p>
                                </div>
                            )}
                            {selectedUser.fav_team && (
                                <div className={styles.popoutFavTeam}>
                                    <h3>Favorite Team</h3>
                                    <p>{selectedUser.fav_team}</p>
                                </div>
                            )}
                            <div className={styles.popoutStats}>
                                <div>
                                    <h3>Performance</h3>
                                    <p>{selectedUser.performance}%</p>
                                </div>
                                <div>
                                    <h3>Points</h3>
                                    <p>{selectedUser.points}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Item({ data, onUserClick }: { data: user[], onUserClick: (user: user) => void }) {
    // Double check sorting
    const sortedData = [...data].sort((a, b) => a.rank - b.rank);
    //const { user } = useUser(); // to display signed in user differently
    
    return(
        <>
            {sortedData.map((user) => (
                <div 
                    className={styles.profile} 
                    key={`${user.username}-${user.rank}`}
                    onClick={() => onUserClick(user)}
                >
                    <div className={styles.rank}>{user.rank}</div>
                    <Image
                        src={getImageSrc(user.imageUrl)}
                        alt={`Profile image of ${user.username}`}
                        loading='lazy'
                        width={60}
                        height={60}
                        quality={100}
                        className={styles.image}/>
                    <div className={styles.username}>{user.username}</div>
                    <div className={styles.performance}>{user.performance}%</div>
                    <div className={styles.points}>{user.points}</div>
                </div>
            ))}
        </>
    );
}

function getImageSrc(img?: string) {
    if (!img) return '/default-profile.png'; // Fallback for missing images
    return img.startsWith('data:image') || img.startsWith('http') ? img : '/default-profile.png';
}