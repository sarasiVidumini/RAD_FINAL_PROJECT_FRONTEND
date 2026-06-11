import React, { useState, useEffect } from 'react';
import API from '../lib/api';
import { Note } from '../types';
import NoteCard from '../components/NoteCard';
import { 
  Search, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  UploadCloud, 
  Download, 
  GraduationCap, 
  CheckCircle,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    fetchNotes();
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

  return (
    <div className="min-h-screen bg-[#070514] text-white selection:bg-purple-500 selection:text-white">
      
      {/* SECTION 1: MODERN HERO CONTAINER */}
      <div className="relative pt-36 pb-28 overflow-hidden border-b border-white/5">
        {/* Modern ambient blurred background accent glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 shadow-lg">
              <Sparkles className="text-yellow-400" size={16} />
              <span className="font-semibold text-xs tracking-wide uppercase text-purple-200">Next-Gen Student Hub</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.15]">
            Notes That <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-indigo-400">Actually Help</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Beautifully organized notes compiled directly by peers. Broaden your technical knowledge base, reference certified reviews, and accelerate your academic path together.
          </p>

          <div className="flex justify-center items-center gap-10 text-xs font-semibold text-slate-400 tracking-wider uppercase bg-white/[0.02] border border-white/5 w-fit mx-auto px-8 py-3.5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={16} /> 
              <span>Trending Materials</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
              <GraduationCap className="text-purple-400" size={16} />
              <span>500+ Active Contributors</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FLOATING FILTER SEARCH CONTROLS */}
      <div className="max-w-5xl mx-auto -mt-9 px-6 relative z-20">
        <div className="bg-[#0f0c24]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-4.5 text-white/40" size={20} />
              <input
                type="text"
                placeholder="Search notes, fields, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-13 pr-6 py-4 bg-white/[0.03] text-white border border-white/5 rounded-2xl placeholder-white/40 text-base focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all"
              />
            </div>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-[#0f0c24] border border-white/10 text-slate-200 px-6 py-4 rounded-2xl focus:outline-none focus:border-purple-500/50 text-base font-medium appearance-none cursor-pointer transition-all hover:bg-white/[0.02]"
            >
              <option value="" className="bg-[#0f0c24]">All Fields</option>
              <option value="Computer Science" className="bg-[#0f0c24]">Computer Science</option>
              <option value="Mathematics" className="bg-[#0f0c24]">Mathematics</option>
              <option value="Physics" className="bg-[#0f0c24]">Physics</option>
              <option value="Chemistry" className="bg-[#0f0c24]">Chemistry</option>
              <option value="Programming" className="bg-[#0f0c24]">Programming</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: CORE IMPORTANCE VALUE PROP (WHY CHOOSE NOTEVAULT) */}
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Why NoteVault Matters</h2>
          <p className="text-slate-400 text-sm md:text-base">An engineering-focused knowledge ecosystem engineered to support collaborative academic advancement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
              <UploadCloud size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Structured Submissions</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Students and field experts can upload structured, module-specific resources to keep academic content synchronized across batches.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:border-indigo-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Expert Verification</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Materials undergo multi-role reviews. Platform experts validate technical accuracy so you learn from verified reference data.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:border-pink-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6">
              <Layers size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Role-Based Guardrails</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enforced dynamic path routing preserves integrity. Admins manage system logs cleanly, protecting open campus exchange channels.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: HOW THE PLATFORM WORKS */}
      <div className="bg-gradient-to-b from-transparent via-white/[0.01] to-transparent py-20 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold tracking-widest text-purple-400 uppercase">Operational Protocol</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 tracking-tight">How to Get Started</h2>
              <p className="text-slate-400 mb-8 text-sm md:text-base leading-relaxed">
                NoteVault streamlines the process of discovering and contributing reference materials down to three secure points of interaction:
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold mt-1 text-purple-300 shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-200 text-base">Create Authenticated Profile</h4>
                    <p className="text-slate-400 text-xs mt-1">Register using your verified role (Student or Expert) to initialize your access dashboard.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold mt-1 text-purple-300 shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-200 text-base">Query/Publish Resources</h4>
                    <p className="text-slate-400 text-xs mt-1">Filter documents globally or upload code files, notes, and technical references directly.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold mt-1 text-purple-300 shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-slate-200 text-base">Secure Local Download</h4>
                    <p className="text-slate-400 text-xs mt-1">Acquire validated reference streams directly onto your terminal disk smoothly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Informational Overview Box Component */}
            <div className="bg-[#0d0a21] border border-white/10 p-8 rounded-3xl relative">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-400" /> System Integrity Metrics
              </h3>
              <div className="space-y-3 text-xs text-slate-400">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span>Authorization Model</span>
                  <span className="text-slate-200 font-mono">JWT Role Gated</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span>Verification Speed</span>
                  <span className="text-slate-200 font-mono">&lt; 24 Hours</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span>File Storage Mapping</span>
                  <span className="text-slate-200 font-mono">Stream Protected</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>System Routing Gateways</span>
                  <span className="text-slate-200 font-mono">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: LIVE CAMPUS NOTES FEED LIST */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Fresh from Campus</h2>
            <p className="text-slate-400 text-sm mt-1">Explore current community submissions uploaded across your department.</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-medium text-purple-300 w-fit">
            {notes.length} notes available
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin"></div>
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Syncing Live Directory...</span>
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {notes.map(note => <NoteCard key={note._id} note={note} />)}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl max-w-xl mx-auto px-6">
            <BookOpen size={64} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-xl font-bold text-slate-300">No records found</h3>
            <p className="text-slate-500 text-xs mt-2 max-w-xs mx-auto">
              Your specific subject filter parameters yielded zero active file objects. Try adjusting your input terms.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 6: MODERN MINI FOOTER BAR */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500 font-medium">
        &copy; {new Date().getFullYear()} NoteVault. Academic Content Exchange Platform. All rights reserved.
      </footer>
    </div>
  );
}