/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image'
import styles from '../styles/leaderboardProfiles.module.css';
//import { useUser } from '@clerk/nextjs';

interface user {
    rank: number;
    username: string;
    points: number;
    max_points: number;
    performance: string;
    bio?: string;
    fav_team?: string;
    user_id: number;
    clerk_id: string;
    imageUrl: string;
}

interface SocialLinks {
    x?: string;
    instagram?: string;
    discord?: string;
    facebook?: string;
    snapchat?: string;
}

type Sport = 'NFL' | 'MLB' | 'NBA' | 'SELECT';

interface leaderboardProfileProps{
    sport: Sport;
    week: number | null;
    userIds: number[];
}

//export default function LeaderboardProfiles({ userIds = []}: leaderboardProfileProps) {
export default function LeaderboardProfiles({ sport, week, userIds = [] }: leaderboardProfileProps) {
    const [users, setUsers] = useState<user[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<number>(0); // Timestamp for updating leaderboard
    const [selectedUser, setSelectedUser] = useState<user | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);
    const [loadingSocial, setLoadingSocial] = useState(false);
    
    useEffect(() => {
        if (sport === 'SELECT' || week === -1 || week === null) {
            // Fetch user data based on userIds
            if (userIds.length === 0) {
                setLoading(false);
                setError('No user_ids provided');
                return;
            }
    
            const fetchUsers = async () => {
                try {
                    const queryStr = `user_id=${userIds.join(',')}`;
                    const res = await fetch(`/api/user/getUsersLeaderboard?${queryStr}`); // For total leaderboard
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
        } else {
            // Fetch leaderboard data based on sport and week
            const fetchSpecificLeaderboardUsers = async () => {
                try{
                    const res = await fetch(`/api/leaderboard-entries/getEntriesForLeaderboard?sport=${sport}&week=${week}`);
                    const data = await res.json();

                    if(res.ok) {
                        const updatedUsers = data.data.map((user: user) => ({
                            ...user,
                            imageUrl: user.imageUrl || "/default-profile.png", // Ensure fallback image
                        }));
                        setUsers(updatedUsers);
                    } else {
                        setError(data.message || 'User Fetch for Specific Leaderboard: Failed')
                    }
                } catch (error) {
                    setError(`Network error fetching users for specific leaderboard: ${error}`);
                }
                setLoading(false);
            };
            fetchSpecificLeaderboardUsers();
        }
    }, [sport, week, userIds]);
    

    // Close profile popout when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const popout = document.getElementById('profilePopout');
            if (popout && !popout.contains(event.target as Node) && selectedUser) {
                setSelectedUser(null);
                setSocialLinks(null);
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

    // Update leaderboard hourly
    useEffect(() => { 
        const currentTime = Date.now();
        const sinceUpdate = currentTime - lastUpdated;

        if (sinceUpdate > 3600000) // More than 1hr, 86400000 for 24hrs
            updateAllUserPerformance();

        const interval = setInterval(() => {
            updateAllUserPerformance();
        }, 3600000)

        return () => clearInterval(interval);
    }, [lastUpdated, updateAllUserPerformance]);

    // Fetch user social media links and favorite team from Clerk
    const fetchUserSocialLinks = async (clerkId: string) => {
        if (!clerkId) return;
        
        setLoadingSocial(true);
        try {
            const response = await fetch(`/api/user/getUserProfile?clerkId=${clerkId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user profile data');
            }
            const data = await response.json();
            setSocialLinks(data.socialLinks);
        } catch (error) {
            console.error('Error fetching user social links:', error);
            setSocialLinks(null);
        } finally {
            setLoadingSocial(false);
        }
    };

    const handleUserClick = (user: user) => {
        setSelectedUser(user);
        fetchUserSocialLinks(user.clerk_id);
    };

    // Helper function to check if user has any social media links
    const hasSocialLinks = (links: SocialLinks | null) => {
        if (!links) return false;
        return Object.values(links).some(link => link && link.trim() !== '');
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
                            onClick={() => {
                                setSelectedUser(null);
                                setSocialLinks(null);
                            }}
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
                        </div>
                        <div className={styles.popoutDetails}>
                            {selectedUser.fav_team ? (
                                <div className={styles.popoutFavTeamSection}>
                                    <h3>Favorite Team</h3>
                                    <div className={styles.favTeamContainer}>
                                        <p className={styles.favTeamText}>{selectedUser.fav_team}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.popoutFavTeamSection}>
                                    <h3>Favorite Team</h3>
                                    <p className={styles.socialMessage}>No favorite team selected</p>
                                </div>
                            )}
                            
                            <div className={styles.popoutSocialLinks}>
                                <h3>Social Media</h3>
                                {loadingSocial ? (
                                    <p className={styles.socialMessage}>Loading social media links...</p>
                                ) : hasSocialLinks(socialLinks) ? (
                                    <div className={styles.socialLinksContainer}>
                                        {socialLinks?.x && (
                                            <div className={styles.socialLink}>
                                                <span>X:</span> {socialLinks.x}
                                            </div>
                                        )}
                                        {socialLinks?.instagram && (
                                            <div className={styles.socialLink}>
                                                <span>Instagram:</span> {socialLinks.instagram}
                                            </div>
                                        )}
                                        {socialLinks?.discord && (
                                            <div className={styles.socialLink}>
                                                <span>Discord:</span> {socialLinks.discord}
                                            </div>
                                        )}
                                        {socialLinks?.facebook && (
                                            <div className={styles.socialLink}>
                                                <span>Facebook:</span> {socialLinks.facebook}
                                            </div>
                                        )}
                                        {socialLinks?.snapchat && (
                                            <div className={styles.socialLink}>
                                                <span>Snapchat:</span> {socialLinks.snapchat}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className={styles.socialMessage}>No social media linked to this profile</p>
                                )}
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