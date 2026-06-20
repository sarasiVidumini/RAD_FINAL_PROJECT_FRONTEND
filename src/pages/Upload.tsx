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
    <div className="min-h-screen bg-[#050505] text-zinc-100" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        .font-mono-vault { font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, Menlo, monospace; }
        .vault-grid-bg {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0);
          background-size: 28px 28px;
        }
      `}</style>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 vault-grid-bg opacity-[0.2] pointer-events-none" />
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-2xl mx-auto px-6 py-12">
          <div className="bg-[#0a0a0c] border border-white/[0.06] rounded-3xl shadow-2xl p-8 sm:p-10">
            <div className="text-center mb-9">
              <div className="mx-auto w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-4">
                <UploadIcon className="text-amber-400" size={26} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">Upload Material</h1>
              <p className="text-zinc-500 mt-2 text-sm">Share notes or papers with your classmates</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-zinc-200">

              {/* Doc type toggle */}
              <div>
                <label className="font-mono-vault block text-[11px] font-bold uppercase tracking-wider mb-2 text-zinc-500">Upload Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDocType('note')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition-all ${docType === 'note' ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-black border-white/[0.08] text-zinc-400 hover:border-white/20'}`}
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
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition-all ${docType === 'paper' ? 'bg-cyan-500 border-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-black border-white/[0.08] text-zinc-400 hover:border-white/20'} ${!canUploadPapers ? 'opacity-40 cursor-not-allowed hover:border-white/[0.08]' : ''}`}
                  >
                    <FileText size={16} /> Paper
                  </button>
                </div>
                {!canUploadPapers && (
                  <p className="text-[12px] text-zinc-600 mt-2">Papers can only be uploaded by experts or admins.</p>
                )}
              </div>

              <div>
                <label className="font-mono-vault block text-[11px] font-bold uppercase tracking-wider mb-2 text-zinc-500">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-white/[0.08] rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 bg-black text-zinc-100 placeholder-zinc-600 text-sm transition-all"
                  placeholder="e.g., OOP Concepts Summary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono-vault block text-[11px] font-bold uppercase tracking-wider mb-2 text-zinc-500">Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-white/[0.08] rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 bg-black text-zinc-100 text-sm cursor-pointer transition-all"
                  >
                    {[1, 2, 3, 4].map(s => (
                      <option key={s} value={s} className="bg-black">Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-mono-vault block text-[11px] font-bold uppercase tracking-wider mb-2 text-zinc-500">Subject</label>
                  <select
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-white/[0.08] rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 bg-black text-zinc-100 text-sm cursor-pointer transition-all"
                  >
                    {subjectsForSemester.map(s => (
                      <option key={s.code} value={s.code} className="bg-black">{s.code} — {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono-vault block text-[11px] font-bold uppercase tracking-wider mb-2 text-zinc-500">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-white/[0.08] rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 bg-black text-zinc-100 placeholder-zinc-600 text-sm transition-all resize-none"
                  placeholder="Brief description about these notes..."
                />
              </div>

              <div>
                <label className="font-mono-vault block text-[11px] font-bold uppercase tracking-wider mb-2 text-zinc-500">Upload Files (PDF / Images)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full border border-white/[0.08] rounded-2xl p-4 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer bg-black text-zinc-400 text-sm"
                  required
                />
                <p className="text-xs text-zinc-600 mt-2">You can upload up to 3 files. Individual file limit: 10MB.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all text-base cursor-pointer"
              >
                {loading ? "Uploading..." : `Upload ${docType === 'paper' ? 'Paper' : 'Notes'}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}