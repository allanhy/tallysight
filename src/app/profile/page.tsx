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

// Enhanced validation function for JPG/JPEG files
const isValidImageFile = (file: File): boolean => {
    // Check if file is an image and specifically jpg/jpeg
    const validTypes = ['image/jpeg', 'image/jpg'];
    
    // Check MIME type
    if (!validTypes.includes(file.type)) {
        alert('Only JPG/JPEG images are allowed');
        return false;
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
        alert('File must have a .jpg or .jpeg extension');
        return false;
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        alert('Image file is too large. Maximum size is 5MB');
        return false;
    }
    
    return true;
};

const Profile = () => {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [selectedSection, setSelectedSection] = useState("Profile");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
      setSelectedSection("Profile");
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
    
    if (!file) return;
    
    // Validate the file is a JPG/JPEG
    if (!isValidImageFile(file)) {
        event.target.value = ''; // Clear the input
        return;
    }
    
    // If validation passes, show the cropper
    setSelectedFile(file);
    setShowCropper(true);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidImageFile(file)) {
        e.target.value = ''; // Clear the input
        return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload image to Clerk
      const uploadResponse = await user?.setProfileImage({
        file: file,
      });

      if (uploadResponse) {
        console.log('Profile image updated successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    }
  };

  {/* Navigation Buttons */}
  const renderNavigationButtons = () => (
    <div>
      <button
        className="md:hidden p-3 text-gray-700 dark:text-gray-200 text-2xl"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        &#9776; {/* Hamburger icon */}
      </button>
      <ul className={`flex-col w-full mt-4 space-y-2 ${menuOpen ? 'flex' : 'hidden'} md:flex`}>
        {["Profile", "Preferences", "Favorite Team", "Social Media"].map((section) => (
          <li key={section}>
            <button
              onClick={() => {
                setMenuOpen(false);
                if (section === "Favorite Team") {
                  setShowFavoriteTeamModal(true);
                  setSelectedSection(section);
                } else {
                  setSelectedSection(section);
                }
              }}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                selectedSection === section
                  ? 'bg-[var(--accent-color)] text-white font-semibold shadow-sm'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {section}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  // Fetching favorite team data
  useEffect(() => {
    const fetchFavoriteTeam = async () => {
      try {
        const response = await fetch('/api/user/getFavoriteTeam');
        if (!response.ok) throw new Error('Failed to fetch favorite team');
        const data = await response.json();
        
        if (data.team) {
          setFavoriteTeam({
            id: data.team.id || 0,
            name: data.team.fav_team,
            logoUrl: data.team.fav_team_logo
          });
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
      
      // Update the database
      const response = await fetch('/api/user/postFavoriteTeam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          teamName: selectedTeam.name,
          teamLogoUrl: selectedTeam.logoUrl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite team in database');
      }

      // Update local state
      setFavoriteTeam(selectedTeam);
      setShowFavoriteTeamModal(false);
      setSelectedSection("Profile");
    } catch (error) {
      console.error("Error saving favorite team:", error);
      alert('Failed to save favorite team. Please try again.');
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
            <h2 className="text-5xl font-medium mb-4 text-gray-900 dark:text-gray-100">Profile Information</h2>
            {favoriteTeam && favoriteTeam.logoUrl && (<div className="flex items-center">
            <img
              src={favoriteTeam.logoUrl}
              width="64"
              height="64"
              alt={favoriteTeam.name || "Favorite Team Logo"}
              className="object-contain"
            />
          </div>
        )}
            <table className="w-full text-left bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md table-auto">
                <tbody>
                    <tr>
                        <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 text-xl">Current Username</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300 text-xl">{user?.username}</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 text-xl">First Name</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300 text-xl">{user?.firstName}</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 text-xl">Last Name</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300 text-xl">{user?.lastName}</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 text-xl">Email</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300 text-xl">{user?.primaryEmailAddress?.toString()}</td>
                    </tr>
                </tbody>
            </table>
            <div className = "py-2 space-between">
                <button
                    onClick={() => setSelectedSection('Edit Profile')}
                    className="w-s text-left px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-semibold shadow-sm">
                    Edit Profile
                </button>
            </div>
        </div>
        );
        case "Edit Profile":
          return (
              <div>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-100">Edit Profile</h2>
                  <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="mb-4">
                          <label className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 w-1/6" htmlFor="username">
                              *Username:
                          </label>
                          {errors.username?.type === "required" && (
                            <div className="text-sm text-red-600 mb-1 px-4">This field is required</div>
                          )}
                          {errors.username?.type === "minLength" && (
                            <div className="text-sm text-red-600 mb-1 px-4">Username must be at least 4 characters</div>
                          )}
                          {errors.username?.type === "maxLength" && (
                            <div className="text-sm text-red-600 mb-1 px-4">Username must be no more than 64 characters</div>
                          )}
                          <input 
                              defaultValue={user?.username!}
                              {...register("username", { 
                                required: true,
                                minLength: 4,
                                maxLength: 64
                              })}
                              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 dark:text-gray-200 dark:bg-gray-800 shadow focus:outline-none"/>
                      </div>
    
                      <div className="mb-4">
                          <label className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 w-1/6" htmlFor="firstName">
                              *First Name:
                          </label>
                          {errors.firstName && (
                            <div className="text-sm text-red-600 mb-1 px-4">This field is required</div>
                          )}
                          <input 
                              defaultValue={user?.firstName!}
                              {...register("firstName", { required: true })}
                              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 dark:text-gray-200 dark:bg-gray-800 shadow focus:outline-none"/>
                      </div>
    
                      <div className="mb-4">
                          <label className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 w-1/6" htmlFor="lastName">
                              *Last Name:
                          </label>
                          {errors.lastName && (
                            <div className="text-sm text-red-600 mb-1 px-4">This field is required</div>
                          )}
                          <input 
                              defaultValue={user?.lastName!}
                              {...register("lastName", { required: true })}
                              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 dark:text-gray-200 dark:bg-gray-800 shadow focus:outline-none"/>
                      </div>
    
                      <div className="mb-4">
                          <label className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200" htmlFor="profilePicture">
                              Profile Picture (JPG/JPEG only):
                          </label>
                          <input
                              id="profilePicture"
                              type="file"
                              accept=".jpg,.jpeg"
                              onChange={handleFileChange}
                              aria-label="Upload profile picture"
                              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 dark:text-gray-200 dark:bg-gray-800 shadow focus:outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1 px-4">Only JPG/JPEG files up to 5MB are allowed</p>
                      </div>
    
                      <div className="space-x-2 py-2 space-between">
                          <button onClick={() => setSelectedSection("Profile")}
                              className="w-s text-left px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-semibold shadow-sm">
                              Back
                          </button>
    
                          <button type="submit"
                              className="w-s text-left px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-semibold shadow-sm">
                              Submit Changes
                          </button>
                      </div>
                  </form>
              </div>
          );
      case 'Preferences':
        return <PreferencesSettings />;
      case 'Favorite Team':
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
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-100">Social Media Links</h2>
            <form onSubmit={handleSubmit(handleSocialMediaSubmit)} className="space-y-4">
              {[
                { display: 'X', key: 'x' },
                { display: 'Instagram', key: 'instagram' },
                { display: 'Discord', key: 'discord' },
                { display: 'Facebook', key: 'facebook' },
                { display: 'Snapchat', key: 'snapchat' }
              ].map((platform) => (
                <div key={platform.key} className="flex flex-col">
                  <label className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">
                    {platform.display}:
                  </label>
                  <input
                    defaultValue={socialLinks[platform.key as keyof typeof socialLinks] || ''}
                    {...register(platform.key)}
                    placeholder={`Enter your ${platform.display} profile link`}
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 dark:text-gray-200 dark:bg-gray-800 shadow focus:outline-none"
                  />
                </div>
              ))}
              
              <div className="space-x-2 py-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-semibold shadow-sm hover:bg-blue-600"
                >
                  Save Social Links
                </button>
              </div>
            </form>

            {/* Displaying the social media links */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100">Your Social Media Links:</h3>
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
                        className="text-blue-500 hover:underline dark:text-blue-400"
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
    <div className="h-[80vh] p-4 md:p-8 flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full h-full max-w-[90vw] bg-card dark:bg-card-background rounded-lg shadow-lg overflow-hidden">
        {/* Left Section of profile screen */}
        <div className="w-full md:w-1/6 bg-gray-50 dark:bg-gray-800 p-6 flex flex-col items-center">
          {/* Profile Picture and Navigation */}
          <div className="relative w-24 h-24 mb-4 cursor-pointer group" onClick={handleImageClick}>
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
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="select-none cursor-pointer text-white text-4xl">&#9998;</p>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onClick={event => event.currentTarget.value = ""} onChange={handleFileChange} style={{ display: "none" }} />
          {renderNavigationButtons()}
        </div>
        {/* Right Section of profile screen */}
        <div className="w-full md:w-5/6 p-4 md:p-8 overflow-y-auto bg-white dark:bg-gray-900">
          {renderContent()}
        </div>
      </div>
      {showCropper && selectedFile && (
        <ImageCropper imageFile={selectedFile} onCropComplete={handleCropComplete} onCancel={() => setShowCropper(false)} />
      )}
    </div>
  );
};

export default Profile;
