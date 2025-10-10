import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth/authService";
import type { SignInRequest, SignUpRequest, JwtResponse } from "@/services/auth/authService";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

// ----------------------------
// STATE
// ----------------------------
interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// ----------------------------
// ACTIONS
// ----------------------------
interface AuthActions {
  signup: (data: SignUpRequest) => Promise<void>;
  signin: (data: SignInRequest) => Promise<void>;
  signout: () => void;
  refreshUser: () => Promise<void>;
}

// ----------------------------
// COMBINED STORE
// ----------------------------
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      // Đăng ký
      signup: async (data) => {
        try {
          set({ loading: true, error: null });
          const res = await authService.signup(data);
          const jwt: JwtResponse = res.data;

          // ⛔ Không lưu accessToken vì ông đang để trong localStorage riêng hoặc cookie
          localStorage.setItem("accessToken", jwt.accessToken ?? "");

          set({
            user: jwt.user,
            loading: false,
          });
        } catch (err: any) {
          set({
            error: err.response?.data?.message || "Sign up failed",
            loading: false,
          });
        }
      },

      // Đăng nhập
      signin: async (data) => {
        try {
          set({ loading: true, error: null });
          const res = await authService.signin(data);
          const jwt: JwtResponse = res.data;

          // ⚡ Tạm thời gắn accessToken để test dev
          localStorage.setItem("accessToken", jwt.accessToken ?? "");

          set({
            user: jwt.user,
            loading: false,
          });
        } catch (err: any) {
          set({
            error: err.response?.data?.message || "Sign in failed",
            loading: false,
          });
        }
      },

      // Đăng xuất
      signout: () => {
        try {
          authService.signout();
        } catch (_) {
          /* ignore network errors */
        }
        localStorage.removeItem("accessToken");
        set({ user: null, error: null, loading: false });
      },

      // Làm mới user từ server (khi F5, hoặc cookie đã có token)
      refreshUser: async () => {
        try {
          const res = await authService.refreshToken({
            refreshToken: localStorage.getItem("refreshToken") || "",
          });
          const jwt: JwtResponse = res.data;
          set({ user: jwt.user });
        } catch {
          set({ user: null });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user, // chỉ lưu user thôi
      }),
    }
  )
);
