'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

export default function UserMatch() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  useEffect(() => {
    if (isSignedIn && user) {
      fetch('/api/user/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id, // Clerk's unique user ID
          email: user.primaryEmailAddress?.emailAddress,
          username: user.username ?? user.primaryEmailAddress?.emailAddress?.split('@')[0],
          // Add any other fields you want to store
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log('User saved:', data))
        .catch((err) => console.error('Error saving user:', err));
    }
  }, [isSignedIn, user]);

  return null;
}
