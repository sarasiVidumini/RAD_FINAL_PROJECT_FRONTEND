import React from 'react';
import { CheckCircle2, FileText, ExternalLink, MessageSquare, Clock, User, Calendar, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RequestCardProps {
  req: any;
  isExpert: boolean;
  onOpenChat?: (userId: string, userName: string) => void;
}

export default function RequestCard({ req, isExpert, onOpenChat }: RequestCardProps) {
  const isFulfilled = req.status === 'fulfilled';

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className={`group relative bg-[#0a0a0c] border rounded-2xl p-6 transition-all duration-300 overflow-hidden ${
        isFulfilled
          ? 'border-emerald-500/25 hover:border-emerald-400/40 shadow-lg shadow-emerald-500/5'
          : 'border-white/[0.06] hover:border-amber-500/30 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-amber-500/5'
      }`}
    >
      {/* Animated Background Glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        isFulfilled
          ? 'bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/5'
          : 'bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5'
      }`} />

      {/* Top Banner with Status & Metadata */}
      <div className="relative flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono-vault bg-black text-zinc-400 text-[11px] font-bold px-3 py-1 rounded-full border border-white/[0.08] flex items-center gap-1.5">
            <Calendar size={12} className="text-amber-400" />
            Semester {req.semester}
          </span>
          {req.createdAt && (
            <span className="text-[11px] text-zinc-600 flex items-center gap-1 font-mono-vault">
              <Clock size={10} />
              {formatDate(req.createdAt)}
            </span>
          )}
        </div>

        {isFulfilled ? (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Fulfilled
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Zap size={12} className="text-amber-400" />
            Pending
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="relative space-y-3">
        <div>
          <h4 className="font-extrabold text-white text-lg leading-tight group-hover:text-amber-300 transition-colors duration-300">
            {req.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <p className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {req.subject}
            </p>
            {req.urgency && (
              <span className={`font-mono-vault text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                req.urgency === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' :
                req.urgency === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/25' :
                'bg-cyan-500/10 text-cyan-400 border-cyan-500/25'
              }`}>
                {req.urgency.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-black p-3 rounded-xl border border-white/[0.06]">
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
            {req.description || "No description provided."}
          </p>
        </div>

        {/* Student Info if available */}
        {req.student && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-black p-2 rounded-lg border border-white/[0.06]">
            <User size={12} className="text-zinc-600" />
            <span>Requested by: <span className="text-zinc-300 font-medium">{req.student.name}</span></span>
          </div>
        )}

        {/* Fulfilled Document Card */}
        {isFulfilled && req.fulfilledNote && (
          <div className="mt-2 p-3 bg-black border border-emerald-500/20 rounded-xl hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <FileText size={16} className="text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {req.fulfilledNote.title}
                  </p>
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-emerald-400" />
                    Verified Resource
                  </p>
                </div>
              </div>
              <a
                href={req.fulfilledNote.files?.[0]}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40 group/link"
              >
                <ExternalLink size={14} className="group-hover/link:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="relative mt-5 pt-4 border-t border-white/[0.06]">
        {!isFulfilled && isExpert && (
          <Link
            to={`/upload?request_id=${req._id}&subject=${encodeURIComponent(req.subject)}`}
            className="group/btn w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/15 hover:shadow-amber-500/30"
          >
            <span>Fulfill Request</span>
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        )}

        {!isExpert && onOpenChat && req.fulfilledBy && (
          <button
            onClick={() => onOpenChat(req.fulfilledBy._id, req.fulfilledBy.name)}
            className="group/btn w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold py-3 rounded-xl transition-all duration-300 shadow-lg"
          >
            <MessageSquare size={14} className="group-hover/btn:scale-110 transition-transform" />
            <span>Chat with Specialist</span>
          </button>
        )}

        {!isFulfilled && !isExpert && (
          <div className="text-center">
            <span className="text-[11px] text-zinc-600 flex items-center justify-center gap-2">
              <Clock size={12} className="text-amber-400" />
              Awaiting expert response
            </span>
          </div>
        )}
      </div>

      {/* Decorative Corner Accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 transition-opacity duration-500 ${
        isFulfilled
          ? 'bg-emerald-500 group-hover:opacity-40'
          : 'bg-amber-500 group-hover:opacity-30'
      }`} />

      <style>{`.font-mono-vault { font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, Menlo, monospace; }`}</style>
    </div>
  );
}