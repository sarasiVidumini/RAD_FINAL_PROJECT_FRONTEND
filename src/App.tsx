import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Dashboard from './pages/student/Dashboard';
import StudentExperts from './pages/StudentExperts'; // New Expert Directory component Matrix Link
import ExpertDashboard from './pages/expert/ExpertDashboard'; 
import AdminDashboard from './pages/Admin/AdminDashboard';
import Requests from './pages/Requests';
import NoteDetailsPage from './pages/NoteDetailsPage'; // Dynamic detailed secure notes preview node

import { useAuth } from './hooks/useAuth';

function PrivateRoute({ children, allowedRoles }: { 
  children: React.ReactElement; 
  allowedRoles?: ('student' | 'expert' | 'admin')[] 
}) {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  if (!user && !token) return <Navigate to="/login" replace />;
  
  // Standardized routing loops management checking admin credentials matrix matching rules
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin' || user.email?.toLowerCase() === 'admin@notevault.com' || user.email?.toLowerCase() === 'admin@glowcare.ai') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'expert') return <Navigate to="/expert-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Redirect Component to forward generic unassigned logged-in paths to proper dashboards
function DynamicDashboardFallback() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  // Checking both role properties and matching admin string signatures explicitly
  if (user.role === 'admin' || user.email?.toLowerCase() === 'admin@notevault.com' || user.email?.toLowerCase() === 'admin@glowcare.ai') {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === 'expert') return <Navigate to="/expert-dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/upload" 
            element={
              <PrivateRoute allowedRoles={['student', 'expert', 'admin']}>
                <Upload />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute allowedRoles={['student']}>
                <Dashboard />
              </PrivateRoute>
            } 
          />

          {/* Explicit private path linking up your customized Student Expert Chat Matrix */}
          <Route 
            path="/experts" 
            element={
              <PrivateRoute allowedRoles={['student', 'admin']}>
                <StudentExperts />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/expert-dashboard" 
            element={
              <PrivateRoute allowedRoles={['expert']}>
                <ExpertDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/requests" 
            element={
              <PrivateRoute allowedRoles={['student', 'expert', 'admin']}>
                <Requests />
              </PrivateRoute>
            } 
          />

          {/* Root Admin Control Panel View Route */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />

          {/* Secure Registered User Profiles Directory Registry Path View */}
          <Route 
            path="/admin/users" 
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />

          {/* Dynamic routing parameter path for viewing specific secure documents */}
          <Route 
            path="/notes/:noteId" 
            element={
              <PrivateRoute allowedRoles={['student', 'expert', 'admin']}>
                <NoteDetailsPage />
              </PrivateRoute>
            } 
          />

          {/* Catch-all dynamic fallback for routing redirects */}
          <Route path="/home" element={<DynamicDashboardFallback />} />
          <Route path="*" element={<DynamicDashboardFallback />} />
        </Routes>
        
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}