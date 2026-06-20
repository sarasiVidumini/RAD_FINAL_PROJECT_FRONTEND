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
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
        <div className="text-neutral-400 font-mono tracking-widest text-xs">SYNCHRONIZING EXPERT TERMINAL...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Award size={26} className="text-black stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                  Expert Hub
                </h1>
                <p className="text-neutral-400 font-medium text-sm mt-1">Verified Knowledge Architect Console</p>
              </div>
            </div>
          </div>

          <RouterLink
            to="/upload"
            className="flex items-center gap-3 bg-amber-500 text-black px-8 py-4 rounded-2xl hover:bg-amber-400 transition-all font-bold tracking-wide shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:-translate-y-0.5 duration-200"
          >
            <UploadCloud size={20} className="stroke-[2.5]" />
            PUBLISH NEW RESOURCE
          </RouterLink>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Publications", value: expertNotes.length, icon: FileText, color: "text-amber-400" },
            { label: "Open Requests", value: requests.filter(r => r.status !== 'fulfilled').length, icon: Clock, color: "text-amber-500" },
            { label: "Active Chats", value: chats.length, icon: MessageSquare, color: "text-yellow-500" },
            { label: "Status", value: "VERIFIED", icon: Sparkles, color: "text-amber-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 hover:border-amber-500/30 transition-all duration-300 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[2px] text-neutral-500">{stat.label}</p>
                  <p className="text-4xl font-black mt-3 text-white tracking-tight">{stat.value}</p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 transition-colors">
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Main Section - Publications & Requests */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* My Publications */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-white">
                  <BookOpen className="text-amber-500" size={24} /> Your Publications
                </h2>
                <span className="text-xs text-neutral-500 font-mono bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">{expertNotes.length} resources published</span>
              </div>

              {expertNotes.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/50">
                  <Award size={48} className="mx-auto text-neutral-700 mb-4" />
                  <p className="text-lg text-neutral-400 font-medium">No publications yet</p>
                  <p className="text-neutral-600 text-sm mt-1">Share your expertise with the community</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {expertNotes.map(note => (
                    <div key={note._id} className="relative group rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/40 border border-transparent hover:border-amber-500/20">
                      <NoteCard note={note} showActions />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button onClick={() => openEditModal(note)} className="bg-neutral-950/90 border border-neutral-800 p-2.5 rounded-xl text-neutral-400 hover:text-amber-400 hover:border-amber-500/30 transition shadow-lg">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteNote(note._id)} className="bg-neutral-950/90 border border-neutral-800 p-2.5 rounded-xl text-neutral-400 hover:text-red-500 hover:border-red-500/30 transition shadow-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Student Demands */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-white">
                  <Clock className="text-amber-500" size={24} /> Live Student Requests
                </h2>
                <RouterLink to="/requests" className="text-amber-500 hover:text-amber-400 flex items-center gap-1.5 text-sm font-semibold group transition">
                  View All <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </RouterLink>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.length === 0 ? (
                  <div className="col-span-2 text-center py-16 text-neutral-500 font-medium">No active requests at the moment.</div>
                ) : (
                  requests.map((req) => {
                    const isFulfilled = req.status === 'fulfilled';
                    return (
                      <div key={req._id} className={`bg-neutral-950 border rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between ${isFulfilled ? 'border-neutral-800 opacity-70' : 'border-neutral-800 hover:border-amber-500/30 shadow-lg hover:shadow-amber-500/[0.02]'}`}>
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[11px] font-bold tracking-wider px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-amber-500 rounded-md">SEM {req.semester}</span>
                            {isFulfilled && (
                              <span className="text-neutral-400 text-xs flex items-center gap-1 font-medium bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md">
                                <CheckCircle2 size={13} className="text-neutral-500" /> Fulfilled
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-white text-lg leading-snug mb-2 tracking-tight group-hover:text-amber-400 transition">{req.title}</h4>
                          <p className="text-amber-500/90 text-xs font-semibold tracking-wide uppercase mb-3">{req.subject}</p>
                          <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed mb-6">{req.description}</p>
                        </div>

                        {!isFulfilled && (
                          <RouterLink 
                            to={`/upload?request_id=${req._id}&subject=${encodeURIComponent(req.subject)}`}
                            className="w-full text-center py-3 bg-amber-500 text-black rounded-xl font-bold text-sm hover:bg-amber-400 transition duration-200 block shadow-md shadow-amber-500/5"
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
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden h-[620px] flex flex-col backdrop-blur-md">
                <div className="p-6 border-b border-neutral-800 bg-neutral-950/60">
                  <h2 className="text-xl font-bold tracking-tight flex items-center gap-3 text-white">
                    <MessageSquare className="text-amber-500" size={22} /> Private Consultations
                  </h2>
                </div>

                {!activeChatId ? (
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {chats.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center px-6">
                        <MessageSquare size={40} className="text-neutral-700 mb-3" />
                        <p className="text-neutral-500 text-sm font-medium">No active conversations</p>
                      </div>
                    ) : (
                      chats.map(chat => {
                        const lastMsg = chat.messages[chat.messages.length - 1];
                        return (
                          <div 
                            key={chat._id}
                            onClick={() => setActiveChatId(chat._id)}
                            className="p-4 hover:bg-neutral-900/80 border border-yellow-500 rounded-2xl cursor-pointer transition-all duration-200 group mb-1"
                          >
                            <div className="flex gap-3.5 items-center">
                              <div className="w-10 h-10 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center group-hover:border-amber-500/30 transition">
                                <User size={18} className="text-neutral-400 group-hover:text-amber-400 transition" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-neutral-200 group-hover:text-white transition truncate">{chat.student?.name}</div>
                                <p className="text-xs text-neutral-500 truncate mt-0.5">
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
                  <div className="flex flex-col h-full bg-neutral-950/40">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center">
                          <User size={16} className="text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-white truncate">{currentChat?.student?.name}</p>
                          <p className="text-[11px] text-neutral-500 font-mono truncate">{currentChat?.student?.email}</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveChatId(null)} className="text-neutral-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-neutral-900 transition">
                        <X size={18} />
                      </button>
                    </div>

                    {/* Messages Frame */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/20">
                      {currentChat?.messages.map((msg) => {
                        const isExpert = msg.senderModel === 'Expert';
                        return (
                          <div key={msg._id} className={`flex ${isExpert ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md border ${isExpert 
                              ? 'bg-amber-500 border-amber-600 text-black font-medium rounded-tr-none' 
                              : 'bg-neutral-900 border-neutral-800 text-neutral-200 rounded-tl-none'}`}>
                              <p>{msg.text}</p>
                              <span className={`block text-[9px] mt-1.5 opacity-60 text-right font-mono ${isExpert ? 'text-black' : 'text-neutral-500'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Reply Form */}
                    <form onSubmit={handleSendReply} className="p-4 border-t border-neutral-800 bg-neutral-900/60">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Type professional response..." 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none placeholder-neutral-600 transition"
                        />
                        <button 
                          type="submit" 
                          disabled={sendingMessage || !replyText.trim()}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-4 rounded-xl disabled:opacity-40 transition flex items-center justify-center shadow-md shadow-amber-500/5"
                        >
                          <Send size={16} className="stroke-[2.5]" />
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

      {/* Modern Black & Gold Edit Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-7 shadow-2xl shadow-black/80">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Edit3 size={18} className="text-amber-500" /> Update Academic Publication
              </h3>
              <button onClick={() => setEditingNote(null)} className="text-neutral-500 hover:text-white p-1 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateNote} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Resource Title</label>
                <input 
                  type="text" 
                  value={updateTitle} 
                  onChange={(e) => setUpdateTitle(e.target.value)} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Subject Category</label>
                  <input 
                    type="text" 
                    value={updateSubject} 
                    onChange={(e) => setUpdateSubject(e.target.value)} 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Target Semester</label>
                  <select 
                    value={updateSemester} 
                    onChange={(e) => setUpdateSemester(Number(e.target.value))} 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-300 focus:border-amber-500/50 outline-none transition appearance-none"
                  >
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester 0{n}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Resource Description</label>
                <textarea 
                  value={updateDescription} 
                  onChange={(e) => setUpdateDescription(e.target.value)} 
                  rows={4} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition resize-none" 
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setEditingNote(null)} 
                  className="flex-1 py-3 border border-neutral-800 text-sm font-semibold rounded-xl text-neutral-300 hover:bg-neutral-950 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating} 
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition disabled:opacity-40 shadow-lg shadow-amber-500/5"
                >
                  {isUpdating ? "Saving Deployment..." : "Commit Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}