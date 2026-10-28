import React, { useState, useEffect } from 'react';
import {
  Code2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Play,
  Shield,
  Clock,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  CodingPracticeSet,
  CodingProblem,
  ProgrammingLanguage,
  Difficulty,
  CodingMode,
  CodeReviewResult,
} from '../../types';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';

interface CodingPracticeProps {
  initialParams?: any;
  preferredLanguage: ProgrammingLanguage;
  preferredDifficulty: Difficulty;
}

const STARTER_CODE_TEMPLATES: Record<ProgrammingLanguage, string> = {
  Python: `def solution():
    # Write your solution here
    pass

# Example test run
if __name__ == '__main__':
    print(solution())
`,
  'C++': `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    void solve() {
        // Write your solution here
    }
};

int main() {
    Solution s;
    s.solve();
    return 0;
}
`,
  Java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // Write your solution here
        System.out.println("Solution initialized");
    }
}
`,
  JavaScript: `/**
 * Problem Solution
 * @param {any} input
 * @return {any}
 */
function solve(input) {
  // Write your solution here
  return input;
}

console.log(solve("test"));
`,
};

export const CodingPractice: React.FC<CodingPracticeProps> = ({
  initialParams,
  preferredLanguage,
  preferredDifficulty,
}) => {
  const { showToast } = useToast();

  // Form State
  const [language, setLanguage] = useState<ProgrammingLanguage>(initialParams?.language || preferredLanguage || 'Python');
  const [topic, setTopic] = useState(initialParams?.topic || 'Two Pointers & Arrays');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialParams?.difficulty || preferredDifficulty || 'Medium');
  const [count, setCount] = useState<number>(1);
  const [mode, setMode] = useState<CodingMode>('Placement Prep');

  // Active Problems State
  const [loading, setLoading] = useState(false);
  const [activeSet, setActiveSet] = useState<CodingPracticeSet | null>(null);
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);

  // Editor State
  const [studentCode, setStudentCode] = useState<string>(STARTER_CODE_TEMPLATES[language]);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Review State
  const [evaluating, setEvaluating] = useState(false);
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);

  // Sync if initialParams changes
  useEffect(() => {
    if (initialParams) {
      if (initialParams.language) setLanguage(initialParams.language);
      if (initialParams.topic) setTopic(initialParams.topic);
      if (initialParams.difficulty) setDifficulty(initialParams.difficulty);
      if (initialParams.problems) {
        setActiveSet(initialParams);
      }
    }
  }, [initialParams]);

  // When language changes and student hasn't heavily modified, reset template
  useEffect(() => {
    if (!activeSet) {
      setStudentCode(STARTER_CODE_TEMPLATES[language]);
    }
  }, [language, activeSet]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      showToast('Please specify a coding topic.', 'warning');
      return;
    }

    setLoading(true);
    setActiveSet(null);
    setReviewResult(null);
    setShowSolution(false);
    setRevealedHints({});
    setActiveProblemIndex(0);

    try {
      const generated = await apiService.generateCodingQuestions({
        language,
        topic: topic.trim(),
        difficulty,
        count,
        mode,
      });

      setActiveSet(generated);
      setStudentCode(STARTER_CODE_TEMPLATES[language]);
      showToast(`Generated ${generated.problems.length} challenge(s) in ${language}!`, 'success');

      // Auto-save generation to history
      storageService.addHistoryItem({
        type: 'coding',
        title: `${language}: ${generated.problems[0]?.title || topic}`,
        summary: `${difficulty} difficulty practice on ${topic} (${mode})`,
        data: generated,
      });
    } catch (err: any) {
      console.error('Coding generation error:', err);
      showToast(err.message || 'Failed to generate coding challenges.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentProblem: CodingProblem | undefined = activeSet?.problems[activeProblemIndex];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    showToast('Code copied to clipboard!', 'info', 2000);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetCode = () => {
    setStudentCode(STARTER_CODE_TEMPLATES[language]);
    setReviewResult(null);
    showToast('Editor reset to template.', 'info');
  };

  const handleReviewCode = async () => {
    if (!currentProblem) return;
    if (!studentCode.trim() || studentCode === STARTER_CODE_TEMPLATES[language]) {
      showToast('Please write your implementation before requesting review.', 'warning');
      return;
    }

    setEvaluating(true);
    try {
      const review = await apiService.reviewCode({
        problemTitle: currentProblem.title,
        problemStatement: currentProblem.statement,
        constraints: currentProblem.constraints,
        sampleTestCases: currentProblem.sampleTestCases,
        language,
        studentCode,
      });

      setReviewResult(review);
      showToast('Gemma 4 static analysis completed!', 'success');

      // Record to history for progress tracking
      storageService.addHistoryItem({
        type: 'coding',
        title: `${language}: ${currentProblem.title} (${review.score}/100)`,
        summary: `Static review completed with score ${review.score}/100 — ${review.isCorrectEstimate ? 'Correct' : 'Needs attention'}.`,
        data: {
          problem: currentProblem,
          studentCode,
          review,
          language,
          problems: [currentProblem],
        },
      });
    } catch (err: any) {
      console.error('Review code error:', err);
      showToast(err.message || 'Failed to review code.', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const toggleHint = (index: number) => {
    setRevealedHints((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Code2 className="w-6 h-6 text-emerald-400" />
              Interactive Coding Practice & AI Review
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Gemma 4 Judge
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Algorithmic challenges with strict constraints, sample cases, and sandboxed AI static analysis without executing unsafe code on the server.
          </p>
        </div>

        {activeSet && (
          <button
            onClick={() => setActiveSet(null)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Problem Setup
          </button>
        )}
      </div>

      {/* Generator Form */}
      {!activeSet && (
        <form onSubmit={handleGenerate} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-5">
          {/* Row 1: Language & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Programming Language
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Python', 'C++', 'Java', 'JavaScript'] as ProgrammingLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      language === lang
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Algorithmic Topic <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Dynamic Programming, Two Pointers, Trees, Graphs, Sorting"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Arrays & Two Pointers', 'Sliding Window', 'Binary Search', 'Trees & BST', 'Dynamic Programming', 'Graph Traversal'].map((t) => (
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

          {/* Row 2: Difficulty, Count, Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Challenge Count</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      count === num
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {num} Problem{num > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Practice Objective</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as CodingMode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Placement Prep">Campus Placement Interview</option>
                <option value="Exam Prep">University Lab / Semester Exam</option>
                <option value="Concept Practice">Core Concept Practice</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Gemma 4 is synthesizing constraints & test cases...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                <span>Generate Coding Challenge</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-xs text-slate-400">
            Gemma 4 is designing input formats, edge constraints, sample traces, and optimal reference code...
          </p>
        </div>
      )}

      {/* Active Coding Challenge Workspace */}
      {activeSet && currentProblem && (
        <div className="space-y-6">
          {/* Problem Selector (if multiple problems) */}
          {activeSet.problems.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {activeSet.problems.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProblemIndex(idx);
                    setReviewResult(null);
                    setShowSolution(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeProblemIndex === idx
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Problem {idx + 1}: {p.title}
                </button>
              ))}
            </div>
          )}

          {/* Two-Column Grid: Problem Statement (Left) vs Code Editor & Review (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Problem Details (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                {/* Title & Badges */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        activeSet.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : activeSet.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {activeSet.difficulty}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {activeSet.language}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {activeSet.mode}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {currentProblem.title}
                  </h2>
                </div>

                {/* Problem Statement */}
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800 pt-3">
                  {currentProblem.statement}
                </div>

                {/* Input & Output Format */}
                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">Input Format:</span>
                    <p className="text-slate-400 mt-0.5">{currentProblem.inputFormat}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Output Format:</span>
                    <p className="text-slate-400 mt-0.5">{currentProblem.outputFormat}</p>
                  </div>
                </div>

                {/* Constraints */}
                <div className="pt-2 border-t border-slate-800 text-xs">
                  <span className="font-semibold text-slate-200 mb-1.5 block">Constraints:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentProblem.constraints.map((c, i) => (
                      <span key={i} className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expected Complexities */}
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500">Time:</span>{' '}
                    <span className="text-cyan-400 font-semibold">{currentProblem.expectedTimeComplexity || 'O(n)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Space:</span>{' '}
                    <span className="text-violet-400 font-semibold">{currentProblem.expectedSpaceComplexity || 'O(1)'}</span>
                  </div>
                </div>

                {/* Sample Test Cases */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <span className="font-semibold text-xs text-slate-200 block">Sample Test Cases:</span>
                  {currentProblem.sampleTestCases.map((tc, i) => (
                    <div key={i} className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-xs space-y-1.5">
                      <div className="font-semibold text-indigo-400 text-[11px]">Example {i + 1}:</div>
                      <div className="font-mono bg-slate-900 p-2 rounded text-[11px]">
                        <span className="text-slate-400">Input: </span>
                        <span className="text-slate-200">{tc.input}</span>
                      </div>
                      <div className="font-mono bg-slate-900 p-2 rounded text-[11px]">
                        <span className="text-slate-400">Output: </span>
                        <span className="text-emerald-400">{tc.output}</span>
                      </div>
                      {tc.explanation && (
                        <p className="text-[11px] text-slate-400 italic pt-1">
                          Explanation: {tc.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Collapsible Hints */}
                {currentProblem.hints && currentProblem.hints.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      Progressive Hints
                    </span>
                    {currentProblem.hints.map((hint, i) => (
                      <div key={i} className="rounded-xl border border-slate-800/80 overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => toggleHint(i)}
                          className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-900 text-slate-300 font-medium transition-colors"
                        >
                          <span>Hint {i + 1}</span>
                          {revealedHints[i] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {revealedHints[i] && (
                          <div className="p-3 bg-slate-900/60 text-slate-300 leading-relaxed border-t border-slate-800/80 text-[11px]">
                            {hint}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Solution Reveal Button */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowSolution(!showSolution)}
                    className="w-full py-2 px-3 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showSolution ? 'Hide Reference Solution' : 'Reveal Reference Solution & Explanation'}</span>
                  </button>

                  {showSolution && (
                    <div className="mt-3 rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3 animate-in fade-in duration-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">Official Solution ({activeSet.language})</span>
                        <button
                          onClick={() => handleCopy(currentProblem.solution)}
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                      </div>
                      <pre className="font-mono text-[11px] text-emerald-300 bg-slate-900 p-3 rounded-lg overflow-x-auto leading-relaxed max-h-60">
                        {currentProblem.solution}
                      </pre>
                      <div className="text-slate-300 text-[11px] leading-relaxed pt-2 border-t border-slate-800">
                        <strong className="text-indigo-300 block mb-1">Algorithm Breakdown:</strong>
                        {currentProblem.solutionExplanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Code Editor & Sandboxed Review (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
                {/* Editor Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="font-semibold text-xs text-white">Student Solution Workspace</span>
                    <span className="text-[11px] font-mono text-slate-400">({activeSet.language})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCode}
                      className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                      title="Reset editor"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                    <button
                      onClick={() => handleCopy(studentCode)}
                      className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </div>
                </div>

                {/* Code Textarea with line numbers */}
                <div className="relative rounded-xl bg-slate-950 border border-slate-800/90 font-mono text-xs overflow-hidden">
                  <textarea
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    rows={16}
                    spellCheck={false}
                    className="w-full bg-transparent p-4 text-slate-200 placeholder-slate-600 focus:outline-none resize-y leading-relaxed font-mono selection:bg-indigo-500/30"
                    placeholder={`Write your ${activeSet.language} solution here...`}
                  />
                </div>

                {/* Security Note & Evaluate Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Safe Static Analysis: Host never executes arbitrary student code.</span>
                  </div>

                  <button
                    onClick={handleReviewCode}
                    disabled={evaluating}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Gemma 4 Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Evaluate Solution with Gemma 4</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Review Results Panel */}
                {reviewResult && (
                  <div className="mt-4 rounded-xl border border-emerald-500/30 bg-slate-950 p-4 space-y-4 animate-in fade-in duration-200">
                    {/* Verdict Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            reviewResult.score >= 75
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : reviewResult.score >= 50
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {reviewResult.score}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">
                            {reviewResult.isCorrectEstimate ? 'Algorithm Structurally Sound' : 'Logic Revisions Needed'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Estimated Accuracy Score: {reviewResult.score}/100
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                        Evaluated by Gemma 4
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {reviewResult.summary}
                    </p>

                    {/* Complexity Analysis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-400 text-[10px] block">Estimated Time Complexity</span>
                        <span className="font-mono font-semibold text-cyan-300 text-xs">
                          {reviewResult.timeComplexityAnalysis}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-400 text-[10px] block">Estimated Space Complexity</span>
                        <span className="font-mono font-semibold text-violet-300 text-xs">
                          {reviewResult.spaceComplexityAnalysis}
                        </span>
                      </div>
                    </div>

                    {/* Sample Case Breakdown */}
                    {reviewResult.sampleCaseEvaluation && reviewResult.sampleCaseEvaluation.length > 0 && (
                      <div className="space-y-1.5 text-xs">
                        <span className="font-semibold text-slate-300 text-[11px] block">
                          Sample Test Case Trace:
                        </span>
                        {reviewResult.sampleCaseEvaluation.map((sc, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-lg border text-[11px] flex items-start justify-between gap-3 ${
                              sc.status === 'PASS'
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                                : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                            }`}
                          >
                            <div>
                              <span className="font-bold">Case #{sc.caseNumber}:</span> {sc.notes}
                            </div>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                sc.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {sc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Edge Cases & Bugs */}
                    {reviewResult.potentialBugsOrEdgeCases && reviewResult.potentialBugsOrEdgeCases.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="font-semibold text-amber-300 text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Potential Edge Cases & Vulnerabilities:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px] pl-1">
                          {reviewResult.potentialBugsOrEdgeCases.map((bug, i) => (
                            <li key={i}>{bug}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {reviewResult.improvementSuggestions && reviewResult.improvementSuggestions.length > 0 && (
                      <div className="space-y-1 text-xs pt-1 border-t border-slate-800">
                        <span className="font-semibold text-indigo-300 text-[11px] block">
                          Actionable Optimizations:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px] pl-1">
                          {reviewResult.improvementSuggestions.map((sug, i) => (
                            <li key={i}>{sug}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
