import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  BookOpen, Upload, LayoutDashboard, 
  MessageSquare, Shield, LogOut, User, Menu, X 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const isSystemAdmin = user?.role === 'admin' || user?.email === 'admin@glowcare.ai';
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-black border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.3)] group-hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] transition-all duration-300">
            <BookOpen size={22} className="text-black" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tighter">NoteVault</span>
        </Link>

        {/* Desktop Icon Navigation - Spacing fixed at 50px */}
        <div className="hidden md:flex items-center gap-[50px]">
          {user && (
            <>
              <Link 
                to="/dashboard" 
                className={`p-3 rounded-xl border transition-all duration-300 ${isActive('/dashboard') 
                  ? 'bg-yellow-400/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_25px_rgba(250,204,21,0.45)]' 
                  : 'text-zinc-400 border-transparent hover:text-yellow-400 hover:bg-yellow-400/5 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]'}`}
                title="Dashboard"
              >
                <LayoutDashboard size={24} />
              </Link>

              <Link 
                to="/requests" 
                className={`p-3 rounded-xl border transition-all duration-300 ${isActive('/requests') 
                  ? 'bg-yellow-400/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_25px_rgba(250,204,21,0.45)]' 
                  : 'text-zinc-400 border-transparent hover:text-yellow-400 hover:bg-yellow-400/5 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]'}`}
                title="Requests"
              >
                <MessageSquare size={24} />
              </Link>

              <Link 
                to="/upload" 
                className={`p-3 rounded-xl border transition-all duration-300 ${isActive('/upload') 
                  ? 'bg-yellow-400/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_25px_rgba(250,204,21,0.45)]' 
                  : 'text-zinc-400 border-transparent hover:text-yellow-400 hover:bg-yellow-400/5 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]'}`}
                title="Upload Notes"
              >
                <Upload size={24} />
              </Link>

              {isSystemAdmin && (
                <Link 
                  to="/admin" 
                  className={`p-3 rounded-xl border transition-all duration-300 ${isActive('/admin') 
                    ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.45)]' 
                    : 'text-zinc-400 border-transparent hover:text-red-400 hover:bg-red-500/5 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}
                  title="Admin Panel"
                >
                  <Shield size={24} />
                </Link>
              )}
            </>
          )}
        </div>

        {/* User Info / Guest Auth Actions & Mobile Toggle */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* Logged In Info Layout */}
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-zinc-500">Sem {user.semester || 2}</p>
                </div>
                <div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center border border-yellow-500/20 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                  <User size={18} className="text-yellow-400" />
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden md:block text-zinc-400 hover:text-red-400 transition p-3 rounded-xl hover:bg-red-500/5 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                title="Logout"
              >
                <LogOut size={22} />
              </button>
            </>
          ) : (
            /* Logged Out Guest Interface Links */
            <div className="hidden md:flex items-center gap-5">
              <Link 
                to="/login" 
                className="text-sm font-medium text-zinc-400 hover:text-yellow-400 transition"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="text-sm font-bold bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-xl transition shadow-[0_0_15px_rgba(250,204,21,0.25)]"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button Container */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-zinc-400 hover:text-yellow-400 p-3 rounded-xl transition"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Content Wrap */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-white/10 py-6 px-6">
          <div className="flex flex-col gap-3">
            {user ? (
              <>
                {/* Auth Navigation Options */}
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg transition ${isActive('/dashboard') ? 'bg-yellow-400/10 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'text-zinc-300 hover:bg-white/5'}`}>
                  <LayoutDashboard size={24} /> Dashboard
                </Link>
                <Link to="/requests" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg transition ${isActive('/requests') ? 'bg-yellow-400/10 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'text-zinc-300 hover:bg-white/5'}`}>
                  <MessageSquare size={24} /> Requests
                </Link>
                <Link to="/upload" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg transition ${isActive('/upload') ? 'bg-yellow-400/10 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'text-zinc-300 hover:bg-white/5'}`}>
                  <Upload size={24} /> Upload Notes
                </Link>

                {isSystemAdmin && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg transition ${isActive('/admin') ? 'bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'text-zinc-300 hover:bg-white/5'}`}>
                    <Shield size={24} /> Admin Panel
                  </Link>
                )}

                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl text-lg text-red-400 hover:bg-red-500/5 mt-4 transition"
                >
                  <LogOut size={24} /> Logout
                </button>
              </>
            ) : (
              <>
                {/* Guest Navigation Options */}
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 text-zinc-300 hover:text-white bg-zinc-900 rounded-xl font-medium transition"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}