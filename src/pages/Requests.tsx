// pages/Requests.tsx
import React, { useState, useEffect } from 'react';
import API from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { 
  Plus, CheckCircle, Clock, User, X, Zap, 
  Search, Filter, Grid3x3, List, ArrowUpDown,
  Sparkles, TrendingUp, Award, Globe, Compass
} from 'lucide-react';
import RequestCard from '../components/RequestCard';

export default function Requests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    semester: 1,
    description: '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'fulfilled'>('all');
  const [filterSemester, setFilterSemester] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'urgency'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    fulfilled: 0,
    urgent: 0
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    // Update stats whenever requests change
    const open = requests.filter(r => r.status === 'open').length;
    const fulfilled = requests.filter(r => r.status === 'fulfilled').length;
    const urgent = requests.filter(r => r.urgency === 'critical' || r.urgency === 'high').length;
    setStats({
      total: requests.length,
      open,
      fulfilled,
      urgent
    });
  }, [requests]);

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
      toast.success("Request deployed to the network! 🎉");
      setShowForm(false);
      setFormData({ 
        title: '', 
        subject: '', 
        semester: 1, 
        description: '',
        urgency: 'medium'
      });
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post request");
    }
  };

  const handleOpenChat = (userId: string, userName: string) => {
    // This will be handled by the parent component or navigate to chat
    toast.success(`Opening chat with ${userName}...`);
    // You can implement navigation to chat or open modal here
  };

  // Filter and sort requests
  const filteredRequests = requests
    .filter(req => {
      if (filterStatus !== 'all' && req.status !== filterStatus) return false;
      if (filterSemester !== 'all' && req.semester !== filterSemester) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return req.title.toLowerCase().includes(search) ||
               req.subject.toLowerCase().includes(search) ||
               req.description?.toLowerCase().includes(search);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'urgency':
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 0) - 
                 (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 text-slate-200">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-emerald-600/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 text-violet-400 text-xs font-mono tracking-[3px] px-5 py-2.5 rounded-full mb-6 backdrop-blur-sm">
                <Sparkles size={14} className="text-violet-400" />
                REQUEST NETWORK • {stats.total} REQUESTS
              </div>
              <h1 className="text-6xl lg:text-7xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-white via-violet-200 to-emerald-200 bg-clip-text text-transparent">
                  Knowledge
                </span>
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Request Hub
                </span>
              </h1>
              <p className="text-slate-400 mt-4 text-xl max-w-2xl">
                Connect with experts and peers. Request the resources you need to succeed.
              </p>
              
              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10">
                  <div className="w-8 h-8 bg-violet-500/20 rounded-xl flex items-center justify-center">
                    <Award size={16} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Open Requests</p>
                    <p className="text-xl font-bold text-white">{stats.open}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Fulfilled</p>
                    <p className="text-xl font-bold text-white">{stats.fulfilled}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Zap size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Urgent</p>
                    <p className="text-xl font-bold text-white">{stats.urgent}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="group flex items-center gap-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_100%] hover:bg-[length:100%_100%] px-10 py-6 rounded-3xl font-bold text-lg text-white transition-all duration-500 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus size={28} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="hidden sm:inline">Deploy Request</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal - Enhanced Digital Style */}
      {showForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-violet-500/30 rounded-3xl w-full max-w-2xl p-10 relative shadow-2xl shadow-violet-500/10 animate-enter">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X size={28} />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-500/20 rounded-2xl">
                <Sparkles size={24} className="text-violet-400" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent">
                New Request
              </h2>
            </div>
            <p className="text-slate-400 mb-8 text-lg">What knowledge do you need from the community?</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Request Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Advanced Calculus Notes" 
                  className="w-full bg-zinc-950 border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-2xl px-6 py-4 text-lg text-white placeholder:text-slate-500 transition-all outline-none"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Subject / Course</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Mathematics" 
                    className="w-full bg-zinc-950 border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-2xl px-6 py-4 text-lg text-white placeholder:text-slate-500 transition-all outline-none"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Semester</label>
                  <select 
                    className="w-full bg-zinc-950 border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-2xl px-6 py-4 text-lg text-white transition-all outline-none"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                  >
                    {[1,2,3,4].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Urgency Level</label>
                <select
                  className="w-full bg-zinc-950 border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-2xl px-6 py-4 text-lg text-white transition-all outline-none"
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                >
                  <option value="low">Low - Not Urgent</option>
                  <option value="medium">Medium - Soon</option>
                  <option value="high">High - Urgent</option>
                  <option value="critical">Critical - Immediate</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Description</label>
                <textarea 
                  placeholder="Detailed description (topics, units, preferred format...)" 
                  rows={5} 
                  className="w-full bg-zinc-950 border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-2xl px-6 py-4 text-lg text-white placeholder:text-slate-500 transition-all outline-none resize-y"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="flex-1 py-4 border border-white/10 rounded-2xl font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                >
                  Deploy Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-6 py-8 sticky top-0 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 z-10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search requests by title, subject, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border border-white/10 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-2xl text-white placeholder:text-slate-500 transition-all outline-none"
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3.5 rounded-2xl font-medium transition-all flex items-center gap-2 ${
                showFilters ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-zinc-900 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <Filter size={18} /> Filters
            </button>

            <div className="flex bg-zinc-900 rounded-2xl border border-white/10 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all ${
                  viewMode === 'grid' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-white'
                }`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${
                  viewMode === 'list' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-white'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-violet-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="fulfilled">Fulfilled</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Semester</label>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-violet-500"
              >
                <option value="all">All Semesters</option>
                {[1,2,3,4].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-violet-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="urgency">Urgency</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterSemester('all');
                  setSortBy('newest');
                  setSearchTerm('');
                }}
                className="w-full py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Requests Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={24} className="text-violet-400 animate-pulse" />
              </div>
            </div>
            <p className="text-slate-400 mt-6 text-lg">Loading request network...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className={`grid ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2' 
              : 'grid-cols-1'
          } gap-6`}>
            {filteredRequests.map(req => (
              <RequestCard
                key={req._id}
                req={req}
                isExpert={user?.role === 'expert' || user?.role === 'admin'}
                onOpenChat={handleOpenChat}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="mx-auto w-28 h-28 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-dashed border-white/20 rounded-3xl flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-violet-500/10 rounded-3xl blur-xl" />
              <Compass size={56} className="text-violet-500 relative" />
            </div>
            <h3 className="text-4xl font-bold text-slate-300">No Requests Found</h3>
            <p className="text-slate-400 mt-4 max-w-md mx-auto text-lg">
              {searchTerm || filterStatus !== 'all' || filterSemester !== 'all' 
                ? "Try adjusting your filters to find what you're looking for"
                : "Be the spark that starts the knowledge flow"}
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="mt-10 px-10 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl text-lg font-semibold hover:scale-105 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300"
            >
              {requests.length === 0 ? 'Initiate First Request' : 'Create New Request'}
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="max-w-7xl mx-auto px-6 py-8 border-t border-white/5">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Globe size={16} className="text-violet-400" />
              {filteredRequests.length} requests displayed
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              {stats.fulfilled}/{stats.total} fulfilled
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Network active</span>
          </div>
        </div>
      </div>
    </div>
  );
}