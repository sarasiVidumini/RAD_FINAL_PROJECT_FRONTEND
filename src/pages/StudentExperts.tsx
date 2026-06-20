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
      border: '1px solid #f59e0b',
      background: '#0a0a0c',
      color: '#fde68a'
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
    <div className="min-h-screen bg-[#050505] text-zinc-200" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        .font-mono-vault { font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, Menlo, monospace; }
        .vault-grid-bg {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0);
          background-size: 28px 28px;
        }
        .glow-amber { box-shadow: 0 0 0 1px rgba(251,191,36,0.15), 0 8px 30px -8px rgba(251,191,36,0.3); }
        @keyframes pulse-line { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .pulse-line { animation: pulse-line 2.4s ease-in-out infinite; }
      `}</style>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 vault-grid-bg opacity-[0.2] pointer-events-none" />
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-amber-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-12">

          {/* Hero Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 rounded-2xl blur-md opacity-60 group-hover:opacity-90 transition duration-500"></div>
                <div className="relative w-14 h-14 bg-[#0a0a0c] border border-amber-500/20 rounded-2xl flex items-center justify-center">
                  <Award size={28} className="text-amber-400" />
                </div>
              </div>
              <div>
                <span className="font-mono-vault inline-flex items-center gap-2 text-amber-400/90 text-[12px] font-bold px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/[0.06] uppercase tracking-[0.15em] mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-line" />
                  Verified Network
                </span>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  Expert Network
                </h1>
                <p className="text-zinc-500 text-base mt-1">Connect with Verified Academic Specialists</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-12 max-w-xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={19} />
            <input
              type="text"
              placeholder="Search experts by name or expertise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-[#0a0a0c] border border-white/[0.08] rounded-2xl text-base placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
            />
          </div>

          {/* Experts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map(exp => (
              <div
                key={exp._id}
                className="group relative bg-[#0a0a0c] border border-white/[0.06] hover:border-amber-500/40 hover:glow-amber rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 vault-grid-bg opacity-[0.08] group-hover:opacity-20 transition-opacity pointer-events-none" />

                <div className="relative h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300" />

                <div className="relative p-7">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/[0.08] group-hover:border-amber-500/30 transition-colors text-amber-300">
                        {exp.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-[#0a0a0c]">
                        <ShieldCheck size={11} className="text-black" strokeWidth={2.5} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="font-mono-vault inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-[11px] font-bold rounded-full border border-amber-500/20 mb-2">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                        VERIFIED
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {exp.name}
                      </h3>
                      <p className="text-amber-400/80 text-sm mt-1 truncate">{exp.expertise || 'Computer Science'}</p>
                      <p className="text-zinc-500 text-sm mt-2 line-clamp-2">{exp.department}</p>
                    </div>
                  </div>
                </div>

                <div className="relative border-t border-white/[0.06] p-5 bg-black/20">
                  <button
                    onClick={() => handleSecureJoinClick(exp._id, exp.name)}
                    className="w-full flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-black py-3.5 rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition-all"
                  >
                    <MessageSquare size={17} />
                    Open Secure Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
                <Award size={36} className="text-zinc-700" />
              </div>
              <p className="text-xl text-zinc-400 font-medium">No matching specialists found</p>
            </div>
          )}

          {/* Security Verification Modal */}
          {showSecurityModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
              <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">

                <div className="relative bg-black/40 px-8 py-6 border-b border-white/[0.06]">
                  <button
                    disabled={verifying}
                    onClick={() => {
                      setShowSecurityModal(false);
                      setPendingExpert(null);
                    }}
                    className="absolute top-6 right-6 text-zinc-500 hover:text-white transition"
                  >
                    <X size={22} />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                      <Lock size={26} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Security Gate</h3>
                      <p className="text-zinc-500 text-sm">Identity Verification Required</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleVerifyConfirm} className="p-8 space-y-6">
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    You are about to open a private channel with <span className="text-white font-semibold">{pendingExpert?.name}</span>.
                  </p>

                  <div>
                    <label className="font-mono-vault block text-[11px] uppercase tracking-[0.15em] text-zinc-500 mb-3">Your Registered Email</label>
                    <input
                      type="email"
                      required
                      disabled={verifying}
                      placeholder="your@email.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-black border border-white/[0.08] rounded-2xl px-5 py-3.5 text-base text-white focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all disabled:opacity-50"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      disabled={verifying}
                      onClick={() => { setShowSecurityModal(false); setPendingExpert(null); }}
                      className="flex-1 py-3.5 border border-white/[0.08] rounded-2xl hover:bg-white/[0.04] transition text-sm font-bold text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={verifying}
                      className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-70"
                    >
                      {verifying ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={17} />
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
    </div>
  );
}