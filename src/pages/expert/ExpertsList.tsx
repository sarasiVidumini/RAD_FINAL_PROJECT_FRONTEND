import React, { useState, useEffect } from 'react';
import API from '../../lib/api';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Award, BookOpen, Trash2, Edit3, RefreshCw, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExpertsList() {
  const [experts, setExperts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Read logged in user state metrics

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

  // ADMIN ONLY: Trigger delete routine handling execution
  const handleDelete = async (id: string) => {
    if (!window.confirm('⚠️ Administrative Alert: Delete this expert profile permanently?')) return;
    try {
      await API.delete(`/experts/${id}`);
      toast.success('Expert account successfully removed');
      fetchExperts(); // Refresh list configuration metrics
    } catch (error) {
      toast.error('Failed to delete expert access parameters');
    }
  };

  // ADMIN ONLY: Open Edit Modal & Populate default field arrays
  const openEditModal = (expert: User) => {
    setSelectedExpert(expert);
    setEditForm({
      name: expert.name,
      department: expert.department,
      expertise: expert.expertise || '',
    });
    setIsEditModalOpen(true);
  };

  // ADMIN ONLY: Handle Form Update submissions
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
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-3"></div>
        <p className="text-gray-500 font-medium">Syncing Verified Specialists list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header section structure */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <Award className="text-emerald-600 animate-pulse" size={38} />
            Verified Academic Specialists
          </h1>
          <p className="text-gray-600 mt-2">Consult elite domain leaders and professional system review contributors</p>
        </div>
        <button
          onClick={fetchExperts}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm shadow-xs transition"
        >
          <RefreshCw size={16} /> Refresh Grid
        </button>
      </div>

      {/* Modern Card Layout Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experts.map((expert) => (
          <div 
            key={expert.id} 
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
          >
            {/* Visual background element styling accent to show verification color rules */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
            
            <div>
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-2xl shadow-xs shrink-0">
                  <UserCheck size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md mb-2">
                    Verified Expert
                  </span>
                  <h3 className="font-bold text-xl text-gray-900 truncate">{expert.name}</h3>
                  <p className="text-gray-500 text-sm mt-0.5 truncate flex items-center gap-1.5">
                    <BookOpen size={14} className="text-gray-400" /> {expert.department} Department
                  </p>
                </div>
              </div>

              {/* Speciality Badge container section wrapper */}
              <div className="mt-5 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Primary Field Specialty</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{expert.expertise || 'General Domain Consultant'}</p>
              </div>
            </div>

            {/* SECURITY GATEKEEPER RULE: Only display Action Bars if the current user role matches Admin */}
            {user?.role === 'admin' ? (
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => openEditModal(expert)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-gray-600 hover:text-indigo-600 py-2.5 rounded-xl font-semibold text-xs transition"
                >
                  <Edit3 size={14} /> Modify Profile
                </button>
                <button
                  onClick={() => handleDelete(expert.id)}
                  className="bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-500 hover:text-red-600 p-2.5 rounded-xl transition"
                  title="Revoke Account"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              /* Normal users view clean dynamic contact indicator placeholder footer */
              <div className="mt-6 pt-4 border-t border-gray-50 text-center">
                <p className="text-xs font-medium text-emerald-600 bg-emerald-50/50 py-1.5 rounded-lg border border-emerald-50">
                  🛡️ Active Research Verification Contributor
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {experts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-xs max-w-md mx-auto">
          <Award size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-700">No Specialists Listed</h3>
          <p className="text-gray-500 text-sm mt-1">There are currently no accounts flagged under expert role permissions inside system logs.</p>
        </div>
      )}

      {/* ============================================== */}
      {/* ADMINISTRATIVE ADJUSTMENT MODAL SUB-CONTAINER  */}
      {/* ============================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden transform transition-all p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Modify Specialist Information</h2>
            <p className="text-xs text-gray-500 mb-5">Administrative System Override Data Core Update</p>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Department Scope</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Verified Field Specialty</label>
                <input
                  type="text"
                  value={editForm.expertise}
                  onChange={(e) => setEditForm({ ...editForm, expertise: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition text-sm font-medium"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}