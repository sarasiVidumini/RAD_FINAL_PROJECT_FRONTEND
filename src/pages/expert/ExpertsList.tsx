import React, { useState, useEffect } from 'react';
import API from '../../lib/api';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import {
  Award,
  BookOpen,
  Trash2,
  Edit3,
  RefreshCw,
  UserCheck,
  X,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExpertsList() {
  const [experts, setExperts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Administrative control modal state fields
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', department: '', expertise: '' });

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/experts');
      setExperts(res.data);
    } catch (error) {
      toast.error('Failed to load professional expert profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('⚠️ Administrative Alert: Delete this expert profile permanently?')) return;
    try {
      await API.delete(`/experts/${id}`);
      toast.success('Expert account successfully removed');
      fetchExperts();
    } catch (error) {
      toast.error('Failed to delete expert access parameters');
    }
  };

  const openEditModal = (expert: User) => {
    setSelectedExpert(expert);
    setEditForm({
      name: expert.name,
      department: expert.department,
      expertise: expert.expertise || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpert) return;
    try {
      await API.put(`/experts/${selectedExpert.id}`, editForm);
      toast.success('Expert profile parameters updated smoothly');
      setIsEditModalOpen(false);
      fetchExperts();
    } catch (error) {
      toast.error('Failed to apply modification changes');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] bg-[#050505]">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-14 w-14 border-2 border-zinc-800 border-t-amber-400"></div>
          <div className="absolute inset-0 rounded-full blur-md bg-amber-400/10 animate-pulse"></div>
        </div>
        <p className="font-mono-vault text-zinc-500 font-medium tracking-widest text-xs mt-6 uppercase">
          Synchronizing Verified Specialists...
        </p>
        <style>{`.font-mono-vault { font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, Menlo, monospace; }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 antialiased selection:bg-amber-500/30 selection:text-white" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-white/[0.06] pb-10">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 rounded-2xl blur-md opacity-60 group-hover:opacity-90 transition duration-500"></div>
                <div className="relative w-14 h-14 bg-[#0a0a0c] border border-amber-500/20 rounded-2xl flex items-center justify-center">
                  <Award size={28} className="text-amber-400" />
                </div>
              </div>
              <div>
                <span className="font-mono-vault inline-flex items-center gap-2 text-amber-400/90 text-[12px] font-bold px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/[0.06] uppercase tracking-[0.15em] mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-line" />
                  Expert Registry
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  Verified Specialists
                </h1>
                <p className="text-zinc-500 mt-1.5 text-base font-medium">Elite Academic Knowledge Architects</p>
              </div>
            </div>

            <button
              onClick={fetchExperts}
              className="group flex items-center gap-2.5 px-5 py-3 bg-[#0a0a0c] hover:bg-white/[0.04] border border-white/[0.08] hover:border-amber-500/30 active:scale-[0.98] rounded-xl transition-all text-sm font-semibold text-zinc-200 hover:text-amber-300"
            >
              <RefreshCw size={15} className="text-zinc-500 group-hover:text-amber-400 group-hover:rotate-180 transition-all duration-700" />
              Refresh Network
            </button>
          </div>

          {/* Experts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className="group relative bg-[#0a0a0c] border border-white/[0.06] hover:border-amber-500/40 hover:glow-amber rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                <div className="absolute inset-0 vault-grid-bg opacity-[0.08] group-hover:opacity-20 transition-opacity pointer-events-none" />

                {/* Premium Gradient Header Accenting Line */}
                <div className="relative h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300" />

                <div className="relative p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] group-hover:border-amber-500/30 rounded-xl flex items-center justify-center transition-colors">
                        <UserCheck size={22} className="text-amber-400" />
                      </div>
                      {/* Verification seal */}
                      <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-[#0a0a0c]">
                        <ShieldCheck size={11} className="text-black" strokeWidth={2.5} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-mono-vault inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-[11px] tracking-wide text-amber-400 font-bold px-2.5 py-0.5 rounded-full mb-2">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                        VERIFIED
                      </div>

                      <h3 className="font-bold text-xl text-white tracking-tight normal-case break-words">
                        {expert.name}
                      </h3>
                      <p className="text-zinc-400 flex items-center gap-1.5 text-sm font-medium mt-1">
                        <BookOpen size={14} className="text-zinc-500" />
                        {expert.department}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 bg-black border border-white/[0.06] rounded-xl p-4">
                    <p className="font-mono-vault uppercase text-[10px] tracking-wider text-zinc-500 font-bold mb-1">Domain Expertise</p>
                    <p className="text-zinc-200 text-sm leading-relaxed font-medium">
                      {expert.expertise || "Multidisciplinary Academic Consultant"}
                    </p>
                  </div>
                </div>

                {user?.role === 'admin' ? (
                  <div className="relative border-t border-white/[0.06] p-4 flex gap-2 bg-black/30">
                    <button
                      onClick={() => openEditModal(expert)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-amber-500/10 border border-white/[0.08] hover:border-amber-500/30 py-2.5 rounded-xl text-xs font-semibold text-zinc-200 hover:text-amber-300 transition-all active:scale-[0.98]"
                    >
                      <Edit3 size={14} /> Modify Profile
                    </button>
                    <button
                      onClick={() => handleDelete(expert.id)}
                      className="px-3.5 flex items-center justify-center bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.08] hover:border-rose-500/40 text-zinc-500 hover:text-rose-400 rounded-xl transition-all active:scale-[0.98]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="relative border-t border-white/[0.06] p-4 text-center bg-black/20">
                    <div className="inline-flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                      <UserCheck size={14} className="text-amber-400" /> Active Contributor
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {experts.length === 0 && (
            <div className="text-center py-20 border border-dashed border-white/[0.1] rounded-2xl max-w-sm mx-auto mt-12">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <Award size={26} className="text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-zinc-400">No Specialists Found</h3>
              <p className="text-zinc-600 text-sm mt-1">The expert network is currently empty.</p>
            </div>
          )}

          {/* Edit Modal */}
          {isEditModalOpen && selectedExpert && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
              <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white tracking-tight">Update Specialist</h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-zinc-500 hover:text-zinc-200 transition p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdateSubmit} className="space-y-5">
                  <div>
                    <label className="font-mono-vault block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      className="w-full bg-black border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="font-mono-vault block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Department</label>
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      required
                      className="w-full bg-black border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="font-mono-vault block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Expertise Domain</label>
                    <input
                      type="text"
                      value={editForm.expertise}
                      onChange={(e) => setEditForm({ ...editForm, expertise: e.target.value })}
                      required
                      className="w-full bg-black border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition duration-200"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-3 border border-white/[0.08] hover:bg-white/[0.04] rounded-xl text-xs font-semibold text-zinc-400 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}