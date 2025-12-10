import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-hot-toast';

/**
 * Protected Route Component
 * Restricts access based on authentication and user roles
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, userProfile, loading, logout } = useAuth();

  useEffect(() => {
    // Check if user is inactive and logout
    if (userProfile && userProfile.isActive === false) {
      toast.error('Your account has been deactivated. Please contact an administrator.');
      logout();
    }
  }, [userProfile, logout]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if user account is inactive
  if (userProfile && userProfile.isActive === false) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
