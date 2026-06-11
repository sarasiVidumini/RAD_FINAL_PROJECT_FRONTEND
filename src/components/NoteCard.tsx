// frontend/components/NoteCard.tsx  (UPDATED WITH EDIT/DELETE)
import { Download, Star, Edit2, Trash2 } from 'lucide-react';
import { Note } from '../types';
import { useState } from 'react';
import toast from 'react-hot-toast';
import API from '../lib/api';

interface NoteCardProps {
  note: Note;
  onUpdate?: () => void;        // Refresh callback
  showActions?: boolean;        // For expert dashboard
}

export default function NoteCard({ note, onUpdate, showActions = false }: NoteCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
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
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
        <span className="text-white text-6xl">📄</span>
        {showActions && (
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => {/* Will open edit modal */}}
              className="bg-white/90 hover:bg-white p-2 rounded-full text-gray-700 hover:text-emerald-600 transition"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-white/90 hover:bg-white p-2 rounded-full text-gray-700 hover:text-red-600 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-semibold text-xl mb-2 line-clamp-2">{note.title}</h3>
        <p className="text-indigo-600 font-medium">{note.subject} • Sem {note.semester}</p>

        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
          <Star className="text-yellow-500" fill="currentColor" size={18} />
          <span>{note.averageRating.toFixed(1)}</span>
          <span>•</span>
          <span>{note.downloads} downloads</span>
        </div>

        <div className="mt-6 flex gap-3">
          {note.files.map((file, i) => (
            <button
              key={i}
              onClick={() => handleDownload(file)}
              className="flex-1 bg-gray-900 text-white py-3 rounded-2xl hover:bg-black transition flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}