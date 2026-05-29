import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">BatchFlow Node Specs</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          BatchFlow functions as an isolated digital pipeline designed for modern student cohorts. Access is restricted exclusively to cryptographic signatures matched during registration.
        </p>
        <p className="text-slate-400 text-sm leading-relaxed">
          The engineering focus centers on consolidating scattered academic information lines into a unified interface, tracking data payloads efficiently across structured database indexes.
        </p>
        <div className="pt-6 border-t border-slate-800/80 flex justify-between items-center">
          <span className="text-[11px] text-slate-600 font-mono tracking-widest">ENGINE CORE V1.0.0 // 2026</span>
          <Link to="/" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md shadow-indigo-600/10">
            Return to Node
          </Link>
        </div>
      </div>
    </div>
  );
}