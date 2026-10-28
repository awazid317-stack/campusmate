import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Sparkles,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Share2,
  Clock,
  Filter,
} from 'lucide-react';
import { MCQSet, MCQQuestion, Difficulty } from '../../types';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';

interface MCQGeneratorProps {
  initialParams?: any;
  preferredDifficulty: Difficulty;
  defaultQuestionsCount: number;
}

export const MCQGenerator: React.FC<MCQGeneratorProps> = ({
  initialParams,
  preferredDifficulty,
  defaultQuestionsCount,
}) => {
  const { showToast } = useToast();

  // Form State
  const [subject, setSubject] = useState(initialParams?.subject || 'Computer Science');
  const [topic, setTopic] = useState(initialParams?.topic || 'Binary Search Trees & Balancing');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialParams?.difficulty || preferredDifficulty || 'Medium');
  const [count, setCount] = useState<number>(defaultQuestionsCount || 5);
  const [level, setLevel] = useState(initialParams?.level || 'Undergraduate');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Generation & Quiz State
  const [loading, setLoading] = useState(false);
  const [activeSet, setActiveSet] = useState<MCQSet | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [savedToHistory, setSavedToHistory] = useState(false);

  // Sync if initialParams changes
  useEffect(() => {
    if (initialParams) {
      if (initialParams.subject) setSubject(initialParams.subject);
      if (initialParams.topic) setTopic(initialParams.topic);
      if (initialParams.difficulty) setDifficulty(initialParams.difficulty);
      if (initialParams.questions) {
        // Loaded an existing quiz from history!
        setActiveSet(initialParams);
        setUserAnswers(initialParams.userAnswers || {});
        setIsSubmitted(!!initialParams.score !== undefined && initialParams.userAnswers !== undefined);
      }
    }
  }, [initialParams]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!subject.trim()) {
      showToast('Please enter a valid academic subject.', 'warning');
      return;
    }
    if (!topic.trim()) {
      showToast('Please specify a topic to test.', 'warning');
      return;
    }

    setLoading(true);
    setIsSubmitted(false);
    setUserAnswers({});
    setActiveQuestionIndex(0);
    setSavedToHistory(false);

    try {
      const generated = await apiService.generateMCQs({
        subject: subject.trim(),
        topic: topic.trim(),
        difficulty,
        count,
        level,
        additionalInstructions: additionalInstructions.trim() || undefined,
      });

      setActiveSet(generated);
      showToast(`Generated ${generated.questions.length} questions using ${generated.modelUsed || 'Gemma 4'}!`, 'success');
    } catch (err: any) {
      console.error('MCQ Generation error:', err);
      showToast(err.message || 'Failed to generate MCQs. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return; // Prevent change after submit
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeSet) return;
    const answeredCount = Object.keys(userAnswers).length;
    const totalCount = activeSet.questions.length;

    if (answeredCount < totalCount) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${totalCount} questions. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    // Calculate score
    let score = 0;
    activeSet.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    setIsSubmitted(true);
    const updatedSet: MCQSet = {
      ...activeSet,
      score,
      total: totalCount,
      userAnswers,
    };
    setActiveSet(updatedSet);

    // Save automatically to history
    storageService.addHistoryItem({
      type: 'mcq',
      title: `${activeSet.subject}: ${activeSet.topic} (${score}/${totalCount})`,
      summary: `Scored ${score}/${totalCount} (${Math.round((score / totalCount) * 100)}%) on ${activeSet.difficulty} level MCQ set.`,
      data: updatedSet,
    });
    setSavedToHistory(true);
    showToast(`Quiz submitted! Your score: ${score}/${totalCount}`, 'success');
  };

  const handleRetryQuiz = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setActiveQuestionIndex(0);
    showToast('Quiz reset! Try your best this time.', 'info');
  };

  // Filtered questions in post-submission review
  const questionsToReview = activeSet?.questions.filter((q) => {
    if (!isSubmitted || filterMode === 'all') return true;
    const isCorrect = userAnswers[q.id] === q.correctAnswer;
    return filterMode === 'correct' ? isCorrect : !isCorrect;
  }) || [];

  const currentQ = activeSet?.questions[activeQuestionIndex];
  const scorePercent = activeSet?.total ? Math.round(((activeSet.score || 0) / activeSet.total) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <CheckSquare className="w-6 h-6 text-indigo-400" />
              Multiple-Choice Question Generator
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
              Gemma 4 Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build customized, curriculum-aligned multiple choice tests with instant scoring and comprehensive rationale for each option.
          </p>
        </div>

        {activeSet && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveSet(null)}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Test Config
            </button>
          </div>
        )}
      </div>

      {/* Main Configuration Form (visible when no active quiz, or can be collapsed) */}
      {!activeSet && (
        <form onSubmit={handleGenerate} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Academic Subject <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science, Electronics, Calculus"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Computer Science', 'Data Structures & Algorithms', 'Operating Systems', 'Mathematics', 'Database Systems'].map((s) => (
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

            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Topic or Syllabus Sub-unit <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Binary Search Trees, Paging & Segmentation, Bayes Theorem"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Binary Search Trees', 'Graph Traversal (BFS/DFS)', 'Deadlocks & Semaphores', 'SQL Normalization (1NF-BCNF)'].map((t) => (
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
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty Level</label>
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
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Number of Questions</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      count === num
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Examination / Academic Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Undergraduate">Undergraduate (B.Tech / B.Sc)</option>
                <option value="Placement Aptitude">Placement / Technical Interviews</option>
                <option value="GATE / Competitive Exam">GATE / Graduate Exam Level</option>
                <option value="Postgraduate / Advanced">Postgraduate / Research</option>
              </select>
            </div>
          </div>

          {/* Additional instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Additional Instructions (Optional)
            </label>
            <input
              type="text"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="e.g. Focus on worst-case time complexities, include numerical problems, avoid trivial definitions"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Gemma 4 is synthesizing your question set...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                <span>Generate {count} MCQs with Gemma 4</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <div className="h-4 bg-slate-800 rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-slate-800/60 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-xs text-slate-400">
            Gemma 4 is constructing 4 distinct options, verifying the single correct answer, and writing educational rationales...
          </p>
        </div>
      )}

      {/* Active Quiz View */}
      {activeSet && !loading && (
        <div className="space-y-6">
          {/* Post-submission Score Dashboard Banner */}
          {isSubmitted && (
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center shrink-0 bg-slate-950">
                  <div className="text-center">
                    <span className="text-2xl font-black text-white">{scorePercent}%</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">Quiz Evaluation Completed</h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {scorePercent >= 80 ? 'Mastery Level' : scorePercent >= 60 ? 'Proficient' : 'Needs Review'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    You scored <strong className="text-white">{activeSet.score}</strong> out of{' '}
                    <strong className="text-white">{activeSet.total}</strong> correct on{' '}
                    <span className="text-indigo-300">{activeSet.topic}</span> ({activeSet.difficulty} level).
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleRetryQuiz}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  Retry This Quiz
                </button>
                <button
                  onClick={() => setActiveSet(null)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate Another Set
                </button>
              </div>
            </div>
          )}

          {/* Review Filter bar when submitted */}
          {isSubmitted && (
            <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Filter Questions:</span>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({activeSet.questions.length})
                </button>
                <button
                  onClick={() => setFilterMode('incorrect')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterMode === 'incorrect' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Incorrect ({activeSet.questions.length - (activeSet.score || 0)})
                </button>
                <button
                  onClick={() => setFilterMode('correct')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterMode === 'correct' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Correct ({activeSet.score || 0})
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Detailed explanations expanded below
              </div>
            </div>
          )}

          {/* Quiz Question Navigator & Progress */}
          <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {activeSet.subject}: {activeSet.topic}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{activeSet.difficulty}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Answered: {Object.keys(userAnswers).length} / {activeSet.questions.length}</span>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-5">
            {questionsToReview.map((q, idx) => {
              const originalIndex = activeSet.questions.findIndex((item) => item.id === q.id);
              const selectedOption = userAnswers[q.id];
              const isCorrect = selectedOption === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-5 sm:p-6 transition-all bg-slate-900/60 ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : 'border-rose-500/40 bg-rose-950/10'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {originalIndex + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                        {q.question}
                      </h3>
                    </div>

                    {isSubmitted && (
                      <div className="shrink-0">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const optText = q.options[optKey];
                      const isSelected = selectedOption === optKey;
                      const isActualCorrect = q.correctAnswer === optKey;

                      let buttonStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60';

                      if (isSubmitted) {
                        if (isActualCorrect) {
                          buttonStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium shadow-sm shadow-emerald-500/20';
                        } else if (isSelected && !isActualCorrect) {
                          buttonStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 line-through';
                        } else {
                          buttonStyle = 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60';
                        }
                      } else if (isSelected) {
                        buttonStyle = 'bg-indigo-600/20 border-indigo-500 text-white font-medium ring-1 ring-indigo-500';
                      }

                      return (
                        <button
                          key={optKey}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(q.id, optKey)}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs sm:text-sm transition-all ${buttonStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {optKey}
                          </span>
                          <span className="leading-snug pt-0.5">{optText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation (Revealed only after submission) */}
                  {isSubmitted && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Explanation & Rationale:</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-normal">
                        {q.explanation}
                      </p>
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                        Correct Answer:{' '}
                        <strong className="text-emerald-400">
                          Option {q.correctAnswer}: {q.options[q.correctAnswer]}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Actions Bar */}
          {!isSubmitted ? (
            <div className="sticky bottom-4 z-20 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-300">
                <span>{Object.keys(userAnswers).length} of {activeSet.questions.length} questions answered</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setUserAnswers({})}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  Clear Choices
                </button>
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4 text-cyan-300" />
                  Submit Answers & View Score
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={handleRetryQuiz}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                Retry Quiz
              </button>
              <button
                onClick={() => setActiveSet(null)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Generate New Questions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
