import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";

export const useAuthActions = () => {
  const { signout, refreshUser } = useAuthStore();
  const navigate = useNavigate();

  const logout = () => {
    signout();
    navigate("/home");
  };

  const checkAuth = async () => {
    await refreshUser(); // Kiểm tra phiên qua cookie hoặc token
  };

  return { logout, checkAuth };
};
