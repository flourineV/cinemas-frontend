import { v4 as uuidv4 } from "uuid";

const GUEST_SESSION_KEY = "guest_session_id";

const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

const getOrCreateGuestSession = (): string => {
  const isLoggedIn = isUserLoggedIn();

  if (isLoggedIn) {
    return "";
  }

  let guestSessionId = localStorage.getItem(GUEST_SESSION_KEY);

  if (!guestSessionId) {
    guestSessionId = uuidv4();
    localStorage.setItem(GUEST_SESSION_KEY, guestSessionId);
    console.log("🆕 Created new guest session:", guestSessionId);
  } else {
    console.log("♻️ Using existing guest session:", guestSessionId);
  }

  return guestSessionId;
};

export const guestSessionUtils = {
  getOrCreateGuestSession,

  getGuestSession(): string | null {
    return localStorage.getItem(GUEST_SESSION_KEY);
  },

  clearGuestSession(): void {
    localStorage.removeItem(GUEST_SESSION_KEY);
    console.log("🗑️ Cleared guest session");
  },

  isUserLoggedIn,

  getUserOrGuestId(): { userId?: string; guestSessionId?: string } {
    if (isUserLoggedIn()) {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          return { userId: userData.id };
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }

    return { guestSessionId: getOrCreateGuestSession() };
  },
};
