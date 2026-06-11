import React, { useState, useEffect, useRef } from 'react';
import API from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  BookOpen, Search, Filter, Download, 
  Brain, Layers, ArrowRight, X, CheckCircle2, 
  HelpCircle, Timer, Sparkles, AlertTriangle 
} from 'lucide-react';

interface Note {
  _id: string;
  title: string;
  subject: string;
  semester: number;
  description?: string;
  files: string[];
  uploadedBy?: { name: string };
}

interface QuizQuestion {
  q: string;
  a: string[];
  correct: number;
}

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  
  // AI Quiz Interactive Matrix States
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchNotes();
    return () => stopTimer();
  }, [selectedSemester]);

  // Sync effect to handle automated submissions when clock hits zero
  useEffect(() => {
    if (studyMode && quizScore === null && timeLeft === 0 && quizQuestions.length > 0) {
      evaluateQuiz(true); // Forced timeout submission flag
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
      const params: any = {};
      if (selectedSemester) params.semester = selectedSemester;
      const res = await API.get('/notes', { params });
      setNotes(res.data || []);
    } catch (error) {
      toast.error("Failed to load repository notes data.");
    } finally {
      setLoading(false);
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
      // FIXED: Added timeout override object to give the LLM enough time to respond completely
      const res = await API.post('/notes/generate-quiz', {
        title: note.title,
        subject: note.subject,
        description: note.description
      }, {
        timeout: 30000 // Give the AI engine up to 30 seconds to respond safely
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
      console.error(error);
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
          <AlertTriangle className="text-amber-500 shrink-0" size={24}/>
          <div>
            <p className="font-bold text-gray-900">Time Expired!</p>
            <p className="text-xs text-gray-500">Your answers were auto-submitted. You scored {score}/{quizQuestions.length}.</p>
          </div>
        </div>
      ), { duration: 5000 });
    } else {
      const percentage = (score / quizQuestions.length) * 100;
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-indigo-500/30 p-4 text-white`}>
          <div className="flex-1 w-0">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Sparkles className="h-10 w-10 text-amber-400"/>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">Quiz Evaluated successfully!</p>
                <p className="mt-1 text-xs text-slate-300">
                  You answered <span className="font-extrabold text-indigo-400">{score} out of {quizQuestions.length}</span> queries correctly ({percentage.toFixed(0)}%).
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button onClick={() => toast.dismiss(t.id)} className="bg-slate-800 rounded-xl p-1 text-slate-400 hover:text-white focus:outline-none">
              <X size={16}/>
            </button>
          </div>
        </div>
      ), { duration: 6000 });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white py-12 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">Academic Portal</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">Welcome to Your Knowledge Vault</h1>
            <p className="text-indigo-100 mt-2 text-sm md:text-base max-w-xl">Review curated peer source notes, track your academic progress, and run automated self-assessment revision quizzes.</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-md relative">
            <input 
              type="text"
              placeholder="Search subjects, topics, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Filter className="text-slate-400 hidden sm:block" size={18}/>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full sm:w-44 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium cursor-pointer"
            >
              <option value="">All Semesters</option>
              {[1,2,3,4].map(num => (
                <option key={num} value={num}>Semester {num}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Note Feed */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="text-indigo-600" size={20}/>
              Available Materials ({notes.length})
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map((n) => (
                  <div key={n} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <div 
                    key={note._id}
                    onClick={() => { if(!generatingQuiz) { setActiveNote(note); setStudyMode(false); } }}
                    className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${activeNote?._id === note._id ? 'ring-2 ring-indigo-500 border-transparent shadow-sm' : 'border-slate-200/70'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-lg">Sem {note.semester}</span>
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">{note.subject}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition truncate text-base mb-1">{note.title}</h3>
                      <p className="text-slate-500 text-xs line-clamp-2 mb-4">{note.description || "No supplemental details provided."}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                      <span>By {note.uploadedBy?.name || "Peer Contributor"}</span>
                      <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View Workspace <ArrowRight size={14}/>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Active Split-Workspace Pane */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[480px] flex flex-col">
              {activeNote ? (
                !studyMode ? (
                  /* Standard Inspector Panel */
                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{activeNote.subject}</p>
                          <h3 className="text-xl font-bold text-slate-900 mt-1">{activeNote.title}</h3>
                        </div>
                        <button onClick={() => setActiveNote(null)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition">
                          <X size={18}/>
                        </button>
                      </div>

                      <div className="space-y-4 my-6">
                        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1.5">
                          <p><strong>Focus:</strong> Semester {activeNote.semester} Division</p>
                          {activeNote.description && <p className="mt-2 text-slate-500 leading-relaxed"><strong>Notes:</strong> {activeNote.description}</p>}
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attached Artifact Files ({activeNote.files.length})</p>
                          {activeNote.files.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50/20 transition text-sm">
                              <span className="text-slate-700 text-xs truncate">Document Attachment #{i+1}</span>
                              <Download className="text-slate-400" size={16}/>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => launchAiStudyMode(activeNote)}
                      disabled={generatingQuiz}
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 mt-auto"
                    >
                      <Brain className={generatingQuiz ? "animate-spin" : ""} size={18}/>
                      {generatingQuiz ? "Prompting Gemini AI..." : "Launch AI Study Mode"}
                    </button>
                  </div>
                ) : (
                  /* Live Generated AI Quiz Module View */
                  <div className="p-6 flex flex-col flex-grow bg-slate-900 text-slate-100">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Brain className="text-amber-400 animate-pulse" size={18}/>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Gemini AI Engine</span>
                      </div>
                      
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${timeLeft <= 15 ? 'bg-rose-950/50 border border-rose-500 text-rose-400 animate-pulse' : 'bg-slate-800 text-indigo-400'}`}>
                        <Timer size={14}/>
                        <span>{formatTime(timeLeft)}</span>
                      </div>
                    </div>

                    <div className="flex-grow overflow-y-auto my-4 pr-1 space-y-5 max-h-[360px] custom-scrollbar">
                      <div>
                        <h4 className="text-sm font-semibold text-white truncate mb-1">Testing: {activeNote.title}</h4>
                        <p className="text-xs text-slate-400">Complete the generated options before the clock expires.</p>
                      </div>

                      {quizQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-slate-800/60 border border-slate-800 rounded-xl p-4 space-y-3">
                          <p className="text-xs font-medium text-slate-200 flex gap-1.5">
                            <HelpCircle className="text-indigo-400 shrink-0 mt-0.5" size={14}/>
                            <span>{qIdx + 1}. {q.q}</span>
                          </p>
                          <div className="space-y-1.5 pl-5">
                            {q.a.map((opt, aIdx) => {
                              const isSelected = selectedAnswers[qIdx] === aIdx;
                              const showSuccessRing = quizScore !== null && aIdx === q.correct;
                              const showWrongSelectedState = quizScore !== null && isSelected && selectedAnswers[qIdx] !== q.correct;

                              return (
                                <button
                                  key={aIdx}
                                  disabled={quizScore !== null}
                                  onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: aIdx })}
                                  className={`w-full text-left text-xs p-2 rounded-lg transition-all ${isSelected ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'} ${showSuccessRing ? 'ring-2 ring-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold' : ''} ${showWrongSelectedState ? 'ring-2 ring-rose-500 bg-rose-950/40 text-rose-300' : ''}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-800 mt-auto">
                      {quizScore === null ? (
                        <button
                          onClick={() => evaluateQuiz(false)}
                          disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 font-semibold py-2.5 rounded-xl transition text-xs"
                        >
                          Submit Answers for Evaluation
                        </button>
                      ) : (
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-400" size={18}/>
                            <div>
                              <p className="text-xs font-bold text-white">Score Generated</p>
                              <p className="text-[10px] text-slate-400">{quizScore} / {quizQuestions.length} Correct</p>
                            </div>
                          </div>
                          <button
                            onClick={() => launchAiStudyMode(activeNote)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            Regenerate Test
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="m-auto text-center p-8 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                    <BookOpen size={22}/>
                  </div>
                  <h4 className="font-semibold text-slate-700 text-sm">No Active Workspace</h4>
                  <p className="text-slate-400 text-xs mt-1 max-w-[200px]">Select any note card from the inventory feed to launch the AI study module.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}