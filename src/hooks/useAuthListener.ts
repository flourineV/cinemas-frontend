import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useResetPasswordListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const channel = new BroadcastChannel("auth-sync");

    channel.onmessage = (event) => {
      const { type, token } = event.data;
      if (type === "RESET_PASSWORD" && token) {
        console.log("📨 Nhận token từ tab khác:", token);
        navigate(`/reset-password?token=${token}`);
      }
    };

    // Dọn dẹp
    return () => channel.close();
  }, [navigate]);
}
