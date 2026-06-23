import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: ('student' | 'expert' | 'admin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth(); // Assuming your hook provides a 'loading' state
  const token = localStorage.getItem('token');

  // 1. If still checking auth status, show nothing or a spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // 2. If no user and no token, go to login
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  // 3. If user exists but role is not allowed
  if (user && !allowedRoles.includes(user.role as any)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'expert') return <Navigate to="/expert-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}