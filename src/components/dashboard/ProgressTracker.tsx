import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  CheckSquare,
  Code2,
  Flame,
  Award,
  Calendar,
  Sparkles,
  Info,
  RefreshCw,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { HistoryItem, ProgressSummary } from '../../types';
import { storageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';

interface ProgressTrackerProps {
  history: HistoryItem[];
  onRefreshHistory: () => void;
  onNavigate: (page: string, params?: any) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  history,
  onRefreshHistory,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [timeHorizon, setTimeHorizon] = useState<7 | 14 | 30>(7);
  const [showMCQ, setShowMCQ] = useState(true);
  const [showCoding, setShowCoding] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute progress summary from history
  const summary: ProgressSummary = useMemo(() => {
    return storageService.calculateProgressSummary(history, timeHorizon);
  }, [history, timeHorizon]);

  // Find max count for dynamic Y-axis scaling
  const maxDayCount = useMemo(() => {
    let max = 0;
    summary.points.forEach((p) => {
      const activeTotal = (showMCQ ? p.mcqCount : 0) + (showCoding ? p.codingCount : 0);
      if (activeTotal > max) max = activeTotal;
    });
    return Math.max(max, 5); // At least scale of 5 for visually pleasing grid
  }, [summary.points, showMCQ, showCoding]);

  // Chart dimensions
  const chartHeight = 180;
  const yTicks = [0, Math.ceil(maxDayCount * 0.25), Math.ceil(maxDayCount * 0.5), Math.ceil(maxDayCount * 0.75), maxDayCount];

  const handleSeedSample = () => {
    storageService.seedSampleProgress();
    onRefreshHistory();
    showToast('Loaded 7-day sample study activity to visualize chart!', 'success');
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-6">
      {/* Top Header & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Learning Progress & Practice Volume
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Interactive Bar Chart
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize your completed MCQs and evaluated coding challenges over time.
          </p>
        </div>

        {/* Controls: Time horizon & Sample data */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {history.length < 3 && (
            <button
              onClick={handleSeedSample}
              className="px-2.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Populate sample study log to view full chart curve"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Load Sample History</span>
            </button>
          )}

          {/* Time Filter Pills */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTimeHorizon(days as any)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  timeHorizon === days
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Key Metric Metric Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* MCQs Completed */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
              MCQs Solved
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
              {summary.overallMCQAccuracy}% Acc
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {summary.totalMCQsCompleted}
          </div>
          <p className="text-[10px] text-slate-400">Questions answered in tests</p>
        </div>

        {/* Coding Challenges */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              Code Challenges
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
              {summary.overallCodingAverageScore}/100 Avg
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {summary.totalCodingCompleted}
          </div>
          <p className="text-[10px] text-slate-400">Reviewed with Gemma 4</p>
        </div>

        {/* Practice Streak */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              Daily Streak
            </span>
            <span className="text-[10px] font-bold text-amber-400">
              {summary.currentDayStreak > 0 ? 'Active 🔥' : 'Start Today'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {summary.currentDayStreak} <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
          <p className="text-[10px] text-slate-400">Consistent learning streak</p>
        </div>

        {/* Consistency Rating */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-violet-400" />
              Study Consistency
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {summary.activeDaysCount}/{timeHorizon}d
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100 truncate">
            {summary.activeDaysCount >= 5 ? 'Mastery Scholar' : summary.activeDaysCount >= 2 ? 'Active Learner' : 'Getting Started'}
          </div>
          <p className="text-[10px] text-slate-400">Days active in selected window</p>
        </div>
      </div>

      {/* Chart Legend & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowMCQ(!showMCQ)}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all ${
              showMCQ
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-300 font-semibold'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-3 h-3 rounded bg-blue-500 shrink-0"></span>
            <span>MCQs Completed</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCoding(!showCoding)}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all ${
              showCoding
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-semibold'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-3 h-3 rounded bg-emerald-500 shrink-0"></span>
            <span>Coding Challenges</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          Hover over any bar to view daily activity breakdown
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="relative pt-4 pb-2">
        {/* Y-Axis Gridlines & Reference Numbers */}
        <div className="absolute inset-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none pr-4">
          {[...yTicks].reverse().map((tick, idx) => (
            <div key={idx} className="flex items-center w-full">
              <span className="w-6 text-[10px] font-mono text-slate-500 text-right pr-2">
                {tick}
              </span>
              <div className="flex-1 border-b border-slate-800/60"></div>
            </div>
          ))}
        </div>

        {/* Bars Grid */}
        <div className="relative pl-8 pr-2 h-[200px] flex items-end justify-between gap-1 sm:gap-2">
          {summary.points.map((pt, idx) => {
            const mcqHeight = showMCQ && maxDayCount > 0 ? (pt.mcqCount / maxDayCount) * chartHeight : 0;
            const codingHeight = showCoding && maxDayCount > 0 ? (pt.codingCount / maxDayCount) * chartHeight : 0;
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={pt.dateKey}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                {/* Hover Tooltip Card */}
                {isHovered && (
                  <div className="absolute bottom-[calc(100%+8px)] z-30 w-44 p-2.5 rounded-xl bg-slate-950/95 border border-indigo-500/40 shadow-xl text-xs space-y-1.5 backdrop-blur-md pointer-events-none animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-white text-[11px]">
                        {pt.dateShort} {pt.isToday && '(Today)'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{pt.dayLabel}</span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-blue-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          MCQs:
                        </span>
                        <span className="font-bold font-mono">{pt.mcqCount}</span>
                      </div>

                      <div className="flex items-center justify-between text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Coding:
                        </span>
                        <span className="font-bold font-mono">{pt.codingCount}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 font-semibold text-slate-200">
                        <span>Total Volume:</span>
                        <span className="text-indigo-300 font-mono">{pt.totalCount} items</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bars side-by-side or stacked */}
                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-[180px] pb-1">
                  {/* MCQ Bar */}
                  {showMCQ && (
                    <div
                      style={{ height: `${Math.max(mcqHeight, pt.mcqCount > 0 ? 6 : 0)}px` }}
                      className={`w-full max-w-[18px] sm:max-w-[24px] rounded-t-md transition-all duration-300 ${
                        pt.mcqCount > 0
                          ? isHovered
                            ? 'bg-blue-400 shadow-lg shadow-blue-500/30'
                            : 'bg-gradient-to-t from-blue-700 via-blue-600 to-indigo-500'
                          : 'bg-transparent'
                      }`}
                    />
                  )}

                  {/* Coding Bar */}
                  {showCoding && (
                    <div
                      style={{ height: `${Math.max(codingHeight, pt.codingCount > 0 ? 6 : 0)}px` }}
                      className={`w-full max-w-[18px] sm:max-w-[24px] rounded-t-md transition-all duration-300 ${
                        pt.codingCount > 0
                          ? isHovered
                            ? 'bg-emerald-400 shadow-lg shadow-emerald-500/30'
                            : 'bg-gradient-to-t from-emerald-700 via-emerald-600 to-teal-400'
                          : 'bg-transparent'
                      }`}
                    />
                  )}
                </div>

                {/* X-Axis Date Label */}
                <div
                  className={`mt-2 text-[10px] text-center font-medium truncate max-w-full ${
                    pt.isToday
                      ? 'text-indigo-400 font-bold'
                      : isHovered
                      ? 'text-white'
                      : 'text-slate-500'
                  }`}
                >
                  {timeHorizon === 7 ? pt.dayLabel : pt.dateShort.split(' ')[1]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer Callouts */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-time tracking: every quiz submitted & code solution evaluated updates your live study log.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('mcq')}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold flex items-center gap-1 transition-colors text-[11px]"
          >
            <span>Practice MCQs</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onNavigate('coding')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1 transition-colors text-[11px]"
          >
            <span>Solve Coding Challenge</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
