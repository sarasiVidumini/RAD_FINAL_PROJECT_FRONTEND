

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Dashboard from './pages/student/Dashboard';
import AiStudyMode from './pages/student/Aistudymode';
import StudentExperts from './pages/StudentExperts';
import ExpertDashboard from './pages/expert/ExpertDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Requests from './pages/Requests';
import GroupChat from './pages/GroupChat';
import NoteDetailsPage from './pages/NoteDetailsPage';

import Profile from './pages/Profile';


export default function App() {

  const { user } = useAuth();
  

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute allowedRoles={['student', 'expert', 'admin']}><Upload /></ProtectedRoute>} />
          <Route path="/study" element={<ProtectedRoute allowedRoles={['student']}><AiStudyMode /></ProtectedRoute>} />
          <Route path="/experts" element={<ProtectedRoute allowedRoles={['student', 'admin']}><StudentExperts /></ProtectedRoute>} />
          <Route path="/expert-dashboard" element={<ProtectedRoute allowedRoles={['expert']}><ExpertDashboard /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute allowedRoles={['student', 'expert', 'admin']}><Requests /></ProtectedRoute>} />
          <Route path="/group-chat" element={<ProtectedRoute allowedRoles={['student', 'expert', 'admin']}><GroupChat /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['student', 'expert', 'admin']}><Profile /></ProtectedRoute>} />
          <Route path="/notes/:noteId" element={<ProtectedRoute allowedRoles={['student', 'expert', 'admin']}><NoteDetailsPage /></ProtectedRoute>} />

          {/* Fallback route */}
          <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        </Routes>
        
        {user && <Footer user={user} />}
        
        <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      </div>
    </Router>
  );
}