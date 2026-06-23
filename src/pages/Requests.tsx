// pages/Requests.tsx
import React, { useState, useEffect } from 'react';
import API from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Plus, CheckCircle, X, Zap,
  Search, Filter, Grid3x3, List, 
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

  const handleOpenChat = (_: string, userName: string) => {
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
    <div className="min-h-screen bg-[#050505] text-zinc-200" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        .font-mono-vault { font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, Menlo, monospace; }
        .vault-grid-bg {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0);
          background-size: 28px 28px;
        }
        @keyframes pulse-line { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .pulse-line { animation: pulse-line 2.4s ease-in-out infinite; }
      `}</style>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 vault-grid-bg opacity-30 pointer-events-none" />
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-14 relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="font-mono-vault inline-flex items-center gap-2 bg-amber-500/[0.06] border border-amber-500/20 text-amber-400/90 text-[12px] font-bold tracking-[0.15em] px-4 py-1.5 rounded-full mb-5 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-line" />
                Request Network · {stats.total} requests
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-50">
                Knowledge Request Hub
              </h1>
              <p className="text-zinc-500 mt-3 text-base max-w-2xl">
                Connect with experts and peers. Request the resources you need to succeed.
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-4 mt-7">
                <div className="flex items-center gap-3 bg-[#0a0a0c] px-4 py-2.5 rounded-2xl border border-white/[0.06]">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                    <Award size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500 font-mono-vault">OPEN</p>
                    <p className="text-lg font-bold text-white">{stats.open}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-[#0a0a0c] px-4 py-2.5 rounded-2xl border border-white/[0.06]">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500 font-mono-vault">FULFILLED</p>
                    <p className="text-lg font-bold text-white">{stats.fulfilled}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-[#0a0a0c] px-4 py-2.5 rounded-2xl border border-white/[0.06]">
                  <div className="w-8 h-8 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                    <Zap size={16} className="text-rose-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500 font-mono-vault">URGENT</p>
                    <p className="text-lg font-bold text-white">{stats.urgent}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="group flex items-center gap-3 bg-amber-500 hover:bg-amber-400 px-7 py-4 rounded-2xl font-bold text-base text-black transition-all duration-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] shrink-0"
            >
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="hidden sm:inline">Deploy Request</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal — comfortably sized, consistent with site forms */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-3xl w-full max-w-lg p-7 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-5 right-5 p-2 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
            >
              <X size={22} />
            </button>

            <div className="flex items-center gap-3 mb-1.5">
              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Sparkles size={20} className="text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                New Request
              </h2>
            </div>
            <p className="text-zinc-500 mb-6 text-sm">What knowledge do you need from the community?</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="font-mono-vault text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Request Title</label>
                <input
                  type="text"
                  placeholder="e.g., Advanced Calculus Notes"
                  className="w-full bg-black border border-white/[0.08] focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-all outline-none"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono-vault text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Subject / Course</label>
                  <input
                    type="text"
                    placeholder="e.g., Mathematics"
                    className="w-full bg-black border border-white/[0.08] focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-all outline-none"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-mono-vault text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Semester</label>
                  <select
                    className="w-full bg-black border border-white/[0.08] focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-sm text-white transition-all outline-none"
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
                <label className="font-mono-vault text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Urgency Level</label>
                <select
                  className="w-full bg-black border border-white/[0.08] focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-sm text-white transition-all outline-none"
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
                <label className="font-mono-vault text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Description</label>
                <textarea
                  placeholder="Detailed description (topics, units, preferred format...)"
                  rows={4}
                  className="w-full bg-black border border-white/[0.08] focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-all outline-none resize-y"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-white/[0.08] rounded-xl font-bold text-sm text-zinc-300 hover:bg-white/[0.04] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                >
                  Deploy Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-6 py-6 sticky top-0 bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.06] z-10">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search requests by title, subject, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#0a0a0c] border border-white/[0.08] focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm text-white placeholder:text-zinc-600 transition-all outline-none"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border ${
                showFilters ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-[#0a0a0c] text-zinc-400 hover:text-white border-white/[0.08]'
              }`}
            >
              <Filter size={16} /> Filters
            </button>

            <div className="flex bg-[#0a0a0c] rounded-xl border border-white/[0.08] p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-600 hover:text-white'
                }`}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-600 hover:text-white'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-4 gap-3 animate-fadeIn">
            <div>
              <label className="font-mono-vault text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/50"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="fulfilled">Fulfilled</option>
              </select>
            </div>
            <div>
              <label className="font-mono-vault text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Semester</label>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/50"
              >
                <option value="all">All Semesters</option>
                {[1,2,3,4].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono-vault text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#0a0a0c] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/50"
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
                className="w-full py-2.5 bg-[#0a0a0c] border border-white/[0.08] rounded-lg text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-all"
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
              <div className="w-14 h-14 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-amber-400 animate-pulse" />
              </div>
            </div>
            <p className="text-zinc-500 mt-6 text-base font-mono-vault">Loading request network...</p>
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
          <div className="text-center py-28">
            <div className="mx-auto w-24 h-24 bg-[#0a0a0c] border border-dashed border-white/[0.12] rounded-3xl flex items-center justify-center mb-7 relative">
              <div className="absolute inset-0 bg-amber-500/[0.07] rounded-3xl blur-xl" />
              <Compass size={44} className="text-amber-400/70 relative" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-300">No Requests Found</h3>
            <p className="text-zinc-500 mt-3 max-w-md mx-auto text-sm">
              {searchTerm || filterStatus !== 'all' || filterSemester !== 'all'
                ? "Try adjusting your filters to find what you're looking for"
                : "Be the spark that starts the knowledge flow"}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-8 px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
            >
              {requests.length === 0 ? 'Initiate First Request' : 'Create New Request'}
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="max-w-7xl mx-auto px-6 py-7 border-t border-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-600">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Globe size={15} className="text-amber-400/70" />
              {filteredRequests.length} requests displayed
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-400/70" />
              {stats.fulfilled}/{stats.total} fulfilled
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-500">Network active</span>
          </div>
        </div>
      </div>
    </div>
  );
}