import React, { useState, useEffect } from 'react';
import API from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Plus, CheckCircle, Clock, User } from 'lucide-react';

export default function Requests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    semester: 1,
    description: ''
  });
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/requests');
      setRequests(res.data);
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/requests', formData);
      toast.success("Request posted successfully! 🎉");
      setShowForm(false);
      setFormData({ title: '', subject: '', semester: 1, description: '' });
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post request");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Note Requests</h1>
          <p className="text-gray-600 mt-2">Help others by fulfilling their requests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-2xl hover:brightness-110 transition font-medium"
        >
          <Plus size={22} /> Post New Request
        </button>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">What note do you need?</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <input 
                type="text" 
                placeholder="e.g., Operating System Unit 3 Notes" 
                className="w-full p-4 border border-gray-300 rounded-2xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none" 
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              />
              
              <input 
                type="text" 
                placeholder="Subject" 
                className="w-full p-4 border border-gray-300 rounded-2xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none" 
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
              />

              <select 
                className="w-full p-4 border border-gray-300 rounded-2xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              >
                {[1,2,3,4,5,6,7,8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>

              <textarea 
                placeholder="Describe exactly what you need (units, topics, etc...)" 
                rows={4} 
                className="w-full p-4 border border-gray-300 rounded-2xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none" 
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              />

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="flex-1 py-4 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-medium hover:bg-violet-700"
                >
                  Post Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-20">Loading requests...</div>
      ) : requests.length > 0 ? (
        <div className="grid gap-6">
          {requests.map(req => (
            <div key={req._id} className="bg-white p-8 rounded-3xl border border-gray-200 hover:shadow-xl transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-2xl">{req.title}</h3>
                  <p className="text-violet-600 mt-1">{req.subject} • Semester {req.semester}</p>
                </div>
                {req.status === 'fulfilled' && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-1 rounded-full">
                    <CheckCircle size={20} /> Fulfilled
                  </div>
                )}
              </div>

              <p className="mt-5 text-gray-700 leading-relaxed">{req.description}</p>

              <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
                <User size={18} />
                <span>Requested by: <strong>{req.requestedBy?.name}</strong></span>
                <span className="mx-2">•</span>
                <Clock size={18} />
                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
          <p className="text-2xl text-gray-400">No requests yet</p>
          <p className="text-gray-500 mt-3">Be the first to post a request!</p>
        </div>
      )}
    </div>
  );
}