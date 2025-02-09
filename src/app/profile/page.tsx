"use client"

import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import ImageCropper from "../components/imageCropper";

const Profile = () => {
    const router = useRouter();
    const { isLoaded, isSignedIn, user } = useUser();
    const [selectedSection, setSelectedSection] = useState("Profile");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    // Hook to manage form inputs and validation
    const { register, handleSubmit, formState: { errors } } = useForm();

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
                        <p className="text-gray-700">Here it will show users past picks and if they hit or not.</p>
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
                        {/* Pfp that can be changed via clicking and selecting file */}
                        <div className="relative w-24 h-24 cursor-pointer group" onClick={handleImageClick}>
                            <div className="absolute inset-0 bg-gray-800/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Image
                                src={user.imageUrl}
                                width={100}
                                height={100}
                                alt={user.username!}
                                quality={100}
                                className="rounded-full shadow-md cursor-pointer"
                            />
                            {/* On hover shows pencil icon */}
                            <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
