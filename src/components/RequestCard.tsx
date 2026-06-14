import React from 'react';
import { CheckCircle2, FileText, ExternalLink, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RequestCardProps {
  req: any;
  isExpert: boolean;
  onOpenChat?: (userId: string, userName: string) => void;
}

export default function RequestCard({ req, isExpert, onOpenChat }: RequestCardProps) {
  const isFulfilled = req.status === 'fulfilled';

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-xs transition duration-200 relative overflow-hidden ${
      isFulfilled ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100 hover:shadow-md'
    }`}>
      
      {/* Top Banner Status Info */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-md">
          Semester {req.semester}
        </span>
        
        {isFulfilled ? (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
            <CheckCircle2 size={14} /> Fulfilled
          </span>
        ) : (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-100">
            Pending Help
          </span>
        )}
      </div>

      <h4 className="font-extrabold text-gray-800 text-base leading-tight">
        {req.title}
      </h4>
      <p className="text-xs font-semibold text-emerald-600 mt-0.5 mb-2">{req.subject}</p>
      <p className="text-xs text-gray-500 bg-gray-50/80 p-3 rounded-xl mb-4 line-clamp-3">
        {req.description || "No descriptions specified."}
      </p>

      {/* Linked Fulfilled Document Row Context */}
      {isFulfilled && req.fulfilledNote && (
        <div className="mt-3 p-3 bg-white border border-emerald-100 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText className="text-emerald-600 shrink-0" size={18} />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-800 truncate">{req.fulfilledNote.title}</p>
              <p className="text-[10px] text-gray-400 truncate">Uploaded by Specialist</p>
            </div>
          </div>
          <a 
            href={req.fulfilledNote.files?.[0]} 
            target="_blank" 
            rel="noreferrer"
            className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition shrink-0"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Dynamic Action Controls */}
      <div className="mt-4 pt-3 border-t border-gray-100/60 flex items-center gap-2">
        {!isFulfilled && isExpert && (
          <Link 
            to={`/upload?request_id=${req._id}&subject=${encodeURIComponent(req.subject)}`}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-slate-800 transition"
          >
            Fulfill with Resource Log
          </Link>
        )}

        {!isExpert && onOpenChat && req.fulfilledBy && (
          <button 
            onClick={() => onOpenChat(req.fulfilledBy._id, req.fulfilledBy.name)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition"
          >
            <MessageSquare size={14} /> Message Completing Specialist
          </button>
        )}
      </div>
    </div>
  );
}