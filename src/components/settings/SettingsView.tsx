import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  School,
  Code2,
  Gauge,
  Sparkles,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Shield,
  Layers,
  Save,
  Info,
} from 'lucide-react';
import { AppSettings, ProgrammingLanguage, Difficulty, ModelStatusResponse } from '../../types';
import { storageService } from '../../services/storage';
import { apiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearHistory: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
}) => {
  const { showToast } = useToast();

  const [preferredModel, setPreferredModel] = useState(settings.preferredModel || 'gemma-4-26b-a4b-it');
  const [preferredLanguage, setPreferredLanguage] = useState<ProgrammingLanguage>(settings.preferredLanguage || 'Python');
  const [preferredDifficulty, setPreferredDifficulty] = useState<Difficulty>(settings.preferredDifficulty || 'Medium');
  const [defaultQuestionsCount, setDefaultQuestionsCount] = useState<number>(settings.defaultQuestionsCount || 5);
  const [collegeName, setCollegeName] = useState(settings.collegeName || 'Apex Institute of Technology');

  // Benchmark / Status state
  const [testingModel, setTestingModel] = useState(false);
  const [testResult, setTestResult] = useState<ModelStatusResponse | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      preferredModel,
      preferredLanguage,
      preferredDifficulty,
      defaultQuestionsCount,
      collegeName: collegeName.trim() || 'University Campus',
    };
    storageService.saveSettings(updated);
    onUpdateSettings(updated);
    showToast('Preferences updated successfully!', 'success');
  };

  const handleTestConnection = async () => {
    setTestingModel(true);
    setTestResult(null);
    try {
      const status = await apiService.getModelStatus();
      setTestResult(status);
      showToast(`Model online! Latency: ${status.latencyMs}ms`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Connection test failed.', 'error');
    } finally {
      setTestingModel(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-400" />
          Application & Model Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure preferred AI models, default languages, examination preferences, and your institution identity.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Configuration Card */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Primary AI Inference Engine
            </h2>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingModel}
              className="px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {testingModel ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Gauge className="w-3.5 h-3.5" />}
              <span>Test Live Latency</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The platform is engineered around Google's <strong>Gemma 4</strong> model (<code className="text-indigo-300 font-mono">gemma-4-26b-a4b-it</code>), with native fallback to Gemini 3.8 Flash for maximum uptime.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPreferredModel('gemma-4-26b-a4b-it')}
              className={`p-4 rounded-xl border text-left transition-all ${
                preferredModel === 'gemma-4-26b-a4b-it'
                  ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white">Google Gemma 4 (Primary)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Verified
                </span>
              </div>
              <div className="text-[11px] font-mono text-indigo-300">gemma-4-26b-a4b-it</div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Instruction-tuned Gemma 4 model with verified structured JSON response generation.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPreferredModel('gemini-3.8-flash')}
              className={`p-4 rounded-xl border text-left transition-all ${
                preferredModel === 'gemini-3.8-flash'
                  ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white">Gemini 3.8 Flash (High Speed)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Alternative
                </span>
              </div>
              <div className="text-[11px] font-mono text-cyan-300">gemini-3.8-flash</div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Ultra-fast reasoning model for high throughput and rapid responses.
              </p>
            </button>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">Engine Healthy & Responsive</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-slate-300 text-[11px]">
                <span>Status: {testResult.status}</span>
                <span>Latency: {testResult.latencyMs}ms</span>
              </div>
            </div>
          )}
        </div>

        {/* Institution & Campus Context */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <School className="w-4 h-4 text-cyan-400" />
            Institution & Campus Branding
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              College or University Name
            </label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. Apex Institute of Technology, Stanford University"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used in the college assistant, document requisition guidance, and top navigation header.
            </p>
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            Academic & Coding Defaults
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Programming Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as ProgrammingLanguage)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Python">Python 3</option>
                <option value="C++">C++ (GCC 14)</option>
                <option value="Java">Java (OpenJDK 21)</option>
                <option value="JavaScript">JavaScript (ES2024)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Difficulty
              </label>
              <select
                value={preferredDifficulty}
                onChange={(e) => setPreferredDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default MCQ Count
              </label>
              <select
                value={defaultQuestionsCount}
                onChange={(e) => setDefaultQuestionsCount(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visual Theme Info */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Visual Theme
          </h2>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-white">Modern Obsidian Dark Theme</span>
              <p className="text-[11px] text-slate-400">
                Deep navy, charcoal, and neon cyan accents optimized for high contrast and student focus.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              Active Default
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onClearHistory}
            className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All Saved History
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
