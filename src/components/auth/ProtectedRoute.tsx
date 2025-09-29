import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole, isTokenExpired } from '../../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'STAFF' | 'ADMIN';
  allowedRoles?: ('USER' | 'STAFF' | 'ADMIN')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const token = localStorage.getItem('authToken');
  
  // Check if user is authenticated
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }
  
  // Get user role from token
  const userRole = getUserRole(token);
  
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    switch (userRole) {
      case 'USER':
        return <Navigate to="/dashboard/user" replace />;
      case 'STAFF':
        return <Navigate to="/dashboard/staff" replace />;
      case 'ADMIN':
        return <Navigate to="/dashboard/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  // Check if user role is in allowed roles
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on user's actual role
    switch (userRole) {
      case 'USER':
        return <Navigate to="/dashboard/user" replace />;
      case 'STAFF':
        return <Navigate to="/dashboard/staff" replace />;
      case 'ADMIN':
        return <Navigate to="/dashboard/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;