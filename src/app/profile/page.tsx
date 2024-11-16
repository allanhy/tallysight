"use client"

import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

const Profile = () => {
    const router = useRouter()
    const { isLoaded, isSignedIn, user } = useUser()
    const [selectedSection, setSelectedSection] = useState('Profile')
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const onSubmit = (data : any) => {
        try {
            user!.update({
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
        })

        router.push('/profile')
        } catch (error) {
            console.log(error)
        }
    }

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
    
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            if (user) {
                try {
                    await user.setProfileImage({ file });
                    console.log('Profile image updated successfully');
                } catch (error) {
                    console.error('An error occurred:', error);
                }
            }
        } else {
            alert('Please upload a JPEG or PNG image.');
        }
    };

    if (!isLoaded || !isSignedIn) {
        return null
    }

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
                            className="w-s text-left px-4 py-2 rounded-lg bg-[#008AFF] text-white font-semibold shadow-sm"
                        >
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
            case 'Edit Profile':
                return (
                    <div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Edit Profile</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                                <label className="px-4 py-2 font-semibold text-gray-700 w-1/6" htmlFor="username">*Username:</label>
                                <input
                                    defaultValue={user.username!}
                                    {...register('username', {
                                    required: true,
                                    })}
                                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                                />
                                {errors.firstName && <span className="text-sm text-red-600">This field is required</span>}
                                <label className="px-4 py-2 font-semibold text-gray-700 w-1/6" htmlFor="firstName">*First Name:</label>
                                <input
                                    defaultValue={user.firstName!}
                                    {...register('firstName', {
                                    required: true,
                                    })}
                                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                                />
                                {errors.firstName && <span className="text-sm text-red-600">This field is required</span>}
                                <label className="px-4 py-2 font-semibold text-gray-700 w-1/6" htmlFor="lastName">*Last Name:</label>
                                <input
                                    defaultValue={user.lastName!}
                                    {...register('lastName', {
                                    required: true,
                                    })}
                                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                                />
                                {errors.firstName && <span className="text-sm text-red-600">This field is required</span>}
                    <h1 className = "px-4 py-1 text-gray-700">All fields with an asterisk* are required.</h1>
                    <div className = "space-x-2">
                    <button
                        onClick={() => setSelectedSection('Profile')}
                        className="w-s text-left px-4 py-2 rounded-lg bg-[#008AFF] text-white font-semibold shadow-sm"
                    >
                        Back
                    </button>
                    <button type="submit" 
                        className="w-s text-left px-4 py-2 rounded-lg bg-[#008AFF] text-white font-semibold shadow-sm"
                    >
                        Submit Changes
                    </button>
                    </div>
                    </form>
                    </div>
                ) 
            default:
            return null
        }
    }

    return (
        <div className="h-[80vh] p-8 flex items-center justify-center">
            <div className="flex w-full h-full max-w-[80vw] bg-white rounded-lg shadow-lg overflow-hidden">
            
            {/* Left Section: Profile Picture and Navigation */}
            <div className="w-1/6 bg-gray-50 p-6 flex flex-col items-center">
                <Image
                    src={user.imageUrl}
                    width={100}
                    height={100}
                    alt={user.username!}
                    quality={100}
                    className="rounded-full shadow-md mb-6 cursor-pointer"
                    onClick={handleImageClick}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    />

                <li>
                    <button
                        onClick={() => setSelectedSection('Profile')}
                        className={`w-full text-left px-4 py-2 rounded-lg ${selectedSection === 'Profile' ? 'bg-[#008AFF] text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setSelectedSection('My Picks')}
                        className={`w-full text-left px-4 py-2 rounded-lg ${selectedSection === 'My Picks' ? 'bg-[#008AFF] text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
                    >
                        My Picks
                    </button>
                    <button
                        onClick={() => setSelectedSection('Activity')}
                        className={`w-full text-left px-4 py-2 rounded-lg ${selectedSection === 'Activity' ? 'bg-[#008AFF] text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
                    >
                        Activity
                    </button>
                </li>
            </div>

            {/* Right Section: Information */}
            <div className="w-5/6 p-8 overflow-y-auto">
                {renderContent()}
            </div>
            </div>
        </div>
    )
}

export default Profile
