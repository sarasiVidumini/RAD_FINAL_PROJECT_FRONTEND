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
      border: '1px solid #f1f5f9',
      background: '#ffffff',
      color: '#0f172a'
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
        <div className="flex items-center gap-2 text-slate-800">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <div className="flex flex-col">
            <span className="font-bold text-sm">Delete Message?</span>
            <span className="text-xs text-slate-500 font-normal">This operation cannot be undone.</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
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
      style: {
        marginTop: '12vh',
        padding: '16px',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        background: '#ffffff',
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col h-[550px] w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 animate-scale-up">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 text-white border-b border-slate-800">
          <div className="flex flex-col">
            <h3 className="font-bold text-sm tracking-wider text-slate-200">{recipientName}</h3>
            {verifiedUsername && (
              <span className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Authorized ID: <span className="font-bold underline">{verifiedUsername}</span>
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Stream Body */}
        <div className="flex-grow p-5 overflow-y-auto space-y-4 bg-slate-50/60">
          {messages.map((msg) => {
            const isMe = msg.sender === currentUser.id;
            const isTargetRecipient = msg.receiver === userId || msg.sender === userId;
            const isMenuOpen = activeMenuId === msg._id;

            if (!isMe && !isTargetRecipient) return null;

            return (
              <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div 
                  onClick={() => !msg.isDeleted && isMe && setActiveMenuId(isMenuOpen ? null : msg._id)}
                  className={`max-w-[75%] p-3.5 px-4 rounded-2xl text-[13px] transition-all relative ${
                    !msg.isDeleted && isMe ? 'cursor-pointer hover:brightness-95 shadow-xs select-none' : 'shadow-xs'
                  } ${
                    msg.isDeleted
                      ? 'bg-slate-200/70 text-slate-400 italic rounded-xl border border-slate-300/60' 
                      : isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  {editingMessageId === msg._id ? (
                    <div className="flex items-center gap-2 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value={editText} 
                        onChange={(e) => setEditText(e.target.value)} 
                        className="bg-transparent border-b outline-none text-[13px] p-0.5 flex-grow text-white border-white/50 focus:border-white"
                        autoFocus 
                      />
                      <button onClick={() => handleUpdateMessage(msg._id)} className="text-green-300 hover:text-green-100"><Check size={16} /></button>
                      <button type="button" onClick={() => setEditingMessageId(null)} className="text-white/70 hover:text-white"><X size={14} /></button>
                    </div>
                  ) : (
                    <div>
                      {msg.content && <p className="break-words leading-relaxed">{msg.content}</p>}
                      {!msg.isDeleted && msg.attachments?.map((url, i) => {
                        const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
                        return isImage ? (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block mt-2">
                            <img src={url} alt="attachment" className="rounded-xl max-h-48 max-w-full object-cover border border-slate-200/10 hover:brightness-95 transition" />
                          </a>
                        ) : (
                          <a 
                            key={i} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`mt-2.5 flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                              isMe 
                                ? 'bg-indigo-700/30 border-indigo-500/40 text-white hover:bg-indigo-700/50' 
                                : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-indigo-200/60'
                            }`}
                          >
                            <Paperclip size={14} className={isMe ? 'text-indigo-200' : 'text-slate-500'} />
                            <span className="truncate max-w-[180px]">Document ({url.split('.').pop()?.toUpperCase()})</span>
                          </a>
                        );
                      })}

                      {msg.isEdited && !msg.isDeleted && (
                        <span className="text-[9px] opacity-60 block mt-1 text-right">(edited)</span>
                      )}
                    </div>
                  )}
                </div>

                {!msg.isDeleted && isMe && isMenuOpen && editingMessageId !== msg._id && (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 mt-1.5 bg-white border border-slate-200 shadow-md rounded-xl animate-in slide-in-from-top-1 duration-100 z-10">
                    <button 
                      type="button" 
                      onClick={() => copyToClipboard(msg.content)} 
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Copy message"
                    >
                      <Copy size={13}/>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => startEditing(msg)} 
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit message"
                    >
                      <Edit2 size={13}/>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => confirmDeleteToast(msg._id)} 
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete message"
                    >
                      <Trash size={13}/>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Utility Footer */}
        <form onSubmit={(e) => handleSendSubmit(e)} className="border-t border-slate-100 p-4 bg-white relative flex flex-col gap-2">
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-100">
              <EmojiPicker onEmojiClick={onEmojiClick} previewConfig={{ showPreview: false }} height={300} width={300} />
            </div>
          )}

          {attachedUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1 mb-1">
              {attachedUrls.map((url, index) => {
                const isImg = /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
                return (
                  <div key={index} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 pl-2.5 pr-1.5 py-1.5 rounded-xl text-xs text-slate-700 max-w-[220px] shadow-2xs">
                    {isImg ? (
                      <img src={url} alt="preview" className="w-5 h-5 object-cover rounded-md" />
                    ) : (
                      <FileText size={14} className="text-slate-500 shrink-0" />
                    )}
                    <span className="truncate flex-grow font-medium">Queued Attachment</span>
                    <button 
                      type="button" 
                      onClick={() => removeAttachment(index)} 
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded-lg transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 focus-within:bg-white transition-all">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100/50 transition-colors"><Smile size={19} /></button>
            
            <label className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer">
              <Camera size={19} />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>

            <label className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer">
              <Paperclip size={19} />
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>

            <input
              type="text"
              placeholder={uploading ? "Uploading encrypted file..." : "Write a secure message..."}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={uploading}
              className="flex-grow bg-transparent outline-none text-sm text-slate-800 px-1"
            />

            <button 
              type="submit" 
              disabled={uploading || (!messageText.trim() && attachedUrls.length === 0)} 
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white p-2 rounded-xl transition shadow-sm shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}