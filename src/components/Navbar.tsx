// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  BookOpen, Upload, LayoutDashboard, MessageSquare, 
  Users, Shield, LogOut, User, Menu, X, Brain
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const protectedPaths = ['/dashboard', '/upload', '/requests', '/admin', '/group-chat', '/study'];
    const token = localStorage.getItem('token');
    
    if (protectedPaths.includes(location.pathname) && !user && !token) {
      navigate('/login', { replace: true });
    }
  }, [location.pathname, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isSystemAdmin = user?.role === 'admin' || user?.email?.trim().toLowerCase() === 'admin@glowcare.ai';
  const isStudent = user?.role === 'student';
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-black border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.3)] group-hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] transition-all duration-300">
            <BookOpen size={22} className="text-black" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tighter">NoteVault</span>
        </Link>

        {/* ── Desktop Icon Navigation ── */}
        <div className="hidden md:flex items-center gap-[50px]">
          {user && (
            <>
              {/* Dashboard */}
              <Link 
                to="/dashboard" 
                className={`p-3 rounded-xl border transition-all duration-300 ${isActive('/dashboard') 
                  ? 'bg-yellow-400/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_25px_rgba(250,204,21,0.45)]' 
                  : 'text-zinc-400 border-transparent hover:text-yellow-400 hover:bg-yellow-400/5 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]'}`}
                title="Dashboard"
              >
                <LayoutDashboard size={24} />
              </Link>

              {/* Requests */}
              <Link 
                to="/requests" 
                className={`p-3 rounded-xl border transition-all duration-300 ${isActive('/requests') 
                  ? 'bg-yellow-400/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_25px_rgba(250,204,21,0.45)]' 
                  : 'text-zinc-400 border-transparent hover:text-yellow-400 hover:bg-yellow-400/5 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]'}`}
                title="Requests"
              >
                <MessageSquare size={24} />
              </Link>

              {/* Group Chat */}
              <Link 
                to="/group-chat" 
                className={`p-3 rounded-xl border transition-all duration-300 ${isActive('/group-chat') 
                  ? 'bg-yellow-400/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_25px_rgba(250,204,21,0.45)]' 
                  : 'text-zinc-400 border-transparent hover:text-yellow-400 hover:bg-yellow-400/5 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]'}`}
                title="Public Sync Room"
              >
                <Users size={24} />
              </Link>

              {/* Upload */}
              <Link 
                to="/upload" 
                className={`p-3 rounded-xl border transition-all duration-300 ${isActive('/upload') 
                  ? 'bg-yellow-400/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_25px_rgba(250,204,21,0.45)]' 
                  : 'text-zinc-400 border-transparent hover:text-yellow-400 hover:bg-yellow-400/5 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]'}`}
                title="Upload Notes"
              >
                <Upload size={24} />
              </Link>

              {/* ── AI Study Mode — students only ── */}
              {isStudent && (
                <div className="relative group/ai">
                  <Link
                    to="/study"
                    className={`relative p-3 rounded-xl border transition-all duration-300 flex items-center justify-center ${isActive('/study')
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_25px_rgba(251,191,36,0.5)]'
                      : 'text-zinc-400 border-transparent hover:text-amber-400 hover:bg-amber-500/[0.08] hover:border-amber-500/20 hover:shadow-[0_0_18px_rgba(251,191,36,0.25)]'
                    }`}
                    title="AI Study Mode"
                  >
                    <Brain size={24} />

                    {/* Pulsing dot — always visible to nudge students to try it */}
                    {!isActive('/study') && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                      </span>
                    )}
                  </Link>

                  {/* Tooltip */}
                  <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/ai:opacity-100 transition-opacity duration-200 z-50">
                    <div className="bg-zinc-900 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap px-3 py-1.5 rounded-lg shadow-xl"
                      style={{ fontFamily: "ui-monospace,'SF Mono',Consolas,monospace" }}
                    >
                      AI Study Mode
                      {/* Arrow */}
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-zinc-900 border-l border-t border-amber-500/20" />
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Panel */}
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

        {/* ── User Info & Actions ── */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-zinc-500">Sem {user.semester || 2}</p>
                </div>
                <div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center border border-yellow-500/20 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                  <User size={18} className="text-yellow-400" />
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="hidden md:block text-zinc-400 hover:text-red-400 transition p-3 rounded-xl hover:bg-red-500/5 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                title="Logout"
              >
                <LogOut size={22} />
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-5">
              <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-yellow-400 transition">Sign In</Link>
              <Link to="/register" className="text-sm font-bold bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-xl transition shadow-[0_0_15px_rgba(250,204,21,0.25)]">Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-zinc-400 hover:text-yellow-400 p-3 rounded-xl transition"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-white/10 py-6 px-6">
          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg transition ${isActive('/dashboard') ? 'bg-yellow-400/10 text-yellow-400' : 'text-zinc-300 hover:bg-white/5'}`}
                >
                  <LayoutDashboard size={24} /> Dashboard
                </Link>

                <Link
                  to="/requests"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg transition ${isActive('/requests') ? 'bg-yellow-400/10 text-yellow-400' : 'text-zinc-300 hover:bg-white/5'}`}
                >
                  <MessageSquare size={24} /> Requests
                </Link>

                <Link
                  to="/group-chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg transition ${isActive('/group-chat') ? 'bg-yellow-400/10 text-yellow-400' : 'text-zinc-300 hover:bg-white/5'}`}
                >
                  <Users size={24} /> Group Sync
                </Link>

                <Link
                  to="/upload"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg transition ${isActive('/upload') ? 'bg-yellow-400/10 text-yellow-400' : 'text-zinc-300 hover:bg-white/5'}`}
                >
                  <Upload size={24} /> Upload Notes
                </Link>

                {/* AI Study Mode — students only, mobile */}
                {isStudent && (
                  <Link
                    to="/study"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg transition ${isActive('/study') ? 'bg-amber-500/15 text-amber-400' : 'text-zinc-300 hover:bg-amber-500/5 hover:text-amber-400'}`}
                  >
                    <div className="relative">
                      <Brain size={24} />
                      {!isActive('/study') && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                        </span>
                      )}
                    </div>
                    <span>AI Study Mode</span>
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full"
                      style={{ fontFamily: "ui-monospace,'SF Mono',Consolas,monospace" }}
                    >
                      NEW
                    </span>
                  </Link>
                )}

                {isSystemAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg transition ${isActive('/admin') ? 'bg-red-500/10 text-red-400' : 'text-zinc-300 hover:bg-white/5'}`}
                  >
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
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3 text-zinc-300 hover:text-white bg-zinc-900 rounded-xl font-medium transition">Sign In</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold transition">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}