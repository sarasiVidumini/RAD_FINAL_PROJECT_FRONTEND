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
      className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 overflow-hidden ${
        isFulfilled 
          ? 'border-emerald-500/30 hover:border-emerald-400/50 shadow-lg shadow-emerald-500/5' 
          : 'border-slate-700/50 hover:border-slate-600/50 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-emerald-500/5'
      }`}
    >
      {/* Animated Background Glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        isFulfilled 
          ? 'bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/5' 
          : 'bg-gradient-to-br from-slate-600/5 via-transparent to-slate-600/5'
      }`} />
      
      {/* Top Banner with Status & Metadata */}
      <div className="relative flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-slate-700/50 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-600/30 backdrop-blur-sm flex items-center gap-1.5">
            <Calendar size={12} className="text-emerald-400" />
            Semester {req.semester}
          </span>
          {req.createdAt && (
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock size={10} />
              {formatDate(req.createdAt)}
            </span>
          )}
        </div>
        
        {isFulfilled ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Fulfilled
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 backdrop-blur-sm">
            <Zap size={12} className="text-amber-400" />
            Pending
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="relative space-y-3">
        <div>
          <h4 className="font-extrabold text-white text-lg leading-tight group-hover:text-emerald-300 transition-colors duration-300">
            {req.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {req.subject}
            </p>
            {req.urgency && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                req.urgency === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                req.urgency === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {req.urgency.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Description with Glass Effect */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl border border-slate-700/30">
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
            {req.description || "No description provided."}
          </p>
        </div>

        {/* Student Info if available */}
        {req.student && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/30 p-2 rounded-lg border border-slate-700/20">
            <User size={12} className="text-slate-500" />
            <span>Requested by: <span className="text-slate-300 font-medium">{req.student.name}</span></span>
          </div>
        )}

        {/* Fulfilled Document Card */}
        {isFulfilled && req.fulfilledNote && (
          <div className="mt-2 p-3 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-emerald-500/20 rounded-xl backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <FileText size={16} className="text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {req.fulfilledNote.title}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
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

      {/* Action Button with Enhanced Design */}
      <div className="relative mt-5 pt-4 border-t border-slate-700/30">
        {!isFulfilled && isExpert && (
          <Link 
            to={`/upload?request_id=${req._id}&subject=${encodeURIComponent(req.subject)}`}
            className="group/btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
          >
            <span>Fulfill Request</span>
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        )}

        {!isExpert && onOpenChat && req.fulfilledBy && (
          <button 
            onClick={() => onOpenChat(req.fulfilledBy._id, req.fulfilledBy.name)}
            className="group/btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
          >
            <MessageSquare size={14} className="group-hover/btn:scale-110 transition-transform" />
            <span>Chat with Specialist</span>
          </button>
        )}

        {!isFulfilled && !isExpert && (
          <div className="text-center">
            <span className="text-[10px] text-slate-500 flex items-center justify-center gap-2">
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
          : 'bg-slate-500 group-hover:opacity-30'
      }`} />
    </div>
  );
}