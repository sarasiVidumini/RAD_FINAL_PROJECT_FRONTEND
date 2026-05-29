import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuth((state) => state.login);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { 
        name, 
        email, 
        regNumber, 
        password 
      });
      
      // Successfully map isolated data nodes straight to Zustand hook store parameters
      login(res.data.user, res.data.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Structural validation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">Initialize Identity</h2>
          <p className="text-slate-400 text-sm">Register your credentials on the blockchain node</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-sm" placeholder="John Doe" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">University Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-sm" placeholder="admin@batchflow.com or identity@stu.lk" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registration Number</label>
            <input type="text" value={regNumber} onChange={e => setRegNumber(e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-sm" placeholder="e.g., SE/2024/045" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-sm" placeholder="••••••••" required />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-[0.98] mt-2 flex items-center justify-center"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Register Identity'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already verified? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition underline underline-offset-4">Sign In</Link>
        </p>
      </div>
    </div>
  );
}