import React, { useState,  useEffect } from 'react';
import {
  Brain, Sparkles,  Zap, 
  Calendar, ChevronRight, RotateCcw, Copy,
  CheckCheck, Loader2,   
  FileText, Lightbulb, ClipboardList, CreditCard,
  Clock, ArrowLeft, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────
type ToolId = 'summarizer' | 'explainer' | 'quiz' | 'flashcards' | 'planner';

interface QuizQuestion { q: string; options: string[]; correct: number; }
interface Flashcard { front: string; back: string; }
interface PlanBlock { time: string; task: string; tip: string; }

interface ToolResult {
  summarizer?: { headline: string; keyPoints: string[]; gaps: string[] };
  explainer?: { simple: string; deep: string[] };
  quiz?: QuizQuestion[];
  flashcards?: Flashcard[];
  planner?: { topic: string; totalTime: string; blocks: PlanBlock[] };
}

// ─── Waveform ambient animation ──────────────────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  const bars = 28;
  return (
    <svg width="120" height="28" viewBox={`0 0 ${bars * 5} 28`} className="shrink-0">
      {Array.from({ length: bars }).map((_, i) => {
        const h = active
          ? 4 + Math.abs(Math.sin(i * 0.7)) * 20
          : 2 + Math.abs(Math.sin(i * 0.4)) * 5;
        const y = (28 - h) / 2;
        return (
          <rect
            key={i}
            x={i * 5}
            y={y}
            width={3}
            height={h}
            rx={1.5}
            fill={active ? '#f59e0b' : '#3f3f46'}
            style={{
              transition: 'all 0.25s ease',
              animationDelay: `${i * 40}ms`,
            }}
          />
        );
      })}
    </svg>
  );
}

// ─── Flip Card ───────────────────────────────────────────────────────────────
function FlipCard({ card, index }: { card: Flashcard; index: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      onClick={() => setFlipped(f => !f)}
      className="cursor-pointer h-36 relative"
      style={{ perspective: '800px' }}
    >
      <div
        className="w-full h-full relative transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl border border-white/[0.07] bg-[#0e0e12] flex flex-col justify-between p-4"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="font-mono-vault text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Card {index + 1} · Front</span>
          <p className="text-sm font-bold text-zinc-200 leading-snug">{card.front}</p>
          <span className="text-[10px] text-zinc-700 font-mono-vault">tap to reveal →</span>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] flex flex-col justify-between p-4"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="font-mono-vault text-[9px] font-bold text-amber-600 uppercase tracking-widest">Answer</span>
          <p className="text-xs text-zinc-300 leading-relaxed">{card.back}</p>
          <span className="text-[10px] text-amber-600 font-mono-vault">tap to flip back</span>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Player ─────────────────────────────────────────────────────────────
function QuizPlayer({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correct).length
    : null;

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <div key={qi} className="bg-[#0e0e12] border border-white/[0.06] rounded-2xl p-4 space-y-3">
          <p className="text-sm font-bold text-zinc-200 flex gap-2">
            <span className="font-mono-vault text-amber-400 shrink-0">{qi + 1}.</span>
            {q.q}
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {q.options.map((opt, oi) => {
              const chosen = answers[qi] === oi;
              const correct = q.correct === oi;
              let style = 'border-white/[0.06] bg-black/40 text-zinc-400 hover:border-white/20 hover:text-zinc-200';
              if (submitted) {
                if (correct) style = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold';
                else if (chosen) style = 'border-rose-500/40 bg-rose-500/10 text-rose-400';
              } else if (chosen) {
                style = 'border-amber-500/50 bg-amber-500/[0.07] text-amber-300';
              }
              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                  className={`text-left px-3 py-2 rounded-xl border text-xs transition-all ${style}`}
                >
                  <span className="font-mono-vault text-[10px] mr-2 opacity-60">{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-zinc-200 text-black transition disabled:opacity-30"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="bg-black border border-amber-500/20 rounded-2xl p-5 text-center">
          <p className="font-mono-vault text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Final Score</p>
          <h3 className="text-3xl font-black text-amber-400">
            {score}<span className="text-base text-zinc-600"> / {questions.length}</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-1">{Math.round((score! / questions.length) * 100)}% correct</p>
          <button
            onClick={() => { setAnswers({}); setSubmitted(false); }}
            className="mt-3 text-[11px] font-bold text-zinc-400 hover:text-white border border-white/[0.08] px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 mx-auto"
          >
            <RotateCcw size={11} /> Retry
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AiStudyMode() {
  const [activeTool, setActiveTool] = useState<ToolId>('summarizer');
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'simple' | 'deep'>('simple');
  const [planHours, setPlanHours] = useState('2');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult>({});
  const [copied, setCopied] = useState(false);
  const [activeWave, setActiveWave] = useState(false);

  // Animate waveform while loading
  useEffect(() => {
    if (loading) {
      setActiveWave(true);
    } else {
      const t = setTimeout(() => setActiveWave(false), 800);
      return () => clearTimeout(t);
    }
  }, [loading]);



  // ─── Backend API Call (Secure - uses key from .env) ───────────────────────
  const callAI = async (tool: ToolId, payload: any) => {
  // Add the full origin if needed, or ensure the leading slash is treated as root
  const res = await fetch(`${API_URL}/api/ai/study`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, ...payload }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'No details');
    // This will now show the actual status and message from the server
    throw new Error(`API Error: ${res.status} - ${errorText}`);
  }

  return await res.json();
};


  const handleRun = async () => {
    if (loading) return;
    setLoading(true);
    setResult({});

    try {
      if (activeTool === 'summarizer') {
        const data = await callAI('summarizer', { text: input });
        setResult({ summarizer: data });

      } else if (activeTool === 'explainer') {
        const data = await callAI('explainer', { topic, depth });
        setResult({ explainer: data });

      } else if (activeTool === 'quiz') {
        const data = await callAI('quiz', { topic });
        setResult({ quiz: data });

      } else if (activeTool === 'flashcards') {
        const data = await callAI('flashcards', { text: input });
        setResult({ flashcards: data });

      } else if (activeTool === 'planner') {
        const data = await callAI('planner', { topic, hours: planHours });
        setResult({ planner: data });
      }
    } catch (e) {
      console.error('AI Request Failed:', e);
      alert('Failed to get response from AI. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    const text = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setInput(''); setTopic(''); setResult({}); };

  const tools: { id: ToolId; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
    { id: 'summarizer', label: 'Summarizer', icon: <FileText size={16} />, desc: 'Distil any text into key insights', color: 'amber' },
    { id: 'explainer', label: 'Explainer', icon: <Lightbulb size={16} />, desc: 'Understand any concept, any depth', color: 'violet' },
    { id: 'quiz',      label: 'Quiz Gen',  icon: <ClipboardList size={16} />, desc: 'Auto-build a 5-question MCQ test', color: 'cyan' },
    { id: 'flashcards',label: 'Flashcards',icon: <CreditCard size={16} />,   desc: 'Turn your notes into flip cards', color: 'emerald' },
    { id: 'planner',   label: 'Planner',   icon: <Calendar size={16} />,     desc: 'Build a time-boxed study schedule', color: 'rose' },
  ];

  const colorMap: Record<string, Record<string, string>> = {
    amber:   { border: 'border-amber-500/40',   bg: 'bg-amber-500/10',   text: 'text-amber-400',   active: 'bg-amber-500 text-black' },
    violet:  { border: 'border-violet-500/40',  bg: 'bg-violet-500/10',  text: 'text-violet-400',  active: 'bg-violet-500 text-white' },
    cyan:    { border: 'border-cyan-500/40',     bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    active: 'bg-cyan-500 text-black' },
    emerald: { border: 'border-emerald-500/40',  bg: 'bg-emerald-500/10', text: 'text-emerald-400', active: 'bg-emerald-500 text-black' },
    rose:    { border: 'border-rose-500/40',     bg: 'bg-rose-500/10',    text: 'text-rose-400',    active: 'bg-rose-500 text-white' },
  };

  const currentTool = tools.find(t => t.id === activeTool)!;
  const c = colorMap[currentTool.color];

  const hasResult = Object.keys(result).length > 0;

  return (
    <div
      className="min-h-screen bg-[#050507] text-zinc-100 antialiased"
      style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}
    >
      <style>{`
        .font-mono-vault { font-family: ui-monospace,'SF Mono','Cascadia Code','Roboto Mono',Consolas,Menlo,monospace; }
        .synaptic-bg {
          background-image: radial-gradient(circle at 1px 1px, rgba(139,92,246,0.07) 1px, transparent 0);
          background-size: 32px 32px;
        }
        .tool-btn-active { box-shadow: 0 0 0 1px rgba(251,191,36,0.3), 0 4px 20px -4px rgba(251,191,36,0.2); }
        @keyframes synapse { 0%,100%{opacity:.3;transform:scaleX(1)} 50%{opacity:1;transform:scaleX(1.03)} }
        .synapse-pulse { animation: synapse 3s ease-in-out infinite; }
        @keyframes float-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .float-up { animation: float-up .35s ease both; }
        @keyframes bar-pulse {
          0%,100%{transform:scaleY(0.3);opacity:0.4}
          50%{transform:scaleY(1);opacity:1}
        }
        .bar-pulse { animation: bar-pulse 1s ease-in-out infinite; }
      `}</style>

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-[#050507]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-1.5 rounded-lg border border-white/[0.08] text-zinc-500 hover:text-white hover:border-white/20 transition"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/30 to-violet-600/20 border border-amber-500/30 flex items-center justify-center">
                <Brain size={14} className="text-amber-400" />
              </div>
              <span className="font-black text-sm tracking-tight text-zinc-100">AI Study Mode</span>
              <span className="font-mono-vault text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">BETA</span>
            </div>
          </div>

          {/* Waveform signature element */}
          <div className="flex items-center gap-3">
            <span className={`font-mono-vault text-[10px] font-bold uppercase tracking-widest transition-colors ${activeWave ? 'text-amber-400' : 'text-zinc-700'}`}>
              {loading ? 'thinking...' : 'neural ready'}
            </span>
            <Waveform active={activeWave} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          {/* ── Left: Tool Selector ── */}
          <aside className="space-y-4">
            {/* Hero blurb */}
            <div className="relative overflow-hidden bg-[#0a0a10] border border-white/[0.06] rounded-2xl p-5 synaptic-bg">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <Sparkles size={18} className="text-amber-400 mb-2.5" />
                <h2 className="text-base font-black text-zinc-100 leading-snug">Five AI tools.<br />One study session.</h2>
                <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">Pick a mode, feed it your material, and let the model do the heavy lifting.</p>
              </div>
            </div>

            {/* Tool list */}
            <nav className="space-y-1.5">
              {tools.map((tool) => {
                const isActive = activeTool === tool.id;
                const tc = colorMap[tool.color];
                return (
                  <button
                    key={tool.id}
                    onClick={() => { setActiveTool(tool.id); setResult({}); }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      isActive
                        ? `${tc.border} ${tc.bg} tool-btn-active`
                        : 'border-white/[0.05] bg-[#0a0a10] hover:border-white/15 hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className={`shrink-0 transition-colors ${isActive ? tc.text : 'text-zinc-600'}`}>
                      {tool.icon}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold transition-colors ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`}>{tool.label}</p>
                      <p className="text-[10px] text-zinc-600 truncate">{tool.desc}</p>
                    </div>
                    {isActive && <ChevronRight size={13} className={`${tc.text} shrink-0 ml-auto`} />}
                  </button>
                );
              })}
            </nav>

            {/* Quick tips */}
            <div className="bg-[#0a0a10] border border-white/[0.05] rounded-2xl p-4 space-y-2">
              <p className="font-mono-vault text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Tips</p>
              {[
                'Paste dense paragraphs into Summarizer to find gaps',
                'Use Explainer → deep mode before an exam',
                'Export flashcards to a note for offline review',
              ].map((tip, i) => (
                <p key={i} className="text-[10px] text-zinc-500 flex gap-2">
                  <span className="font-mono-vault text-zinc-700 shrink-0">{i + 1}.</span>
                  {tip}
                </p>
              ))}
            </div>
          </aside>

          {/* ── Right: Active Tool Panel ── */}
          <section className="space-y-5">

            {/* Tool header */}
            <div className={`flex items-center justify-between bg-[#0a0a10] border ${c.border} rounded-2xl px-5 py-4`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text}`}>
                  {currentTool.icon}
                </div>
                <div>
                  <h1 className="text-sm font-black text-zinc-100">{currentTool.label}</h1>
                  <p className="text-[11px] text-zinc-500">{currentTool.desc}</p>
                </div>
              </div>
              {hasResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyResult}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-white border border-white/[0.08] px-3 py-1.5 rounded-lg transition"
                  >
                    {copied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-white border border-white/[0.08] px-3 py-1.5 rounded-lg transition"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="bg-[#0a0a10] border border-white/[0.06] rounded-2xl p-5 space-y-4">

              {/* Summarizer input */}
              {activeTool === 'summarizer' && (
                <>
                  <label className="font-mono-vault text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Paste your text or notes</label>
                  <textarea
                    rows={6}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Paste lecture notes, textbook passages, or any study material here..."
                    className="w-full bg-black border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition resize-none"
                  />
                </>
              )}

              {/* Explainer input */}
              {activeTool === 'explainer' && (
                <>
                  <label className="font-mono-vault text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Topic or concept</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Dijkstra's algorithm, photosynthesis, Keynesian economics..."
                    className="w-full bg-black border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 transition"
                  />
                  <div>
                    <label className="font-mono-vault text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Explanation depth</label>
                    <div className="flex gap-2 mt-2">
                      {(['simple', 'deep'] as const).map(d => (
                        <button
                          key={d}
                          onClick={() => setDepth(d)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all capitalize ${depth === d ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-black border-white/[0.07] text-zinc-500 hover:border-white/20'}`}
                        >
                          {d === 'simple' ? '⚡ Simple' : '🔬 Deep Dive'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Quiz & Flashcard topic input */}
              {(activeTool === 'quiz' || activeTool === 'flashcards') && activeTool === 'quiz' && (
                <>
                  <label className="font-mono-vault text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Topic for quiz</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Database normalisation, Newton's laws, Binary search trees..."
                    className="w-full bg-black border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 transition"
                  />
                </>
              )}

              {activeTool === 'flashcards' && (
                <>
                  <label className="font-mono-vault text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Notes to convert</label>
                  <textarea
                    rows={5}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Paste bullet points, definitions, or any dense notes to convert into flip cards..."
                    className="w-full bg-black border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition resize-none"
                  />
                </>
              )}

              {/* Planner input */}
              {activeTool === 'planner' && (
                <>
                  <label className="font-mono-vault text-[10px] font-bold text-zinc-500 uppercase tracking-widest">What are you studying?</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Cryptography & Network Security for midterm exam..."
                    className="w-full bg-black border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/40 transition"
                  />
                  <div>
                    <label className="font-mono-vault text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available hours</label>
                    <div className="flex gap-2 mt-2">
                      {['1', '2', '3', '4', '6'].map(h => (
                        <button
                          key={h}
                          onClick={() => setPlanHours(h)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${planHours === h ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-black border-white/[0.07] text-zinc-500 hover:border-white/20'}`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Run button */}
              <button
                onClick={handleRun}
                disabled={loading || (
                  (activeTool === 'summarizer' || activeTool === 'flashcards') ? !input.trim() :
                  !topic.trim()
                )}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-30 ${c.active}`}
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Thinking...</>
                  : <><Send size={14} /> Run {currentTool.label}</>
                }
              </button>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="bg-[#0a0a10] border border-white/[0.06] rounded-2xl p-6 space-y-3 float-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-1 items-end h-8">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-amber-400/60 rounded-full bar-pulse"
                        style={{ height: `${6 + (i % 3) * 8}px`, animationDelay: `${i * 80}ms` }}
                      />
                    ))}
                  </div>
                  <span className="font-mono-vault text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Processing...</span>
                </div>
                {[80, 65, 90, 55].map((w, i) => (
                  <div key={i} className="h-3 rounded-full bg-white/[0.04] animate-pulse" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}

            {/* ── Results ── */}
            {!loading && hasResult && (

              <div className="float-up space-y-4">

                {/* SUMMARIZER result */}
                {result.summarizer && (
                  <div className="space-y-4">
                    <div className="bg-[#0a0a10] border border-amber-500/20 rounded-2xl p-5">
                      <p className="font-mono-vault text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-2">Main Idea</p>
                      <p className="text-base font-bold text-zinc-100 leading-snug">{result.summarizer.headline}</p>
                    </div>
                    <div className="bg-[#0a0a10] border border-white/[0.06] rounded-2xl p-5">
                      <p className="font-mono-vault text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Key Points</p>
                      <ul className="space-y-2.5">
                        {result.summarizer.keyPoints.map((pt, i) => (
                          <li key={i} className="flex gap-3 text-sm text-zinc-300">
                            <span className="font-mono-vault text-amber-400 text-[11px] font-black shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {result.summarizer.gaps.length > 0 && (
                      <div className="bg-[#0a0a10] border border-violet-500/15 rounded-2xl p-5">
                        <p className="font-mono-vault text-[9px] font-bold text-violet-500 uppercase tracking-widest mb-3">Knowledge Gaps to Explore</p>
                        <ul className="space-y-2">
                          {result.summarizer.gaps.map((g, i) => (
                            <li key={i} className="flex gap-2 text-xs text-zinc-400">
                              <Zap size={11} className="text-violet-400 shrink-0 mt-0.5" />{g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* EXPLAINER result */}
                {result.explainer && (
                  <div className="space-y-4">
                    <div className="bg-[#0a0a10] border border-violet-500/20 rounded-2xl p-5">
                      <p className="font-mono-vault text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-2">Plain Language</p>
                      <p className="text-sm text-zinc-300 leading-relaxed">{result.explainer.simple}</p>
                    </div>
                    {depth === 'deep' && (
                      <div className="bg-[#0a0a10] border border-white/[0.06] rounded-2xl p-5">
                        <p className="font-mono-vault text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Deep Dive</p>
                        <ul className="space-y-3">
                          {result.explainer.deep.map((pt, i) => (
                            <li key={i} className="flex gap-3 text-sm text-zinc-300 border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                              <span className="font-mono-vault text-violet-400 text-[10px] font-black shrink-0 mt-0.5">{String.fromCharCode(65 + i)}</span>
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* QUIZ result */}
                {result.quiz && <QuizPlayer questions={result.quiz} />}

                {/* FLASHCARDS result */}
                {result.flashcards && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-mono-vault text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{result.flashcards.length} Cards — tap to flip</p>
                      <span className="font-mono-vault text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">Spaced Repetition Ready</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.flashcards.map((card, i) => (
                        <FlipCard key={i} card={card} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                {/* PLANNER result */}
                {result.planner && (
                  <div className="space-y-3">
                    <div className="bg-[#0a0a10] border border-rose-500/20 rounded-2xl p-5 flex items-center justify-between">
                      <div>
                        <p className="font-mono-vault text-[9px] font-bold text-rose-400 uppercase tracking-widest mb-1">Study Plan</p>
                        <h3 className="text-sm font-black text-zinc-100">{result.planner.topic}</h3>
                      </div>
                      <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                        <Clock size={13} className="text-rose-400" />
                        <span className="font-mono-vault text-sm font-black text-rose-300">{result.planner.totalTime}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {result.planner.blocks.map((block, i) => (
                        <div key={i} className="bg-[#0a0a10] border border-white/[0.06] rounded-xl p-4 flex gap-4">
                          <div className="shrink-0">
                            <span className="font-mono-vault text-[10px] font-black text-zinc-600 bg-black border border-white/[0.06] px-2 py-1 rounded-lg whitespace-nowrap">{block.time}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-200">{block.task}</p>
                            <p className="text-[11px] text-rose-400/80 mt-0.5 flex gap-1.5">
                              <Lightbulb size={10} className="shrink-0 mt-0.5" />{block.tip}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Empty state */}
            {!loading && !hasResult && (
              <div className="bg-[#0a0a10] border border-white/[0.04] rounded-2xl p-14 text-center synaptic-bg">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <Brain size={22} className="text-zinc-700" />
                </div>
                <p className="text-sm font-bold text-zinc-500">Ready when you are</p>
                <p className="text-xs text-zinc-700 mt-1 max-w-[220px] mx-auto">Fill in the input above and hit Run to generate your study material.</p>
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  );
}