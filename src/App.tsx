import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MCQGenerator } from './components/mcq/MCQGenerator';
import { CodingPractice } from './components/coding/CodingPractice';
import { ShortAnswerGenerator } from './components/shortanswers/ShortAnswerGenerator';
import { CollegeAssistant } from './components/assistant/CollegeAssistant';
import { HistoryView } from './components/history/HistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { storageService, DEFAULT_SETTINGS } from './services/storage';
import { AppSettings, HistoryItem } from './types';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [pageParams, setPageParams] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [history, setHistory] = useState<HistoryItem[]>(storageService.getHistory());

  const refreshHistory = () => {
    setHistory(storageService.getHistory());
  };

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileOpen(false);
  };

  const handleLoadItem = (type: string, data: any) => {
    handleNavigate(type, data);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        collegeName={settings.collegeName}
        activeModel={settings.preferredModel}
        onOpenMobileMenu={() => setIsMobileOpen(true)}
        isMobileMenuOpen={isMobileOpen}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Content View Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          {currentPage === 'dashboard' && (
            <Dashboard
              collegeName={settings.collegeName}
              activeModel={settings.preferredModel}
              onNavigate={handleNavigate}
              recentHistory={history}
              onRefreshHistory={refreshHistory}
            />
          )}

          {currentPage === 'mcq' && (
            <MCQGenerator
              initialParams={pageParams}
              preferredDifficulty={settings.preferredDifficulty}
              defaultQuestionsCount={settings.defaultQuestionsCount}
            />
          )}

          {currentPage === 'coding' && (
            <CodingPractice
              initialParams={pageParams}
              preferredLanguage={settings.preferredLanguage}
              preferredDifficulty={settings.preferredDifficulty}
            />
          )}

          {currentPage === 'short-answers' && (
            <ShortAnswerGenerator
              initialParams={pageParams}
              preferredDifficulty={settings.preferredDifficulty}
            />
          )}

          {currentPage === 'assistant' && (
            <CollegeAssistant
              collegeName={settings.collegeName}
              initialParams={pageParams}
            />
          )}

          {currentPage === 'history' && (
            <HistoryView
              history={history}
              onRefresh={refreshHistory}
              onLoadItem={handleLoadItem}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={(newSettings) => setSettings(newSettings)}
              onClearHistory={() => {
                storageService.clearHistory();
                refreshHistory();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
