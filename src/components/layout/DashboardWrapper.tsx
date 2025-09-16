import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import UserDashboard from '../../pages/Dashboard/UserDashboard';
import StaffDashboard from '../../pages/Dashboard/StaffDashboard';
import AdminDashboard from '../../pages/Dashboard/AdminDashboard';

const DashboardWrapper: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  
  // Check if user is authenticated
  if (!isAuthenticated || !userRole) {
    return <Navigate to="/login" replace />;
  }
  
  // Render appropriate dashboard based on role
  if (userRole === 'ADMIN') return <AdminDashboard />;
  if (userRole === 'STAFF') return <StaffDashboard />;
  return <UserDashboard />;
};

export default DashboardWrapper;