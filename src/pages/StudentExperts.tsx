import React, { useEffect, useState } from 'react';
import API from '../lib/api';
import { Award, MessageSquare, Search } from 'lucide-react';
import PrivateChatModal from '../components/PrivateChatModal';

export default function StudentExperts() {
  const [experts, setExperts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeChatUser, setActiveChatUser] = useState<{ id: string; name: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    // Fetch experts list
    API.get('/experts')
      .then((res) => setExperts(res.data))
      .catch((err) => console.error("Error fetching experts:", err));

    // Safely extract the current user ID from localStorage
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setCurrentUserId(savedUserId);
    } else {
      // Fallback fallback logic check: see if a 'user' object exists
      const savedUserRaw = localStorage.getItem('user');
      if (savedUserRaw) {
        try {
          const parsed = JSON.parse(savedUserRaw);
          if (parsed.id || parsed._id) {
            setCurrentUserId(parsed.id || parsed._id);
          }
        } catch (e) {
          console.error("Failed to parse fallback user storage asset");
        }
      }
    }
  }, []);

  const filtered = experts.filter(exp => 
    exp.name.toLowerCase().includes(search.toLowerCase()) ||
    (exp.expertise || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 min-h-screen bg-slate-50/40">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
          <Award className="text-emerald-600" /> Verified Specialists Directory
        </h1>
        <p className="text-sm text-gray-500 mt-1">Direct micro-consultation corridors into domain professionals.</p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by specialty field or instructor name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(exp => (
          <div key={exp._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg mb-4">
                {exp.name.charAt(0)}
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg">{exp.name}</h3>
              <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 inline-block px-2.5 py-0.5 rounded-md mt-1">
                {exp.expertise || 'Computer Science'}
              </p>
              <p className="text-xs text-gray-400 mt-3">{exp.department || 'Software Engineering Dept'}</p>
            </div>

            <button 
              onClick={() => setActiveChatUser({ id: exp._id, name: exp.name })}
              className="mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-bold py-3 rounded-xl hover:bg-slate-800 transition-all"
            >
              <MessageSquare size={14} /> Open Secure Chat
            </button>
          </div>
        ))}
      </div>

      {activeChatUser && (
        <PrivateChatModal 
          userId={activeChatUser.id} 
          recipientName={activeChatUser.name} 
          onClose={() => setActiveChatUser(null)} 
          currentUser={{ id: currentUserId }}
        />
      )}
    </div>
  );
}