"use client"

import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import ImageCropper from "../components/imageCropper";

interface Team {
    name: string;
    logo: string;
}

interface Game {
    team1: Team;
    team2: Team;
}

interface Pick {
    id: string;
    gameId: string;
    teamIndex: number;
    createdAt: string;
    game: {
        id: string;
        team1Name: string;
        team2Name: string;
        team1Logo: string;
        team2Logo: string;
    };
}

interface GroupedPicks {
    [date: string]: Pick[];
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
};

const PickCard = ({ pick }: { pick: Pick }) => {
    // Get the selected and opponent team names based on teamIndex
    const selectedTeam = pick.teamIndex === 0 ? pick.game.team1Name : pick.game.team2Name;
    const opponentTeam = pick.teamIndex === 0 ? pick.game.team2Name : pick.game.team1Name;

    return (
        <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    {/* Selected Team */}
                    <div className="bg-blue-500/20 px-4 py-2 rounded-lg">
                        <span className="text-blue-400 font-bold">
                            {selectedTeam} ✓
                        </span>
                    </div>

                    <span className="text-gray-400">vs</span>

                    {/* Opponent Team */}
                    <div className="px-4 py-2">
                        <span className="text-gray-400">
                            {opponentTeam}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">
                        {new Date(pick.createdAt).toLocaleDateString()}
                    </span>
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                        Pending
                    </span>
                </div>
            </div>
        </div>
    );
};

const Profile = () => {
    const router = useRouter();
    const { isLoaded, isSignedIn, user } = useUser();
    const [selectedSection, setSelectedSection] = useState("Profile");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [picks, setPicks] = useState<Pick[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchPicks() {
            if (!isSignedIn) {
                setIsLoading(false);
                return;
            }
            
            try {
                const response = await fetch('/api/getPicks');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                if (!data.picks) {
                    throw new Error('No picks data received');
                }
                
                setPicks(data.picks);
                setError(null);
            } catch (err) {
                console.error('Error fetching picks:', err);
                setError('Failed to load picks. Please try again later.');
                setPicks([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPicks();
    }, [isSignedIn]);

    // Handles form submission for when user updates profile info.
    const onSubmit = async (data: any) => {
        try {
            await user!.update({
                username: data.username,
                firstName: data.firstName,
                lastName: data.lastName,
            });
            router.push("/profile");
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    }

    // Opens file input when pfp is clicked
    const handleImageClick = () => fileInputRef.current?.click();

    // Validates and sets selected file for cropping
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && ["image/jpeg", "image/png"].includes(file.type)) {
            setSelectedFile(file);
            setShowCropper(true);
        } else {
            alert("Please upload a JPEG or PNG image.");
        }
    };

    // Handles the cropped image and updates user pfp
    const handleCropComplete = async (croppedDataUrl: string) => {
        setShowCropper(false);
        try {
            const response = await fetch(croppedDataUrl);
            const blob = await response.blob();
            const croppedFile = new File([blob], "cropped-image.png", { type: "image/png" });
            await user?.setProfileImage({ file: croppedFile });
        } catch (error) {
            console.error("Error uploading cropped image:", error);
        }
    };

    // Group picks by date
    const groupPicksByDate = (picks: Pick[]) => {
        return picks.reduce((groups: GroupedPicks, pick) => {
            const date = new Date(pick.createdAt).toLocaleDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(pick);
            return groups;
        }, {});
    };

    if (!isLoaded || !isSignedIn) return null;

    // Renders right side of profile page based on what button is selected on left.
    const renderContent = () => {
        switch (selectedSection) {
            case 'Profile':
                return (
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Profile Information</h2>
                    <table className="w-full text-left bg-gray-50 rounded-lg shadow-md table-fixed">
                        <tbody>
                            <tr>
                                <td className="px-4 py-2 font-semibold text-gray-700 w-1/6">Current Username</td>
                                <td className="px-4 py-2 text-gray-600">{user.username}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold text-gray-700">First Name</td>
                                <td className="px-4 py-2 text-gray-600">{user.firstName}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold text-gray-700">Last Name</td>
                                <td className="px-4 py-2 text-gray-600">{user.lastName}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold text-gray-700">Email</td>
                                <td className="px-4 py-2 text-gray-600">{user.primaryEmailAddress?.toString()}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className = "py-2 space-between">
                        <button
                            onClick={() => setSelectedSection('Edit Profile')}
                            className="w-s text-left px-4 py-2 rounded-lg bg-[#008AFF] text-white font-semibold shadow-sm">
                            Edit Profile
                        </button>
                    </div>
                </div>
                )
            case 'My Picks':
                return (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">My Picks</h2>
                        <div className="space-y-6">
                            {Object.entries(groupPicksByDate(picks)).map(([date, datePicks]) => (
                                <div key={date} className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-400">{date}</h3>
                                    {datePicks.map((pick) => {
                                        const selectedTeam = pick.teamIndex === 0 ? pick.game.team1Name : pick.game.team2Name;
                                        const opposingTeam = pick.teamIndex === 0 ? pick.game.team2Name : pick.game.team1Name;

                                        return (
                                            <div 
                                                key={pick.id} 
                                                className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    {selectedTeam && (
                                                        <div className="flex items-center">
                                                            <Image
                                                                src={selectedTeam}
                                                                alt={selectedTeam}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-gray-400 mb-1">Game {pick.gameId}</p>
                                                        <p className="text-lg text-blue-400">
                                                            {selectedTeam}
                                                        </p>
                                                        {opposingTeam && (
                                                            <p className="text-sm text-gray-400">
                                                                vs {opposingTeam}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-gray-400">
                                                    Pending
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                            {picks.length === 0 && (
                                <p className="text-gray-400 text-center py-4">No picks made yet</p>
                            )}
                        </div>
                    </div>
                )
            case 'Activity':
                return (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Activity</h2>
                        <p className="text-gray-700">Here it will show all contests that the user has taken part of or is currently participating.</p>
                    </div>
                )
            case "Edit Profile":
                return (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Edit Profile</h2>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <label className="px-4 py-2 font-semibold text-gray-700 w-1/6" htmlFor="username">
                                *Username:
                            </label>
                            <input
                                defaultValue={user.username!}
                                {...register("username", { required: true })}
                                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                            />
                            {errors.username && <span className="text-sm text-red-600">This field is required</span>}

                            <label className="px-4 py-2 font-semibold text-gray-700 w-1/6" htmlFor="firstName">
                                *First Name:
                            </label>
                            <input
                                defaultValue={user.firstName!}
                                {...register("firstName", { required: true })}
                                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                            />
                            {errors.firstName && <span className="text-sm text-red-600">This field is required</span>}

                            <label className="px-4 py-2 font-semibold text-gray-700 w-1/6" htmlFor="lastName">
                                *Last Name:
                            </label>
                            <input
                                defaultValue={user.lastName!}
                                {...register("lastName", { required: true })}
                                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                            />
                            {errors.lastName && <span className="text-sm text-red-600">This field is required</span>}

                            <div className="space-x-2">
                                <button
                                    onClick={() => setSelectedSection("Profile")}
                                    className="w-s text-left px-4 py-2 rounded-lg bg-[#008AFF] text-white font-semibold shadow-sm"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="w-s text-left px-4 py-2 rounded-lg bg-[#008AFF] text-white font-semibold shadow-sm"
                                >
                                    Submit Changes
                                </button>
                            </div>
                        </form>
                    </div>
                );
            default:
                return null;
            }
        };

        return (
            <div className="h-[80vh] p-8 flex items-center justify-center">
                <div className="flex w-full h-full max-w-[80vw] bg-white rounded-lg shadow-lg overflow-hidden">
                
                    {/* Left Section of profile screen */}
                    <div className="w-1/6 bg-gray-50 p-6 flex flex-col items-center">
                        {/* Pfp that can be changed via clicking and selecting file*/}
                        <div className="relative w-24 h-24 cursor-pointer" onClick={handleImageClick}>
                            <Image
                                src={user.imageUrl}
                                width={100}
                                height={100}
                                alt={user.username!}
                                quality={100}
                                className="rounded-full shadow-md cursor-pointer"
                            />
                            {/* On hover shows pencil icon */}
                            <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity">
                                <p className="select-none cursor-pointer text-white text-4xl">&#9998;</p>
                            </div>
                        </div>
        
                        {/* File Input for pfp*/}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
        
                        {/* Navigation Buttons */}
                        <ul className="flex flex-col w-full mt-4 space-y-2">
                            <li>
                                <button
                                    onClick={() => setSelectedSection('Profile')}
                                    className={`w-full text-left px-4 py-2 rounded-lg ${
                                        selectedSection === 'Profile' ? 'bg-[#008AFF] text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Profile
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setSelectedSection('My Picks')}
                                    className={`w-full text-left px-4 py-2 rounded-lg ${
                                        selectedSection === 'My Picks' ? 'bg-[#008AFF] text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    My Picks
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setSelectedSection('Activity')}
                                    className={`w-full text-left px-4 py-2 rounded-lg ${
                                        selectedSection === 'Activity' ? 'bg-[#008AFF] text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Activity
                                </button>
                            </li>
                        </ul>
                    </div>
        
                    {/* Left Section of profile screen (Changed by setSelectedSection) */}
                    <div className="w-5/6 p-8 overflow-y-auto">
                        {renderContent()}
                    </div>
                </div>
        
                {showCropper && selectedFile && (
                    <ImageCropper imageFile={selectedFile} onCropComplete={handleCropComplete} onCancel={() => setShowCropper(false)} />
                )}
            </div>
        );
};

export default Profile
