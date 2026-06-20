import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  BookOpen, Upload, LayoutDashboard, 
  MessageSquare, Shield, LogOut, User 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Guard against unauthenticated sessions
  useEffect(() => {
    const protectedPaths = ['/dashboard', '/upload', '/requests', '/admin'];
    const token = localStorage.getItem('token');
    
    if (protectedPaths.includes(location.pathname) && !user && !token) {
      navigate('/login', { replace: true });
    }
  }, [location.pathname, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isSystemAdmin = user?.role === 'admin' || user?.email === 'admin@college.edu';

  return (
    <nav className="bg-zinc-950 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 text-2xl font-bold text-white">
          <BookOpen size={32} className="text-violet-400" />
          NoteVault
        </Link>

        <div className="flex items-center gap-8">
          {user ? (
            <>
              {/* Navigation Links with Icons */}
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
                  location.pathname === '/dashboard' 
                    ? 'bg-violet-600 text-white' 
                    : 'text-slate-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <LayoutDashboard size={20} />
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link 
                to="/requests" 
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
                  location.pathname === '/requests' 
                    ? 'bg-violet-600 text-white' 
                    : 'text-slate-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <MessageSquare size={20} />
                <span className="font-medium">Requests</span>
              </Link>

              <Link 
                to="/upload" 
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
                  location.pathname === '/upload' 
                    ? 'bg-violet-600 text-white' 
                    : 'text-slate-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Upload size={20} />
                <span className="font-medium">Upload Notes</span>
              </Link>

              {isSystemAdmin && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
                    location.pathname === '/admin' 
                      ? 'bg-red-600 text-white' 
                      : 'text-slate-300 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Shield size={20} />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              )}

              <div className="h-6 w-px bg-white/10" />

              {/* User Info & Logout */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-zinc-800 rounded-2xl flex items-center justify-center border border-white/10">
                    <User size={20} className="text-slate-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white truncate max-w-[140px]">{user.name}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      {isSystemAdmin ? 'System Admin' : `Sem ${user.semester || 3}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition p-2 rounded-xl hover:bg-zinc-900"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white transition font-medium">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-violet-600 text-white px-6 py-2.5 rounded-2xl hover:bg-violet-700 transition font-medium"
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