import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const { accessToken, user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [items, setItems] = useState([]);

  // Form Inputs
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postType, setPostType] = useState('resource');
  const [postCat, setPostCat] = useState('DSA');
  const [postLink, setPostLink] = useState('');

  const [itemTitle, setItemTitle] = useState('');
  const [itemType, setItemType] = useState('lecture');
  const [itemDate, setItemDate] = useState('');
  const [itemLoc, setItemLoc] = useState('');

  const fetchData = async () => {
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    try {
      const postsRes = await axios.get('http://localhost:5000/api/posts', config);
      const itemsRes = await axios.get('http://localhost:5000/api/items', config);
      setPosts(postsRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      console.error("Error drawing matrix stream:", err);
    }
  };

  useEffect(() => { if (accessToken) fetchData(); }, [accessToken]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    await axios.post('http://localhost:5000/api/posts', { title: postTitle, description: postDesc, type: postType, category: postCat, link: postLink }, config);
    setPostTitle(''); setPostDesc(''); setPostLink('');
    fetchData();
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    await axios.post('http://localhost:5000/api/items', { title: itemTitle, type: itemType, dateTime: itemDate, location: itemLoc }, config);
    setItemTitle(''); setItemDate(''); setItemLoc('');
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Premium Glass Header Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center space-x-8">
          <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">BatchFlow</span>
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <Link to="/" className="text-white border-b-2 border-indigo-500 pb-5 pt-1">Dashboard</Link>
            <Link to="/about" className="text-slate-400 hover:text-white transition py-1">About Project</Link>
            <Link to="/me" className="text-slate-400 hover:text-white transition py-1">My Logs</Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/50 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
          </div>
          <button onClick={logout} className="bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-200 shadow-md">
            Disconnect
          </button>
        </div>
      </nav>

      {/* Primary Fluid Layout Matrix */}
      <div className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start flex-1">
        
        {/* Left Column Feed Operations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Post Asset Entry Console */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-black tracking-wider text-indigo-400 uppercase">Broadcast Resource Material</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Material Asset Title" value={postTitle} onChange={e => setPostTitle(e.target.value)} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-sm w-full text-white focus:outline-none focus:border-indigo-500" required />
                <input type="url" placeholder="Drive or CDN Link (Optional)" value={postLink} onChange={e => setPostLink(e.target.value)} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-sm w-full text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <textarea placeholder="Provide detailed technical instructions or queries..." value={postDesc} onChange={e => setPostDesc(e.target.value)} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-sm w-full h-24 text-white focus:outline-none focus:border-indigo-500" required />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={postType} onChange={e => setPostType(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-slate-300 focus:outline-none">
                  <option value="resource">📚 Shared Resource / Material</option>
                  <option value="help_request">🚨 Urgent Help Request</option>
                </select>
                <select value={postCat} onChange={e => setPostCat(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-slate-300 focus:outline-none">
                  <option value="DSA">Data Structures & Algorithms</option>
                  <option value="OOP">Object Oriented Programming</option>
                  <option value="Web Dev">Full Stack Web Engineering</option>
                </select>
              </div>

              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/10 active:scale-98">
                Publish Feed Element
              </button>
            </form>
          </div>

          {/* Activity Streaming Wall */}
          <div className="space-y-4">
            <h3 className="text-md font-bold tracking-wider text-slate-400 uppercase">Live Resource Stream</h3>
            {posts.map((p: any) => (
              <div key={p._id} className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm hover:border-slate-700 transition duration-200">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] tracking-widest font-black uppercase px-2.5 py-1 rounded-full ${p.type === 'resource' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {p.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-800/60 px-3 py-1 rounded-xl border border-slate-700/30">{p.category}</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white tracking-tight">{p.title}</h4>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{p.description}</p>
                </div>
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group transition">
                    <span>Access Node Asset</span>
                    <span className="transform group-hover:translate-x-1 transition duration-150">↗</span>
                  </a>
                )}
                <div className="text-[11px] text-slate-500 border-t border-slate-800/60 pt-3 flex justify-between items-center">
                  <span>Node: <strong className="text-slate-400 font-medium">{p.createdBy?.name}</strong></span>
                  <span>Credential Hash: {p.createdBy?.regNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Core Sidebar */}
        <div className="space-y-8">
          
          {/* Admin Schedule Entry Interface Component */}
          {user?.role === 'admin' && (
            <div className="bg-gradient-to-b from-indigo-950/20 to-slate-900/40 border border-indigo-500/20 p-6 rounded-2xl shadow-xl space-y-4">
              <h2 className="text-xs font-black tracking-widest text-amber-400 uppercase">🛡️ Administrative Scheduling Command</h2>
              <form onSubmit={handleCreateItem} className="space-y-3">
                <input type="text" placeholder="Event / Assignment Title" value={itemTitle} onChange={e => setItemTitle(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs w-full text-white" required />
                <input type="text" placeholder="Location Hall or Zoom Node" value={itemLoc} onChange={e => setItemLoc(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs w-full text-white" required />
                <input type="datetime-local" value={itemDate} onChange={e => setItemDate(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs w-full text-slate-400" required />
                <select value={itemType} onChange={e => setItemType(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs w-full text-slate-300">
                  <option value="lecture">Lecture Grid Block</option>
                  <option value="deadline">Submission Deadline</option>
                  <option value="study_session">Group Review Session</option>
                </select>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10">
                  Broadcast Global Matrix Event
                </button>
              </form>
            </div>
          )}

          {/* Unified Timeline Matrix Module View Layout */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Academic Timeline Matrix</h3>
            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-xs text-slate-600 italic">No scheduled events found.</p>
              ) : (
                items.map((i: any) => (
                  <div key={i._id} className="relative border-l-2 border-indigo-500/40 bg-slate-900/50 p-4 rounded-r-xl space-y-1 hover:bg-slate-900/80 transition border-l-indigo-500">
                    <div className="flex justify-between items-center text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                      <span>{i.type}</span>
                      <span className="text-slate-500 font-normal">{new Date(i.dateTime).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">{i.title}</h4>
                    <p className="text-[11px] text-slate-500">📍 Location: {i.location}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}