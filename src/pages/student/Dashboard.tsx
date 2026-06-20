import React, { useState, useEffect, useRef } from 'react';
import API from '../../lib/api';
import toast from 'react-hot-toast';
import {
  BookOpen, Search, Filter, Download,
  Brain, ArrowRight, X, CheckCircle2,
  HelpCircle, Timer, Sparkles, AlertTriangle,
  Award, MessageSquare, ExternalLink, ClipboardList,
  User, ChevronLeft, Calendar, Clock,
  FileText, NotebookText, Layers3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PrivateChatModal from '../../components/PrivateChatModal';
import type { Note, NoteDocType } from '../../types';

interface QuizQuestion {
  q: string;
  a: string[];
  correct: number;
}

interface StudentRequest {
  _id: string;
  title: string;
  subject: string;
  semester: number;
  description: string;
  status: 'open' | 'fulfilled';
  fulfilledBy?: { _id: string; name: string };
  fulfilledNote?: { _id: string; title: string; files: string[] };
}

// Subject map: each semester lists its subject codes + full names.
// Edit this list if your curriculum changes — nothing else needs touching.
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

const SEMESTERS = [1, 2, 3, 4];

type UploaderSource = 'student' | 'expert';

type ViewState =
  | { level: 'source' }
  | { level: 'semesters'; source: UploaderSource }
  | { level: 'subjects'; source: UploaderSource; semester: number }
  | { level: 'subject-detail'; source: UploaderSource; semester: number; code: string; name: string };

const isExpertUploader = (note: Note) =>
  note.uploadedBy?.role === 'expert' || note.uploadedBy?.role === 'admin';

// Vault depth labels — used by the signature breadcrumb/depth-gauge element
const DEPTH_LABELS = ['Source', 'Semester', 'Subject', 'Archive'];

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [view, setView] = useState<ViewState>({ level: 'source' });
  const [activeTab, setActiveTab] = useState<NoteDocType>('note');

  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const [activeChatUser, setActiveChatUser] = useState<{ id: string; name: string } | null>(null);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchNotes();
    fetchStudentRequests();
    return () => stopTimer();
  }, []);

  useEffect(() => {
    if (studyMode && quizScore === null && timeLeft === 0 && quizQuestions.length > 0) {
      evaluateQuiz(true);
    }
  }, [timeLeft, studyMode, quizScore]);

  const startTimer = (seconds: number) => {
    stopTimer();
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notes');
      setNotes(res.data || []);
    } catch (error) {
      toast.error("Failed to load repository notes data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentRequests = async () => {
    try {
      const res = await API.get('/requests');
      setRequests(res.data || []);
    } catch (error) {
      console.error("Failed to fetch student requests ecosystem map.");
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.get(`/notes?search=${search}`);
      setNotes(res.data || []);
    } catch (error) {
      toast.error("Search tracking request failed.");
    } finally {
      setLoading(false);
    }
  };

  const launchAiStudyMode = async (note: Note) => {
    setGeneratingQuiz(true);
    setStudyMode(false);
    const loadingToast = toast.loading("Analyzing notes & prompting Gemini AI...");

    try {
      const res = await API.post('/notes/generate-quiz', {
        title: note.title,
        subject: note.subject,
        description: note.description
      }, {
        timeout: 30000
      });

      if (res.data?.quiz && Array.isArray(res.data.quiz)) {
        setQuizQuestions(res.data.quiz);
        setSelectedAnswers({});
        setQuizScore(null);
        setStudyMode(true);
        startTimer(60);
        toast.success("AI Assessment generated successfully!", { id: loadingToast });
      } else {
        throw new Error("Malformed payload signature returned from generator.");
      }
    } catch (error: any) {
      const systemErrorMessage = error.response?.data?.message || "AI Engine busy. Please try spinning it up again.";
      toast.error(systemErrorMessage, { id: loadingToast });
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const evaluateQuiz = (isTimeout = false) => {
    stopTimer();
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score++;
    });

    setQuizScore(score);

    if (isTimeout) {
      toast((t) => (
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <div>
            <p className="font-bold text-gray-900">Time Expired!</p>
            <p className="text-xs text-gray-500">Your answers were auto-submitted. You scored {score}/{quizQuestions.length}.</p>
          </div>
        </div>
      ), { duration: 5000 });
    } else {
      const percentage = (score / quizQuestions.length) * 100;
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-[#0d0d0f] shadow-2xl rounded-2xl pointer-events-auto flex p-4 text-white border border-cyan-500/30`}>
          <div className="flex-1">
            <div className="flex items-start">
              <Sparkles className="h-10 w-10 text-amber-400 shrink-0" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">Quiz Evaluated!</p>
                <p className="mt-1 text-xs text-zinc-400">
                  You scored <span className="font-extrabold text-cyan-400">{score} / {quizQuestions.length}</span> ({percentage.toFixed(0)}%).
                </p>
              </div>
            </div>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="ml-4 text-zinc-500 hover:text-white align-top">
            <X size={16} />
          </button>
        </div>
      ), { duration: 6000 });
    }
  };

  const formatDateTimeStamp = (isoString?: string) => {
    if (!isoString) return { date: 'N/A', time: 'N/A' };
    const dateObj = new Date(isoString);
    return {
      date: dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      time: dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Counts per semester (for the badge on each semester tile), scoped to a source
  const semesterCounts = (source: UploaderSource) => {
    const counts: Record<number, number> = {};
    SEMESTERS.forEach(sem => {
      counts[sem] = notes.filter(n =>
        n.semester === sem &&
        (source === 'expert' ? isExpertUploader(n) : !isExpertUploader(n))
      ).length;
    });
    return counts;
  };

  // Counts per subject code within a semester (for subject tile badges), scoped to a source
  const subjectCounts = (semester: number, source: UploaderSource) => {
    const counts: Record<string, { notes: number; papers: number }> = {};
    notes
      .filter(n =>
        n.semester === semester &&
        (source === 'expert' ? isExpertUploader(n) : !isExpertUploader(n))
      )
      .forEach(n => {
        const code = (n.subjectCode || '').toUpperCase();
        if (!counts[code]) counts[code] = { notes: 0, papers: 0 };
        if (n.docType === 'paper') counts[code].papers++;
        else counts[code].notes++;
      });
    return counts;
  };

  const getFilteredDocs = (semester: number, code: string, docType: NoteDocType, source: UploaderSource) => {
    return notes.filter(n =>
      n.semester === semester &&
      (n.subjectCode || '').toUpperCase() === code.toUpperCase() &&
      n.docType === docType &&
      (source === 'expert' ? isExpertUploader(n) : !isExpertUploader(n))
    );
  };

  // ---- Signature element: vault depth gauge ----------------------------
  // Encodes how many levels deep the user has navigated (Source → Semester
  // → Subject → Archive). Each tier lights up as it's entered, and clicking
  // a lit tier jumps back to it — same navigation the breadcrumb used to do,
  // just rendered as a literal depth indicator into the vault.
  const depthIndex = view.level === 'source' ? 0
    : view.level === 'semesters' ? 1
    : view.level === 'subjects' ? 2
    : 3;

  const jumpToDepth = (i: number) => {
    if (view.level === 'source') return;
    if (i === 0) setView({ level: 'source' });
    else if (i === 1) setView({ level: 'semesters', source: view.source });
    else if (i === 2 && (view.level === 'subjects' || view.level === 'subject-detail')) {
      setView({ level: 'subjects', source: view.source, semester: view.semester });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 antialiased selection:bg-cyan-500/30" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        .font-mono-vault { font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, Menlo, monospace; }
        .vault-grid-bg {
          background-image:
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0);
          background-size: 28px 28px;
        }
        .glow-amber { box-shadow: 0 0 0 1px rgba(251,191,36,0.15), 0 8px 30px -8px rgba(251,191,36,0.25); }
        .glow-cyan { box-shadow: 0 0 0 1px rgba(34,211,238,0.15), 0 8px 30px -8px rgba(34,211,238,0.25); }
        @keyframes pulse-line { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .pulse-line { animation: pulse-line 2.4s ease-in-out infinite; }
      `}</style>

      {/* Banner */}
      <div className="relative overflow-hidden bg-[#050505] border-b border-white/[0.06] py-14 px-6">
        <div className="absolute inset-0 vault-grid-bg opacity-30 pointer-events-none" />
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-cyan-500/[0.06] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="font-mono-vault inline-flex items-center gap-2 text-amber-400/90 text-[11px] font-bold px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.06] uppercase tracking-[0.15em]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-line" />
              Academic Vault
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-3 text-zinc-50">
              Knowledge Vault
            </h1>
            <p className="text-zinc-500 mt-2.5 text-sm md:text-base max-w-xl">
              Descend through semesters and subjects to surface notes, papers, and AI-generated revision quizzes.
            </p>
          </div>

          <Link
            to="/experts"
            className="shrink-0 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-amber-500/30 p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 group text-left backdrop-blur-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Award size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold flex items-center gap-1 text-zinc-100">
                Consult Experts <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-amber-400" />
              </h4>
              <p className="text-[11px] text-zinc-500 max-w-[160px]">Open real-world secure chats</p>
            </div>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search bar */}
        <div className="bg-[#0a0a0c] rounded-2xl shadow-2xl border border-white/[0.06] p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-md relative">
            <input
              type="text"
              placeholder="Search subjects, topics, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-black border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition text-sm text-zinc-100 placeholder-zinc-600"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          </form>

          {view.level !== 'source' && (
            <button
              onClick={() => {
                if (view.level === 'subject-detail') setView({ level: 'subjects', source: view.source, semester: view.semester });
                else if (view.level === 'subjects') setView({ level: 'semesters', source: view.source });
                else setView({ level: 'source' });
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-black border border-white/[0.08] hover:border-white/20 px-3 py-2.5 rounded-xl transition shrink-0"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
        </div>

        {/* SIGNATURE ELEMENT: Vault depth gauge */}
        <div className="bg-[#0a0a0c] border border-white/[0.06] rounded-2xl px-5 py-4 mb-8 overflow-x-auto">
          <div className="flex items-center gap-0 min-w-max font-mono-vault">
            {DEPTH_LABELS.map((label, i) => {
              const isActive = i === depthIndex;
              const isPassed = i < depthIndex;
              const isClickable = i <= depthIndex && view.level !== 'source';
              const accent = view.level !== 'source' && view.source === 'expert' ? 'cyan' : 'amber';
              const accentText = accent === 'cyan' ? 'text-cyan-400' : 'text-amber-400';
              const accentBorder = accent === 'cyan' ? 'border-cyan-500/40' : 'border-amber-500/40';
              const accentBg = accent === 'cyan' ? 'bg-cyan-500/10' : 'bg-amber-500/10';
              const accentLine = accent === 'cyan' ? 'bg-cyan-500/60' : 'bg-amber-500/60';

              let liveLabel = label;
              if (i === 1 && view.level !== 'source') liveLabel = view.source === 'expert' ? 'Expert' : 'Student';
              if (i === 2 && (view.level === 'subjects' || view.level === 'subject-detail')) liveLabel = `Sem ${view.semester}`;
              if (i === 3 && view.level === 'subject-detail') liveLabel = view.code;

              return (
                <React.Fragment key={label}>
                  <button
                    onClick={() => isClickable && jumpToDepth(i)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
                      ${isActive ? `${accentText} ${accentBg} border ${accentBorder}` : isPassed ? 'text-zinc-300 hover:text-white' : 'text-zinc-700'}
                      ${isClickable && !isActive ? 'cursor-pointer' : ''}
                      ${!isClickable ? 'cursor-default' : ''}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? accentLine + ' pulse-line' : isPassed ? 'bg-zinc-500' : 'bg-zinc-800'}`} />
                    {liveLabel}
                  </button>
                  {i < DEPTH_LABELS.length - 1 && (
                    <div className={`h-px w-8 sm:w-12 mx-1 ${i < depthIndex ? accentLine : 'bg-zinc-800'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-14">

            {/* LEVEL 0: Student vs Expert source selection */}
            {view.level === 'source' && (
              <div className="space-y-6">
                <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
                  <Layers3 className="text-zinc-500" size={20} /> Select Upload Source
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button
                    onClick={() => setView({ level: 'semesters', source: 'student' })}
                    className="relative text-left bg-[#0a0a0c] border border-white/[0.06] rounded-2xl p-7 hover:border-amber-500/40 hover:glow-amber transition-all duration-300 group min-h-[190px] flex flex-col justify-between overflow-hidden"
                  >
                    <div className="absolute inset-0 vault-grid-bg opacity-[0.15] group-hover:opacity-30 transition-opacity pointer-events-none" />
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20 mb-5">
                        <User size={22} />
                      </div>
                      <h3 className="text-lg font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">Student Uploads</h3>
                      <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">Notes and papers shared by fellow students.</p>
                    </div>
                    <div className="relative flex items-center justify-between mt-4">
                      <span className="font-mono-vault text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-400">
                        {notes.filter(n => !isExpertUploader(n)).length} DOCS
                      </span>
                      <ArrowRight size={16} className="text-zinc-700 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>

                  <button
                    onClick={() => setView({ level: 'semesters', source: 'expert' })}
                    className="relative text-left bg-[#0a0a0c] border border-white/[0.06] rounded-2xl p-7 hover:border-cyan-500/40 hover:glow-cyan transition-all duration-300 group min-h-[190px] flex flex-col justify-between overflow-hidden"
                  >
                    <div className="absolute inset-0 vault-grid-bg opacity-[0.15] group-hover:opacity-30 transition-opacity pointer-events-none" />
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 mb-5">
                        <Award size={22} />
                      </div>
                      <h3 className="text-lg font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">Expert Uploads</h3>
                      <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">Authoritative notes and papers from experts and admins.</p>
                    </div>
                    <div className="relative flex items-center justify-between mt-4">
                      <span className="font-mono-vault text-[11px] font-bold bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full text-cyan-400">
                        {notes.filter(n => isExpertUploader(n)).length} DOCS
                      </span>
                      <ArrowRight size={16} className="text-zinc-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* LEVEL 1: Semester grid */}
            {view.level === 'semesters' && (
              <div className="space-y-6">
                <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
                  <Layers3 className={view.source === 'expert' ? 'text-cyan-400' : 'text-amber-400'} size={20} />
                  {view.source === 'expert' ? 'Expert Uploads' : 'Student Uploads'}
                  <span className="text-zinc-600 font-medium text-sm">— select a semester</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {SEMESTERS.map((sem) => {
                    const accent = view.source === 'expert' ? 'cyan' : 'amber';
                    return (
                      <button
                        key={sem}
                        onClick={() => setView({ level: 'subjects', source: view.source, semester: sem })}
                        className={`relative text-left bg-[#0a0a0c] border border-white/[0.06] rounded-2xl p-6 transition-all duration-300 group min-h-[160px] flex flex-col justify-between overflow-hidden ${accent === 'cyan' ? 'hover:border-cyan-500/40' : 'hover:border-amber-500/40'}`}
                      >
                        <div className={`absolute -right-6 -top-6 text-[110px] font-black leading-none select-none text-white/[0.025] transition-colors ${accent === 'cyan' ? 'group-hover:text-cyan-500/10' : 'group-hover:text-amber-500/10'}`}>
                          {sem}
                        </div>
                        <div className="relative z-10">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${accent === 'cyan' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            <Layers3 size={22} />
                          </div>
                          <h3 className={`text-lg font-bold text-zinc-100 transition-colors ${accent === 'cyan' ? 'group-hover:text-cyan-300' : 'group-hover:text-amber-300'}`}>Semester {sem}</h3>
                          <p className="text-xs text-zinc-500 mt-1.5">{SEMESTER_SUBJECTS[sem].length} subjects</p>
                        </div>
                        <div className="relative z-10 flex items-center justify-between mt-4">
                          <span className={`font-mono-vault text-[11px] font-bold px-2.5 py-1 rounded-full border ${accent === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                            {semesterCounts(view.source)[sem] || 0} DOCS
                          </span>
                          <ArrowRight size={16} className={`text-zinc-700 group-hover:translate-x-1 transition-all ${accent === 'cyan' ? 'group-hover:text-cyan-400' : 'group-hover:text-amber-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 2: Subject grid within a semester */}
            {view.level === 'subjects' && (
              <div className="space-y-6">
                <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2 flex-wrap">
                  <BookOpen className={view.source === 'expert' ? 'text-cyan-400' : 'text-amber-400'} size={20} /> Semester {view.semester} Subjects
                  <span className="font-mono-vault text-[10px] font-bold text-zinc-600 normal-case tracking-wide">
                    {view.source === 'expert' ? 'EXPERT' : 'STUDENT'}
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {SEMESTER_SUBJECTS[view.semester].map((subj) => {
                    const counts = subjectCounts(view.semester, view.source)[subj.code] || { notes: 0, papers: 0 };
                    const total = counts.notes + counts.papers;
                    const accent = view.source === 'expert' ? 'cyan' : 'amber';
                    return (
                      <button
                        key={subj.code}
                        onClick={() => setView({ level: 'subject-detail', source: view.source, semester: view.semester, code: subj.code, name: subj.name })}
                        className={`text-left bg-[#0a0a0c] border border-white/[0.06] rounded-2xl p-5 transition-all duration-300 group flex flex-col justify-between min-h-[150px] ${accent === 'cyan' ? 'hover:border-cyan-500/40' : 'hover:border-amber-500/40'}`}
                      >
                        <div>
                          <span className={`font-mono-vault inline-block bg-black border border-white/10 text-xs font-black tracking-wider px-2.5 py-1 rounded-lg ${accent === 'cyan' ? 'text-cyan-400' : 'text-amber-400'}`}>
                            {subj.code}
                          </span>
                          <h3 className={`text-sm font-bold text-zinc-100 mt-3 transition-colors leading-snug ${accent === 'cyan' ? 'group-hover:text-cyan-300' : 'group-hover:text-amber-300'}`}>
                            {subj.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 mt-4 text-[11px] font-medium text-zinc-500 font-mono-vault">
                          <span className="flex items-center gap-1"><NotebookText size={12} className="text-amber-400/70" /> {counts.notes}</span>
                          <span className="flex items-center gap-1"><FileText size={12} className="text-cyan-400/70" /> {counts.papers}</span>
                          {total === 0 && <span className="text-zinc-700 italic font-sans">empty</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 3: Subject detail — Notes / Papers tabs */}
            {view.level === 'subject-detail' && (
              <div className="space-y-6">
                <div>
                  <span className={`font-mono-vault inline-block bg-black border border-white/10 text-xs font-black tracking-wider px-2.5 py-1 rounded-lg ${view.source === 'expert' ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {view.code} · SEM {view.semester}
                  </span>
                  <h2 className="text-xl font-extrabold text-zinc-100 mt-2">{view.name}</h2>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 bg-[#0a0a0c] border border-white/[0.06] rounded-2xl p-1.5 w-fit">
                  <button
                    onClick={() => setActiveTab('note')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'note' ? 'bg-amber-500 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-200'}`}
                  >
                    <NotebookText size={14} /> Notes
                  </button>
                  <button
                    onClick={() => setActiveTab('paper')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'paper' ? 'bg-cyan-500 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-200'}`}
                  >
                    <FileText size={14} /> Papers
                  </button>
                </div>

                {/* Document list */}
                <div className="space-y-3">
                  {getFilteredDocs(view.semester, view.code, activeTab, view.source).length === 0 ? (
                    <div className="bg-[#0a0a0c] border border-white/[0.06] rounded-2xl p-10 text-center">
                      {activeTab === 'note' ? (
                        <NotebookText size={28} className="text-zinc-800 mx-auto mb-2" />
                      ) : (
                        <FileText size={28} className="text-zinc-800 mx-auto mb-2" />
                      )}
                      <p className="text-sm font-bold text-zinc-400">No {activeTab === 'note' ? 'notes' : 'papers'} yet</p>
                      <p className="text-xs text-zinc-600 mt-1">
                        {activeTab === 'paper'
                          ? 'Papers are posted by experts and admins.'
                          : 'Be the first to upload notes for this subject.'}
                      </p>
                    </div>
                  ) : (
                    getFilteredDocs(view.semester, view.code, activeTab, view.source).map((note) => {
                      const meta = formatDateTimeStamp(note.createdAt);
                      const isExpertUpload = note.uploadedBy?.role === 'expert' || note.uploadedBy?.role === 'admin';
                      return (
                        <div
                          key={note._id}
                          onClick={() => { if (!generatingQuiz) { setActiveNote(note); setStudyMode(false); } }}
                          className={`p-4 border rounded-2xl transition-all cursor-pointer flex flex-col gap-3 ${activeNote?._id === note._id ? (activeTab === 'paper' ? 'border-cyan-500/50 bg-cyan-500/[0.04]' : 'border-amber-500/50 bg-amber-500/[0.04]') : 'border-white/[0.06] bg-[#0a0a0c] hover:border-white/15'}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-zinc-200 line-clamp-1">{note.title}</h4>
                              {note.description && <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{note.description}</p>}
                            </div>
                            <span className={`font-mono-vault shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${activeTab === 'paper' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                              {activeTab}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500 font-medium">
                            <span className="flex items-center gap-1 text-zinc-300">
                              <User size={11} className={isExpertUpload ? 'text-cyan-400' : 'text-amber-400'} />
                              Uploaded by <strong className="font-semibold text-zinc-200">{note.uploadedBy?.name || (isExpertUpload ? 'Specialist' : 'Peer Student')}</strong>
                            </span>
                            <span className="flex items-center gap-1 font-mono-vault"><Calendar size={11} /> {meta.date}</span>
                            <span className="flex items-center gap-1 font-mono-vault"><Clock size={11} /> {meta.time}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Demands / Requests Area */}
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mb-4 pt-4">
                <ClipboardList className="text-zinc-500" size={20} />
                Your Submitted Demands &amp; Requests Tracking
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {requests.map((req) => {
                  const isFulfilled = req.status === 'fulfilled';
                  return (
                    <div
                      key={req._id}
                      className={`bg-[#0a0a0c] border rounded-2xl p-5 shadow-md transition duration-200 relative overflow-hidden ${isFulfilled ? 'border-emerald-500/25 bg-emerald-500/[0.03]' : 'border-white/[0.06]'}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono-vault bg-black text-zinc-500 border border-white/[0.08] text-[10px] font-bold px-2 py-0.5 rounded-md">SEM {req.semester}</span>
                        {isFulfilled ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                            <CheckCircle2 size={12} /> Fulfilled
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">Pending Help</span>
                        )}
                      </div>

                      <h4 className="font-bold text-zinc-100 text-sm leading-snug">{req.title}</h4>
                      <p className="text-[11px] font-semibold text-cyan-400/80 mt-0.5 mb-2">{req.subject}</p>
                      <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{req.description}</p>

                      {isFulfilled && req.fulfilledNote && (
                        <div className="mt-3 p-3 bg-black border border-emerald-500/15 rounded-xl flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <BookOpen className="text-emerald-400 shrink-0" size={16} />
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-zinc-200 truncate">{req.fulfilledNote.title}</p>
                              <p className="text-[10px] text-zinc-600 truncate">Uploaded by Specialist</p>
                            </div>
                          </div>
                          <a href={req.fulfilledNote.files?.[0]} target="_blank" rel="noreferrer" className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition shrink-0">
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}

                      {isFulfilled && req.fulfilledBy && (
                        <button
                          onClick={() => setActiveChatUser({ id: req.fulfilledBy!._id, name: req.fulfilledBy!.name })}
                          className="w-full mt-4 flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold py-2 rounded-xl transition-all shadow-md"
                        >
                          <MessageSquare size={12} /> Chat with Specialist
                        </button>
                      )}
                    </div>
                  );
                })}

                {requests.length === 0 && (
                  <p className="text-xs text-zinc-600 col-span-2 py-4">No active requests logged in your tracking history.</p>
                )}
              </div>
            </div>

          </div>

          {/* Right Side Pane */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-[#0a0a0c] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6">
              {activeNote ? (
                <>
                  <div>
                    <span className={`font-mono-vault text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${activeNote.docType === 'paper' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      Sem {activeNote.semester} · {activeNote.subjectCode}
                    </span>
                    <h3 className="text-lg font-black text-zinc-100 mt-2 leading-tight">{activeNote.title}</h3>
                    <p className="text-xs font-bold text-zinc-500 mt-0.5">{activeNote.subject}</p>
                  </div>

                  {activeNote.description && (
                    <div className="bg-black rounded-xl p-3.5 border border-white/[0.06]">
                      <h5 className="text-[11px] font-extrabold text-zinc-600 uppercase tracking-wider mb-1 font-mono-vault">Scope Details</h5>
                      <p className="text-xs text-zinc-400 leading-relaxed">{activeNote.description}</p>
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    {activeNote.files?.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-black hover:bg-white/5 text-zinc-200 border border-white/[0.08] text-xs font-bold py-3 rounded-xl transition"
                      >
                        <Download size={14} /> Download Document Attachment
                      </a>
                    ))}

                    <button
                      onClick={() => launchAiStudyMode(activeNote)}
                      disabled={generatingQuiz}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
                    >
                      <Brain size={14} /> {generatingQuiz ? "Generating Smart Exam..." : "Launch Gemini Revision Quiz"}
                    </button>
                  </div>

                  {/* ACTIVE STUDY MODE PANEL */}
                  {studyMode && quizQuestions.length > 0 && (
                    <div className="border-t border-white/[0.06] pt-5 space-y-4 animate-enter">
                      <div className="flex items-center justify-between bg-black border border-white/[0.06] text-white px-4 py-3 rounded-2xl shadow-inner">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-zinc-400 font-mono-vault">
                          <Timer size={14} className="text-amber-400 animate-pulse" />
                          <span>REVISION TIMER</span>
                        </div>
                        <span className={`font-mono-vault text-sm font-black px-2 py-0.5 rounded-lg ${timeLeft <= 15 ? 'bg-rose-500/20 text-rose-400 animate-bounce' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {formatTime(timeLeft)}
                        </span>
                      </div>

                      <div className="space-y-6 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                        {quizQuestions.map((question, qIdx) => (
                          <div key={qIdx} className="space-y-2.5 p-1 text-left">
                            <p className="text-xs font-extrabold text-zinc-200 leading-relaxed flex gap-1.5">
                              <HelpCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                              <span>{qIdx + 1}. {question.q}</span>
                            </p>
                            <div className="grid grid-cols-1 gap-1.5 pl-5">
                              {question.a.map((answer, aIdx) => {
                                const isSelected = selectedAnswers[qIdx] === aIdx;
                                const isCorrect = question.correct === aIdx;
                                const displayEvaluated = quizScore !== null;

                                let choiceStyle = "border-white/[0.08] bg-black/40 hover:bg-white/[0.04] text-zinc-300";
                                if (isSelected) choiceStyle = "border-amber-500/50 bg-amber-500/[0.06] text-amber-300";
                                if (displayEvaluated) {
                                  if (isCorrect) choiceStyle = "border-emerald-500/60 bg-emerald-500/10 text-emerald-400 font-medium";
                                  else if (isSelected) choiceStyle = "border-rose-500/60 bg-rose-500/10 text-rose-400";
                                }

                                return (
                                  <label
                                    key={aIdx}
                                    className={`w-full text-left p-2.5 border rounded-xl text-[11px] cursor-pointer flex items-center gap-2 transition-all ${choiceStyle}`}
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${qIdx}`}
                                      checked={isSelected}
                                      disabled={displayEvaluated}
                                      onChange={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: aIdx }))}
                                      className="accent-amber-500 shrink-0"
                                    />
                                    <span>{answer}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {quizScore === null ? (
                        <button
                          onClick={() => evaluateQuiz(false)}
                          className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-2.5 rounded-xl text-xs transition"
                        >
                          Submit Responses
                        </button>
                      ) : (
                        <div className="bg-black border border-white/[0.06] rounded-2xl p-4 text-center">
                          <p className="text-xs text-zinc-500 font-medium font-mono-vault">Your Assessment Target Score</p>
                          <h4 className="text-2xl font-black text-amber-400 mt-1">
                            {quizScore} <span className="text-sm font-normal text-zinc-700">/ {quizQuestions.length}</span>
                          </h4>
                          <button
                            onClick={() => { setStudyMode(false); setQuizQuestions([]); setQuizScore(null); }}
                            className="mt-3 text-[11px] font-bold text-zinc-300 hover:text-white border border-white/[0.08] bg-[#0a0a0c] px-3 py-1.5 rounded-lg transition mx-auto"
                          >
                            Reset Workspace
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-14 px-4 text-center text-zinc-600">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={24} className="text-zinc-700" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-500">No Module Active</h4>
                  <p className="text-xs text-zinc-700 mt-1 max-w-[200px] mx-auto">Select a note or paper from a subject to start.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Real-World Chat Messenger Modal Box */}
      {activeChatUser && (
        <PrivateChatModal
          userId={activeChatUser.id}
          recipientName={activeChatUser.name}
          onClose={() => setActiveChatUser(null)}
          currentUser={{
            id: localStorage.getItem('userId') || ''
          }}
        />
      )}

    </div>
  );
}