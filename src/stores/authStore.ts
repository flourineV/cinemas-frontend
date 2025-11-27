import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth/authService";
import type {
  SignInRequest,
  SignUpRequest,
  JwtResponse,
} from "@/types/auth/auth.type";
import { decodeToken, getUserRole, isTokenExpired } from "@/utils/authHelper";

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
  signin: (data: SignInRequest) => Promise<void>;
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
        } catch (err: any) {
          set({
            error: err.response?.data?.message || "Sign up failed",
            loading: false,
          });
        }
      },

      signin: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await authService.signin(data);
          const jwt: JwtResponse = res.data;

          localStorage.setItem("accessToken", jwt.accessToken ?? "");
          localStorage.setItem("refreshToken", jwt.refreshToken ?? "");

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

        // Trigger guest session creation by dispatching storage event
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "user",
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
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          set({ user: null, accessToken: null });
          return;
        }

        try {
          const res = await authService.refreshToken({ refreshToken });
          const jwt: JwtResponse = res.data;

          localStorage.setItem("accessToken", jwt.accessToken ?? "");
          set({
            accessToken: jwt.accessToken,
            user: jwt.user,
          });
        } catch {
          set({ user: null, accessToken: null });
        }
      },

      checkAuth: async () => {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken) {
          if (refreshToken) await get().refreshAccessToken();
          else set({ user: null });
          return;
        }

        if (isTokenExpired(accessToken)) {
          if (refreshToken) await get().refreshAccessToken();
          else set({ user: null });
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
