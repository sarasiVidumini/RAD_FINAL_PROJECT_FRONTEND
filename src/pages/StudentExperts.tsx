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
      border: '1px solid #f1f5f9',
      background: '#ffffff',
      color: '#0f172a'
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
      // Beautiful centralized popup context deployment
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
    <div className="max-w-6xl mx-auto px-6 py-10 min-h-screen bg-slate-50/40 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
          <Award className="text-emerald-600" /> Verified Specialists Directory
        </h1>
        <p className="text-sm text-gray-500 mt-1">Direct micro-consultation corridors into domain professionals.</p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by specialty field or instructor name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(exp => (
          <div key={exp._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg mb-4">
                {exp.name.charAt(0)}
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg">{exp.name}</h3>
              <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 inline-block px-2.5 py-0.5 rounded-md mt-1">
                {exp.expertise || 'Computer Science'}
              </p>
              <p className="text-xs text-gray-400 mt-3">{exp.department || 'Software Engineering Dept'}</p>
            </div>

            <button 
              onClick={() => handleSecureJoinClick(exp._id, exp.name)}
              className="mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-bold py-3 rounded-xl hover:bg-slate-800 transition-all shadow-xs"
            >
              <MessageSquare size={14} /> Open Secure Chat
            </button>
          </div>
        ))}
      </div>

      {/* SECURITY MODAL */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all duration-300 animate-scale-up">
            
            <div className="bg-gradient-to-r from-slate-950 to-slate-800 px-6 py-5 text-white relative">
              <button 
                type="button"
                disabled={verifying}
                onClick={() => { setShowSecurityModal(false); setPendingExpert(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-wide">Security Verification</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Secure Corridor Authorization Gateway</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleVerifyConfirm} className="p-6 space-y-4">
              <div className="text-sm text-slate-600 leading-relaxed">
                You are requesting entry to a strictly private channel with <span className="font-bold text-slate-900">{pendingExpert?.name}</span>. Please authorize your session identity below.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase block">Registered Email Address</label>
                <input 
                  type="email"
                  required
                  disabled={verifying}
                  placeholder="Enter your registered account email..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all disabled:opacity-60"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  disabled={verifying}
                  onClick={() => { setShowSecurityModal(false); setPendingExpert(null); }}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={verifying}
                  className="w-1/2 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-70"
                >
                  {verifying ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  {verifying ? "Checking DB..." : "Confirm Access"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* PRIVATE CHAT BOX */}
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
  );
}