/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import styles from '../styles/leaderboardProfiles.module.css';

interface user {
    rank: number;
    username: string;
    img: string;
    points: number;
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

    if (loading) return <div>Loading users...</div>;
    if (error) return <div className='error'>{error}</div>;

    return (
        <div id='profile' className='profile'>
            {users?.length > 0 ? <Item data={users}/> : <div>No data available</div>}
        </div>
    );
}

function Item({ data }: { data: user[] }) {
    return(
        <>
            {data.map((value: { rank: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; img: any; username: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; points: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }, index: React.Key | null | undefined) => (
                <div className={styles.profile} key={index}>
                    <div className={styles.rank}>{value.rank}</div>
                    <Image 
                        src={getImageSrc(value.img)} 
                        alt={`Profile image of ${value.username}`} 
                        loading='lazy'
                        width={60} 
                        height={60}
                        className={styles.image}/>
                    <div className={styles.username}>{value.username}</div>
                    <div className={styles.points}>{value.points}</div>
                </div>
            ))}
        </>
    );
}

function getImageSrc(img: string){
    return img?.startsWith('data:image') || img?.startsWith('http') ? img : '/default-profile.png';
}