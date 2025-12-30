import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export const useEmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const navigateToVerification = (email?: string, returnUrl?: string) => {
    const targetEmail = email || user?.email;
    if (!targetEmail) {
      console.warn("No email provided for verification");
      return;
    }

    const params = new URLSearchParams();
    if (targetEmail !== user?.email) {
      params.set("email", targetEmail);
    }
    if (returnUrl) {
      params.set("returnUrl", returnUrl);
    } else if (location.pathname !== "/email-verification") {
      params.set("returnUrl", location.pathname + location.search);
    }

    const queryString = params.toString();
    navigate(`/email-verification${queryString ? `?${queryString}` : ""}`);
  };

  return {
    navigateToVerification,
  };
};
