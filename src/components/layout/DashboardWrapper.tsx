import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';
import Home from '../../pages/Home'
import StaffDashboard from '../../pages/Dashboard/StaffDashboard';
import AdminDashboard from '../../pages/Dashboard/AdminDashboard';

const DashboardWrapper: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated || !user?.role) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'STAFF') return <StaffDashboard />;
  return <Home />;
};

export default DashboardWrapper;