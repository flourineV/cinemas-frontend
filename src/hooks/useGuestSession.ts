import { useEffect, useState } from "react";
import { guestSessionUtils } from "@/utils/guestSession";

export const useGuestSession = () => {
  const [guestSessionId, setGuestSessionId] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const loggedIn = guestSessionUtils.isUserLoggedIn();
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      const sessionId = guestSessionUtils.getOrCreateGuestSession();
      setGuestSessionId(sessionId);
    }
  }, []);

  return {
    guestSessionId,
    isLoggedIn,
    getUserOrGuestId: guestSessionUtils.getUserOrGuestId,
    clearGuestSession: guestSessionUtils.clearGuestSession,
  };
};
