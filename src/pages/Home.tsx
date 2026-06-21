import React, { useState, useEffect } from 'react';
import API from '../lib/api';
import { Note } from '../types';

import { 
  Search, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  UploadCloud, 
  Users,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Live Bar Chart Data - Standardized to use your theme colors (Amber/Yellow/Emerald variants)
  const [knowledgeData, setKnowledgeData] = useState([
    { subject: "PRF", progress: 82, color: "from-amber-500 to-yellow-400" },
    { subject: "DBMS", progress: 78, color: "from-yellow-600 to-amber-500" },
    { subject: "OOP", progress: 91, color: "from-emerald-500 to-teal-500" },
    { subject: "SE", progress: 85, color: "from-amber-500 to-orange-500" },
    { subject: "JDBC", progress: 73, color: "from-yellow-500 to-amber-400" },
    { subject: "ORM", progress: 69, color: "from-amber-600 to-yellow-500" },
    { subject: "Network Programming", progress: 76, color: "from-yellow-500 to-teal-500" },
    { subject: "Internet Technology", progress: 84, color: "from-amber-500 to-yellow-500" },
    { subject: "CNS", progress: 79, color: "from-amber-400 to-yellow-300" },
    { subject: "AAD", progress: 87, color: "from-yellow-600 to-orange-500" },
    { subject: "AD-2", progress: 92, color: "from-amber-500 to-yellow-500" },
    { subject: "Python", progress: 95, color: "from-emerald-500 to-yellow-400" },
    { subject: "RAD", progress: 71, color: "from-amber-600 to-yellow-400" },
    { subject: "AMD", progress: 80, color: "from-orange-500 to-amber-500" },
    { subject: "Project Management", progress: 77, color: "from-teal-500 to-emerald-500" },
    { subject: "ML", progress: 83, color: "from-amber-500 to-teal-500" },
  ]);

  useEffect(() => {
    fetchNotes();

    // Simulate live knowledge growth
    const interval = setInterval(() => {
      setKnowledgeData(prev =>
        prev.map(item => ({
          ...item,
          progress: Math.min(98, item.progress + (Math.random() > 0.65 ? 1 : 0))
        }))
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [search, subjectFilter]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notes', {
        params: { search, subject: subjectFilter || undefined }
      });
      setNotes(res.data);
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  // Split data into two rows (8 on top, 8 on bottom)
  const topRow = knowledgeData.slice(0, 8);
  const bottomRow = knowledgeData.slice(8);

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-200 overflow-hidden">
      {/* HERO SECTION */}
      <div className="relative pt-32 pb-28 bg-gradient-to-br from-zinc-950 via-amber-950/20 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b15_1px,transparent_1px)] [background-size:50px_50px]"></div>
        
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-amber-500/20 rounded-full px-5 py-2 mb-8 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <Sparkles className="text-amber-400" size={18} />
            <span className="uppercase text-xs tracking-[3px] font-semibold text-amber-400">Student Powered | Expert Powerful Chatting</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6">
            The Ultimate<br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Academic Network
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover, share, and master high-quality notes. Watch knowledge grow live.
          </p>

          <div className="flex justify-center gap-6 mt-12">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-3">
              <Users className="text-amber-400" size={22} />
              <div>
                <p className="text-sm font-semibold">2.4k+</p>
                <p className="text-xs text-slate-500">Active Students</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-3">
              <TrendingUp className="text-amber-400" size={22} />
              <div>
                <p className="text-sm font-semibold">12k+</p>
                <p className="text-xs text-slate-500">Notes Shared</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="max-w-5xl mx-auto -mt-8 px-6 relative z-20">
        <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-4 text-slate-400" size={22} />
              <input
                type="text"
                placeholder="Search notes, topics, professors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 py-4 bg-zinc-950 border border-white/10 rounded-2xl focus:border-amber-500 focus:outline-none placeholder:text-slate-500 text-lg"
              />
            </div>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-zinc-950 border border-white/10 text-slate-200 px-8 py-4 rounded-2xl focus:border-amber-500 focus:outline-none text-base font-medium cursor-pointer"
            >
              <option value="">All Subjects</option>
              {knowledgeData.map(item => (
                <option key={item.subject} value={item.subject}>{item.subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VALUE PROPOSITION */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight">Why Students Love NoteVault</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl hover:border-amber-500/30 group transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <UploadCloud size={32} className="text-amber-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Easy Upload</h3>
            <p className="text-slate-400">Share your notes in seconds and help thousands of students.</p>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl hover:border-amber-500/30 group transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <ShieldCheck size={32} className="text-amber-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Verified Content</h3>
            <p className="text-slate-400">Expert-reviewed materials you can trust.</p>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl hover:border-amber-500/30 group transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <TrendingUp size={32} className="text-amber-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Live Growth</h3>
            <p className="text-slate-400">See knowledge improving across subjects in real time.</p>
          </div>
        </div>
      </div>

      {/* LIVE BAR CHART SECTION - Two Rows Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-3">
              <Award className="text-amber-400" size={32} />
              <h2 className="text-4xl font-bold tracking-tight">Live Knowledge Development</h2>
            </div>
            <p className="text-slate-400 mt-2">Real-time academic growth across all subjects on NoteVault</p>
          </div>
          <div className="text-sm text-amber-400 font-medium flex items-center gap-2 tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> LIVE UPDATING
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {/* Top Row - 8 Subjects */}
          <div className="mb-16">
            <p className="text-slate-400 text-sm mb-6 font-medium tracking-wider">TOP PERFORMING SUBJECTS</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
              {topRow.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-sm font-semibold text-slate-200 mb-4 text-center min-h-[44px]">
                    {item.subject}
                  </div>
                  
                  <div className="relative w-20 h-80 bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden flex items-end justify-center shadow-inner group transition-all duration-300">
                    <div 
                      className={`w-full transition-all duration-1000 rounded-t-3xl bg-gradient-to-t ${item.color} shadow-[0_0_20px_rgba(245,158,11,0.2)]`}
                      style={{ height: `${item.progress}%` }}
                    />
                    <div className="absolute top-4 text-xs font-mono text-amber-400 font-bold bg-zinc-900/90 border border-amber-500/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {item.progress}%
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-amber-500 font-mono">
                    +{Math.floor(Math.random() * 3) + 1}% this hour
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row - 8 Subjects */}
          <div>
            <p className="text-slate-400 text-sm mb-6 font-medium tracking-wider">OTHER SUBJECTS</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
              {bottomRow.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-sm font-semibold text-slate-200 mb-4 text-center min-h-[44px]">
                    {item.subject}
                  </div>
                  
                  <div className="relative w-20 h-80 bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden flex items-end justify-center shadow-inner">
                    <div 
                      className={`w-full transition-all duration-1000 rounded-t-3xl bg-gradient-to-t ${item.color} shadow-[0_0_20px_rgba(245,158,11,0.2)]`}
                      style={{ height: `${item.progress}%` }}
                    />
                    <div className="absolute top-4 text-xs font-mono text-amber-400 font-bold bg-zinc-900/90 border border-amber-500/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {item.progress}%
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-amber-500 font-mono">
                    +{Math.floor(Math.random() * 3) + 1}% this hour
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12 text-slate-500 text-sm">
            Knowledge scores are updating live as students engage and improve
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} NoteVault • Built for students, by sarasi vidumini
      </footer>
    </div>
  );
}