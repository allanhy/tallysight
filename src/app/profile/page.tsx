/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
"use client"

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
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
  const { user } = useUser();
  const [selectedSection, setSelectedSection] = useState("Profile");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingEmailId, setPendingEmailId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState("");

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
      // Update username, name fields
      await user!.update({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
      });
  
      // Check if email was changed
      const currentEmail = user!.primaryEmailAddress?.emailAddress;
      const newEmail = data.email;
  
      if (newEmail && newEmail !== currentEmail) {
        const existing = user!.emailAddresses.find((e) => e.emailAddress === newEmail);
  
        // If this email isn't already on the account
        if (!existing) {
          const newEmailObj = await user!.createEmailAddress({ email: newEmail });
          await newEmailObj.prepareVerification({ strategy: "email_code" });
        
          setPendingEmail(newEmail);
          setPendingEmailId(newEmailObj.id);
          setShowVerifyModal(true);
        }
      }
  
      setSelectedSection("Profile");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const email = user!.emailAddresses.find((e) => e.id === pendingEmailId);
      if (!email) throw new Error("Email not found");
  
      await email.attemptVerification({ code: verificationCode });
  
      // Set as primary after verification
      await user!.update({ primaryEmailAddressId: email.id });
  
      // Optional: remove previous email
      const oldEmail = user!.primaryEmailAddress;
      if (oldEmail && oldEmail.id !== email.id) {
        await oldEmail.destroy();
      }
  
      setShowVerifyModal(false);
      alert("Email verified and updated successfully!");
    } catch (err: any) {
      console.error("Verification failed:", err);
      setVerifyError("Invalid code. Please try again.");
    }
  };

  // Loader implementation for profile picture
  const contentfulImageLoader = ({ src, width }: { src: string, width: number }) => {
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
      const croppedFile = new File([blob], "cropped-image.jpeg", { type: "image/jpeg" });
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
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-medium mb-2 sm:mb-4 text-gray-900 dark:text-gray-100">Profile Information</h2>
            {favoriteTeam && favoriteTeam.logoUrl && (
              <div className="flex items-center mb-2 sm:mb-4">
                <img
                  src={favoriteTeam.logoUrl}
                  width="48"
                  height="48"
                  alt={favoriteTeam.name || "Favorite Team Logo"}
                  className="object-contain"
                />
              </div>
            )}
            <table className="w-full text-left bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md table-auto">
                <tbody>
                    <tr>
                        <td className="px-2 sm:px-4 py-1 sm:py-2 font-semibold text-gray-700 dark:text-gray-200 text-base sm:text-xl">Current Username</td>
                        <td className="px-2 sm:px-4 py-1 sm:py-2 text-gray-600 dark:text-gray-300 text-base sm:text-xl">{user?.username}</td>
                    </tr>
                    <tr>
                        <td className="px-2 sm:px-4 py-1 sm:py-2 font-semibold text-gray-700 dark:text-gray-200 text-base sm:text-xl">First Name</td>
                        <td className="px-2 sm:px-4 py-1 sm:py-2 text-gray-600 dark:text-gray-300 text-base sm:text-xl">{user?.firstName}</td>
                    </tr>
                    <tr>
                        <td className="px-2 sm:px-4 py-1 sm:py-2 font-semibold text-gray-700 dark:text-gray-200 text-base sm:text-xl">Last Name</td>
                        <td className="px-2 sm:px-4 py-1 sm:py-2 text-gray-600 dark:text-gray-300 text-base sm:text-xl">{user?.lastName}</td>
                    </tr>
                    <tr>
                        <td className="px-2 sm:px-4 py-1 sm:py-2 font-semibold text-gray-700 dark:text-gray-200 text-base sm:text-xl">Email</td>
                        <td className="px-2 sm:px-4 py-1 sm:py-2 text-gray-600 dark:text-gray-300 text-base sm:text-xl">{user?.primaryEmailAddress?.toString()}</td>
                    </tr>
                </tbody>
            </table>
            
            <button
                onClick={() => setSelectedSection('Edit Profile')}
                className="w-full sm:w-auto mt-2 sm:mt-4 text-left px-3 sm:px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-semibold shadow-sm">
                Edit Profile
            </button>
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
                        <label className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 w-1/6" htmlFor="email">
                          *Email:
                        </label>
                        {errors.email?.type === "required" && (
                          <div className="text-sm text-red-600 mb-1 px-4">This field is required</div>
                        )}
                        {errors.email?.type === "pattern" && (
                          <div className="text-sm text-red-600 mb-1 px-4">Enter a valid email (e.g. example@example.com)</div>
                        )}
                        <input
                          defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""}
                          {...register("email", {
                            required: true,
                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          })}
                          className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 dark:text-gray-200 dark:bg-gray-800 shadow focus:outline-none"
                        />
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
                          <p className="text-xs text-gray-500 mt-1 px-4">Only JPG/JPEG files up to 3MB are allowed</p>
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
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-700 dark:text-gray-100">Social Media Links</h2>
            <form onSubmit={handleSubmit(handleSocialMediaSubmit)} className="space-y-2 sm:space-y-4">
              {[
                { display: 'X', key: 'x' },
                { display: 'Instagram', key: 'instagram' },
                { display: 'Discord', key: 'discord' },
                { display: 'Facebook', key: 'facebook' },
                { display: 'Snapchat', key: 'snapchat' } 
              ].map((platform) => (
                <div key={platform.key} className="flex flex-col">
                  <label className="px-2 sm:px-4 py-1 sm:py-2 font-semibold text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                    {platform.display}:
                  </label>
                  <input
                    defaultValue={socialLinks[platform.key as keyof typeof socialLinks] || ''}
                    {...register(platform.key)}
                    placeholder={`Enter your ${platform.display} profile handle`}
                    className="focus:shadow-outline w-full appearance-none rounded border px-2 sm:px-3 py-1 sm:py-2 leading-tight text-gray-700 dark:text-gray-200 dark:bg-gray-800 shadow focus:outline-none text-sm sm:text-base"
                  />
                </div>
              ))}
              
              <div className="space-x-2 py-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-semibold shadow-sm hover:bg-blue-600 text-sm sm:text-base"
                >
                  Save Social Links
                </button>
              </div>
            </form>

            {/* Displaying the social media links */}
            <div className="mt-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-100">Your Social Media Links:</h3>
              <ul className="space-y-1 sm:space-y-2">
                {Object.entries(socialLinks).map(([key, value]) => (
                  value && (
                    <li key={key} className="text-sm sm:text-base">
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
                        className="text-blue-500 dark:text-blue-400 hover:underline hover:bg-gray-200 dark:hover:bg-gray-800"
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
    <div className="min-h-[80vh] p-2 sm:p-4 md:p-8 flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full h-full max-w-[95vw] bg-card dark:bg-card-background rounded-lg shadow-lg overflow-hidden">
        {/* Left Section of profile screen */}
        <div className="w-full md:w-1/6 bg-gray-50 dark:bg-gray-800 p-2 sm:p-4 md:p-6 flex flex-col items-center">
          {/* Profile Picture and Navigation */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 sm:mb-4 cursor-pointer group" onClick={handleImageClick}>
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
              <p className="select-none cursor-pointer text-white text-2xl sm:text-3xl md:text-4xl">&#9998;</p>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onClick={event => event.currentTarget.value = ""} 
            onChange={handleFileChange} 
            className="hidden" 
            aria-label="Profile picture upload"
          />
          {renderNavigationButtons()}
        </div>
        {/* Right Section of profile screen */}
        <div className="w-full md:w-5/6 p-2 sm:p-4 md:p-8 overflow-y-auto bg-white dark:bg-gray-900">
          {renderContent()}
        </div>
        {showVerifyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Verify Your New Email
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              We've sent a verification code to <strong>{pendingEmail}</strong>. Please enter it below.
            </p>

            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
              className="w-full px-4 py-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />

            {verifyError && (
              <p className="text-sm text-red-500 mb-3">{verifyError}</p>
            )}

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                onClick={() => {
                  setShowVerifyModal(false);
                  setVerificationCode("");
                  setVerifyError("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white rounded-lg bg-blue-500 hover:bg-blue-600"
                onClick={handleVerifyEmail}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
      
      {showCropper && selectedFile && (
        <ImageCropper imageFile={selectedFile} onCropComplete={handleCropComplete} onCancel={() => setShowCropper(false)} />
      )}
    </div>
  );
};

export default Profile;