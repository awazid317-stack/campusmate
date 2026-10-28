import {
  MCQSet,
  CodingPracticeSet,
  CodeReviewResult,
  ShortAnswerSet,
  ChatMessage,
  ModelStatusResponse,
  CollegeKnowledgeItem,
  Difficulty,
  ProgrammingLanguage,
  AnswerLength,
  CodingMode,
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server error (${res.status})`;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
    } catch {
      const text = await res.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const apiService = {
  async getModelStatus(): Promise<ModelStatusResponse> {
    const res = await fetch(`${API_BASE}/status`);
    return handleResponse<ModelStatusResponse>(res);
  },

  async generateMCQs(params: {
    subject: string;
    topic: string;
    difficulty: Difficulty;
    count: number;
    level?: string;
    additionalInstructions?: string;
    preferredModel?: string;
  }): Promise<MCQSet> {
    const res = await fetch(`${API_BASE}/mcq/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<MCQSet>(res);
  },

  async generateCodingQuestions(params: {
    language: ProgrammingLanguage;
    topic: string;
    difficulty: Difficulty;
    count: number;
    mode: CodingMode;
    preferredModel?: string;
  }): Promise<CodingPracticeSet> {
    const res = await fetch(`${API_BASE}/coding/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<CodingPracticeSet>(res);
  },

  async reviewCode(params: {
    problemTitle: string;
    problemStatement: string;
    constraints: string[];
    sampleTestCases: any[];
    language: ProgrammingLanguage;
    studentCode: string;
    preferredModel?: string;
  }): Promise<CodeReviewResult> {
    const res = await fetch(`${API_BASE}/coding/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<CodeReviewResult>(res);
  },

  async generateShortAnswers(params: {
    subject: string;
    topic: string;
    difficulty: Difficulty;
    count: number;
    length: AnswerLength;
    academicLevel?: string;
    preferredModel?: string;
  }): Promise<ShortAnswerSet> {
    const res = await fetch(`${API_BASE}/short-answers/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<ShortAnswerSet>(res);
  },

  async askCollegeAssistant(params: {
    question: string;
    history?: { role: string; content: string }[];
    customKnowledge?: CollegeKnowledgeItem[];
    preferredModel?: string;
  }): Promise<{
    id: string;
    answer: string;
    isVerifiedInfo: boolean;
    citedDepartments: string[];
    followUpSuggestions: string[];
    modelUsed: string;
    timestamp: number;
  }> {
    const res = await fetch(`${API_BASE}/college/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<any>(res);
  },

  async getCollegeKnowledge(): Promise<{ total: number; items: CollegeKnowledgeItem[] }> {
    const res = await fetch(`${API_BASE}/college/knowledge`);
    return handleResponse<any>(res);
  },

  async addCollegeKnowledge(item: Partial<CollegeKnowledgeItem>): Promise<{ success: boolean; item: CollegeKnowledgeItem }> {
    const res = await fetch(`${API_BASE}/college/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse<any>(res);
  },

  async deleteCollegeKnowledge(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/college/knowledge/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<any>(res);
  },
};
