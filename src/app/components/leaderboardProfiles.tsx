/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image'
import styles from '../styles/leaderboardProfiles.module.css';

interface user {
    rank: number;
    username: string;
    img: string;
    points: number;
    max_points: number;
    performance_percentage?: string;
}

interface leaderboardProfileProps {
    userIds: number[];
}

export default function LeaderboardProfiles({ userIds = []}: leaderboardProfileProps) {
    const [users, setUsers] = useState<user[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() =>{
        if (userIds.length === 0){
            setLoading(false);
            setError('No user_ids provided');
            return;
        }

        const fetchUsers = async () => {
            try {
                const queryStr = `user_id=${userIds.join(',')}`;
                const res = await fetch(`/api/user/get?${queryStr}`);
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

    // Call function to calculate performance for display
    const processedUsers = useMemo(() => calculatePerformance(users), [users]);

    if (loading) return <div>Loading users...</div>;
    if (error) return <div className='error'>{error}</div>;

    return (
        <div id='profile' className='profile'>
            {users?.length > 0 ? <Item data={processedUsers}/> : <div>No data available</div>}
        </div>
    );
}

function Item({ data }: { data: user[] }) {
    // Double check sorting
    const sortedData = [...data].sort((a, b) => a.rank - b.rank);
    
    return(
        <>
            {sortedData.map((user, index: React.Key | null | undefined) => (
                <div className={styles.profile} key={index}>
                    <div className={styles.rank}>{user.rank}</div>
                    <Image 
                        src={getImageSrc(user.img)} 
                        alt={`Profile image of ${user.username}`} 
                        loading='lazy'
                        width={60} 
                        height={60}
                        className={styles.image}/>
                    <div className={styles.username}>{user.username}</div>
                    <div className={styles.performance}>{user.performance_percentage}%</div>
                    <div className={styles.points}>{user.points}</div>
                </div>
            ))}
        </>
    );
}

function getImageSrc(img: string){
    return img?.startsWith('data:image') || img?.startsWith('http') ? img : '/default-profile.png';
}

function calculatePerformance(data: user[]) {
    if(data.length === 0) 
        return [];

    return data.map( user => {
        const percentage = user.max_points > 0 ? (user.points/user.max_points) * 100 : 0;
        return{ ...user, performance_percentage: percentage.toFixed(3) };
    });
}