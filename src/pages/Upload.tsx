import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../lib/api';
import toast from 'react-hot-toast';
import { Upload as UploadIcon, NotebookText, FileText } from 'lucide-react';

// Keep this list in sync with the dashboard's SEMESTER_SUBJECTS map.
const SEMESTER_SUBJECTS: Record<number, { code: string; name: string }[]> = {
  1: [
    { code: 'PRF', name: 'Programming Fundamentals' },
    { code: 'DBMS', name: 'Database Management Systems' },
    { code: 'OOP', name: 'Object Oriented Programming' },
    { code: 'SE', name: 'Software Engineering' },
  ],
  2: [
    { code: 'ORM', name: 'Object Relational Mapping' },
    { code: 'NP', name: 'Network Programming' },
    { code: 'IT', name: 'Internet Technology' },
    { code: 'CNS', name: 'Cryptography & Network Security' },
    { code: 'AAD', name: 'Algorithm Analysis & Design' },
  ],
  3: [
    { code: 'AD2', name: 'Application Development II' },
    { code: 'PY', name: 'Python' },
    { code: 'RAD', name: 'Rapid Application Development' },
    { code: 'AMD', name: 'Advanced Mobile Development' },
  ],
  4: [
    { code: 'PM', name: 'Project Management' },
    { code: 'ML', name: 'Machine Learning' },
  ],
};

function getCurrentUserRole(): 'student' | 'expert' | 'admin' {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.role) return parsed.role;
    }
  } catch (e) {
    // fall through to default
  }
  return 'student';
}

export default function Upload() {
  const role = useMemo(() => getCurrentUserRole(), []);
  const canUploadPapers = role === 'expert' || role === 'admin';

  const [formData, setFormData] = useState({
    title: '',
    
    semester: 1,
    subjectCode: SEMESTER_SUBJECTS[1][0].code,
    description: '',
  });
  const [docType, setDocType] = useState<'note' | 'paper'>('note');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const subjectsForSemester = SEMESTER_SUBJECTS[formData.semester] || [];
  const selectedSubject = subjectsForSemester.find(s => s.code === formData.subjectCode);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'semester') {
      const sem = Number(value);
      const firstSubject = SEMESTER_SUBJECTS[sem]?.[0]?.code || '';
      setFormData(prev => ({ ...prev, semester: sem, subjectCode: firstSubject }));
      return;
    }

    setFormData({ ...formData, [name]: value });
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

    if (!formData.subjectCode) {
      toast.error("Please choose a subject");
      return;
    }

    if (docType === 'paper' && !canUploadPapers) {
      toast.error("Only experts or admins can upload papers.");
      return;
    }

    // Strict 10MB limit enforcement check to match Cloudinary Free Tier limits
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Megabytes in bytes
    const filesArray = Array.from(files);

    for (const file of filesArray) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" is too large! Maximum allowed size is 10MB due to Cloudinary storage limits.`);
        return;
      }
    }

    setLoading(true);
    const data = new FormData();

    data.append('title', formData.title);
    data.append('subject', selectedSubject?.name || formData.subjectCode);
    data.append('subjectCode', formData.subjectCode);
    data.append('docType', docType);
    data.append('semester', formData.semester.toString());
    data.append('description', formData.description);

    filesArray.forEach(file => {
      data.append('files', file);
    });

    try {
      await API.post('/notes/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(`${docType === 'paper' ? 'Paper' : 'Notes'} uploaded successfully!`);
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Frontend Upload Error Catch:", error);

      const errorMessage = error.response?.data?.message || "Upload failed. Please ensure files are under 10MB.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl p-10">
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-4">
              <UploadIcon className="text-indigo-400" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-zinc-100">Upload Material</h1>
            <p className="text-zinc-400 mt-2">Share notes or papers with your classmates</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-zinc-200">

            {/* Doc type toggle */}
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Upload Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDocType('note')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition-all ${docType === 'note' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                >
                  <NotebookText size={16} /> Note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!canUploadPapers) {
                      toast.error("Only experts or admins can upload papers.");
                      return;
                    }
                    setDocType('paper');
                  }}
                  disabled={!canUploadPapers}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition-all ${docType === 'paper' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'} ${!canUploadPapers ? 'opacity-40 cursor-not-allowed hover:border-zinc-800' : ''}`}
                >
                  <FileText size={16} /> Paper
                </button>
              </div>
              {!canUploadPapers && (
                <p className="text-[11px] text-zinc-500 mt-2">Papers can only be uploaded by experts or admins.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-zinc-950 text-zinc-100 placeholder-zinc-500 transition-all"
                placeholder="e.g., OOP Concepts Summary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-zinc-950 text-zinc-100 cursor-pointer transition-all"
                >
                  {[1, 2, 3, 4].map(s => (
                    <option key={s} value={s} className="bg-zinc-950">Semester {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">Subject</label>
                <select
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-zinc-950 text-zinc-100 cursor-pointer transition-all"
                >
                  {subjectsForSemester.map(s => (
                    <option key={s.code} value={s.code} className="bg-zinc-950">{s.code} — {s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-zinc-950 text-zinc-100 placeholder-zinc-500 transition-all resize-none"
                placeholder="Brief description about these notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Upload Files (PDF / Images)</label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full border border-zinc-800 rounded-2xl p-4 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer bg-zinc-950 text-zinc-300"
                required
              />
              <p className="text-xs text-zinc-500 mt-2">You can upload up to 3 files. Individual file limit: 10MB.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-700/30 transition-all text-lg cursor-pointer"
            >
              {loading ? "Uploading..." : `Upload ${docType === 'paper' ? 'Paper' : 'Notes'}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}