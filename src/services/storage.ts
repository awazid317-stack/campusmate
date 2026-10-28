import { AppSettings, HistoryItem, ProgressSummary, DailyProgressPoint } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'campusmate_settings_v1',
  HISTORY: 'campusmate_history_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  preferredModel: 'gemma-4-26b-a4b-it',
  preferredLanguage: 'Python',
  preferredDifficulty: 'Medium',
  defaultQuestionsCount: 5,
  collegeName: 'Apex Institute of Technology',
  theme: 'dark',
};

export const storageService = {
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings to localStorage:', err);
    }
  },

  getHistory(): HistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!data) return [];
      return JSON.parse(data) as HistoryItem[];
    } catch {
      return [];
    }
  },

  addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
    try {
      const history = this.getHistory();
      const newItem: HistoryItem = {
        ...item,
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
      };
      // Keep most recent 50 items
      const updated = [newItem, ...history].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return newItem;
    } catch (err) {
      console.error('Failed to save history item:', err);
      return {
        ...item,
        id: `hist_${Date.now()}`,
        timestamp: Date.now(),
      };
    }
  },

  deleteHistoryItem(id: string): void {
    try {
      const history = this.getHistory().filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  },

  exportData(): string {
    const data = {
      settings: this.getSettings(),
      history: this.getHistory(),
      exportedAt: new Date().toISOString(),
      app: 'CampusMate AI',
    };
    return JSON.stringify(data, null, 2);
  },

  calculateProgressSummary(history: HistoryItem[], days: number = 7): ProgressSummary {
    const now = new Date();
    const points: DailyProgressPoint[] = [];
    const dateMap: Record<string, { mcq: number; coding: number }> = {};

    // Generate buckets for the last N days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateShort = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isToday = i === 0;

      points.push({
        dateKey,
        dayLabel,
        dateShort,
        isToday,
        mcqCount: 0,
        codingCount: 0,
        totalCount: 0,
      });

      dateMap[dateKey] = { mcq: 0, coding: 0 };
    }

    let totalMCQs = 0;
    let totalCoding = 0;
    let mcqScoreSum = 0;
    let mcqTotalPossible = 0;
    let codingScoreSum = 0;
    let codingScoredCount = 0;

    // Aggregate real history
    history.forEach((item) => {
      const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
      
      if (item.type === 'mcq') {
        const qCount = item.data?.total || (Array.isArray(item.data?.questions) ? item.data.questions.length : 5);
        totalMCQs += qCount;
        if (dateMap[itemDate]) {
          dateMap[itemDate].mcq += qCount;
        }

        if (typeof item.data?.score === 'number' && typeof item.data?.total === 'number' && item.data.total > 0) {
          mcqScoreSum += item.data.score;
          mcqTotalPossible += item.data.total;
        }
      } else if (item.type === 'coding') {
        const pCount = Array.isArray(item.data?.problems) ? item.data.problems.length : 1;
        totalCoding += pCount;
        if (dateMap[itemDate]) {
          dateMap[itemDate].coding += pCount;
        }

        if (typeof item.data?.review?.score === 'number') {
          codingScoreSum += item.data.review.score;
          codingScoredCount++;
        }
      }
    });

    // Populate points
    points.forEach((pt) => {
      const counts = dateMap[pt.dateKey];
      if (counts) {
        pt.mcqCount = counts.mcq;
        pt.codingCount = counts.coding;
        pt.totalCount = counts.mcq + counts.coding;
      }
    });

    // Calculate streak
    let streak = 0;
    // Check backwards from today
    for (let i = points.length - 1; i >= 0; i--) {
      if (points[i].totalCount > 0) {
        streak++;
      } else if (i === points.length - 1) {
        // If today is 0, check if yesterday had activity to keep streak alive
        continue;
      } else {
        break;
      }
    }

    const activeDaysCount = points.filter((p) => p.totalCount > 0).length;

    return {
      totalMCQsCompleted: totalMCQs,
      totalCodingCompleted: totalCoding,
      overallMCQAccuracy: mcqTotalPossible > 0 ? Math.round((mcqScoreSum / mcqTotalPossible) * 100) : 85,
      overallCodingAverageScore: codingScoredCount > 0 ? Math.round(codingScoreSum / codingScoredCount) : 88,
      currentDayStreak: streak,
      activeDaysCount,
      points,
    };
  },

  seedSampleProgress(): void {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const sampleEntries: HistoryItem[] = [
      {
        id: `sample_mcq_${now}_1`,
        type: 'mcq',
        title: 'Computer Science: Binary Search Trees (5/5)',
        summary: 'Scored 5/5 (100%) on Medium level MCQ set.',
        timestamp: now - 0.2 * dayMs,
        data: { total: 5, score: 5, topic: 'Binary Search Trees', subject: 'Computer Science' },
      },
      {
        id: `sample_code_${now}_1`,
        type: 'coding',
        title: 'Python: Two Sum & Hash Maps (Score: 92/100)',
        summary: 'Evaluated Python solution for Two Sum — Structurally sound.',
        timestamp: now - 0.5 * dayMs,
        data: { problems: [{ title: 'Two Sum' }], review: { score: 92 } },
      },
      {
        id: `sample_mcq_${now}_2`,
        type: 'mcq',
        title: 'Operating Systems: Virtual Memory & Page Faults (8/10)',
        summary: 'Scored 8/10 (80%) on Medium level MCQ set.',
        timestamp: now - 1.2 * dayMs,
        data: { total: 10, score: 8, topic: 'Virtual Memory', subject: 'Operating Systems' },
      },
      {
        id: `sample_code_${now}_2`,
        type: 'coding',
        title: 'C++: Reverse Linked List (Score: 95/100)',
        summary: 'Evaluated C++ solution with iterative pointer reversal.',
        timestamp: now - 1.6 * dayMs,
        data: { problems: [{ title: 'Reverse Linked List' }, { title: 'Detect Cycle' }], review: { score: 95 } },
      },
      {
        id: `sample_mcq_${now}_3`,
        type: 'mcq',
        title: 'Database Systems: SQL Normalization 1NF-BCNF (5/5)',
        summary: 'Scored 5/5 (100%) on Hard level MCQ set.',
        timestamp: now - 2.4 * dayMs,
        data: { total: 5, score: 5, topic: 'SQL Normalization', subject: 'Database Systems' },
      },
      {
        id: `sample_code_${now}_3`,
        type: 'coding',
        title: 'Java: Binary Tree Level Order Traversal (Score: 88/100)',
        summary: 'Evaluated Java BFS solution using standard Queue.',
        timestamp: now - 3.1 * dayMs,
        data: { problems: [{ title: 'Level Order Traversal' }], review: { score: 88 } },
      },
      {
        id: `sample_mcq_${now}_4`,
        type: 'mcq',
        title: 'Computer Networks: TCP 3-Way Handshake (10/10)',
        summary: 'Scored 10/10 (100%) on Medium level MCQ set.',
        timestamp: now - 4.3 * dayMs,
        data: { total: 10, score: 10, topic: 'TCP Handshake', subject: 'Networks' },
      },
      {
        id: `sample_code_${now}_4`,
        type: 'coding',
        title: 'JavaScript: Valid Parentheses Stack (Score: 90/100)',
        summary: 'Evaluated JavaScript solution using LIFO stack.',
        timestamp: now - 5.2 * dayMs,
        data: { problems: [{ title: 'Valid Parentheses' }], review: { score: 90 } },
      },
      {
        id: `sample_mcq_${now}_5`,
        type: 'mcq',
        title: 'Algorithms: Merge Sort & Recurrence Relations (5/5)',
        summary: 'Scored 5/5 (100%) on Hard level MCQ set.',
        timestamp: now - 6.1 * dayMs,
        data: { total: 5, score: 5, topic: 'Merge Sort', subject: 'Algorithms' },
      },
    ];

    try {
      const existing = this.getHistory();
      const merged = [...sampleEntries, ...existing].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(merged));
    } catch (e) {
      console.error('Failed to seed sample progress:', e);
    }
  },
};

