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
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';


interface NoteRequest {
  _id: string;
  title: string;
  subject: string;
  semester: string;
  description: string;
  requestedBy: { name: string };
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

  // State management for updating notes
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

  // Auto-scroll inside real-time chat containers on selection shifts
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chats]);

  // Handle Note Deletion
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

  // Open Edit Modal with populated data
  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setUpdateTitle(note.title);
    setUpdateSubject(note.subject);
    setUpdateSemester(note.semester);
    setUpdateDescription(note.description || '');
  };

  // Handle Note Update Submission
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
          note._id === editingNote._id 
            ? { ...note, ...res.data } 
            : note
        )
      );
      setEditingNote(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to modify configuration details");
    } finally {
      setIsUpdating(false);
    }
  };

  // Dispatch replies inside student workspace
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ DEFENSIVE CHECK: Prevents firing network calls with a broken context key
    if (!activeChatId || activeChatId === 'undefined' || !replyText.trim()) {
      toast.error("Unable to send: Missing active thread configuration sequence.");
      return;
    }

    setSendingMessage(true);
    try {
      const res = await API.post(`/chats/${activeChatId}/messages`, { text: replyText });
      
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === activeChatId 
            ? { ...chat, messages: [...chat.messages, res.data] } 
            : chat
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

      {/* Metrics Row */}
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Inquiries</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{chats.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><MessageSquare size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verification Badge</p>
            <h3 className="text-sm font-bold text-emerald-700 mt-2 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">Active Specialist</h3>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Sparkles size={24} /></div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left/Middle Column Components: Publications & Live Student Demands */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Publications Panel */}
          <div className="space-y-6">
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
                <Link to="/upload" className="inline-block mt-5 bg-emerald-600 text-white text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition font-semibold shadow-xs">
                  Upload First Reference Note
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {expertNotes.map(note => (
                  <div key={note._id} className="relative group bg-white border border-gray-100 rounded-2xl p-2 shadow-xs hover:shadow-md transition duration-200">
                    <NoteCard note={note} />
                    
                    <div className="mt-3 border-t border-gray-50 pt-3 px-3 pb-2 flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(note)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note._id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Student Demands Block */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Clock size={22} className="text-amber-500" /> Live Student Demands
              </h2>
              <Link to="/requests" className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1 transition">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {requests.length === 0 ? (
                <div className="col-span-2 bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-xs">
                  <p className="text-sm text-gray-500">No active curated request lists matching your discipline domain tags at this moment.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between">
                    <div>
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
                    </div>

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
          </div>

        </div>

        {/* Right Column: Real-Time Interactive Inbox Terminal Layout */}
        <div className="lg:col-span-1 sticky top-6 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <MessageSquare size={22} className="text-indigo-600" /> Private Consultations
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden h-[540px] flex flex-col">
            {!activeChatId ? (
              /* Threads View Matrix */
              <div className="flex-grow flex flex-col overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Incoming Active Channels ({chats.length})
                </div>
                
                <div className="flex-grow overflow-y-auto divide-y divide-slate-100">
                  {chats.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                      <MessageSquare className="text-slate-200 mb-2" size={40} />
                      <p className="text-xs text-slate-400 font-medium">No active communications found.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Students messaging you privately will appear here.</p>
                    </div>
                  ) : (
                    chats.map(chat => {
                      const lastMsg = chat.messages[chat.messages.length - 1];
                      return (
                        <div 
                          key={chat._id}
                          onClick={() => setActiveChatId(chat._id)}
                          className="p-4 hover:bg-indigo-50/30 transition cursor-pointer flex items-start gap-3 group"
                        >
                          <div className="p-2 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-indigo-100 group-hover:text-indigo-600 transition">
                            <User size={16} />
                          </div>
                          <div className="flex-grow overflow-hidden">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <h4 className="text-sm font-bold text-slate-800 truncate">{chat.student?.name}</h4>
                              <span className="text-[10px] text-slate-400">
                                {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {lastMsg ? `${lastMsg.senderModel === 'Expert' ? 'You: ' : ''}${lastMsg.text}` : 'Started a consultation.'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* Inside Selected Chat Channel Terminal Panel */
              <div className="flex-grow flex flex-col overflow-hidden">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-1.5 bg-slate-800 text-indigo-400 rounded-lg shrink-0">
                      <User size={14} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold truncate">{currentChat?.student?.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{currentChat?.student?.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveChatId(null)}
                    className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Conversation History Matrix Panel */}
                <div className="flex-grow overflow-y-auto bg-slate-50 p-4 space-y-3 flex flex-col">
                  {currentChat?.messages.map((msg) => {
                    const isExpert = msg.senderModel === 'Expert';
                    return (
                      <div 
                        key={msg._id} 
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-2xs ${
                          isExpert 
                            ? 'bg-indigo-600 text-white font-medium self-end rounded-br-none' 
                            : 'bg-white text-slate-800 border border-slate-200/60 self-start rounded-bl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className={`block text-[9px] mt-1 text-right ${isExpert ? 'text-indigo-200/80' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Secure Message Transmission Bar */}
                <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type professional advice..." 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={sendingMessage}
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                  />
                  <button 
                    type="submit" 
                    disabled={sendingMessage || !replyText.trim()}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Static Badging Accent */}
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

      {/* --- Overlay Edit/Update Modal Blueprint --- */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in-50 zoom-in-95 duration-150">
            <button 
              onClick={() => setEditingNote(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={18} />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Edit3 className="text-emerald-600" size={20} /> Modify Resource Properties
            </h3>
            <p className="text-xs text-gray-500 mb-5">Make changes to your verified document metadata.</p>

            <form onSubmit={handleUpdateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Document Title</label>
                <input 
                  type="text" 
                  value={updateTitle} 
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Subject Field</label>
                  <input 
                    type="text" 
                    value={updateSubject} 
                    onChange={(e) => setUpdateSubject(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Academic Semester</label>
                  <select 
                    value={updateSemester} 
                    onChange={(e) => setUpdateSemester(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition"
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>Semester {num}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Resource Blueprint Description</label>
                <textarea 
                  value={updateDescription} 
                  onChange={(e) => setUpdateDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition flex items-center gap-2"
                >
                  {isUpdating ? "Synchronizing..." : "Apply Updates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}