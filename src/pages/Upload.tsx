import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../lib/api';
import toast from 'react-hot-toast';
import { Upload as UploadIcon } from 'lucide-react';

export default function Upload() {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    semester: 1,
    description: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    // FIXED: Strict 10MB limit enforcement check to match Cloudinary Free Tier limits
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Megabytes in bytes
    const filesArray = Array.from(files);

    for (const file of filesArray) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" is too large! Maximum allowed size is 10MB due to Cloudinary storage limits.`);
        return; // Halts form submission immediately
      }
    }

    setLoading(true);
    const data = new FormData();

    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('semester', formData.semester.toString());
    data.append('description', formData.description);

    filesArray.forEach(file => {
      data.append('files', file);
    });

    try {
      await API.post('/notes/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Notes uploaded successfully!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Frontend Upload Error Catch:", error);
      // FIXED: Better fallback message if Cloudinary terminates connection drops abruptly
      const errorMessage = error.response?.data?.message || "Upload failed. Please ensure files are under 10MB.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white rounded-3xl shadow-xl p-10">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
            <UploadIcon className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Upload New Notes</h1>
          <p className="text-gray-600 mt-2">Help your classmates by sharing notes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition-all"
              placeholder="e.g., OOP Concepts Summary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition-all"
                placeholder="Object Oriented Programming"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white cursor-pointer transition-all"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition-all resize-none"
              placeholder="Brief description about these notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload Files (PDF / Images)</label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-2xl p-4 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer bg-white"
              required
            />
            <p className="text-xs text-gray-500 mt-2">You can upload up to 3 files. Individual file limit: 10MB.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-700/30 transition-all text-lg cursor-pointer"
          >
            {loading ? "Uploading..." : "Upload Notes"}
          </button>
        </form>
      </div>
    </div>
  );
}