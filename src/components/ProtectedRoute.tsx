import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  // Changing JSX.Element to React.ReactElement fixes the namespace error cleanly
  children: React.ReactElement; 
  allowedRoles: ('student' | 'expert' | 'admin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const token = localStorage.getItem('token'); 

  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  // Cast user.role as any to align with allowedRoles array safely
  if (user && !allowedRoles.includes(user.role as any)) {
    const currentRole = user.role as string;
    if (currentRole === 'admin') return <Navigate to="/admin" replace />;
    if (currentRole === 'expert') return <Navigate to="/expert-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}