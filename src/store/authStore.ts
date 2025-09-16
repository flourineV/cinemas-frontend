import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import { getUserRole, isTokenExpired } from '../utils/auth';

interface AuthState {
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
  signupToken: string | null;
  
  // User info
  userRole: 'USER' | 'STAFF' | 'ADMIN' | null;
  isAuthenticated: boolean;
  
  // Actions
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setSignupToken: (token: string) => void;
  clearAuth: () => void;
  checkAuthStatus: () => void;
  getUserInfo: () => { role: string | null; isAuth: boolean };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      accessToken: null,
      refreshToken: null,
      signupToken: null,
      userRole: null,
      isAuthenticated: false,

      // Set access and refresh tokens
      setTokens: (accessToken: string, refreshToken?: string) => {
        const role = getUserRole(accessToken);
        const isValid = !isTokenExpired(accessToken);
        
        set({
          accessToken,
          refreshToken: refreshToken || get().refreshToken,
          userRole: role,
          isAuthenticated: isValid && !!role,
        });
      },

      // Set signup token
      setSignupToken: (token: string) => {
        set({ signupToken: token });
      },

      // Clear all auth data
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          signupToken: null,
          userRole: null,
          isAuthenticated: false,
        });
      },

      // Check if current tokens are still valid
      checkAuthStatus: () => {
        const { accessToken } = get();
        
        if (!accessToken) {
          set({ isAuthenticated: false, userRole: null });
          return;
        }

        if (isTokenExpired(accessToken)) {
          // Token expired, clear auth
          get().clearAuth();
          return;
        }

        // Token is valid, update role and auth status
        const role = getUserRole(accessToken);
        set({
          userRole: role,
          isAuthenticated: !!role,
        });
      },

      // Get user info
      getUserInfo: () => {
        const { userRole, isAuthenticated } = get();
        return {
          role: userRole,
          isAuth: isAuthenticated,
        };
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist tokens, not computed values
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        signupToken: state.signupToken,
      }),
    }
  )
);

// Hook to get auth status
export const useAuth = () => {
  const store = useAuthStore();
  
  // Check auth status on every call
  useEffect(() => {
    store.checkAuthStatus();
  }, [store.accessToken]);

  return {
    isAuthenticated: store.isAuthenticated,
    userRole: store.userRole,
    accessToken: store.accessToken,
    refreshToken: store.refreshToken,
    signupToken: store.signupToken,
    setTokens: store.setTokens,
    setSignupToken: store.setSignupToken,
    clearAuth: store.clearAuth,
    checkAuthStatus: store.checkAuthStatus,
    getUserInfo: store.getUserInfo,
  };
};