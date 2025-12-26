import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth/authService";
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
            const { userProfileService } = await import(
              "@/services/userprofile/userProfileService"
            );
            await userProfileService.createProfile({
              userId: jwt.user.id,
              email: jwt.user.email,
              username: jwt.user.username,
              fullName: jwt.user.username, // Use username as default fullName
              phoneNumber: data.phoneNumber,
              nationalId: data.nationalId,
            });
          } catch (profileError) {
            console.error("Failed to create profile:", profileError);
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
          set({
            error: err.response?.data?.message || "Sign in failed",
            loading: false,
          });
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
            },
            accessToken,
            refreshToken,
          });
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
