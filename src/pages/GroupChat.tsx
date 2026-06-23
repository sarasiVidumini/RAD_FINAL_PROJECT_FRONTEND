import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Send, Smile, Camera, FileUp, Users, 
  ShieldAlert, X, Download, MonitorSmartphone,
  Copy, Pencil, Trash2, Check
} from 'lucide-react';
import { GroupMessage } from '../types';

const REACTION_STAMPS = ["👍", "❤️", "😂", "😮", "🔥", "✅", "🙏"];

export default function GroupChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [liveCamera, setLiveCamera] = useState(false);

  // States handling editing and inline manipulation
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const videoFeedRef = useRef<HTMLVideoElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // 1. Recover preceding group data logs
    axios.get('https://rad-final-project-backend.vercel.app/api/chat/history', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setMessages(res.data || []))
    .catch(() => console.error("Could not sync message history logs down."));

    // 2. Open full duplex WebSockets lines
    socketRef.current = io('https://rad-final-project-backend.vercel.app', { withCredentials: true });

    socketRef.current.on('receive_group_message', (msg: GroupMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    // Handle real-time sync for edits
    socketRef.current.on('group_message_updated', (updatedMsg: GroupMessage) => {
      setMessages(prev => prev.map(m => (m._id === updatedMsg._id ? updatedMsg : m)));
    });

    // Handle real-time sync for deletions
    socketRef.current.on('group_message_deleted', (payload: { messageId: string }) => {
      setMessages(prev => prev.filter(m => m._id !== payload.messageId));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !user) return;

    const currentUser = user as any;
    const userId = currentUser.id || currentUser._id || 'unknown_node';

    const payload: GroupMessage = {
      text: inputVal,
      sender: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    socketRef.current?.emit('send_group_message', payload);
    setInputVal('');
  };

  // Triggers text pipeline mutation up to server instances
  const submitMessageUpdate = (messageId: string) => {
    if (!editText.trim() || !user?.email) return;
    socketRef.current?.emit('edit_group_message', {
      messageId,
      text: editText,
      userEmail: user.email
    });
    setEditingId(null);
    setEditText('');
    toast.success("Payload updated successfully.");
  };

  // Triggers deletion request (handles both admin drops and self removals)
  const processMessageDeletion = (messageId: string, isSelfDrop: boolean) => {
    if (!user?.email) return;
    socketRef.current?.emit('delete_group_message', {
      messageId,
      userEmail: user.email
    });
    if (isSelfDrop) {
      toast.success("Your message was deleted.");
    } else {
      toast.success("Message line dropped by Admin override.");
    }
  };

  // Native Clipboard helper
  const handleTextCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Content copied to clipboard layout.");
  };

  const handleStampInjection = (emoji: string) => {
    if (!user) return;
    
    const currentUser = user as any;
    const userId = currentUser.id || currentUser._id || 'unknown_node';

    const payload: GroupMessage = {
      emoji,
      sender: { id: userId, name: user.name, email: user.email, role: user.role }
    };
    socketRef.current?.emit('send_group_message', payload);
    setShowEmojis(false);
  };

  const initCameraStreamNode = async () => {
    setLiveCamera(true);
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoFeedRef.current) videoFeedRef.current.srcObject = stream;
      } catch {
        toast.error("Camera permissions blocked or device unavailable.");
        setLiveCamera(false);
      }
    }, 150);
  };

  const handleSnapshotExtraction = () => {
    if (!videoFeedRef.current || !user) return;
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 340;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoFeedRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrlStr = canvas.toDataURL('image/png');

      const trackSrc = videoFeedRef.current.srcObject as MediaStream;
      trackSrc?.getTracks().forEach(track => track.stop());
      setLiveCamera(false);

      const currentUser = user as any;
      const userId = currentUser.id || currentUser._id || 'unknown_node';

      const payload: GroupMessage = {
        cameraSnapshot: dataUrlStr,
        fileName: "Webcam_Snapshot.png",
        sender: { id: userId, name: user.name, email: user.email, role: user.role }
      };
      socketRef.current?.emit('send_group_message', payload);
      toast.success("Snapshot transmitted successfully.");
    }
  };

  const processExternalFileAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const asset = e.target.files?.[0];
    if (!asset || !user) return;

    const loader = toast.loading(`Uploading asset file: ${asset.name}...`);
    const dataForm = new FormData();
    dataForm.append('file', asset);

    try {
      const res = await axios.post('https://rad-final-project-backend.vercel.app/api/chat/upload', dataForm, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const currentUser = user as any;
      const userId = currentUser.id || currentUser._id || 'unknown_node';

      const payload: GroupMessage = {
        fileUrl: res.data.fileUrl,
        fileName: asset.name,
        sender: { id: userId, name: user.name, email: user.email, role: user.role }
      };

      socketRef.current?.emit('send_group_message', payload);
      toast.success("File shared in group room.", { id: loader });
    } catch {
      toast.error("Asset transmission error.", { id: loader });
    }
  };

  // Determine if active session identity holds Admin clearance
  const currentSessionIsAdmin = user?.email?.trim().toLowerCase() === 'admin@glowcare.ai' || user?.email?.trim().toLowerCase() === 'admin@notevault.com' || user?.role === 'admin';

  return (
    <div className="w-full min-h-screen bg-black text-zinc-100 py-8 px-4 font-sans selection:bg-amber-500/20 selection:text-amber-400">
      <div className="max-w-5xl mx-auto">
        
        {/* Sub-Header */}
        <div className="mb-6 px-2">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" /> Live Node Channel
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Peer-to-Peer <span className="text-amber-400">Sync Grid</span>
          </h1>
        </div>

        {/* Outer Chat Container */}
        <div className="bg-[#0b0b0d] border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col min-h-[620px] shadow-2xl relative">
          
          {/* Header Bar */}
          <div className="bg-[#111114] p-5 border-b border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Users size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Public Sync Communication Channel</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 font-mono">NoteVault low-latency grid connection</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 font-mono">
              <MonitorSmartphone size={12} className="text-amber-400" />
              <span>Node ID: {user?.name || "anonymous_peer"}</span>
            </div>
          </div>

          {/* Messaging Workspace Logs */}
          <div className="flex-1 bg-[#070708] p-6 overflow-y-auto space-y-6 max-h-[480px]">
            {messages.map((m, idx) => {
              const isSelf = m.sender?.email?.trim().toLowerCase() === user?.email?.trim().toLowerCase();
              const isAdminNode = m.sender?.email?.trim().toLowerCase() === 'admin@glowcare.ai' || m.sender?.email?.trim().toLowerCase() === 'admin@notevault.com' || m.sender?.role === 'admin';
              const messageId = m._id || '';
              const senderRole = m.sender?.role || 'user';

              return (
                <div key={messageId || idx} className={`flex flex-col max-w-[80%] space-y-1 relative group ${isSelf ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  
                  {/* Sender Metadata Block (Role precedes Name) */}
                  <div className="flex items-center gap-1.5 text-[10px] px-1 font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">
                      {senderRole}
                    </span>
                    <span className={isSelf ? 'text-amber-400 font-bold' : 'text-zinc-400'}>{m.sender?.name}</span>
                    {isAdminNode && (
                      <span className="text-red-400 bg-red-950/40 border border-red-800/60 rounded px-1.5 py-0.5 text-[8px] font-sans font-bold flex items-center gap-0.5 uppercase tracking-wider">
                        <ShieldAlert size={8} /> Admin Override
                      </span>
                    )}
                  </div>

                  {/* Message Context Core Wrapper with Action Utilities Grid */}
                  <div className="relative flex items-center gap-2">
                    
                    {/* Action Panel: Visible on hover */}
                    <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg shadow-xl z-10 ${
                      isSelf ? 'right-full mr-2' : 'left-full ml-2'
                    }`}>
                      {/* COPY Action (Universal Access) */}
                      {m.text && (
                        <button 
                          onClick={() => handleTextCopy(m.text || '')} 
                          className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition"
                          title="Copy Content Sequence"
                        >
                          <Copy size={12} />
                        </button>
                      )}

                      {/* EDIT Action (Sender Exclusive Access) */}
                      {isSelf && m.text && (
                        <button 
                          onClick={() => {
                            setEditingId(messageId);
                            setEditText(m.text || '');
                          }} 
                          className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 rounded transition"
                          title="Modify Text Data"
                        >
                          <Pencil size={12} />
                        </button>
                      )}

                      {/* DELETE Action (Sender OR Administrator Access) */}
                      {(isSelf || currentSessionIsAdmin) && messageId && (
                        <button 
                          onClick={() => processMessageDeletion(messageId, isSelf)} 
                          className="p-1 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 rounded transition"
                          title="Purge Message Frame"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Chat Text Bubble Content Node */}
                    <div className={`p-3.5 rounded-xl text-xs break-words shadow-lg leading-relaxed border transition-all ${
                      isSelf 
                        ? 'bg-amber-400 text-black border-amber-500 font-medium rounded-tr-none' 
                        : 'bg-[#121216] text-zinc-100 border-zinc-800/80 rounded-tl-none'
                    }`}>
                      {editingId === messageId ? (
                        /* Inline Workspace Editor View */
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <input 
                            type="text" 
                            value={editText} 
                            onChange={e => setEditText(e.target.value)}
                            className="flex-1 bg-black/20 text-black border-b border-black/40 focus:outline-none text-xs font-medium p-0.5"
                            autoFocus
                          />
                          <button onClick={() => submitMessageUpdate(messageId)} className="p-1 hover:bg-black/10 rounded text-black">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 hover:bg-black/10 rounded text-black">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        /* Standard View Layer Layouts */
                        <>
                          {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                          {m.emoji && <p className="text-2xl select-none">{m.emoji}</p>}
                          {m.cameraSnapshot && (
                            <img src={m.cameraSnapshot} alt="Hardware snapshot" className="rounded-lg border border-zinc-800 max-h-40 object-cover mt-1 bg-black" />
                          )}
                          {m.fileUrl && (
                            <a 
                              href={m.fileUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className={`mt-1 flex items-center gap-2 p-2 rounded-lg transition border text-[11px] font-mono ${
                                isSelf ? 'bg-black text-amber-400 border-zinc-900 hover:bg-zinc-950' : 'bg-black text-white border-zinc-800 hover:bg-zinc-900'
                              }`}
                            >
                              <Download size={12} /> <span className="truncate max-w-[180px] font-bold">{m.fileName || "Download Shared Asset"}</span>
                            </a>
                          )}
                        </>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
            <div ref={scrollAnchorRef} />
          </div>

          {/* Camera Panels */}
          {liveCamera && (
            <div className="absolute inset-x-0 bottom-[73px] bg-black/95 backdrop-blur-md p-4 border-t border-zinc-800 flex flex-col items-center gap-3 z-20 animate-fadeIn">
              <button type="button" onClick={() => setLiveCamera(false)} className="absolute top-3 right-3 text-zinc-400 hover:text-white transition"><X size={16} /></button>
              <video ref={videoFeedRef} autoPlay playsInline className="w-full max-w-[240px] rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl" />
              <button type="button" onClick={handleSnapshotExtraction} className="bg-amber-400 hover:bg-amber-500 text-black font-bold text-[10px] px-4 py-1.5 rounded-lg uppercase tracking-wider transition">Capture Frame Payload</button>
            </div>
          )}

          {/* Emoji Tray */}
          {showEmojis && (
            <div className="absolute inset-x-0 bottom-[73px] bg-[#111114]/95 backdrop-blur-md p-2 border-t border-zinc-800/60 flex flex-wrap gap-2 justify-center select-none z-10 animate-fadeIn">
              {REACTION_STAMPS.map(stamp => (
                <button type="button" key={stamp} onClick={() => handleStampInjection(stamp)} className="text-lg hover:scale-125 transition p-1.5 duration-150">{stamp}</button>
              ))}
            </div>
          )}

          {/* Message Dispatch Actions Tray Bar */}
          <div className="p-4 bg-[#111114] border-t border-zinc-800/60">
            <form onSubmit={handleMessageDispatch} className="flex items-center gap-2">
              <input type="file" ref={uploadInputRef} onChange={processExternalFileAttachment} className="hidden" accept="*/*" />
              
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => uploadInputRef.current?.click()} className="p-2.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl text-zinc-400 hover:text-amber-400 transition" title="Attach File Asset"><FileUp size={16} /></button>
                <button type="button" onClick={initCameraStreamNode} className="p-2.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl text-zinc-400 hover:text-amber-400 transition" title="Activate Camera Feed"><Camera size={16} /></button>
                <button type="button" onClick={() => setShowEmojis(!showEmojis)} className={`p-2.5 border rounded-xl transition ${showEmojis ? 'bg-amber-400/10 text-amber-400 border-amber-500/30' : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-amber-400'}`} title="Reaction Stamps"><Smile size={16} /></button>
              </div>

              <input 
                type="text" 
                value={inputVal} 
                onChange={e => setInputVal(e.target.value)} 
                placeholder="Type message payload sequence..." 
                className="flex-1 bg-[#070708] border border-zinc-800/80 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-400 text-zinc-100 placeholder-zinc-600 transition"
              />
              <button type="submit" disabled={!inputVal.trim()} className="p-2.5 bg-amber-400 disabled:bg-zinc-900/40 text-black disabled:text-zinc-600 rounded-xl font-bold transition duration-200 transform active:scale-95 hover:bg-amber-500">
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}