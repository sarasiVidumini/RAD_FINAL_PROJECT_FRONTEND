import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, Upload, LayoutDashboard, MessageSquare, Shield, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Guard against unauthenticated sessions attempting to cross protected paths
  useEffect(() => {
    const protectedPaths = ['/dashboard', '/upload', '/requests', '/admin'];
    const token = localStorage.getItem('token'); // Adjust key name to match your auth slice storage
    
    if (protectedPaths.includes(location.pathname) && !user && !token) {
      navigate('/login', { replace: true });
    }
  }, [location.pathname, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Determine administrative status based on credentials and designated service account mapping
  const isSystemAdmin = user?.role === 'admin' || user?.email === 'admin@college.edu';

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 text-2xl font-bold text-indigo-600">
          <BookOpen size={32} />
          NoteVault
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 transition ${
                  location.pathname === '/dashboard' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                <LayoutDashboard size={20} /> Dashboard
              </Link>

              <Link 
                to="/requests" 
                className={`flex items-center gap-2 transition ${
                  location.pathname === '/requests' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                <MessageSquare size={20} /> Requests
              </Link>

              <Link 
                to="/upload" 
                className={`flex items-center gap-2 transition ${
                  location.pathname === '/upload' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                <Upload size={20} /> Upload Notes
              </Link>

              {isSystemAdmin && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium ${
                    location.pathname === '/admin' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <Shield size={20} /> Admin Panel
                </Link>
              )}

              <div className="h-5 w-[1px] bg-gray-200 self-center" />

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{user.name}</p>
                  <p className="text-xs text-gray-500 font-mono">
                    {isSystemAdmin ? '👑 Systems Admin' : `Sem ${user.semester || 3}`}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition group p-1 rounded-lg hover:bg-gray-50"
                  title="Logout Session"
                >
                  <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-indigo-600 transition font-medium">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl hover:bg-indigo-700 transition font-medium shadow-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}