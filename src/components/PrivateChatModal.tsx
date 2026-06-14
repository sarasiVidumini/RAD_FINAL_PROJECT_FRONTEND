import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Smile, Camera, Paperclip, Send, X, Copy, Trash, Edit2, Check } from 'lucide-react';
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
}

export default function PrivateChatModal({ userId, recipientName, onClose, currentUser }: ChatProps) {
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

  const fetchMessages = async () => {
    if (!userId || userId === 'undefined') {
      return;
    }

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

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || userId === 'undefined') {
      toast.error("Cannot send message: Invalid recipient profile reference.");
      return;
    }
    if (!messageText.trim() && attachedUrls.length === 0) return;

    try {
      const res = await axios.post(
        'http://localhost:5000/api/chat',
        { receiverId: userId, content: messageText, attachments: attachedUrls },
        { headers }
      );
      setMessages([...messages, res.data]);
      setMessageText('');
      setAttachedUrls([]);
      setShowEmojiPicker(false);
    } catch (err: any) {
      toast.error("Failed to send message");
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
      setAttachedUrls(prev => [...prev, res.data.fileUrl]);
      toast.success("File upload complete!");
    } catch (error) {
      toast.error("File upload failed.");
    } finally {
      // FIXED: Removed the stray "Platform:" text so the finally block executes properly
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
    } catch (err) {
      toast.error("Failed to update message");
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/chat/${msgId}`, { headers });
      setMessages(messages.map(m => m._id === msgId ? res.data : m));
      setActiveMenuId(null);
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageText(prev => prev + emojiData.emoji);
  };

  return (
    <div className="flex flex-col h-[500px] w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Header Element Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <h3 className="font-medium text-sm">{recipientName}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
      </div>

      {/* Message Stream Body */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((msg) => {
          const isMe = msg.sender === currentUser.id;
          const isMenuOpen = activeMenuId === msg._id;

          return (
            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              
              {/* Message Bubble */}
              <div 
                onClick={() => !msg.isDeleted && isMe && setActiveMenuId(isMenuOpen ? null : msg._id)}
                className={`max-w-[70%] p-3 rounded-2xl text-sm transition-all relative ${
                  !msg.isDeleted && isMe ? 'cursor-pointer hover:opacity-95 select-none' : ''
                } ${
                  msg.isDeleted
                    ? 'bg-slate-200 text-slate-400 italic rounded-xl border border-slate-300' 
                    : isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {/* Editing Inline Input Form */}
                {editingMessageId === msg._id ? (
                  <div className="flex items-center gap-2 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="text" 
                      value={editText} 
                      onChange={(e) => setEditText(e.target.value)} 
                      className="bg-transparent border-b outline-none text-sm p-0.5 flex-grow text-white border-white/50 focus:border-white"
                      autoFocus 
                    />
                    <button onClick={() => handleUpdateMessage(msg._id)} className="text-green-300 hover:text-green-100"><Check size={16} /></button>
                    <button type="button" onClick={() => setEditingMessageId(null)} className="text-white/70 hover:text-white"><X size={14} /></button>
                  </div>
                ) : (
                  <div>
                    <p className="break-words">{msg.content}</p>
                    
                    {/* Document and Asset Attachments Renderer */}
                    {!msg.isDeleted && msg.attachments?.map((url, i) => {
                      const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
                      return isImage ? (
                        <img key={i} src={url} alt="attachment" className="mt-2 rounded-lg max-h-32 object-cover" />
                      ) : (
                        <a 
                          key={i} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`mt-2 flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                            isMe 
                              ? 'bg-indigo-700/40 border-indigo-500 text-white hover:bg-indigo-700/60' 
                              : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
                          }`}
                        >
                          <Paperclip size={14} className={isMe ? 'text-indigo-200' : 'text-slate-500'} />
                          View Document ({url.split('.').pop()?.toUpperCase()})
                        </a>
                      );
                    })}

                    {msg.isEdited && !msg.isDeleted && (
                      <span className="text-[10px] opacity-60 block mt-0.5 text-right">(edited)</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Toolbar: Icons directly underneath the bubble when clicked */}
              {!msg.isDeleted && isMe && isMenuOpen && editingMessageId !== msg._id && (
                <div className="flex items-center gap-2 px-2 py-1.5 mt-1 bg-white border border-slate-200 shadow-xs rounded-lg animate-in slide-in-from-top-1 duration-100">
                  <button 
                    type="button" 
                    onClick={() => copyToClipboard(msg.content)} 
                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded transition-colors"
                    title="Copy message text"
                  >
                    <Copy size={14}/>
                  </button>
                  <div className="w-[1px] h-3.5 bg-slate-200" />
                  <button 
                    type="button" 
                    onClick={() => startEditing(msg)} 
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Edit message"
                  >
                    <Edit2 size={14}/>
                  </button>
                  <div className="w-[1px] h-3.5 bg-slate-200" />
                  <button 
                    type="button" 
                    onClick={() => handleDeleteMessage(msg._id)} 
                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                    title="Delete message"
                  >
                    <Trash size={14}/>
                  </button>
                </div>
              )}

            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Utility Footer */}
      <form onSubmit={handleSendSubmit} className="border-t border-slate-100 p-3 bg-white relative flex flex-col gap-2">
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-2 z-50 shadow-xl rounded-xl overflow-hidden border border-slate-100">
            <EmojiPicker onEmojiClick={onEmojiClick} previewConfig={{ showPreview: false }} height={280} width={280} />
          </div>
        )}

        {attachedUrls.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto py-1">
            {attachedUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-indigo-50 border text-indigo-700 text-[11px] px-2 py-0.5 rounded-lg">
                <span className="truncate max-w-[80px]">File {idx + 1}</span>
                <button type="button" onClick={() => setAttachedUrls(attachedUrls.filter((_, i) => i !== idx))}><X size={12} /></button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-50 border rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-slate-400 hover:text-indigo-600 p-1"><Smile size={18} /></button>
          
          <label className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer">
            <Camera size={18} />
            <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileUpload} />
          </label>

          <label className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer">
            <Paperclip size={18} />
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>

          <input
            type="text"
            placeholder={uploading ? "Uploading file..." : "Type your message..."}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={uploading}
            className="flex-grow bg-transparent outline-none text-sm text-slate-800 px-1"
          />

          <button type="submit" disabled={uploading || (!messageText.trim() && attachedUrls.length === 0)} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white p-1.5 rounded-lg transition shrink-0">
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}