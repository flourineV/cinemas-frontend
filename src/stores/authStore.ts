import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth/authService";
import { userProfileService } from "@/services/userprofile/userProfileService";
import type {
  SignInRequest,
  SignUpRequest,
  JwtResponse,
} from "@/types/auth/auth.type";
import { decodeToken, getUserRole, isTokenExpired } from "@/utils/authHelper";
import {
  setCookie,
  getCookie,
  deleteAllAuthCookies,
} from "@/utils/cookieHelper";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signup: (data: SignUpRequest) => Promise<void>;
  signin: (data: SignInRequest, rememberMe?: boolean) => Promise<void>;
  signout: () => void;
  refreshAccessToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,

      signup: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await authService.signup(data);
          const jwt: JwtResponse = res.data;

          localStorage.setItem("accessToken", jwt.accessToken ?? "");
          localStorage.setItem("refreshToken", jwt.refreshToken ?? "");

          // Clear guest session when user signs up
          localStorage.removeItem("guest_session_id");

          set({
            user: jwt.user,
            accessToken: jwt.accessToken,
            refreshToken: jwt.refreshToken,
            loading: false,
          });

          // Create user profile after successful signup
          try {
            // Small delay to ensure token is set in localStorage
            await new Promise((resolve) => setTimeout(resolve, 100));

            console.log("🔄 Creating profile with data:", {
              userId: jwt.user.id,
              email: jwt.user.email,
              username: jwt.user.username,
              fullName: jwt.user.username,
              phoneNumber: data.phoneNumber,
              nationalId: data.nationalId,
            });

            const profileResult = await userProfileService.createProfile({
              userId: jwt.user.id,
              email: jwt.user.email,
              username: jwt.user.username,
              fullName: jwt.user.username, // Use username as default fullName
              phoneNumber: data.phoneNumber,
              nationalId: data.nationalId,
            });
            console.log(
              "✅ Profile created successfully for user:",
              jwt.user.id,
              profileResult
            );
          } catch (profileError: any) {
            console.error("❌ Failed to create profile:", profileError);
            console.error(
              "❌ Profile error response:",
              profileError.response?.data
            );
            // Don't fail the signup process if profile creation fails
          }
        } catch (err: any) {
          set({
            error: err.response?.data?.message || "Sign up failed",
            loading: false,
          });
        }
      },

      signin: async (data, rememberMe = false) => {
        set({ loading: true, error: null });
        try {
          const res = await authService.signin(data);
          const jwt: JwtResponse = res.data;

          // Only proceed if we have a successful response
          if (!jwt.accessToken || !jwt.user) {
            throw new Error("Invalid response from server");
          }

          // Always save to localStorage for immediate use
          localStorage.setItem("accessToken", jwt.accessToken ?? "");
          localStorage.setItem("refreshToken", jwt.refreshToken ?? "");

          if (rememberMe) {
            // Also save to cookies for persistence across browser sessions (30 days)
            setCookie("accessToken", jwt.accessToken ?? "", 30);
            setCookie("refreshToken", jwt.refreshToken ?? "", 30);
            setCookie("rememberMe", "true", 30);
          } else {
            // Clear any existing remember me cookies
            deleteAllAuthCookies();
          }

          // Clear guest session when user logs in
          localStorage.removeItem("guest_session_id");

          set({
            user: jwt.user,
            accessToken: jwt.accessToken,
            refreshToken: jwt.refreshToken,
            loading: false,
          });
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Sign in failed";
          set({
            error: errorMessage,
            loading: false,
            user: null, // Ensure user is cleared on error
            accessToken: null,
            refreshToken: null,
          });

          // Clear any stored tokens on error
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          deleteAllAuthCookies();

          throw err; // Re-throw so component can handle specific errors
        }
      },

      signout: () => {
        authService.signout().catch(() => {});
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Also clear cookies
        deleteAllAuthCookies();

        // Trigger guest session creation by dispatching storage event
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "auth-storage",
            oldValue: "something",
            newValue: null,
            url: window.location.href,
          })
        );

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
          loading: false,
        });
      },

      refreshAccessToken: async () => {
        let refreshToken = localStorage.getItem("refreshToken");

        // If not in localStorage, check cookies
        if (!refreshToken) {
          refreshToken = getCookie("refreshToken");
        }

        if (!refreshToken) {
          set({ user: null, accessToken: null });
          return;
        }

        try {
          const res = await authService.refreshToken({ refreshToken });
          const jwt: JwtResponse = res.data;

          // Always save to localStorage for immediate use
          localStorage.setItem("accessToken", jwt.accessToken ?? "");

          // Check if we should also save to cookies (remember me was enabled)
          const isRemembered = getCookie("rememberMe") === "true";
          if (isRemembered) {
            setCookie("accessToken", jwt.accessToken ?? "", 30);
          }

          set({
            accessToken: jwt.accessToken,
            user: jwt.user,
          });
        } catch {
          set({ user: null, accessToken: null });
          // Clear invalid tokens
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          deleteAllAuthCookies();
        }
      },

      checkAuth: async () => {
        let accessToken = localStorage.getItem("accessToken");
        let refreshToken = localStorage.getItem("refreshToken");

        // If not in localStorage, check cookies (remember me)
        if (!accessToken) {
          accessToken = getCookie("accessToken");
        }
        if (!refreshToken) {
          refreshToken = getCookie("refreshToken");
        }

        if (!accessToken) {
          if (refreshToken) await get().refreshAccessToken();
          else set({ user: null });
          return;
        }

        if (isTokenExpired(accessToken)) {
          if (refreshToken) await get().refreshAccessToken();
          else {
            set({ user: null });
            // Clear expired tokens
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            deleteAllAuthCookies();
          }
          return;
        }

        const decoded = decodeToken(accessToken);
        if (decoded)
          set({
            user: {
              id: decoded.sub,
              username: decoded.username ?? "",
              email: decoded.email ?? "",
              role: decoded.role ?? getUserRole(accessToken),
              emailVerified: decoded.emailVerified ?? false,
            },
            accessToken,
            refreshToken,
          });
      },

      refreshUser: async () => {
        const { accessToken } = get();
        if (!accessToken || isTokenExpired(accessToken)) {
          await get().checkAuth();
          return;
        }

        const decoded = decodeToken(accessToken);
        if (decoded) {
          set({
            user: {
              id: decoded.sub,
              username: decoded.username ?? "",
              email: decoded.email ?? "",
              role: decoded.role ?? getUserRole(accessToken),
              emailVerified: decoded.emailVerified ?? false,
            },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
