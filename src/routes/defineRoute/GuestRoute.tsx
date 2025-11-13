import React from "react";
import { Navigate } from "react-router-dom";
import { getUserRole, isTokenExpired } from "@/utils/authHelper";
import type { UserRole } from "@/constants/UserRole";

interface GuestRouteProps {
  children: React.ReactNode;
  // nếu true thì treat expired token as guest (mặc định true)
  treatExpiredAsGuest?: boolean;
}

const roleToDashboard = (role: UserRole) => {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MANAGER":
      return "/manager/dashboard";
    case "STAFF":
      return "/staff/dashboard";
    case "CUSTOMER":
      return "/profile";
    default:
      return "/";
  }
};

/**
 * GuestRoute: chỉ cho guest (chưa login) truy cập.
 * Nếu token tồn tại và còn hiệu lực -> redirect về dashboard tương ứng.
 */
const GuestRoute: React.FC<GuestRouteProps> = ({
  children,
  treatExpiredAsGuest = true,
}) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // chưa login -> là guest
      return <>{children}</>;
    }

    const expired = isTokenExpired(token);
    if (expired) {
      // token hết hạn -> tuỳ cấu hình: coi như guest (mặc định true)
      if (treatExpiredAsGuest) return <>{children}</>;
      // nếu bạn muốn redirect người có token expired -> login, fallback:
      return <Navigate to="/login" replace />;
    }

    // token hợp lệ -> lấy role và redirect sang dashboard tương ứng
    const role = getUserRole(token) as UserRole;
    const to = roleToDashboard(role);
    return <Navigate to={to} replace />;
  } catch (err) {
    console.error("GuestRoute error:", err);
    // lỗi helper -> để an toàn: treat as guest
    return <>{children}</>;
  }
};

export default GuestRoute;
