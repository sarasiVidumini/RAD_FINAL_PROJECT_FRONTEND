import React, { useState, useEffect } from 'react';
import API from '../../lib/api';
import { Note } from '../../types';
import NoteCard from '../../components/NoteCard';
import toast from 'react-hot-toast';
import { 
  Award, 
  UploadCloud, 
  CheckCircle, 
  BookOpen, 
  FileText, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Interface mapping incoming student requests
interface NoteRequest {
  _id: string;
  title: string;
  subject: string;
  semester: string;
  description: string;
  requestedBy: { name: string };
  createdAt: string;
}

export default function ExpertDashboard() {
  const [expertNotes, setExpertNotes] = useState<Note[]>([]);
  const [requests, setRequests] = useState<NoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Concurrent requests for publication logs and general student needs
        const [notesRes, requestsRes] = await Promise.all([
          API.get('/notes/my'),
          API.get('/requests') // Assuming endpoint tracks active global student demand
        ]);
        
        setExpertNotes(notesRes.data);
        // Displaying top 3 priority items to keep dashboard balanced
        setRequests(requestsRes.data?.slice(0, 3) || []);
      } catch (error) {
        toast.error("Failed to synchronize system terminal logs");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <div className="text-gray-500 font-medium tracking-wide">Synchronizing Expert Terminal Panel...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-slate-50/50 min-h-screen">
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Award className="text-emerald-600" size={40} /> Expert Hub Console
          </h1>
          <p className="text-gray-600 mt-2">
            Verified Domain Specialist: <span className="font-semibold text-emerald-600 underline decoration-2 underline-offset-4">{(user as any)?.expertise || 'Computer Science'}</span>
          </p>
        </div>

        <Link
          to="/upload"
          className="flex items-center gap-3 bg-emerald-600 text-white px-6 py-3.5 rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm tracking-wide"
        >
          <UploadCloud size={18} />
          Publish Expert Resource
        </Link>
      </div>

      {/* Analytical Metric Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Publications</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{expertNotes.length}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><FileText size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Requests</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{requests.length}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Clock size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fulfillment Index</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{expertNotes.length > 0 ? '94%' : 'N/A'}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><TrendingUp size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verification Badge</p>
            <h3 className="text-sm font-bold text-emerald-700 mt-2 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">Active Specialist</h3>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Sparkles size={24} /></div>
        </div>
      </div>

      {/* Main Structural Dashboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left/Center Column: Publications Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <BookOpen size={22} className="text-gray-500" /> Your Academic Publications
            </h2>
            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">{expertNotes.length} Published</span>
          </div>

          {expertNotes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 shadow-xs">
              <Award size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700">No verified logs found</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm">Publish verified articles or reference material blueprints to populate the student ecosystem feeds.</p>
              <Link
                to="/upload"
                className="inline-block mt-5 bg-emerald-600 text-white text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition font-semibold shadow-xs"
              >
                Upload First Reference Note
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {expertNotes.map(note => (
                <NoteCard key={note._id} note={note} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Real-Time Student Requests */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <MessageSquare size={22} className="text-amber-500" /> Live Student Demands
            </h2>
            <Link to="/requests" className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1 transition">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-xs">
                <p className="text-sm text-gray-500">No active curated request lists matching your discipline domain tags at this moment.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition duration-200">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-amber-100">
                      Sem {req.semester || '1'}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-base leading-tight hover:text-emerald-600 cursor-pointer transition">
                    {req.title}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-600 mt-1 mb-2">{req.subject}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 bg-gray-50 p-2.5 rounded-lg">
                    {req.description || "No description provided."}
                  </p>
                  
                  <Link 
                    to={`/upload?request_id=${req._id}&subject=${encodeURIComponent(req.subject)}`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-slate-800 transition"
                  >
                    Fulfill This Request
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Persistent Context Banner */}
          <div className="bg-linear-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <Award size={140} />
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-emerald-200 shrink-0 mt-0.5" size={20} />
              <div>
                <h5 className="font-bold text-sm tracking-wide">Specialist Badging System</h5>
                <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                  Your premium reference notes are automatically distinguished with a <strong>Verified Specialist</strong> profile tier layout stamp to draw priority exposure on student feeds.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}