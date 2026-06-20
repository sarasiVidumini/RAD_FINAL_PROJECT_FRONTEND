import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Smile, Camera, Paperclip, Send, X, Copy, Trash, Edit2, Check, FileText, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface MessageType {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  attachments: string[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
}

interface ChatProps {
  userId: string;
  recipientName: string;
  onClose: () => void;
  currentUser: { id: string };
  verifiedUserEmail?: string;
  verifiedUsername?: string;
}

export default function PrivateChatModal({ userId, recipientName, onClose, currentUser, verifiedUserEmail, verifiedUsername }: ChatProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachedUrls, setAttachedUrls] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const toastOptions = {
    position: 'top-center' as const,
    style: {
      marginTop: '12vh',
      padding: '16px 24px',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      fontSize: '14px',
      fontWeight: '600',
      maxWidth: '420px',
      border: '1px solid #4f46e5',
      background: '#18181b',
      color: '#e0e7ff'
    }
  };

  const fetchMessages = async () => {
    if (!userId || userId === 'undefined') return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${userId}`, { headers });
      setMessages(res.data);
    } catch (err: any) {
      console.error("Error fetching chat stream:", err.message);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendSubmit = async (e?: React.FormEvent, overrideAttachments?: string[]) => {
    if (e) e.preventDefault();
    
    if (!userId || userId === 'undefined') {
      toast.error("Cannot send message: Invalid recipient profile reference.", toastOptions);
      return;
    }

    const finalAttachments = overrideAttachments !== undefined ? overrideAttachments : attachedUrls;
    if (!messageText.trim() && finalAttachments.length === 0) return;

    try {
      const res = await axios.post(
        'http://localhost:5000/api/chat',
        { receiverId: userId, content: messageText, attachments: finalAttachments },
        { headers }
      );
      setMessages(prev => [...prev, res.data]);
      setMessageText('');
      setAttachedUrls([]);
      setShowEmojiPicker(false);
    } catch (err: any) {
      toast.error("Failed to send message", toastOptions);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('file', files[0]);

    setUploading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chat/upload', formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      
      const newFileUrl = res.data.fileUrl;
      
      if (!messageText.trim()) {
        await handleSendSubmit(undefined, [newFileUrl]);
        toast.success("File shared instantly!", toastOptions);
      } else {
        setAttachedUrls(prev => [...prev, newFileUrl]);
        toast.success("File attached to message draft.", toastOptions);
      }
    } catch (error) {
      toast.error("File upload failed.", toastOptions);
    } finally {
      setUploading(false);
      e.target.value = ''; 
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachedUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", toastOptions);
    setActiveMenuId(null);
  };

  const startEditing = (msg: MessageType) => {
    setEditingMessageId(msg._id);
    setEditText(msg.content);
    setActiveMenuId(null);
  };

  const handleUpdateMessage = async (msgId: string) => {
    if (!editText.trim()) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/chat/${msgId}`, { content: editText }, { headers });
      setMessages(messages.map(m => m._id === msgId ? res.data : m));
      setEditingMessageId(null);
      toast.success("Message updated successfully!", toastOptions);
    } catch (err) {
      toast.error("Failed to update message", toastOptions);
    }
  };

  const confirmDeleteToast = (msgId: string) => {
    setActiveMenuId(null);
    
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[280px]">
        <div className="flex items-center gap-2 text-slate-200">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <div className="flex flex-col">
            <span className="font-bold text-sm">Delete Message?</span>
            <span className="text-xs text-slate-400 font-normal">This operation cannot be undone.</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              executeDelete(msgId);
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      position: 'top-center',
      duration: Infinity,
      style: { background: '#27272a', color: '#f1f5f9', border: '1px solid #4f46e5' }
    });
  };

  const executeDelete = async (msgId: string) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/chat/${msgId}`, { headers });
      setMessages(messages.map(m => m._id === msgId ? res.data : m));
      toast.success("Message removed.", toastOptions);
    } catch (err) {
      toast.error("Failed to delete message", toastOptions);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageText(prev => prev + emojiData.emoji);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
      <div className="flex flex-col h-[620px] w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-white/10">
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg text-white">{recipientName}</h3>
            {verifiedUsername && (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Verified • {verifiedUsername}
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-700">
          {messages.map((msg) => {
            const isMe = msg.sender === currentUser.id;
            const isTargetRecipient = msg.receiver === userId || msg.sender === userId;
            const isMenuOpen = activeMenuId === msg._id;

            if (!isMe && !isTargetRecipient) return null;

            return (
              <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div 
                  onClick={() => !msg.isDeleted && isMe && setActiveMenuId(isMenuOpen ? null : msg._id)}
                  className={`max-w-[78%] px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed relative transition-all ${
                    msg.isDeleted
                      ? 'bg-zinc-900 text-slate-500 italic border border-zinc-800'
                      : isMe 
                        ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-tr-none shadow-lg' 
                        : 'bg-zinc-800 text-slate-100 rounded-tl-none border border-white/10'
                  }`}
                >
                  {editingMessageId === msg._id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value={editText} 
                        onChange={(e) => setEditText(e.target.value)} 
                        className="bg-transparent border-b border-white/30 outline-none flex-grow text-white"
                        autoFocus 
                      />
                      <button onClick={() => handleUpdateMessage(msg._id)} className="text-emerald-400 hover:text-emerald-300"><Check size={18} /></button>
                      <button onClick={() => setEditingMessageId(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                    </div>
                  ) : (
                    <div>
                      {msg.content && <p className="break-words">{msg.content}</p>}
                      
                      {!msg.isDeleted && msg.attachments?.map((url, i) => {
                        const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
                        return isImage ? (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block mt-3">
                            <img src={url} alt="attachment" className="rounded-2xl max-h-60 w-full object-cover border border-white/10" />
                          </a>
                        ) : (
                          <a 
                            key={i} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-3 flex items-center gap-3 bg-black/30 border border-white/10 hover:border-violet-500 p-3 rounded-2xl transition-all"
                          >
                            <FileText size={18} />
                            <span className="text-sm truncate">Attachment • {url.split('.').pop()?.toUpperCase()}</span>
                          </a>
                        );
                      })}

                      {msg.isEdited && !msg.isDeleted && (
                        <span className="text-[10px] opacity-60 block mt-1 text-right">(edited)</span>
                      )}
                    </div>
                  )}
                </div>

                {!msg.isDeleted && isMe && isMenuOpen && editingMessageId !== msg._id && (
                  <div className="flex items-center gap-1 mt-2 bg-zinc-900 border border-white/10 rounded-2xl p-1 shadow-xl">
                    <button onClick={() => copyToClipboard(msg.content)} className="p-2.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition" title="Copy">
                      <Copy size={16} />
                    </button>
                    <button onClick={() => startEditing(msg)} className="p-2.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-violet-400 transition" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => confirmDeleteToast(msg._id)} className="p-2.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-red-500 transition" title="Delete">
                      <Trash size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <form onSubmit={(e) => handleSendSubmit(e)} className="border-t border-white/10 bg-zinc-900 p-4">
          {showEmojiPicker && (
            <div className="absolute bottom-24 left-6 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10">
              <EmojiPicker onEmojiClick={onEmojiClick} previewConfig={{ showPreview: false }} height={320} width={320} />
            </div>
          )}

          {attachedUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 px-1">
              {attachedUrls.map((url, index) => {
                const isImg = /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
                return (
                  <div key={index} className="flex items-center gap-2 bg-zinc-800 border border-white/10 pl-3 pr-2 py-1.5 rounded-2xl text-xs">
                    {isImg ? (
                      <img src={url} alt="preview" className="w-6 h-6 object-cover rounded-lg" />
                    ) : (
                      <FileText size={16} />
                    )}
                    <span className="truncate max-w-[140px]">Attachment</span>
                    <button onClick={() => removeAttachment(index)} className="text-slate-400 hover:text-red-400 p-1">
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 bg-zinc-800 border border-white/10 rounded-2xl p-2 focus-within:border-violet-500 transition-all">
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
              className="text-slate-400 hover:text-violet-400 p-3 hover:bg-white/5 rounded-xl transition"
            >
              <Smile size={22} />
            </button>

            <label className="text-slate-400 hover:text-violet-400 p-3 hover:bg-white/5 rounded-xl transition cursor-pointer">
              <Camera size={22} />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>

            <label className="text-slate-400 hover:text-violet-400 p-3 hover:bg-white/5 rounded-xl transition cursor-pointer">
              <Paperclip size={22} />
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>

            <input
              type="text"
              placeholder={uploading ? "Uploading file..." : "Type a message..."}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={uploading}
              className="flex-1 bg-transparent outline-none text-slate-100 placeholder:text-slate-500 px-3"
            />

            <button 
              type="submit" 
              disabled={uploading || (!messageText.trim() && attachedUrls.length === 0)} 
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-slate-500 p-3 rounded-xl transition-all active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}