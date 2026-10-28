import React from 'react';
import {
  CheckSquare,
  Code2,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { HistoryItem } from '../types';
import { ProgressTracker } from './dashboard/ProgressTracker';

interface DashboardProps {
  collegeName: string;
  activeModel: string;
  onNavigate: (page: string, params?: any) => void;
  recentHistory: HistoryItem[];
  onRefreshHistory?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  collegeName,
  activeModel,
  onNavigate,
  recentHistory,
  onRefreshHistory,
}) => {
  const featureCards = [
    {
      id: 'mcq',
      title: 'MCQ Question Generator',
      subtitle: 'Timed Practice & Comprehensive Explanations',
      description:
        'Generate custom multiple-choice quizzes with 4 options per question, instant score evaluation, and in-depth rationale for correct and distractor choices.',
      icon: CheckSquare,
      gradient: 'from-blue-600/20 via-indigo-600/10 to-transparent',
      borderColor: 'border-blue-500/30 hover:border-blue-400/60',
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      badge: 'Interactive Scoring',
      actionText: 'Start Quiz',
    },
    {
      id: 'coding',
      title: 'Coding Practice & Review',
      subtitle: 'Algorithmic Challenges with Gemma 4 Review',
      description:
        'Practice data structures and algorithms across Python, C++, Java, and JavaScript with sample cases, constraints, hints, and static AI code evaluation.',
      icon: Code2,
      gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400/60',
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Zero Arbitrary Host Exec',
      actionText: 'Solve Problems',
    },
    {
      id: 'short-answers',
      title: 'Short-Answer Generator',
      subtitle: 'High-Yield Exam Prep & Terminology',
      description:
        'Produce concise or detailed answers for semester exams, with bulleted key grading points, technical terminology tags, and concrete analogies.',
      icon: BookOpen,
      gradient: 'from-violet-600/20 via-purple-600/10 to-transparent',
      borderColor: 'border-violet-500/30 hover:border-violet-400/60',
      iconColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      badge: 'Model Answers',
      actionText: 'Generate Answers',
    },
    {
      id: 'assistant',
      title: 'Campus Information Assistant',
      subtitle: 'Grounded Guidance on College Services',
      description:
        'Inquire about ID card replacements, bonafide certificates, library timings, placements, student clubs, and examination schedules with zero fabricated data.',
      icon: GraduationCap,
      gradient: 'from-cyan-600/20 via-sky-600/10 to-transparent',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400/60',
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      badge: 'Strict Grounding',
      actionText: 'Ask Assistant',
    },
  ];

  const quickActions = [
    {
      label: 'DSA: Binary Search MCQs',
      target: 'mcq',
      params: { subject: 'Computer Science', topic: 'Binary Search & Divide and Conquer', difficulty: 'Medium' },
    },
    {
      label: 'Python: Array Two Sum',
      target: 'coding',
      params: { language: 'Python', topic: 'Two Sum & Hash Maps', difficulty: 'Easy' },
    },
    {
      label: 'OS: Virtual Memory & Paging',
      target: 'short-answers',
      params: { subject: 'Operating Systems', topic: 'Virtual Memory, TLB and Page Faults', length: 'Short' },
    },
    {
      label: 'Campus: Bonafide Certificate Steps',
      target: 'assistant',
      params: { initialPrompt: 'What is the step-by-step process for getting a bonafide certificate for an education loan?' },
    },
    {
      label: 'Campus: Central Library Timings & Rules',
      target: 'assistant',
      params: { initialPrompt: 'What are the central library timings on weekdays and during exam weeks?' },
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/40 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-16 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Powered by Google Gemma 4 Intelligence</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-400 font-mono">Engine Verified</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">CampusMate AI</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Your unified academic copilot for examination prep, interactive coding challenges, concept revision, and verified campus service information at <span className="font-semibold text-indigo-300">{collegeName}</span>.
          </p>

          {/* Quick Stats Banner */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Hallucinated Campus Contacts</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Gemma 4 Structured Responses</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Full Quiz Scoring & Explanations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            Quick Launch Prompts
          </h2>
          <span className="text-xs text-slate-300">Click any card to start instantly</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={() => onNavigate(qa.target, qa.params)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm group"
            >
              <span>{qa.label}</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Progress Tracking Dashboard: Bar Chart Visualization */}
      <ProgressTracker
        history={recentHistory}
        onRefreshHistory={onRefreshHistory || (() => {})}
        onNavigate={onNavigate}
      />

      {/* Four Primary Feature Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Core Academic & Campus Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className={`group relative overflow-hidden rounded-2xl border ${card.borderColor} bg-slate-900/60 p-6 transition-all duration-300 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer flex flex-col justify-between`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center p-2.5 ${card.iconColor} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">
                    {card.title}
                  </h3>
                  <div className="text-xs text-indigo-400/90 font-medium mt-0.5 mb-2">
                    {card.subtitle}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>{card.actionText}</span>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Model Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Panel */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent Learning Activity
            </h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View Full History →
            </button>
          </div>

          {recentHistory.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto mb-2 text-slate-400">
                <Clock className="w-5 h-5" />
              </div>
              <p>No recent activity yet. Choose a module above to start practicing!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentHistory.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate(item.type === 'college-chat' ? 'assistant' : item.type, item.data)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/50 cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <div>
                      <div className="font-semibold text-slate-200">{item.title}</div>
                      <div className="text-[11px] text-slate-300 truncate max-w-md">{item.summary}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-300 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Model & Security Guardrails Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Active AI Architecture
          </h3>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Primary Model:</span>
              <span className="font-mono font-semibold text-indigo-300">gemma-4-26b-a4b-it</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Model Family:</span>
              <span className="text-slate-200">Google Gemma 4 (Instruction Tuned)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Format Mode:</span>
              <span className="text-emerald-400 font-mono">application/json</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Fallback Engine:</span>
              <span className="text-slate-400 font-mono">gemini-3.8-flash</span>
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-slate-400">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Grounding checks against official campus database</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Student code evaluated via static algorithmic review</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Answers validated for non-duplication and schema compliance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
