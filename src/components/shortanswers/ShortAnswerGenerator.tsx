import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Tag,
  CheckCircle2,
  Bookmark,
  Share2,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ShortAnswerSet, ShortAnswerQuestion, Difficulty, AnswerLength } from '../../types';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';

interface ShortAnswerGeneratorProps {
  initialParams?: any;
  preferredDifficulty: Difficulty;
}

export const ShortAnswerGenerator: React.FC<ShortAnswerGeneratorProps> = ({
  initialParams,
  preferredDifficulty,
}) => {
  const { showToast } = useToast();

  // Form State
  const [subject, setSubject] = useState(initialParams?.subject || 'Operating Systems');
  const [topic, setTopic] = useState(initialParams?.topic || 'Virtual Memory & Page Replacement');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialParams?.difficulty || preferredDifficulty || 'Medium');
  const [count, setCount] = useState<number>(4);
  const [length, setLength] = useState<AnswerLength>(initialParams?.length || 'Short');
  const [academicLevel, setAcademicLevel] = useState(initialParams?.academicLevel || 'Undergraduate');

  // Generator State
  const [loading, setLoading] = useState(false);
  const [activeSet, setActiveSet] = useState<ShortAnswerSet | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync if initialParams changes
  useEffect(() => {
    if (initialParams) {
      if (initialParams.subject) setSubject(initialParams.subject);
      if (initialParams.topic) setTopic(initialParams.topic);
      if (initialParams.difficulty) setDifficulty(initialParams.difficulty);
      if (initialParams.questions) {
        setActiveSet(initialParams);
        // Default reveal all when loaded from history
        const all: Record<string, boolean> = {};
        initialParams.questions.forEach((q: ShortAnswerQuestion) => {
          all[q.id] = true;
        });
        setRevealedAnswers(all);
      }
    }
  }, [initialParams]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim()) {
      showToast('Please provide an academic subject.', 'warning');
      return;
    }
    if (!topic.trim()) {
      showToast('Please provide a topic.', 'warning');
      return;
    }

    setLoading(true);
    setActiveSet(null);
    setRevealedAnswers({});

    try {
      const generated = await apiService.generateShortAnswers({
        subject: subject.trim(),
        topic: topic.trim(),
        difficulty,
        count,
        length,
        academicLevel,
      });

      setActiveSet(generated);
      showToast(`Generated ${generated.questions.length} revision questions!`, 'success');

      // Auto-save to history
      storageService.addHistoryItem({
        type: 'short-answer',
        title: `${subject}: ${topic} (${length})`,
        summary: `${generated.questions.length} ${length.toLowerCase()} revision questions with model answers.`,
        data: generated,
      });
    } catch (err: any) {
      console.error('Short answer generation error:', err);
      showToast(err.message || 'Failed to generate short answers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleRevealAll = (reveal: boolean) => {
    if (!activeSet) return;
    const updated: Record<string, boolean> = {};
    activeSet.questions.forEach((q) => {
      updated[q.id] = reveal;
    });
    setRevealedAnswers(updated);
  };

  const handleCopy = (q: ShortAnswerQuestion) => {
    const textToCopy = `Question: ${q.question}

Model Answer:
${q.modelAnswer}

Key Points:
${q.keyPoints.map((k) => `• ${k}`).join('\n')}

Terminology: ${q.terminology.join(', ')}
${q.example ? `Example: ${q.example}\n` : ''}
Explanation: ${q.explanation}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(q.id);
    showToast('Q&A copied to clipboard!', 'info', 2000);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-violet-400" />
              Short-Answer Revision Generator
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold">
              Gemma 4 Formatter
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Produce exam-ready model answers with essential grading bullet points, critical terminology, and analogies for university revision.
          </p>
        </div>

        {activeSet && (
          <button
            onClick={() => setActiveSet(null)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Q&A Setup
          </button>
        )}
      </div>

      {/* Generator Form */}
      {!activeSet && (
        <form onSubmit={handleGenerate} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Academic Subject <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems, Computer Networks, DBMS"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Operating Systems', 'Database Systems', 'Computer Networks', 'Software Engineering'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Topic or Concept <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Virtual Memory, TCP 3-Way Handshake, ACID Properties"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['TCP/IP vs OSI Layers', 'ACID Transactions & Isolation', 'Deadlock Detection & Prevention', 'Cache Coherence Protocols'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Answer Length */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expected Answer Length</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Very Short', 'Short', 'Detailed'] as AnswerLength[]).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setLength(len)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      length === len
                        ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-300 mt-1">
                {length === 'Very Short'
                  ? '1-2 concise sentences (20-40 words)'
                  : length === 'Short'
                  ? '1 high-yield paragraph (60-100 words)'
                  : 'Multi-point comprehensive breakdown'}
              </p>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      difficulty === d
                        ? d === 'Easy'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : d === 'Medium'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Question Count</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[3, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      count === num
                        ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Gemma 4 is curating model answers & scoring points...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                <span>Generate {count} Short-Answer Questions</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-xs text-slate-400">
            Formulating examination-grade questions, drafting model answers, and tagging key vocabulary...
          </p>
        </div>
      )}

      {/* Generated Q&A Display */}
      {activeSet && !loading && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{activeSet.subject}: {activeSet.topic}</span>
              <span className="text-slate-500">•</span>
              <span className="text-violet-300 font-medium">{activeSet.length} format</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{activeSet.difficulty}</span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => toggleRevealAll(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors flex items-center gap-1"
              >
                <Eye className="w-3 h-3 text-cyan-400" />
                Reveal All
              </button>
              <button
                type="button"
                onClick={() => toggleRevealAll(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors flex items-center gap-1"
              >
                <EyeOff className="w-3 h-3 text-slate-400" />
                Hide All
              </button>
            </div>
          </div>

          {/* Questions Cards */}
          <div className="space-y-4">
            {activeSet.questions.map((q, idx) => {
              const isRevealed = !!revealedAnswers[q.id];

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 transition-all hover:border-slate-700"
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        Q{idx + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                        {q.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(q)}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Copy Question & Model Answer"
                      >
                        {copiedId === q.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => toggleReveal(q.id)}
                        className="px-3 py-1.5 rounded-lg border border-violet-500/30 bg-violet-950/30 hover:bg-violet-900/40 text-violet-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isRevealed ? 'Hide Answer' : 'Reveal Answer'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Answer Body */}
                  {isRevealed && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                      {/* Model Answer */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Model Answer ({activeSet.length})
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                          {q.modelAnswer}
                        </p>
                      </div>

                      {/* Key Scoring Points */}
                      {q.keyPoints && q.keyPoints.length > 0 && (
                        <div>
                          <div className="text-xs font-bold text-indigo-300 mb-1.5 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-400" />
                            Key Points for Exam Scoring:
                          </div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {q.keyPoints.map((kp, i) => (
                              <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                                <span>{kp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Terminology Tags & Example */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Terminology */}
                        {q.terminology && q.terminology.length > 0 && (
                          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                            <span className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5 text-[11px]">
                              <Tag className="w-3 h-3 text-cyan-400" />
                              Key Technical Terminology:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {q.terminology.map((term, i) => (
                                <span key={i} className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                                  {term}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Concrete Example / Analogy */}
                        {q.example && (
                          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                            <span className="font-semibold text-slate-300 block mb-1 text-[11px]">
                              Real-World Example / Analogy:
                            </span>
                            <p className="text-slate-400 text-[11px] leading-relaxed italic">
                              "{q.example}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Concise Takeaway Explanation */}
                      <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                        <strong className="text-slate-300">Core Takeaway:</strong> {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveSet(null)}
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Another Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
