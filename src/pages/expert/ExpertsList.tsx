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
  X   // ← Added this
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mb-4"></div>
        <p className="text-slate-400 font-medium tracking-widest">SYNCHRONIZING VERIFIED SPECIALISTS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-xl shadow-violet-500/30">
              <Award size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Verified Specialists
              </h1>
              <p className="text-slate-400 mt-1 text-lg">Elite Academic Knowledge Architects</p>
            </div>
          </div>

          <button
            onClick={fetchExperts}
            className="flex items-center gap-3 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-2xl transition-all hover:border-violet-500 text-sm font-medium"
          >
            <RefreshCw size={18} className="transition-transform group-hover:rotate-45" /> 
            Refresh Network
          </button>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experts.map((expert) => (
            <div 
              key={expert.id} 
              className="group bg-zinc-900 border border-white/10 hover:border-violet-500/50 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-2xl"
            >
              <div className="h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />

              <div className="p-8">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-violet-500/30 transition-colors shrink-0">
                    <UserCheck size={32} className="text-violet-400" />
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      VERIFIED EXPERT
                    </div>
                    
                    <h3 className="font-bold text-2xl text-white tracking-tight mb-1 group-hover:text-violet-300 transition-colors">
                      {expert.name}
                    </h3>
                    <p className="text-slate-400 flex items-center gap-2 text-sm">
                      <BookOpen size={16} className="text-slate-500" />
                      {expert.department}
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-zinc-950 border border-white/10 rounded-2xl p-5">
                  <p className="uppercase text-xs tracking-widest text-slate-500 mb-2">Domain Expertise</p>
                  <p className="text-slate-200 leading-relaxed">
                    {expert.expertise || "Multidisciplinary Academic Consultant"}
                  </p>
                </div>
              </div>

              {user?.role === 'admin' ? (
                <div className="border-t border-white/10 p-6 flex gap-3 bg-zinc-950/50">
                  <button
                    onClick={() => openEditModal(expert)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500 py-3.5 rounded-2xl text-sm font-medium transition-all"
                  >
                    <Edit3 size={18} /> Modify Profile
                  </button>
                  <button
                    onClick={() => handleDelete(expert.id)}
                    className="px-5 flex items-center justify-center bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 text-red-400 hover:text-red-500 rounded-2xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ) : (
                <div className="border-t border-white/10 p-6 text-center">
                  <div className="inline-flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-5 py-2 rounded-2xl text-sm font-medium">
                    <UserCheck size={18} /> Active Contributor
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {experts.length === 0 && (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl max-w-md mx-auto">
            <Award size={64} className="mx-auto text-slate-600 mb-6" />
            <h3 className="text-2xl font-bold text-slate-300">No Specialists Found</h3>
            <p className="text-slate-500 mt-3">The expert network is currently empty.</p>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedExpert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Update Specialist</h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    required
                    className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Expertise Domain</label>
                  <input
                    type="text"
                    value={editForm.expertise}
                    onChange={(e) => setEditForm({ ...editForm, expertise: e.target.value })}
                    required
                    className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-violet-500 outline-none transition"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 border border-white/10 hover:bg-white/5 rounded-2xl text-sm font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-violet-600 hover:bg-violet-500 rounded-2xl text-sm font-semibold transition"
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
  );
}