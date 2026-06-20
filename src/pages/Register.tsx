import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import API from '../lib/api';
import toast from 'react-hot-toast';
import { BookOpen, Award, GraduationCap } from 'lucide-react';

type UserRole = 'student' | 'expert';

declare global {
  interface Window {
    google?: any;
  }
}

export default function Register() {
  const [role, setRole] = useState<UserRole>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    semester: 1,
    expertise: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const GOOGLE_CLIENT_ID = 
    import.meta.env.VITE_GOOGLE_CLIENT_ID || 
    "872414388425-o661s1fjl9ot581eof75210i81l7p79e.apps.googleusercontent.com";

  const isAdminEmail = formData.email.toLowerCase() === 'admin@glowcare.ai';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'semester' ? parseInt(value, 10) : value 
    }));
  };

  const handleAuthSuccess = (user: any, token: string) => {
    login(user, token);
    toast.success("Account setup complete!");

    if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'expert') navigate('/expert-dashboard');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      department: formData.department,
      role: isAdminEmail ? 'admin' : role,
      ...(!isAdminEmail && role === 'student' && { semester: formData.semester }),
      ...(!isAdminEmail && role === 'expert' && { expertise: formData.expertise })
    };

    try {
      const res = await API.post('/auth/register', payload);
      handleAuthSuccess(res.data.user, res.data.token);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration runtime rejection.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!window.google) {
      toast.error("Google authentication engine is loading. Please try again.");
      return;
    }

    setGoogleLoading(true);

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID.trim(),
      scope: 'email profile',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          setGoogleLoading(false);
          toast.error("Google access negotiation failed.");
          return;
        }

        try {
          // Enhanced: Passes registration choices along with OAuth Token
          const res = await API.post('/auth/google-login', {
            accessToken: tokenResponse.access_token,
            role: isAdminEmail ? 'admin' : role,
            department: formData.department || 'General',
            semester: role === 'student' ? formData.semester : undefined,
            expertise: role === 'expert' ? formData.expertise : undefined
          });
          handleAuthSuccess(res.data.user, res.data.token);
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Google register sync failed.");
        } finally {
          setGoogleLoading(false);
        }
      },
    });

    client.requestAccessToken();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 selection:bg-yellow-400 selection:text-black">
      <div className="w-full max-w-md">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(250,204,21,0.35)]">
              <BookOpen size={28} className="text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Create <span className="text-yellow-400">Account</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Join NoteVault Portal Ecosystem
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-zinc-900/50 backdrop-blur-md rounded-3xl p-8 border border-zinc-800 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
          
          {/* Role Switching Tabs */}
          <div className="bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-wider font-bold rounded-xl transition-all duration-200 ${
                role === 'student' && !isAdminEmail
                  ? 'bg-yellow-400 text-black shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <GraduationCap size={16} /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole('expert')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-wider font-bold rounded-xl transition-all duration-200 ${
                role === 'expert' && !isAdminEmail
                  ? 'bg-yellow-400 text-black shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Award size={16} /> Expert
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter your full name"
                required 
                className="w-full px-4 py-3.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition duration-200 placeholder-zinc-600" 
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter your email"
                required 
                className="w-full px-4 py-3.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition duration-200 placeholder-zinc-600" 
              />
              {isAdminEmail && (
                <p className="mt-2 text-xs text-yellow-400 font-semibold animate-pulse">
                  ✨ System Admin Signature Identified
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Create a password"
                required 
                className="w-full px-4 py-3.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition duration-200 placeholder-zinc-600" 
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Department
              </label>
              <input 
                type="text" 
                name="department" 
                value={formData.department} 
                onChange={handleChange} 
                placeholder="e.g. Software Engineering"
                required 
                className="w-full px-4 py-3.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition duration-200 placeholder-zinc-600" 
              />
            </div>

            {/* Role-Based Attribute Forms */}
            {!isAdminEmail && role === 'student' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Current Semester
                </label>
                <select 
                  name="semester" 
                  value={formData.semester} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition duration-200"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s} className="bg-zinc-950 text-white">Semester {s}</option>
                  ))}
                </select>
              </div>
            )}

            {!isAdminEmail && role === 'expert' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Area of Expertise
                </label>
                <input 
                  type="text" 
                  name="expertise" 
                  value={formData.expertise} 
                  onChange={handleChange} 
                  placeholder="e.g. Data Structures, Web Architectures"
                  required 
                  className="w-full px-4 py-3.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition duration-200 placeholder-zinc-600" 
                />
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || googleLoading} 
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-600/50 text-black font-bold py-3.5 rounded-xl transition duration-200 text-base shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_25px_rgba(250,204,21,0.4)] active:scale-[0.99] mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Navigation link */}
          <div className="text-center mt-5">
            <p className="text-sm text-zinc-400">
              Already have an account?{" "}
              <Link to="/login" className="text-yellow-400 hover:underline font-medium transition">
                Sign in
              </Link>
            </p>
          </div>

          {/* Context Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-zinc-800"></div>
            <span className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">OR</span>
            <div className="flex-1 border-t border-zinc-800"></div>
          </div>

          {/* Google Single Sign-Up Integration Button */}
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
              {googleLoading ? "Signing up with Google..." : "Sign up with Google"}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}