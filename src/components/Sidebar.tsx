import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Code2,
  BookOpen,
  GraduationCap,
  History,
  Settings,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & quick actions',
    },
    {
      id: 'mcq',
      label: 'MCQ Generator',
      icon: CheckSquare,
      badge: 'Interactive',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'Custom quizzes with scoring',
    },
    {
      id: 'coding',
      label: 'Coding Practice',
      icon: Code2,
      badge: 'Static Review',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Code challenges & AI feedback',
    },
    {
      id: 'short-answers',
      label: 'Short Answers',
      icon: BookOpen,
      badge: 'Revision',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      description: 'High-yield exam points',
    },
    {
      id: 'assistant',
      label: 'College Assistant',
      icon: GraduationCap,
      badge: 'Grounded',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'Campus services & procedures',
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      description: 'Saved quizzes & sessions',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Models, language & prefs',
    },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-950/95 border-r border-slate-800/80 w-64 p-4">
      {/* Navigation Links */}
      <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
          Learning & Campus Tools
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group text-left ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-violet-600/10 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Safety & Model Info Card */}
      <div className="pt-4 mt-auto border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Gemma 4 Intelligence</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Strict campus verification grounding enabled. Zero fabricated phone numbers or policies.
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-400">
            <Shield className="w-3 h-3" />
            <span>Sandboxed Code Review</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex-1 max-w-xs w-full animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
