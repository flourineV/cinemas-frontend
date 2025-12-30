import React from "react";
import { Navigate } from "react-router-dom";
import { getUserRole, isTokenExpired } from "@/utils/authHelper";
import type { UserRole } from "@/constants/UserRole";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole; // CUSTOMER | MANAGER | ADMIN
}

const roleHierarchy: Record<UserRole, number> = {
  GUEST: 0,
  CUSTOMER: 1,
  MANAGER: 2,
  ADMIN: 3,
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const token = localStorage.getItem("accessToken");
  const userRole = getUserRole(token);

  // Nếu route không yêu cầu role → public route, không redirect
  if (!requiredRole) return <>{children}</>;

  // Nếu token không có hoặc hết hạn → redirect login
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/auth" replace />;
  }

  // Kiểm tra role đủ quyền
  const userLevel = roleHierarchy[userRole];
  const requiredLevel = roleHierarchy[requiredRole];

  if (userLevel < requiredLevel) {
    // Redirect theo role hiện tại
    switch (userRole) {
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "MANAGER":
        return <Navigate to="/manager/dashboard" replace />;
      case "CUSTOMER":
        return <Navigate to="/profile" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Token hợp lệ và role đủ quyền
  return <>{children}</>;
};

export default ProtectedRoute;
