import { v4 as uuidv4 } from "uuid";

const GUEST_SESSION_KEY = "guest_session_id";

const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem("accessToken");
  const authStorage = localStorage.getItem("auth-storage");

  let hasUser = false;
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      hasUser = !!parsed?.state?.user?.id;
    } catch (e) {
      console.error("Error parsing auth-storage:", e);
    }
  }

  const result = !!(token && hasUser);

  console.log(
    "🔍 [isUserLoggedIn] token:",
    !!token,
    "authStorage:",
    !!authStorage,
    "hasUser:",
    hasUser,
    "result:",
    result
  );

  return result;
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
    const loggedIn = isUserLoggedIn();
    console.log("🔍 [getUserOrGuestId] isLoggedIn:", loggedIn);

    if (loggedIn) {
      const authStorage = localStorage.getItem("auth-storage");
      console.log(
        "🔍 [getUserOrGuestId] authStorage from localStorage:",
        !!authStorage
      );

      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const userId = parsed?.state?.user?.id;
          if (userId) {
            console.log("✅ [getUserOrGuestId] Returning userId:", userId);
            return { userId };
          }
        } catch (error) {
          console.error(
            "❌ [getUserOrGuestId] Error parsing auth-storage:",
            error
          );
        }
      } else {
        console.warn(
          "⚠️ [getUserOrGuestId] User is logged in but no auth-storage in localStorage!"
        );
      }
    }

    console.log("👻 [getUserOrGuestId] Creating/using guest session");
    return { guestSessionId: getOrCreateGuestSession() };
  },
};
