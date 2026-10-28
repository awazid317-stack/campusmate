import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  Send,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Clock,
  Mail,
  MapPin,
  HelpCircle,
  Plus,
  BookOpen,
  Search,
  X,
  RefreshCw,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, CollegeKnowledgeItem } from '../../types';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { useToast } from '../../context/ToastContext';

interface CollegeAssistantProps {
  collegeName: string;
  initialParams?: any;
}

export const CollegeAssistant: React.FC<CollegeAssistantProps> = ({
  collegeName,
  initialParams,
}) => {
  const { showToast } = useToast();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **CampusMate AI Assistant** at **${collegeName}**.

I am strictly grounded in our verified institutional database for official student inquiries. Ask me about:
• **ID Card Issuance & Replacements**
• **Bonafide Certificates for loans/passports**
• **Examination Hall Tickets & COE Grievances**
• **Central Library Timings & Subscriptions**
• **Training & Placement Cell Drives**
• **Student Clubs & Cultural Societies**
• **Sports Pavilion & Gym Facilities**

*If an inquiry falls outside verified records, I will let you know honestly rather than hallucinating offices or phone numbers.*`,
      timestamp: Date.now(),
      isVerifiedInfo: true,
      citedDepartments: ['Academic Affairs', 'Student Services', 'Controller of Examinations'],
      followUpSuggestions: [
        'How can I get a replacement ID card if lost?',
        'What is the procedure for obtaining a bonafide certificate?',
        'What are the library timings on weekends and during exams?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Knowledge Base Explorer Modal State
  const [showKBModal, setShowKBModal] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<CollegeKnowledgeItem[]>([]);
  const [kbSearch, setKbSearch] = useState('');
  const [loadingKB, setLoadingKB] = useState(false);

  // New Record Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<any>('Academics');
  const [newContent, setNewContent] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newTimings, setNewTimings] = useState('');
  const [newContact, setNewContact] = useState('');

  // Load KB items
  const loadKnowledgeBase = async () => {
    try {
      setLoadingKB(true);
      const res = await apiService.getCollegeKnowledge();
      setKnowledgeItems(res.items || []);
    } catch (err) {
      console.error('Failed to load KB:', err);
    } finally {
      setLoadingKB(false);
    }
  };

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  // Handle initial prompt from Dashboard shortcuts
  useEffect(() => {
    if (initialParams?.initialPrompt) {
      handleSend(initialParams.initialPrompt);
    }
  }, [initialParams]);

  // Scroll to bottom on message updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Send conversation history (last 6 turns)
      const historyContext = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await apiService.askCollegeAssistant({
        question: q,
        history: historyContext,
      });

      const assistantMsg: ChatMessage = {
        id: res.id || `msg_a_${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        timestamp: res.timestamp || Date.now(),
        isVerifiedInfo: res.isVerifiedInfo,
        citedDepartments: res.citedDepartments,
        followUpSuggestions: res.followUpSuggestions,
        modelUsed: res.modelUsed,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Save to local history
      storageService.addHistoryItem({
        type: 'college-chat',
        title: `Campus Query: ${q.slice(0, 40)}...`,
        summary: res.isVerifiedInfo ? 'Grounded response from campus database' : 'General guidance provided',
        data: { question: q, answer: res.answer },
      });
    } catch (err: any) {
      console.error('College assistant error:', err);
      showToast(err.message || 'Failed to receive assistant response.', 'error');

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content:
            'I encountered a temporary connection issue while querying campus records. Please retry your question or check the Knowledge Base directly.',
          timestamp: Date.now(),
          isVerifiedInfo: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKnowledgeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('Title and content are required.', 'warning');
      return;
    }

    try {
      await apiService.addCollegeKnowledge({
        title: newTitle.trim(),
        category: newCategory,
        content: newContent.trim(),
        department: newDept.trim(),
        officeLocation: newLoc.trim(),
        timings: newTimings.trim(),
        contactEmail: newContact.trim(),
        tags: [newTitle.toLowerCase(), newCategory.toLowerCase()],
      });

      showToast('Verified knowledge record added successfully!', 'success');
      setShowAddForm(false);
      setNewTitle('');
      setNewContent('');
      setNewDept('');
      setNewLoc('');
      setNewTimings('');
      setNewContact('');
      loadKnowledgeBase();
    } catch (err: any) {
      showToast(err.message || 'Failed to add record.', 'error');
    }
  };

  const filteredKB = knowledgeItems.filter((item) => {
    const q = kbSearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.department && item.department.toLowerCase().includes(q))
    );
  });

  const promptShortcuts = [
    'How do I replace a lost ID card?',
    'Steps for a Bonafide Certificate?',
    'What are the Central Library hours?',
    'How can I contact the Placement Cell?',
    'How do I join student clubs?',
    'What sports & gym facilities exist?',
  ];

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200 h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              Campus Information Assistant
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
              Grounded AI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified campus services advisor for <strong className="text-slate-200">{collegeName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadKnowledgeBase();
              setShowKBModal(true);
            }}
            className="px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Campus Knowledge Base ({knowledgeItems.length})</span>
          </button>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm flex flex-col overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/10'
                  }`}
                >
                  {isUser ? 'You' : <Sparkles className="w-4 h-4 text-cyan-200" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2 max-w-[85%]">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-line font-normal">{msg.content}</div>

                    {/* Verified Record Metadata Badge if applicable */}
                    {!isUser && msg.isVerifiedInfo && msg.citedDepartments && msg.citedDepartments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-[11px] text-cyan-300 font-medium">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verified Record:</span>
                        </div>
                        {msg.citedDepartments.map((dept, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-200 font-semibold">
                            {dept}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Follow-up question suggestion chips */}
                  {!isUser && msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.followUpSuggestions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(suggestion)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all text-left flex items-center gap-1.5 group"
                        >
                          <HelpCircle className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 max-w-md mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-cyan-600/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <span>Gemma 4 is consulting campus verified records...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Question Prompt Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
          <span className="text-slate-300 font-medium shrink-0">Popular:</span>
          {promptShortcuts.map((text, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(text)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
            >
              {text}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ID cards, library timings, bonafide certificates, exams, or clubs at ${collegeName}...`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Campus Knowledge Base Explorer Modal */}
      {showKBModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Verified College Knowledge Base</h3>
                  <p className="text-xs text-slate-400">
                    Official procedures, office locations, and timings used to ground Gemma 4
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddForm ? 'View Records' : 'Add Official Record'}
                </button>
                <button
                  onClick={() => setShowKBModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {showAddForm ? (
                /* Add Knowledge Form */
                <form onSubmit={handleAddKnowledgeItem} className="space-y-4 max-w-xl mx-auto bg-slate-950/80 p-5 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-white text-sm">Add Verified Campus Record</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Title *</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Hostel Fee Deadlines"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="Administration">Administration</option>
                        <option value="Academics">Academics</option>
                        <option value="Facilities">Facilities</option>
                        <option value="Placements">Placements</option>
                        <option value="Examination">Examination</option>
                        <option value="Scholarships">Scholarships</option>
                        <option value="Clubs & Activities">Clubs & Activities</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Official Policy / Details *</label>
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={4}
                      placeholder="Enter verified instructions, fee amounts, step-by-step procedures..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white leading-relaxed"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Department</label>
                      <input
                        type="text"
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        placeholder="e.g. Chief Warden Office"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Office Location</label>
                      <input
                        type="text"
                        value={newLoc}
                        onChange={(e) => setNewLoc(e.target.value)}
                        placeholder="e.g. Hostel Complex Block A"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Office Timings</label>
                      <input
                        type="text"
                        value={newTimings}
                        onChange={(e) => setNewTimings(e.target.value)}
                        placeholder="e.g. 10:00 AM – 04:00 PM"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Contact Email</label>
                      <input
                        type="text"
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        placeholder="e.g. hostel@campus.edu"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Save Record
                    </button>
                  </div>
                </form>
              ) : (
                /* List & Search View */
                <>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={kbSearch}
                      onChange={(e) => setKbSearch(e.target.value)}
                      placeholder="Search verified campus records by keyword, department, or procedure..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredKB.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-xs leading-snug">{item.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold shrink-0">
                            {item.category}
                          </span>
                        </div>

                        <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-4 whitespace-pre-line">
                          {item.content}
                        </p>

                        <div className="space-y-1 text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                          {item.officeLocation && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="truncate">{item.officeLocation}</span>
                            </div>
                          )}
                          {item.timings && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">{item.timings}</span>
                            </div>
                          )}
                          {item.contactEmail && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{item.contactEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
