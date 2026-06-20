import React, { useEffect, useState } from 'react';
import API from '../lib/api';
import { Award, MessageSquare, Search, ShieldCheck, Lock, X, Loader2 } from 'lucide-react';
import PrivateChatModal from '../components/PrivateChatModal';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function StudentExperts() {
  const [experts, setExperts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeChatUser, setActiveChatUser] = useState<{ id: string; name: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingExpert, setPendingExpert] = useState<{ id: string; name: string } | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [verifiedUsername, setVerifiedUsername] = useState<string>('');

  const toastOptions = {
    position: 'top-center' as const,
    style: {
      marginTop: '12vh',
      padding: '16px 24px',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      fontSize: '14px',
      fontWeight: '600',
      maxWidth: '420px',
      border: '1px solid #4f46e5',
      background: '#18181b',
      color: '#e0e7ff'
    }
  };

  useEffect(() => {
    
    API.get('/experts')
      .then((res) => setExperts(res.data))
      .catch((err) => console.error("Error fetching experts:", err));


    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setCurrentUserId(savedUserId);
    } else {

      const savedUserRaw = localStorage.getItem('user');
      if (savedUserRaw) {
        try {
          const parsed = JSON.parse(savedUserRaw);
          if (parsed.id || parsed._id) {
            setCurrentUserId(parsed.id || parsed._id);
          }
        } catch (e) {
          console.error("Failed to parse local storage asset");
        }
      }
    }
  }, []);

  const handleSecureJoinClick = (expertId: string, expertName: string) => {
    setPendingExpert({ id: expertId, name: expertName });
    setEmailInput('');
    setShowSecurityModal(true);
  };

  const handleVerifyConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      toast.error("Invalid email address format standard entered.", toastOptions);
      return;
    }

    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chat/verify-email',
        { email: emailInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && pendingExpert) {
        toast.success(`Welcome ${response.data.name}!`, toastOptions);
        setVerifiedEmail(emailInput.trim().toLowerCase());
        setVerifiedUsername(response.data.name); 
        setActiveChatUser({ id: pendingExpert.id, name: pendingExpert.name });
        
        setShowSecurityModal(false);
        setPendingExpert(null);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Verification failed. Please try again.";

      toast.error(errorMessage, toastOptions);
    } finally {
      setVerifying(false);
    }
  };

  const filtered = experts.filter(exp => 
    exp.name.toLowerCase().includes(search.toLowerCase()) ||
    (exp.expertise || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Hero Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center">
              <Award size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Expert Network
              </h1>
              <p className="text-slate-400 text-lg mt-1">Connect with Verified Academic Specialists</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12 max-w-xl">
          <Search className="absolute left-5 top-4 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search experts by name or expertise..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-zinc-900 border border-white/10 rounded-3xl text-lg placeholder:text-slate-500 focus:border-violet-500 focus:outline-none transition-all"
          />
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(exp => (
            <div 
              key={exp._id} 
              className="group bg-zinc-900 border border-white/10 hover:border-violet-500/50 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
            >
              <div className="h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />
              
              <div className="p-8">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-2xl flex items-center justify-center text-3xl font-bold border border-white/10 group-hover:border-violet-400/30 transition-colors">
                    {exp.name.charAt(0)}
                  </div>

                  <div className="flex-1 pt-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 mb-3">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      VERIFIED
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white group-hover:text-violet-300 transition-colors">
                      {exp.name}
                    </h3>
                    <p className="text-violet-400 text-sm mt-1">{exp.expertise || 'Computer Science'}</p>
                    <p className="text-slate-500 text-sm mt-3 line-clamp-2">{exp.department}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 p-6">
                <button 
                  onClick={() => handleSecureJoinClick(exp._id, exp.name)}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-semibold hover:bg-white/90 active:scale-95 transition-all"
                >
                  <MessageSquare size={18} />
                  Open Secure Consultation
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <Award size={80} className="mx-auto text-slate-700 mb-6" />
            <p className="text-2xl text-slate-300">No matching specialists found</p>
          </div>
        )}

        {/* Security Verification Modal */}
        {showSecurityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              
              <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 px-8 py-6 relative">
                <button 
                  disabled={verifying}
                  onClick={() => { 
                    setShowSecurityModal(false); 
                    setPendingExpert(null); 
                  }}
                  className="absolute top-6 right-6 text-slate-400 hover:text-white transition"
                >
                  <X size={24} />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <Lock size={28} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Security Gate</h3>
                    <p className="text-slate-400 text-sm">Identity Verification Required</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerifyConfirm} className="p-8 space-y-6">
                <p className="text-slate-400 leading-relaxed">
                  You are about to open a private channel with <span className="text-white font-medium">{pendingExpert?.name}</span>.
                </p>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-3">Your Registered Email</label>
                  <input 
                    type="email"
                    required
                    disabled={verifying}
                    placeholder="your@email.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-6 py-4 text-lg focus:border-violet-500 outline-none transition-all disabled:opacity-50"
                    autoFocus
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    disabled={verifying}
                    onClick={() => { setShowSecurityModal(false); setPendingExpert(null); }}
                    className="flex-1 py-4 border border-white/10 rounded-2xl hover:bg-white/5 transition text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={verifying}
                    className="flex-1 py-4 bg-violet-600 hover:bg-violet-500 rounded-2xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-70"
                  >
                    {verifying ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Confirm Access
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Private Chat Modal */}
        {activeChatUser && (
          <PrivateChatModal 
            userId={activeChatUser.id} 
            recipientName={activeChatUser.name} 
            onClose={() => {
              setActiveChatUser(null);
              setVerifiedEmail('');
              setVerifiedUsername('');
            }} 
            currentUser={{ id: currentUserId }}
            verifiedUserEmail={verifiedEmail}
            verifiedUsername={verifiedUsername} 
          />
        )}
      </div>
    </div>
  );
}