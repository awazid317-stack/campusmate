export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ProgrammingLanguage = 'Python' | 'C++' | 'Java' | 'JavaScript';

export type AnswerLength = 'Very Short' | 'Short' | 'Detailed';

export type CodingMode = 'Placement Prep' | 'Exam Prep' | 'Concept Practice';

export interface MCQQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface MCQSet {
  id: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  level?: string;
  timestamp: number;
  questions: MCQQuestion[];
  score?: number;
  total?: number;
  userAnswers?: Record<string, 'A' | 'B' | 'C' | 'D'>;
  modelUsed?: string;
}

export interface CodingSampleCase {
  input: string;
  output: string;
  explanation: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  sampleTestCases: CodingSampleCase[];
  expectedTimeComplexity?: string;
  expectedSpaceComplexity?: string;
  hints: string[];
  solution: string;
  solutionExplanation: string;
}

export interface CodingPracticeSet {
  id: string;
  language: ProgrammingLanguage;
  topic: string;
  difficulty: Difficulty;
  mode: CodingMode;
  timestamp: number;
  problems: CodingProblem[];
  modelUsed?: string;
}

export interface CodeReviewResult {
  isCorrectEstimate: boolean;
  score: number; // 0 - 100
  summary: string;
  timeComplexityAnalysis: string;
  spaceComplexityAnalysis: string;
  potentialBugsOrEdgeCases: string[];
  positiveHighlights: string[];
  improvementSuggestions: string[];
  sampleCaseEvaluation: {
    caseNumber: number;
    expected: string;
    likelyOutput: string;
    status: 'PASS' | 'FAIL' | 'UNCERTAIN';
    notes: string;
  }[];
}

export interface ShortAnswerQuestion {
  id: string;
  question: string;
  modelAnswer: string;
  keyPoints: string[];
  terminology: string[];
  example?: string;
  explanation: string;
}

export interface ShortAnswerSet {
  id: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  length: AnswerLength;
  academicLevel?: string;
  timestamp: number;
  questions: ShortAnswerQuestion[];
  modelUsed?: string;
}

export interface CollegeKnowledgeItem {
  id: string;
  category: 'Administration' | 'Academics' | 'Clubs & Activities' | 'Facilities' | 'Placements' | 'Examination' | 'Scholarships' | 'General';
  title: string;
  content: string;
  department?: string;
  contactEmail?: string;
  officeLocation?: string;
  timings?: string;
  tags: string[];
  isVerified: boolean;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isVerifiedInfo?: boolean;
  citedDepartments?: string[];
  followUpSuggestions?: string[];
  modelUsed?: string;
}

export interface AppSettings {
  preferredModel: 'gemma-4-26b-a4b-it' | 'gemini-3.8-flash';
  preferredLanguage: ProgrammingLanguage;
  preferredDifficulty: Difficulty;
  defaultQuestionsCount: number;
  collegeName: string;
  theme: 'dark';
}

export interface HistoryItem {
  id: string;
  type: 'mcq' | 'coding' | 'short-answer' | 'college-chat';
  title: string;
  timestamp: number;
  summary: string;
  data: any;
}

export interface ModelStatusResponse {
  status: 'online' | 'degraded' | 'offline';
  model: string;
  verifiedGemmaAvailable: boolean;
  apiKeyConfigured: boolean;
  latencyMs: number;
}

export interface DailyProgressPoint {
  dateKey: string;
  dayLabel: string;
  dateShort: string;
  isToday: boolean;
  mcqCount: number;
  codingCount: number;
  totalCount: number;
}

export interface ProgressSummary {
  totalMCQsCompleted: number;
  totalCodingCompleted: number;
  overallMCQAccuracy: number;
  overallCodingAverageScore: number;
  currentDayStreak: number;
  activeDaysCount: number;
  points: DailyProgressPoint[];
}

