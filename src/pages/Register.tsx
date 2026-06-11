import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import API from '../lib/api';
import toast from 'react-hot-toast';
import { BookOpen, Award, GraduationCap } from 'lucide-react';

type UserRole = 'student' | 'expert';

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

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'semester' ? parseInt(value, 10) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isSystemAdminEmail = formData.email.toLowerCase() === 'admin@college.edu';
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      department: formData.department,
      role: isSystemAdminEmail ? 'admin' : role,
      ...(!isSystemAdminEmail && role === 'student' && { semester: formData.semester }),
      ...(!isSystemAdminEmail && role === 'expert' && { expertise: formData.expertise })
    };

    try {
      const res = await API.post('/auth/register', payload);
      const { token, user } = res.data;

      login(user, token);
      toast.success("Account created successfully!");

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'expert') navigate('/expert-dashboard');
      else navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration runtime rejection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xs">
              <BookOpen size={40} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-600 mt-2">Join NoteVault Portal Ecosystem</p>
        </div>

        <div className="bg-white p-1.5 rounded-2xl shadow-xs border border-gray-100 flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              role === 'student' && formData.email.toLowerCase() !== 'admin@college.edu'
                ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <GraduationCap size={18} /> Student
          </button>
          <button
            type="button"
            onClick={() => setRole('expert')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              role === 'expert' && formData.email.toLowerCase() !== 'admin@college.edu'
                ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Award size={18} /> Expert
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              {formData.email.toLowerCase() === 'admin@college.edu' && (
                <p className="mt-1.5 text-xs text-amber-600 font-semibold animate-pulse">✨ System Admin Signature Identified</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>

            {formData.email.toLowerCase() !== 'admin@college.edu' && role === 'student' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Current Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            )}

            {formData.email.toLowerCase() !== 'admin@college.edu' && role === 'expert' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Area of Expertise</label>
                <input type="text" name="expertise" value={formData.expertise} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-xl shadow-xs transition-colors mt-2">
              {loading ? "Processing Secure Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}