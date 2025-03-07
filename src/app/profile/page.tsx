/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
"use client"

import { useUser } from '@clerk/nextjs';
import Image, { ImageLoaderProps }from 'next/image';
import { ImageLoader } from "next/image"
import { useState, useRef, useEffect } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import ImageCropper from '../components/imageCropper';
import PreferencesSettings from '../components/PreferencesSettings';
import FavoriteTeam from '../components/FavoriteTeam';

export interface Team {
  id: number;
  name: string;
  logoUrl?: string;
}

// Add interface for social links
interface SocialLinks {
  x: string;
  instagram: string;
  discord: string;
  facebook: string;
  snapchat: string;
}

const Profile = () => {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [selectedSection, setSelectedSection] = useState("Profile");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  // Favorite team states and effects from the second file
  const [favoriteTeam, setFavoriteTeam] = useState<Team | null>(null);
  const [showFavoriteTeamModal, setShowFavoriteTeamModal] = useState(false);
  useEffect(() => {
    console.log("Favorite team state:", favoriteTeam);
  }, [favoriteTeam]);

  // Hook to manage form inputs and validation
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Add this new state for social media links
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    x: (user?.unsafeMetadata?.x as string) || '',
    instagram: (user?.unsafeMetadata?.instagram as string) || '',
    discord: (user?.unsafeMetadata?.discord as string) || '',
    facebook: (user?.unsafeMetadata?.facebook as string) || '',
    snapchat: (user?.unsafeMetadata?.snapchat as string) || ''
  });

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

  // Loader implementation for profile picture
  const contentfulImageLoader: ImageLoader = ({ src, width }: ImageLoaderProps) => {
    return `${src}?w=${width}`
  }

  // Opens file input when profile image is clicked
  const handleImageClick = () => fileInputRef.current?.click();

  // Validates and sets selected file for cropping
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Handling profile picture change.");
    const file = event.target.files?.[0];
    if (file && ["image/jpg", "image/jpeg", "image/png"].includes(file.type)) {
      setSelectedFile(file);
      setShowCropper(true);
    } else {
      alert("Please upload a JPEG or PNG image.");
    }
  };

  // Handles the cropped image and updates user profile image
  const handleCropComplete = async (croppedDataUrl: string) => {
    setShowCropper(false);
    try {
      const response = await fetch(croppedDataUrl);
      const blob = await response.blob();
      const croppedFile = new File([blob], "cropped-image.png", { type: "image/png" });
      await user?.setProfileImage({ file: croppedFile });
      console.log("Successfully changed user profile picture.");
    } catch (error) {
      console.error("Error uploading cropped image:", error);
    }
  };

  {/* Navigation Buttons */}
  const renderNavigationButtons = () => (
    <ul className="flex flex-col w-full mt-4 space-y-2">
      {["Profile", "Activity", "Preferences", "Favorite Teams", "Social Media"].map((section) => (
        <li key={section}>
          <button
            onClick={() => {
              if (section === "Favorite Teams") {
                setShowFavoriteTeamModal(true);
                setSelectedSection(section);
              } else {
                setSelectedSection(section);
              }
            }}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              selectedSection === section
                ? 'bg-[#008AFF] text-white font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-200'
            }`}>
            {section}
          </button>
        </li>
      ))}
    </ul>
  );

  // Fetching favorite team data
  useEffect(() => {
    const fetchFavoriteTeam = async () => {
      try {
        const response = await fetch('/api/FavoriteTeams');
        if (!response.ok) throw new Error('Failed to fetch favorite team');
        const data = await response.json();
        // Expect data.team to be either an object or an array; adjust accordingly.
        if (data.team) {
          setFavoriteTeam(data.team);
        }
      } catch (error) {
        console.error('Error fetching favorite team:', error);
      }
    };

    fetchFavoriteTeam();
  }, []);

  
  // Handles saving the favorite team
  const handleFavoriteTeamSave = async (selectedTeam: Team) => {
    try {
      console.log("Saving favorite team:", selectedTeam);
      // Update public metadata with the new favorite team.
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          favoriteTeam: selectedTeam,
        },
      });
      setFavoriteTeam(selectedTeam);
      setShowFavoriteTeamModal(false);
      setSelectedSection("Profile");
      console.log("Favorite team saved:", selectedTeam);
    } catch (error) {
      console.error("Error saving favorite team:", error);
    }
  };
  

  // Update the handleSocialMediaSubmit function
  const handleSocialMediaSubmit = async (data: FieldValues) => {
    try {
      const socialData = {
        x: data.x || '',
        instagram: data.instagram || '',
        discord: data.discord || '',
        facebook: data.facebook || '',
        snapchat: data.snapchat || ''
      };
      
      // Update Clerk's unsafe metadata
      await user!.update({
        unsafeMetadata: {
          ...user?.unsafeMetadata,
          ...socialData
        }
      });

      // Update local state to reflect changes
      setSocialLinks(socialData);
      alert('Social media links updated successfully!');
    } catch (error) {
      console.error("Error updating social media links:", error);
      alert('Failed to update social media links');
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'Profile':
        return (
        <div>
            <h2 className="text-5xl font-medium mb-4 text-gray-900">Profile Information</h2>
            <table className="w-full text-left bg-gray-50 rounded-lg shadow-md table-fixed">
                <tbody>
                    <tr>
                        <td className="px-4 py-2 font-semibold text-gray-700 w-1/6 text-xl">Current Username</td>
                        <td className="px-4 py-2 text-gray-600 text-xl">{user?.username}</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2 font-semibold text-gray-700 text-xl">First Name</td>
                        <td className="px-4 py-2 text-gray-600 text-xl">{user?.firstName}</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2 font-semibold text-gray-700 text-xl">Last Name</td>
                        <td className="px-4 py-2 text-gray-600 text-xl">{user?.lastName}</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2 font-semibold text-gray-700 text-xl">Email</td>
                        <td className="px-4 py-2 text-gray-600 text-xl">{user?.primaryEmailAddress?.toString()}</td>
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
        );
        case "Edit Profile":
          return (
              <div>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-700">Edit Profile</h2>
                  <form onSubmit={handleSubmit(onSubmit)}>
                      <label className="px-4 py-2 font-semibold text-gray-700 w-1/6" htmlFor="username">
                          *Username:
                      </label>
                      <input defaultValue={user?.username!}
                          {...register("username", { required: true })}
                          className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"/>
                      {errors.username && <span className="text-sm text-red-600">This field is required</span>}

                      <label className="px-4 py-2 font-semibold text-gray-700 w-1/6" htmlFor="firstName">
                          *First Name:
                      </label>
                      <input defaultValue={user?.firstName!}
                          {...register("firstName", { required: true })}
                          className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"/>
                      {errors.firstName && <span className="text-sm text-red-600">This field is required</span>}

                      <label className="px-4 py-2 font-semibold text-gray-700 w-1/6" htmlFor="lastName">
                          *Last Name:
                      </label>
                      <input defaultValue={user?.lastName!}
                          {...register("lastName", { required: true })}
                          className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"/>
                      {errors.lastName && <span className="text-sm text-red-600">This field is required</span>}

                      <div className="space-x-2 py-2 space-between">
                          <button onClick={() => setSelectedSection("Profile")}
                              className="w-s text-left px-4 py-2 rounded-lg bg-[#008AFF] text-white font-semibold shadow-sm">
                              Back
                          </button>

                          <button type="submit"
                              className="w-s text-left px-4 py-2 rounded-lg bg-[#008AFF] text-white font-semibold shadow-sm">
                              Submit Changes
                          </button>
                      </div>
                  </form>
              </div>
          );
      case 'Activity':
        return (
          <div>
            <h2 className="text-5xl font-semibold mb-4 text-gray-700">Activity</h2>
            <p className="text-gray-700">This page will display a user&apos;s past activity, including their contest participation, results, and other relevant stats.</p>
          </div>
        );
      case 'Preferences':
        return <PreferencesSettings />;
      case 'Favorite Teams':
        return (
          <div>
            {showFavoriteTeamModal && (
              <FavoriteTeam
                onClose={() => {
                  setShowFavoriteTeamModal(false);
                  setSelectedSection("Profile");
                }}
                onSave={handleFavoriteTeamSave}
                
              />
            )}
          </div>
        );
      case 'Social Media':
        return (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Social Media Links</h2>
            <form onSubmit={handleSubmit(handleSocialMediaSubmit)} className="space-y-4">
              {[
                { display: 'X', key: 'x' },
                { display: 'Instagram', key: 'instagram' },
                { display: 'Discord', key: 'discord' },
                { display: 'Facebook', key: 'facebook' },
                { display: 'Snapchat', key: 'snapchat' }
              ].map((platform) => (
                <div key={platform.key} className="flex flex-col">
                  <label className="px-4 py-2 font-semibold text-gray-700">
                    {platform.display}:
                  </label>
                  <input
                    defaultValue={socialLinks[platform.key as keyof typeof socialLinks] || ''}
                    {...register(platform.key)}
                    placeholder={`Enter your ${platform.display} profile link`}
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                  />
                </div>
              ))}
              
              <div className="space-x-2 py-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#008AFF] text-white font-semibold shadow-sm hover:bg-blue-600"
                >
                  Save Social Links
                </button>
              </div>
            </form>

            {/* Displaying the social media links */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Your Social Media Links:</h3>
              <ul>
                {Object.entries(socialLinks).map(([key, value]) => (
                  value && (
                    <li key={key}>
                      <a
                        href={
                          key === 'instagram' ? `https://www.instagram.com/${value}` :
                          key === 'facebook' ? `https://www.facebook.com` :
                          key === 'snapchat' ? `https://www.snapchat.com/add/${value}` :
                          key === 'discord' ? `https://discord.com/users/${value}` : 
                          `https://www.${key}.com/${value}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}: @{value}
                      </a>
                    </li>
                  )
                ))}
              </ul>
            </div>
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
            {user?.imageUrl && (
              <Image
              loader={contentfulImageLoader}
              src={user.imageUrl}
              width={100}
              height={100}
              alt={user.username!}
              quality={100}
              className="rounded-full shadow-md cursor-pointer"
              />)}
            {/* On hover shows pencil icon */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="select-none cursor-pointer text-white text-4xl">&#9998;</p>
            </div>
          </div>
          {/* File Input for pfp*/}
          <input type="file" ref={fileInputRef} onClick={event => event.currentTarget.value = ""} onChange={handleFileChange} style={{ display: "none" }} />
          {renderNavigationButtons()}
        {/* Right Section of profile screen (Changed by setSelectedSection) */}
        </div>
        <div className="w-5/6 p-8 overflow-y-auto">{renderContent()}</div>
      </div>
      {showCropper && selectedFile && (
        <ImageCropper imageFile={selectedFile} onCropComplete={handleCropComplete} onCancel={() => setShowCropper(false)} />
      )}
        {favoriteTeam && favoriteTeam.logoUrl && (
        <div style={{ position: "fixed", top: "725px", left: "160px" }}>
          <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 shadow-lg flex items-center justify-center">
            <img
              src={favoriteTeam.logoUrl}
              width="40"
              height="40"
              alt={favoriteTeam.name || "Favorite Team Logo"}
              className="rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
