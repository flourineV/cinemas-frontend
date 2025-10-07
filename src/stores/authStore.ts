import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import { isTokenExpired } from '../utils/authHelper';
import type { User } from '../types/index';

interface AuthState {
  // Tokens
  accessToken: string | null;

  // User info (lưu luôn cả id, username, role)
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (accessToken: string, user: User) => void;
  clearAuth: () => void;
  checkAuthStatus: () => void;
  getUserInfo: () => { id: string | null; username: string | null; role: string | null; isAuth: boolean };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      accessToken: null,
      user: null,
      isAuthenticated: false,

      // Set token + user info
      setAuth: (accessToken: string, user: User) => {
        const isValid = !isTokenExpired(accessToken);
        set({
          accessToken,
          user,
          isAuthenticated: isValid,
        });
      },

      // Clear all auth data
      clearAuth: () => {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      // Check if current token is still valid
      checkAuthStatus: () => {
        const { accessToken, user } = get();

        if (!accessToken || !user) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        if (isTokenExpired(accessToken)) {
          get().clearAuth();
          return;
        }

        set({
          isAuthenticated: true,
          user,
        });
      },

      // Get user info
      getUserInfo: () => {
        const { user, isAuthenticated } = get();
        return {
          id: user?.id || null,
          username: user?.username || null,
          role: user?.role || null,
          isAuth: isAuthenticated,
        };
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user, // persist luôn user object
      }),
    }
  )
);

// Hook để check trạng thái auth
export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    store.checkAuthStatus();
  }, [store.accessToken]);

  return {
    isAuthenticated: store.isAuthenticated,
    accessToken: store.accessToken,
    user: store.user,
    setAuth: store.setAuth,
    clearAuth: store.clearAuth,
    checkAuthStatus: store.checkAuthStatus,
    getUserInfo: store.getUserInfo,
  };
};
