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
    <div className="group bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden hover:border-amber-500/40 hover:-translate-y-2 transition-all duration-500 shadow-2xl hover:shadow-amber-500/[0.02] flex flex-col">

      {/* Luxury Metallic Dark Grid Header */}
      <div className={`h-52 relative flex items-center justify-center overflow-hidden bg-gradient-to-b ${isPaper ? 'from-neutral-800 via-neutral-900 to-neutral-950' : 'from-neutral-900 to-neutral-950'}`}>
        {/* Abstract structural alignment lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>

        {/* Premium Document Type Badge */}
        <span className={`absolute top-4 left-4 z-10 flex items-center gap-1.5 backdrop-blur-md border px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
          isPaper 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
        }`}>
          {isPaper ? <FileText size={12} className="stroke-[2.5]" /> : <NotebookText size={12} className="stroke-[2.5]" />}
          {isPaper ? 'Research Paper' : 'Lecture Note'}
        </span>

        {/* Central Graphic Container */}
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-neutral-950/80 border border-neutral-800 group-hover:border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 shadow-xl group-hover:shadow-amber-500/[0.03]">
            <BookOpen size={34} className="text-amber-500 group-hover:scale-110 transition-transform duration-300 stroke-[1.8]" />
          </div>
          <p className="text-neutral-500 text-[11px] font-mono font-semibold tracking-widest uppercase">
            SEM 0{note.semester} <span className="text-neutral-700">·</span> {note.subjectCode || 'GEN-CORE'}
          </p>
        </div>

        {/* Floating Context Control Actions */}
        {showActions && (
          <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button
              onClick={() => toast('Edit functionality coming soon!')}
              className="bg-neutral-950 border border-neutral-800 hover:border-amber-500/30 p-2.5 rounded-xl text-neutral-400 hover:text-amber-400 transition-all duration-200 shadow-lg"
              title="Edit Publication"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-neutral-950 border border-neutral-800 hover:border-red-500/30 p-2.5 rounded-xl text-neutral-400 hover:text-red-500 transition-all duration-200 shadow-lg"
              title="Delete Publication"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Component Core Detail Bounds */}
      <div className="p-6 flex-1 flex flex-col justify-between bg-neutral-900/40">
        <div className="mb-4">
          <p className="text-amber-500 text-xs font-bold tracking-wider uppercase mb-1.5">{note.subject}</p>
          <h3 className="font-bold text-xl text-white line-clamp-2 leading-snug tracking-tight group-hover:text-amber-400 transition-colors duration-300">
            {note.title}
          </h3>
        </div>

        <div>
          {/* Uploader Meta Track */}
          <div className="flex items-center justify-between text-xs mb-4 text-neutral-500 border-t border-neutral-800/60 pt-4">
            <span className="truncate max-w-[55%]">
              By <strong className="text-neutral-300 font-semibold">{note.uploadedBy?.name || 'Academic Vault'}</strong>
            </span>
            <span className="font-mono text-[11px] shrink-0 text-neutral-600">
              {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Social Proof metrics */}
          <div className="flex items-center justify-between text-xs mb-5 bg-neutral-950/40 border border-neutral-800/40 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Star className="fill-current text-amber-500" size={14} />
              <span className="font-bold text-neutral-200">{note.averageRating?.toFixed(1) || '4.8'}</span>
            </div>
            <div className="text-neutral-500 font-mono text-[11px]">
              <span className="text-neutral-300 font-semibold">{note.downloads || 0}</span> system downloads
            </div>
          </div>

          {/* Core Access Terminals (Downloads) */}
          <div className="space-y-2">
            {note.files && note.files.length > 0 ? (
              note.files.map((file, i) => (
                <button
                  key={i}
                  onClick={() => handleDownload(file)}
                  className="w-full flex items-center justify-center gap-2 bg-neutral-950 hover:bg-amber-500 border border-neutral-800 hover:border-amber-400 py-3 rounded-xl text-xs font-bold text-neutral-300 hover:text-black transition-all duration-300 active:scale-[0.985] shadow-md hover:shadow-amber-500/10 tracking-wide"
                >
                  <Download size={16} className="stroke-[2.5]" />
                  DOWNLOAD TERMINAL {note.files.length > 1 ? `#0${i + 1}` : ''}
                </button>
              ))
            ) : (
              <button
                onClick={() => toast('No files attached to this note', {
                  icon: '📭',
                  duration: 2500
                })}
                className="w-full py-3 bg-neutral-950/40 border border-neutral-800/40 rounded-xl text-xs font-bold text-neutral-600 cursor-not-allowed transition"
                disabled
              >
                NO ATTACHMENTS RECOVERED
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}