import React, { useState, useEffect } from "react";
import API from "../../lib/api";
import { Note } from "../../types";
import { Trash2, Star, RefreshCw, ShieldAlert, Award, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDownloads, setTotalDownloads] = useState(0);

  useEffect(() => {
    fetchAllNotes();
  }, []);

  const fetchAllNotes = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notes");
      setNotes(res.data);

      const total = res.data.reduce((sum: number, note: Note) => sum + note.downloads, 0);
      setTotalDownloads(total);
    } catch (error) {
      toast.error("Failed to load global notes logs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm("⚠️ Global Overwrite Action: Delete this note permanently from cloud system?")) return;

    try {
      await API.delete(`/notes/${noteId}`);
      toast.success("Note purged successfully from system database");
      fetchAllNotes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Purge execution failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <div className="text-gray-600 font-medium">Loading System Admin Terminal...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldAlert className="text-red-600" size={38} />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Global Content Moderation & Access Operations Control Center</p>
        </div>
        <button
          onClick={fetchAllNotes}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 transition font-medium text-sm shadow-xs"
        >
          <RefreshCw size={18} /> Refresh System Log
        </button>
      </div>

      {/* Analytics Command Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <p className="text-gray-500 text-sm font-medium">Total Files Stored</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{notes.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <p className="text-gray-500 text-sm font-medium">Total Resource Downloads</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{totalDownloads}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <p className="text-gray-500 text-sm font-medium">Security Clearance Level</p>
          <p className="text-xl font-bold text-red-600 mt-3 bg-red-50 inline-block px-3 py-1 rounded-xl">👑 Super Admin</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">All Shared Workspace Documents</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div key={note._id} className="bg-white rounded-3xl p-6 border border-gray-200 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{note.title}</h3>
                  <p className="text-indigo-600 font-semibold text-xs mt-1 uppercase tracking-wider">
                    {note.subject} • Sem {note.semester}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition shrink-0"
                  title="Purge Document"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Star className="text-amber-500" fill="currentColor" size={16} />
                <span className="font-semibold text-gray-700">{note.averageRating ? note.averageRating.toFixed(1) : "0.0"}</span>
              </div>
              <div className="font-medium">{note.downloads} downloads</div>
            </div>

            <div className="mt-3 bg-gray-50 -mx-6 -mb-6 p-4 flex items-center gap-2 border-t border-gray-100">
              {note.uploadedBy?.role === 'expert' ? (
                <Award size={16} className="text-emerald-600" />
              ) : (
                <GraduationCap size={16} className="text-indigo-600" />
              )}
              <p className="text-xs text-gray-500 truncate">
                Owner: <span className="font-medium text-gray-700">{note.uploadedBy?.name}</span> 
                <span className="text-[10px] ml-1 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-sm capitalize">{note.uploadedBy?.role}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-300">
          No files currently cataloged on the platform.
        </div>
      )}
    </div>
  );
}