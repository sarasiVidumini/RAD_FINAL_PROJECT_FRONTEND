import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Trash2,
  Edit3,
  X,
  Send,
  User,
  CheckCircle2
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';


interface NoteRequest {
  _id: string;
  title: string;
  subject: string;
  semester: string;
  description: string;
  status: 'open' | 'fulfilled';
  requestedBy: { name: string };
  fulfilledBy?: { _id: string; name: string };
  fulfilledNote?: { _id: string; title: string };
  createdAt: string;
}

interface Message {
  _id: string;
  senderId: string;
  senderModel: 'Student' | 'Expert';
  text: string;
  createdAt: string;
}

interface ChatThread {
  _id: string;
  student: { _id: string; name: string; email: string };
  messages: Message[];
  updatedAt: string;
}

export default function ExpertDashboard() {
  const [expertNotes, setExpertNotes] = useState<Note[]>([]);
  const [requests, setRequests] = useState<NoteRequest[]>([]);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);


  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateSubject, setUpdateSubject] = useState('');
  const [updateSemester, setUpdateSemester] = useState<number>(1);
  const [updateDescription, setUpdateDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [notesRes, requestsRes, chatsRes] = await Promise.all([
        API.get('/notes/my'),
        API.get('/requests'),
        API.get('/chats')
      ]);
      setExpertNotes(notesRes.data || []);
      setRequests(requestsRes.data?.slice(0, 3) || []);
      setChats(chatsRes.data || []);
    } catch (error) {
      toast.error("Failed to synchronize system terminal logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chats]);


  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this academic publication?")) return;
    
    try {
      await API.delete(`/notes/${noteId}`);
      toast.success("Publication removed successfully");
      setExpertNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to drop note resource");
    }
  };


  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setUpdateTitle(note.title);
    setUpdateSubject(note.subject);
    setUpdateSemester(note.semester);
    setUpdateDescription(note.description || '');
  };


  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    setIsUpdating(true);
    try {
      const updatedData = {
        title: updateTitle,
        subject: updateSubject,
        semester: updateSemester,
        description: updateDescription
      };

      const res = await API.put(`/notes/${editingNote._id}`, updatedData);
      toast.success("Academic resource updated successfully");
      
      setExpertNotes(prev => 
        prev.map(note => 
          note._id === editingNote._id ? { ...note, ...res.data } : note
        )
      );
      setEditingNote(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to modify configuration details");
    } finally {
      setIsUpdating(false);
    }
  };


  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    

    if (!activeChatId || activeChatId === 'undefined' || !replyText.trim()) {
      toast.error("Unable to send: Missing active thread configuration sequence.");
      return;
    }

    setSendingMessage(true);
    try {
      const res = await API.post(`/chats/${activeChatId}/messages`, { text: replyText });

      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === activeChatId ? { ...chat, messages: [...chat.messages, res.data] } : chat
        )
      );
      setReplyText('');
    } catch (error) {
      toast.error("Failed to transmit system messaging sequence");
    } finally {
      setSendingMessage(false);
    }
  };

  const currentChat = chats.find(c => c._id === activeChatId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mb-4"></div>
        <div className="text-slate-400 font-medium tracking-wide">SYNCHRONIZING EXPERT TERMINAL...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-200 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center">
                <Award size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Expert Hub
                </h1>
                <p className="text-slate-400 mt-1">Verified Knowledge Architect Console</p>
              </div>
            </div>
          </div>

          <RouterLink
            to="/upload"
            className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl hover:bg-white/90 transition-all font-semibold shadow-xl shadow-violet-500/20"
          >
            <UploadCloud size={20} />
            PUBLISH NEW RESOURCE
          </RouterLink>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Publications", value: expertNotes.length, icon: FileText, color: "violet" },
            { label: "Open Requests", value: requests.filter(r => r.status !== 'fulfilled').length, icon: Clock, color: "amber" },
            { label: "Active Chats", value: chats.length, icon: MessageSquare, color: "sky" },
            { label: "Status", value: "VERIFIED", icon: Sparkles, color: "emerald" },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900 border border-white/10 rounded-3xl p-6 hover:border-violet-500/30 transition-all group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-[2px] text-slate-500">{stat.label}</p>
                  <p className="text-4xl font-bold mt-3 text-white">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl bg-zinc-800 group-hover:bg-zinc-700 transition-colors`}>
                  <stat.icon size={28} className={`text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Section - Publications & Requests */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* My Publications */}
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <BookOpen className="text-violet-400" /> Your Publications
                </h2>
                <span className="text-sm text-slate-400 font-mono">{expertNotes.length} resources published</span>
              </div>

              {expertNotes.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  <Award size={60} className="mx-auto text-slate-600 mb-6" />
                  <p className="text-xl text-slate-300">No publications yet</p>
                  <p className="text-slate-500 mt-2">Share your expertise with the community</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {expertNotes.map(note => (
                    <div key={note._id} className="relative group">
                      <NoteCard note={note} showActions />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEditModal(note)} className="bg-zinc-900 p-2 rounded-xl hover:bg-violet-600 transition">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDeleteNote(note._id)} className="bg-zinc-900 p-2 rounded-xl hover:bg-red-600 transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Student Demands */}
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Clock className="text-amber-400" /> Live Student Requests
                </h2>
                <RouterLink to="/requests" className="text-violet-400 hover:text-violet-300 flex items-center gap-2 text-sm font-medium">
                  View All <ArrowRight size={16} />
                </RouterLink>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.length === 0 ? (
                  <div className="col-span-2 text-center py-16 text-slate-400">No active requests at the moment.</div>
                ) : (
                  requests.map((req) => {
                    const isFulfilled = req.status === 'fulfilled';
                    return (
                      <div key={req._id} className={`bg-zinc-950 border rounded-3xl p-6 transition-all hover:border-violet-500/50 ${isFulfilled ? 'border-emerald-500/30' : 'border-white/10'}`}>
                        <div className="flex justify-between mb-4">
                          <span className="text-xs px-3 py-1 bg-zinc-800 rounded-full">SEM {req.semester}</span>
                          {isFulfilled && <span className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle2 size={14} /> Fulfilled</span>}
                        </div>
                        <h4 className="font-semibold text-lg leading-tight mb-2">{req.title}</h4>
                        <p className="text-violet-400 text-sm mb-3">{req.subject}</p>
                        <p className="text-sm text-slate-400 line-clamp-3">{req.description}</p>

                        {!isFulfilled && (
                          <RouterLink 
                            to={`/upload?request_id=${req._id}&subject=${encodeURIComponent(req.subject)}`}
                            className="mt-6 w-full block text-center py-3 bg-white text-black rounded-2xl font-semibold hover:bg-white/90 transition"
                          >
                            Fulfill Request
                          </RouterLink>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Private Consultations */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden h-[620px] flex flex-col">
                <div className="p-6 border-b border-white/10 bg-zinc-950">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <MessageSquare className="text-sky-400" /> Private Consultations
                  </h2>
                </div>

                {!activeChatId ? (
                  <div className="flex-1 overflow-y-auto p-4">
                    {chats.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center px-6">
                        <MessageSquare size={48} className="text-slate-600 mb-4" />
                        <p className="text-slate-400">No active conversations</p>
                      </div>
                    ) : (
                      chats.map(chat => {
                        const lastMsg = chat.messages[chat.messages.length - 1];
                        return (
                          <div 
                            key={chat._id}
                            onClick={() => setActiveChatId(chat._id)}
                            className="p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition-all mb-2 group"
                          >
                            <div className="flex gap-4">
                              <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center">
                                <User size={20} />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-white group-hover:text-violet-400 transition">{chat.student?.name}</div>
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {lastMsg ? lastMsg.text : "New consultation started"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    {/* Chat Header */}
                    <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-950">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-zinc-800 rounded-2xl flex items-center justify-center">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{currentChat?.student?.name}</p>
                          <p className="text-xs text-slate-500">{currentChat?.student?.email}</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveChatId(null)} className="text-slate-400 hover:text-white">
                        <X size={22} />
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-950">
                      {currentChat?.messages.map((msg) => {
                        const isExpert = msg.senderModel === 'Expert';
                        return (
                          <div key={msg._id} className={`flex ${isExpert ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-5 py-3 rounded-3xl text-sm ${isExpert 
                              ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white' 
                              : 'bg-zinc-800 text-slate-100'}`}>
                              <p>{msg.text}</p>
                              <span className="block text-[10px] mt-2 opacity-70 text-right">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Reply Input */}
                    <form onSubmit={handleSendReply} className="p-4 border-t border-white/10 bg-zinc-900">
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          placeholder="Type your professional response..." 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 bg-zinc-800 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:border-violet-500 outline-none"
                        />
                        <button 
                          type="submit" 
                          disabled={sendingMessage || !replyText.trim()}
                          className="bg-violet-600 hover:bg-violet-500 px-6 rounded-2xl disabled:opacity-50 transition"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Edit Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-lg p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">Update Resource</h3>
              <button onClick={() => setEditingNote(null)}><X size={24} /></button>
            </div>

            <form onSubmit={handleUpdateNote} className="space-y-6">
              {/* Form fields remain unchanged */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Title</label>
                <input type="text" value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-3" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Subject</label>
                  <input type="text" value={updateSubject} onChange={(e) => setUpdateSubject(e.target.value)} className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-3" required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Semester</label>
                  <select value={updateSemester} onChange={(e) => setUpdateSemester(Number(e.target.value))} className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-3">
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Description</label>
                <textarea value={updateDescription} onChange={(e) => setUpdateDescription(e.target.value)} rows={5} className="w-full bg-zinc-800 border border-white/10 rounded-3xl px-5 py-4 resize-y" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingNote(null)} className="flex-1 py-4 border border-white/10 rounded-2xl hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 py-4 bg-violet-600 hover:bg-violet-500 rounded-2xl font-semibold">
                  {isUpdating ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}