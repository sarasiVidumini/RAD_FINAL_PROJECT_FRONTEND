import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import API from '../lib/api';
import toast from 'react-hot-toast';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

// Inform TypeScript that window.google exists safely
declare global {
  interface Window {
    google?: any;
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // UPDATED: Dynamically checks your environment variables OR falls back directly to your verified Client ID
  const GOOGLE_CLIENT_ID = 
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || 
    "872414388425-o661s1fjl9ot581eof75210i81l7p79e.apps.googleusercontent.com";

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAuthSuccess = (user: any, token: string) => {
    login(user, token);
    toast.success(`Welcome back, ${user.name}!`);

    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'expert') {
      navigate('/expert-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      handleAuthSuccess(res.data.user, res.data.token);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!window.google) {
      toast.error("Google login is still loading. Please try again in a moment.");
      return;
    }

    setGoogleLoading(true);

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          setGoogleLoading(false);
          toast.error("Google authentication failed");
          return;
        }

        try {
          const res = await API.post('/auth/google-login', {
            accessToken: tokenResponse.access_token,
          });

          handleAuthSuccess(res.data.user, res.data.token);
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Google registration failed");
        } finally {
          setGoogleLoading(false);
        }
      },
    });

    client.requestAccessToken();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 selection:bg-yellow-400 selection:text-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(250,204,21,0.35)]">
              <BookOpen size={28} className="text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Welcome to <span className="text-yellow-400">NoteVault</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Sign in to report and track local academic requests.
          </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-md rounded-3xl p-8 border border-zinc-800 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition duration-200 placeholder-zinc-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition duration-200 placeholder-zinc-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-600/50 text-black font-bold py-3.5 rounded-xl transition duration-200 text-base shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_25px_rgba(250,204,21,0.4)] active:scale-[0.99]"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-sm text-zinc-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-yellow-400 hover:underline font-medium transition">
                Sign up
              </Link>
            </p>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-zinc-800"></div>
            <span className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">OR</span>
            <div className="flex-1 border-t border-zinc-800"></div>
          </div>

          {/* UPDATED: Clean, branded authentic multi-colored Google Sign-In Button */}
          <button
            type="button"
            disabled={loading || googleLoading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-zinc-950 hover:bg-zinc-900 disabled:opacity-50 border border-zinc-800 hover:border-zinc-700 rounded-xl transition duration-200 text-center shadow-md group"
          >
            <div className="w-5 h-5 flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <span className="text-sm text-zinc-200 font-semibold group-hover:text-white transition">
              {googleLoading ? "Signing in with Google..." : "Sign in with Google"}
            </span>
          </button>
        </div>

        <div className="text-center mt-6 text-xs text-zinc-600 tracking-wide font-medium">
          Demo Admin Configuration: admin@glowcare.ai / admin123
        </div>
      </div>
    </div>
  );
}