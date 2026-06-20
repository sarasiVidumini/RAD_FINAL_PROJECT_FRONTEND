// frontend/components/NoteCard.tsx
import { Download, Star, Edit2, Trash2, BookOpen, FileText, NotebookText } from 'lucide-react';
import { Note } from '../types';
import { useState } from 'react';
import toast from 'react-hot-toast';
import API from '../lib/api';

interface NoteCardProps {
  note: Note;
  onUpdate?: () => void;
  showActions?: boolean;
}

export default function NoteCard({ note, onUpdate, showActions = false }: NoteCardProps) {
  const [deleting, setDeleting] = useState(false);
  const isPaper = note.docType === 'paper';

  const handleDownload = (fileUrl: string) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setDeleting(true);
    try {
      await API.delete(`/notes/${note._id}`);
      toast.success('Note deleted successfully');
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden hover:border-violet-500/50 hover:-translate-y-2 transition-all duration-500 shadow-xl">

      {/* Creative Gradient Header */}
      <div className={`h-52 relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${isPaper ? 'from-emerald-600 via-teal-600 to-cyan-600' : 'from-violet-600 via-purple-600 to-fuchsia-600'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:30px_30px]"></div>

        {/* Doc type badge */}
        <span className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-black/30 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
          {isPaper ? <FileText size={11} /> : <NotebookText size={11} />}
          {isPaper ? 'Paper' : 'Note'}
        </span>

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <BookOpen size={48} className="text-white" />
          </div>
          <p className="text-white/90 text-sm font-mono tracking-widest">SEM {note.semester} · {note.subjectCode}</p>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={() => toast('Edit functionality coming soon!')}
              className="bg-zinc-900/80 hover:bg-zinc-800 p-3 rounded-2xl backdrop-blur-md border border-white/10 text-white hover:text-violet-400 transition"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-zinc-900/80 hover:bg-zinc-800 p-3 rounded-2xl backdrop-blur-md border border-white/10 text-white hover:text-red-400 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-7">
        <div className="mb-4">
          <p className="text-violet-400 text-sm font-medium tracking-wide">{note.subject}</p>
          <h3 className="font-semibold text-2xl text-white line-clamp-2 leading-tight mt-2 group-hover:text-violet-300 transition-colors">
            {note.title}
          </h3>
        </div>

        {/* Uploader info */}
        <div className="flex items-center justify-between text-xs mb-4 text-slate-400">
          <span>
            Uploaded by <strong className="text-slate-200 font-semibold">{note.uploadedBy?.name || 'Unknown'}</strong>
          </span>
          <span className="font-mono">
            {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            {' · '}
            {new Date(note.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Rating & Stats */}
        <div className="flex items-center justify-between text-sm mb-6">
          <div className="flex items-center gap-2 text-yellow-400">
            <Star className="fill-current" size={18} />
            <span className="font-medium">{note.averageRating?.toFixed(1) || '4.8'}</span>
          </div>
          <div className="text-slate-400 text-sm font-mono">
            {note.downloads || 0} downloads
          </div>
        </div>

        {/* Download Buttons */}
        <div className="space-y-3">
          {note.files && note.files.length > 0 ? (
            note.files.map((file, i) => (
              <button
                key={i}
                onClick={() => handleDownload(file)}
                className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500 py-4 rounded-2xl text-sm font-medium transition-all active:scale-[0.985]"
              >
                <Download size={20} />
                Download File {note.files.length > 1 ? `#${i + 1}` : ''}
              </button>
            ))
          ) : (
            <button
              onClick={() => toast('No files attached to this note', {
                icon: '📭',
                duration: 2500
              })}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-slate-400 cursor-not-allowed hover:bg-white/10 transition"
            >
              No files available
            </button>
          )}
        </div>
      </div>
    </div>
  );
}