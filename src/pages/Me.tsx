import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Me() {
  const { accessToken, user } = useAuth();
  const [myContributions, setMyContributions] = useState([]);

  useEffect(() => {
    const fetchContributions = async () => {
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      try {
        const res = await axios.get('http://localhost:5000/api/posts', config);
        const filtered = res.data.filter((p: any) => p.createdBy?._id === user?._id);
        setMyContributions(filtered);
      } catch (err) {
        console.error("Error drawing localized metrics:", err);
      }
    };
    if (accessToken) fetchContributions();
  }, [accessToken, user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-white">Local Node Analytics</h2>
            <p className="text-xs text-slate-500">Identity Identifier: {user?.regNumber} — Link Address: {user?.email}</p>
          </div>
          <Link to="/" className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl font-bold transition">
            Dashboard Matrix
          </Link>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Total Broadcast Footprint</h3>
          <p className="text-5xl font-black text-white tracking-tight">{myContributions.length} <span className="text-sm font-medium text-slate-500 uppercase tracking-widest ml-2">Active Payloads</span></p>
        </div>

        <div className="space-y-4">
          <h3 className="text-md font-bold text-slate-400 uppercase tracking-wider">Historical Logs</h3>
          {myContributions.length === 0 ? (
            <p className="text-xs text-slate-600 italic">No payloads registered on this account.</p>
          ) : (
            myContributions.map((p: any) => (
              <div key={p._id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">{p.category}</span>
                <h4 className="font-bold text-white mt-3 text-base">{p.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}