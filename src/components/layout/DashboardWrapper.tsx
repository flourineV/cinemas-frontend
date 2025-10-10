import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import Home from "../../pages/Home";
import StaffDashboard from "../../pages/Dashboard/StaffDashboard";
import AdminDashboard from "../../pages/Dashboard/AdminDashboard";

const DashboardWrapper: React.FC = () => {
  const { user } = useAuthStore(); // 🔹 Lấy user trực tiếp từ Zustand

  // Nếu chưa đăng nhập hoặc không có role ⇒ quay về login
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  // Phân quyền dashboard
  switch (user.role.toUpperCase()) {
    case "ADMIN":
      return <AdminDashboard />;
    case "STAFF":
      return <StaffDashboard />;
    default:
      return <Home />;
  }
};

export default DashboardWrapper;
