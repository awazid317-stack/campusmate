import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  AlertTriangle,
  CheckSquare,
  Code2,
  BookOpen,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { HistoryItem } from '../../types';
import { storageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';

interface HistoryViewProps {
  history: HistoryItem[];
  onRefresh: () => void;
  onLoadItem: (type: string, data: any) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onRefresh,
  onLoadItem,
}) => {
  const { showToast } = useToast();
  const [filterType, setFilterType] = useState<string>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredHistory = history.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const handleClear = () => {
    storageService.clearHistory();
    onRefresh();
    setConfirmClear(false);
    showToast('Local history successfully cleared.', 'info');
  };

  const handleExport = () => {
    const jsonStr = storageService.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusmate-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('History exported as JSON file.', 'success');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'mcq':
        return <CheckSquare className="w-4 h-4 text-blue-400" />;
      case 'coding':
        return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'short-answer':
        return <BookOpen className="w-4 h-4 text-violet-400" />;
      case 'college-chat':
        return <GraduationCap className="w-4 h-4 text-cyan-400" />;
      default:
        return <History className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            Learning & Activity History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review past generated MCQ quizzes, coding practice sessions, short answers, and campus assistant queries.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={() => setConfirmClear(true)}
              className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          </div>
        )}
      </div>

      {/* Browser Local Storage Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200 block">
            Client Browser Storage Notice
          </span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Your session history is stored privately in this browser's local storage (localStorage). It is never sent to a multi-user cloud database and may be cleared if you wipe your browser cookies or site data. You can download an offline JSON backup at any time.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        {[
          { id: 'all', label: `All Entries (${history.length})` },
          { id: 'mcq', label: `MCQs (${history.filter((i) => i.type === 'mcq').length})` },
          { id: 'coding', label: `Coding (${history.filter((i) => i.type === 'coding').length})` },
          { id: 'short-answer', label: `Short Answers (${history.filter((i) => i.type === 'short-answer').length})` },
          { id: 'college-chat', label: `Campus Inquiries (${history.filter((i) => i.type === 'college-chat').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-sm">No History Records Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Generate an MCQ test, attempt a coding challenge, or query the campus assistant to build your practice history.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">{item.title}</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.summary}
                  </p>
                  <div className="text-[10px] text-slate-300 mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => onLoadItem(item.type === 'college-chat' ? 'assistant' : item.type, item.data)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Re-open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    storageService.deleteHistoryItem(item.id);
                    onRefresh();
                    showToast('Entry deleted', 'info', 1500);
                  }}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Clear Local History?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This will wipe all {history.length} saved quiz attempts, coding sessions, and chats stored on this browser.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
