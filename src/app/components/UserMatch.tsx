'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

export default function UserMatch() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const checkUserExists = async () => {
        try {
          const response = await fetch(`/api/user/get?clerkId=${user.id}`);
          const data = await response.json();

          if (data.exists) {
            console.log("User already exists, skipping POST.");
            return;
          }

          // If user doesn't exist, make the POST request
          await fetch('/api/user/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkId: user.id, // Clerk's unique user ID
              email: user.primaryEmailAddress?.emailAddress,
              username: user.username ?? user.primaryEmailAddress?.emailAddress?.split('@')[0],
            }),
          });

          console.log("User saved successfully.");
        } catch (err) {
          console.error("Error checking or saving user:", err);
        }
      };

      checkUserExists();
    }
  }, [isSignedIn, user]);

  return null;
}
