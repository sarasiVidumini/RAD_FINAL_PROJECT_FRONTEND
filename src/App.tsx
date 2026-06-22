// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Dashboard from './pages/student/Dashboard';
import AiStudyMode from './pages/student/Aistudymode';   // ← NEW
import StudentExperts from './pages/StudentExperts';
import ExpertDashboard from './pages/expert/ExpertDashboard'; 
import AdminDashboard from './pages/Admin/AdminDashboard';
import Requests from './pages/Requests';
import GroupChat from './pages/GroupChat';
import NoteDetailsPage from './pages/NoteDetailsPage';
import Profile from './pages/Profile';

import { useAuth } from './hooks/useAuth';

function PrivateRoute({ children, allowedRoles }: { 
  children: React.ReactElement; 
  allowedRoles?: ('student' | 'expert' | 'admin')[] 
}) {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  if (!user && !token) return <Navigate to="/login" replace />;
  
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin' || user.email?.toLowerCase() === 'admin@glowcare.ai' || user.email?.toLowerCase() === 'admin@notevault.com') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'expert') return <Navigate to="/expert-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function DynamicDashboardFallback() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin' || user.email?.toLowerCase() === 'admin@glowcare.ai' || user.email?.toLowerCase() === 'admin@notevault.com') {
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

            <Route 
              path="/profile" 
              element={
                  <PrivateRoute allowedRoles={['student', 'expert', 'admin']}>
                    <Profile />
                  </PrivateRoute>
              } 
            />

          
          {/* ── AI Study Mode — students only ── */}
          <Route
            path="/study"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <AiStudyMode />
              </PrivateRoute>
            }
          />

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


          <Route 
            path="/group-chat" 
            element={
              <PrivateRoute allowedRoles={['student', 'expert', 'admin']}>
                <GroupChat />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/admin/users" 
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/notes/:noteId" 
            element={
              <PrivateRoute allowedRoles={['student', 'expert', 'admin']}>
                <NoteDetailsPage />
              </PrivateRoute>
            } 
          />

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