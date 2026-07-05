/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { auth } from "../firebase";

interface UserAvatarProps {
  className?: string;
  fallbackClassName?: string;
  guestFallback?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  className = "w-full h-full object-cover filter grayscale contrast-125",
  fallbackClassName = "",
  guestFallback = "U",
  onClick 
}) => {
  const [imgError, setImgError] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    setCurrentUser(auth.currentUser);
    setImgError(false);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setImgError(false);
    });
    return () => unsubscribe();
  }, []);

  const getInitials = () => {
    if (!currentUser) return guestFallback;
    const displayName = currentUser.displayName;
    const email = currentUser.email;
    if (displayName) {
      const parts = displayName.trim().split(/\s+/);
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.split("@")[0].slice(0, 2).toUpperCase();
    }
    return guestFallback;
  };

  const photoURL = currentUser?.photoURL;

  if (photoURL && !imgError) {
    return (
      <img
        src={photoURL}
        alt={currentUser?.displayName || "User"}
        className={className}
        onError={() => setImgError(true)}
        onClick={onClick}
      />
    );
  }

  return (
    <div 
      className={`w-full h-full bg-black text-white flex items-center justify-center font-mono font-bold uppercase ${fallbackClassName}`}
      onClick={onClick}
    >
      {getInitials()}
    </div>
  );
};

export default UserAvatar;
