import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export const useAuthActions = () => {
  const { clearAuth, checkAuthStatus } = useAuthStore();
  const navigate = useNavigate();

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  const checkAuth = () => {
    checkAuthStatus();
  };

  return {
    logout,
    checkAuth,
  };
};