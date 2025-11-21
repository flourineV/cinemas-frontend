import React, { createContext, useContext, useEffect, useState } from "react";
import { guestSessionUtils } from "@/utils/guestSession";

interface GuestSessionContextType {
  guestSessionId: string;
  isLoggedIn: boolean;
  getUserOrGuestId: () => { userId?: string; guestSessionId?: string };
  clearGuestSession: () => void;
}

const GuestSessionContext = createContext<GuestSessionContextType | undefined>(
  undefined
);

export const GuestSessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [guestSessionId, setGuestSessionId] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Initialize guest session on app load
    const loggedIn = guestSessionUtils.isUserLoggedIn();
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      const sessionId = guestSessionUtils.getOrCreateGuestSession();
      setGuestSessionId(sessionId);
    }

    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "user") {
        const newLoggedIn = guestSessionUtils.isUserLoggedIn();
        setIsLoggedIn(newLoggedIn);

        if (!newLoggedIn) {
          const sessionId = guestSessionUtils.getOrCreateGuestSession();
          setGuestSessionId(sessionId);
        } else {
          guestSessionUtils.clearGuestSession();
          setGuestSessionId("");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value: GuestSessionContextType = {
    guestSessionId,
    isLoggedIn,
    getUserOrGuestId: guestSessionUtils.getUserOrGuestId,
    clearGuestSession: () => {
      guestSessionUtils.clearGuestSession();
      setGuestSessionId("");
    },
  };

  return (
    <GuestSessionContext.Provider value={value}>
      {children}
    </GuestSessionContext.Provider>
  );
};

export const useGuestSessionContext = () => {
  const context = useContext(GuestSessionContext);
  if (context === undefined) {
    throw new Error(
      "useGuestSessionContext must be used within a GuestSessionProvider"
    );
  }
  return context;
};
