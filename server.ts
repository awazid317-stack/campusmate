import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { DEFAULT_COLLEGE_KNOWLEDGE } from './src/data/defaultCollegeKnowledge.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// In-memory campus knowledge base initialized with verified records
let campusKnowledgeBase = [...DEFAULT_COLLEGE_KNOWLEDGE];

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_MODEL = 'gemma-4-26b-a4b-it';
const FALLBACK_MODEL = 'gemini-3.8-flash';

// Helper to clean and parse JSON from model responses
function cleanAndParseJSON<T>(rawText: string, fallbackDefault: T): T {
  if (!rawText || typeof rawText !== 'string') return fallbackDefault;
  let cleaned = rawText.trim();
  
  // Strip Markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  
  // Find outermost JSON object or array
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  
  if (firstBrace === -1 && firstBracket === -1) {
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      return fallbackDefault;
    }
  }

  // Determine whether it starts with { or [
  let startIdx = 0;
  let endIdx = cleaned.length;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf('}') + 1;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf(']') + 1;
  }

  const jsonSubstring = cleaned.substring(startIdx, endIdx);
  try {
    return JSON.parse(jsonSubstring) as T;
  } catch (err) {
    console.error('Failed to parse model JSON:', err, 'Raw text was:', rawText.slice(0, 300));
    return fallbackDefault;
  }
}

// Model generation helper with automatic fallback
async function callModelWithFallback(params: {
  preferredModel?: string;
  prompt: string;
  systemInstruction?: string;
  expectJson?: boolean;
}): Promise<{ text: string; modelUsed: string }> {
  const chosenModel = params.preferredModel || DEFAULT_MODEL;
  
  const config: Record<string, any> = {};
  if (params.systemInstruction) {
    config.systemInstruction = params.systemInstruction;
  }
  if (params.expectJson) {
    config.responseMimeType = 'application/json';
  }

  try {
    const response = await ai.models.generateContent({
      model: chosenModel,
      contents: params.prompt,
      config,
    });
    return {
      text: response.text || '',
      modelUsed: chosenModel,
    };
  } catch (primaryErr: any) {
    console.warn(`Primary model (${chosenModel}) failed or timed out:`, primaryErr?.message);
    
    // Attempt fallback model if primary was gemma
    if (chosenModel !== FALLBACK_MODEL) {
      try {
        console.log(`Falling back to ${FALLBACK_MODEL}...`);
        const fallbackResponse = await ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents: params.prompt,
          config,
        });
        return {
          text: fallbackResponse.text || '',
          modelUsed: `${FALLBACK_MODEL} (fallback from ${chosenModel})`,
        };
      } catch (fallbackErr: any) {
        throw new Error(`AI generation failed on both ${chosenModel} and fallback: ${fallbackErr?.message || primaryErr?.message}`);
      }
    }
    throw primaryErr;
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health & Status
app.get('/api/status', async (_req: Request, res: Response) => {
  const start = Date.now();
  let verifiedGemmaAvailable = false;
  let status = 'online';

  try {
    if (apiKey) {
      // Quick ping test
      const ping = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: 'respond with ok',
      });
      if (ping.text) {
        verifiedGemmaAvailable = true;
      }
    } else {
      status = 'degraded';
    }
  } catch (err) {
    verifiedGemmaAvailable = false;
    status = 'degraded';
  }

  res.json({
    status,
    model: DEFAULT_MODEL,
    fallbackModel: FALLBACK_MODEL,
    verifiedGemmaAvailable,
    apiKeyConfigured: !!apiKey,
    latencyMs: Date.now() - start,
    supportedModels: [DEFAULT_MODEL, FALLBACK_MODEL],
  });
});

// 2. Generate MCQs
app.post('/api/mcq/generate', async (req: Request, res: Response) => {
  try {
    const { subject, topic, difficulty = 'Medium', count = 5, level = 'Undergraduate', additionalInstructions = '', preferredModel } = req.body;

    if (!subject || !subject.trim()) {
      res.status(400).json({ error: 'Subject is required.' });
      return;
    }
    if (!topic || !topic.trim()) {
      res.status(400).json({ error: 'Topic is required.' });
      return;
    }

    const numQuestions = Math.min(Math.max(parseInt(count, 10) || 5, 1), 20);

    const prompt = `You are an expert academic examiner using the Gemma 4 intelligence model.
Generate exactly ${numQuestions} distinct, high-quality Multiple Choice Questions (MCQs) for university students.

Subject: ${subject}
Topic: ${topic}
Difficulty Level: ${difficulty}
Academic Level: ${level}
${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ''}

Strict Requirements:
1. Every question must be directly relevant and conceptual.
2. Provide exactly 4 options labeled "A", "B", "C", and "D".
3. Exactly ONE option must be unambiguously correct.
4. No duplicate questions or repeating similar concepts within this set.
5. Provide a thorough, educational explanation justifying why the correct option is right and why distractors are incorrect.
6. Return ONLY a valid JSON object matching this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Clear problem statement or question",
      "options": {
        "A": "Option text",
        "B": "Option text",
        "C": "Option text",
        "D": "Option text"
      },
      "correctAnswer": "A",
      "explanation": "Clear explanation of why this answer is correct."
    }
  ]
}`;

    const { text, modelUsed } = await callModelWithFallback({
      preferredModel,
      prompt,
      expectJson: true,
      systemInstruction: 'You are an academic assessment engine that outputs strict JSON formatted university questions.',
    });

    const parsed = cleanAndParseJSON<{ questions: any[] }>(text, { questions: [] });

    // Validate and sanitize questions
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      res.status(502).json({
        error: 'The AI model generated an unparseable response. Please retry.',
        rawText: text.slice(0, 300),
      });
      return;
    }

    const sanitizedQuestions = parsed.questions.map((q, index) => {
      const options = q.options || {};
      const validOptions = {
        A: String(options.A || 'Option A'),
        B: String(options.B || 'Option B'),
        C: String(options.C || 'Option C'),
        D: String(options.D || 'Option D'),
      };
      let correct = String(q.correctAnswer || 'A').toUpperCase().trim();
      if (!['A', 'B', 'C', 'D'].includes(correct)) {
        correct = 'A';
      }

      return {
        id: q.id || `q_${index + 1}_${Date.now()}`,
        question: String(q.question || `Question ${index + 1}`).trim(),
        options: validOptions,
        correctAnswer: correct as 'A' | 'B' | 'C' | 'D',
        explanation: String(q.explanation || 'No detailed explanation provided.').trim(),
      };
    });

    res.json({
      id: `mcq_set_${Date.now()}`,
      subject,
      topic,
      difficulty,
      level,
      timestamp: Date.now(),
      modelUsed,
      questions: sanitizedQuestions,
    });
  } catch (err: any) {
    console.error('Error in /api/mcq/generate:', err);
    res.status(500).json({ error: err.message || 'Failed to generate MCQs.' });
  }
});

// 3. Generate Coding Practice Questions
app.post('/api/coding/generate', async (req: Request, res: Response) => {
  try {
    const { language = 'Python', topic, difficulty = 'Medium', count = 2, mode = 'Placement Prep', preferredModel } = req.body;

    if (!topic || !topic.trim()) {
      res.status(400).json({ error: 'Programming topic is required.' });
      return;
    }

    const numProblems = Math.min(Math.max(parseInt(count, 10) || 2, 1), 5);

    const prompt = `You are a Principal Software Engineer and Technical Interviewer using Google's Gemma 4 model.
Generate ${numProblems} rigorous programming problem(s) in ${language} focused on ${topic}.
Difficulty: ${difficulty}
Mode: ${mode}

For each problem, you must provide:
1. Concise, creative Problem Title.
2. Clear Problem Statement explaining the scenario and objective.
3. Input Format specifications.
4. Output Format specifications.
5. Constraints (e.g. 1 <= N <= 10^5, time limits, memory limits).
6. At least two distinct Sample Test Cases with Sample Input, Sample Output, and step-by-step Example Explanation.
7. Expected Time Complexity (e.g., O(n log n)) and Space Complexity (e.g., O(n)).
8. Two progressive Hints (Hint 1 for conceptual approach, Hint 2 for implementation edge cases).
9. Complete, production-grade Reference Solution written in ${language} with clean comments and error handling.
10. Detailed Solution Explanation explaining data structures and algorithm choices.

Return ONLY a valid JSON object matching this exact schema:
{
  "problems": [
    {
      "id": "p1",
      "title": "Problem Title",
      "statement": "Detailed problem statement...",
      "inputFormat": "Description of input structure...",
      "outputFormat": "Description of output structure...",
      "constraints": [
        "1 <= N <= 10^5",
        "-10^9 <= A[i] <= 10^9"
      ],
      "sampleTestCases": [
        {
          "input": "Sample input string or values",
          "output": "Sample output value",
          "explanation": "Why this output is produced"
        },
        {
          "input": "Second sample input",
          "output": "Second sample output",
          "explanation": "Why this output is produced"
        }
      ],
      "expectedTimeComplexity": "O(N)",
      "expectedSpaceComplexity": "O(1)",
      "hints": [
        "Hint 1: Consider using two pointers...",
        "Hint 2: Pay attention to zero-length arrays."
      ],
      "solution": "// Code in ${language} here...",
      "solutionExplanation": "Detailed algorithmic breakdown..."
    }
  ]
}`;

    const { text, modelUsed } = await callModelWithFallback({
      preferredModel,
      prompt,
      expectJson: true,
      systemInstruction: `You are a technical coding interviewer. Provide rigorous coding challenges in ${language} with complete solutions and constraints. Return valid JSON only.`,
    });

    const parsed = cleanAndParseJSON<{ problems: any[] }>(text, { problems: [] });

    if (!Array.isArray(parsed.problems) || parsed.problems.length === 0) {
      res.status(502).json({
        error: 'The AI model generated an unparseable response for coding problems. Please retry.',
        rawText: text.slice(0, 300),
      });
      return;
    }

    const sanitizedProblems = parsed.problems.map((p, idx) => ({
      id: p.id || `prob_${idx + 1}_${Date.now()}`,
      title: String(p.title || `Problem ${idx + 1}: ${topic}`).trim(),
      statement: String(p.statement || '').trim(),
      inputFormat: String(p.inputFormat || 'Standard input').trim(),
      outputFormat: String(p.outputFormat || 'Standard output').trim(),
      constraints: Array.isArray(p.constraints) ? p.constraints.map(String) : ['1 <= N <= 10^5'],
      sampleTestCases: Array.isArray(p.sampleTestCases)
        ? p.sampleTestCases.map((tc: any) => ({
            input: String(tc.input || ''),
            output: String(tc.output || ''),
            explanation: String(tc.explanation || ''),
          }))
        : [
            { input: 'Sample 1', output: 'Result 1', explanation: 'Basic case' },
            { input: 'Sample 2', output: 'Result 2', explanation: 'Edge case' },
          ],
      expectedTimeComplexity: p.expectedTimeComplexity || 'O(n)',
      expectedSpaceComplexity: p.expectedSpaceComplexity || 'O(1)',
      hints: Array.isArray(p.hints) ? p.hints.map(String) : ['Review standard algorithm approaches.'],
      solution: String(p.solution || '').trim(),
      solutionExplanation: String(p.solutionExplanation || '').trim(),
    }));

    res.json({
      id: `coding_set_${Date.now()}`,
      language,
      topic,
      difficulty,
      mode,
      timestamp: Date.now(),
      modelUsed,
      problems: sanitizedProblems,
    });
  } catch (err: any) {
    console.error('Error in /api/coding/generate:', err);
    res.status(500).json({ error: err.message || 'Failed to generate coding questions.' });
  }
});

// 4. AI Code Review & Static Analysis (NO execution of arbitrary student code on server!)
app.post('/api/coding/review', async (req: Request, res: Response) => {
  try {
    const { problemTitle, problemStatement, constraints, sampleTestCases, language, studentCode, preferredModel } = req.body;

    if (!studentCode || !studentCode.trim()) {
      res.status(400).json({ error: 'Please write or paste code before requesting review.' });
      return;
    }

    const prompt = `You are a Senior Code Reviewer and Competitive Programming Judge powered by Gemma 4.
Perform an in-depth static and semantic code review of the student's solution.
DO NOT execute unsafe code. Inspect the logic, syntax, edge cases, and algorithm soundness.

Problem: ${problemTitle}
Statement: ${problemStatement}
Language: ${language}
Constraints: ${JSON.stringify(constraints || [])}
Sample Test Cases: ${JSON.stringify(sampleTestCases || [])}

Student Code:
\`\`\`${language}
${studentCode}
\`\`\`

Evaluate the student code strictly and produce a structured evaluation:
1. isCorrectEstimate (boolean): true if the logic correctly solves the problem within constraints and handles sample cases.
2. score (number 0-100): overall code quality, correctness, and efficiency score.
3. summary: A constructive 2-3 sentence overview of the student's implementation.
4. timeComplexityAnalysis: Computed Big-O time complexity with justification.
5. spaceComplexityAnalysis: Computed Big-O auxiliary space complexity with justification.
6. potentialBugsOrEdgeCases: Array of strings pointing out off-by-one errors, null checks, empty arrays, or large input bounds.
7. positiveHighlights: Array of strings highlighting clean syntax, good variable naming, or smart idioms.
8. improvementSuggestions: Actionable steps to optimize or refactor.
9. sampleCaseEvaluation: Array evaluating each sample test case with caseNumber, expected, likelyOutput, status ("PASS" | "FAIL" | "UNCERTAIN"), and notes.

Return ONLY a valid JSON object matching this schema:
{
  "isCorrectEstimate": true,
  "score": 85,
  "summary": "...",
  "timeComplexityAnalysis": "O(N) - single pass through the array.",
  "spaceComplexityAnalysis": "O(1) - in-place modification.",
  "potentialBugsOrEdgeCases": ["..."],
  "positiveHighlights": ["..."],
  "improvementSuggestions": ["..."],
  "sampleCaseEvaluation": [
    {
      "caseNumber": 1,
      "expected": "...",
      "likelyOutput": "...",
      "status": "PASS",
      "notes": "Traces correctly through the loop"
    }
  ]
}`;

    const { text, modelUsed } = await callModelWithFallback({
      preferredModel,
      prompt,
      expectJson: true,
      systemInstruction: 'You are an automated code evaluation judge. Evaluate code statically and return structured JSON.',
    });

    const parsed = cleanAndParseJSON<any>(text, {
      isCorrectEstimate: false,
      score: 50,
      summary: 'Code review completed with general observations.',
      timeComplexityAnalysis: 'Could not definitively determine time complexity.',
      spaceComplexityAnalysis: 'Could not definitively determine space complexity.',
      potentialBugsOrEdgeCases: ['Verify boundary limits and empty inputs.'],
      positiveHighlights: ['Clean attempt submitted.'],
      improvementSuggestions: ['Compare with sample test cases carefully.'],
      sampleCaseEvaluation: [],
    });

    res.json({
      ...parsed,
      modelUsed,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('Error in /api/coding/review:', err);
    res.status(500).json({ error: err.message || 'Failed to review code.' });
  }
});

// 5. Generate Short Answers
app.post('/api/short-answers/generate', async (req: Request, res: Response) => {
  try {
    const { subject, topic, difficulty = 'Medium', count = 4, length = 'Short', academicLevel = 'Undergraduate', preferredModel } = req.body;

    if (!subject || !subject.trim()) {
      res.status(400).json({ error: 'Subject is required.' });
      return;
    }
    if (!topic || !topic.trim()) {
      res.status(400).json({ error: 'Topic is required.' });
      return;
    }

    const numQuestions = Math.min(Math.max(parseInt(count, 10) || 4, 1), 10);

    const lengthGuide = {
      'Very Short': '1 to 2 crisp, high-yield sentences (around 25-40 words)',
      'Short': 'A focused 1-paragraph explanation (around 60-100 words)',
      'Detailed': 'A comprehensive multi-point explanation (around 150-250 words)',
    }[length as string] || 'A focused explanation';

    const prompt = `You are an academic mentor and professor using Gemma 4.
Generate ${numQuestions} essential short-answer revision questions and high-scoring answers.

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Expected Answer Length: ${length} (${lengthGuide})
Academic Level: ${academicLevel}

For each question:
1. Formulate a realistic university exam question testing a key concept.
2. Provide a pristine Model Answer matching the requested length: ${length}.
3. Provide 3-5 bulleted Key Points that an examiner checks for marking.
4. List 2-4 critical Technical Terminology keywords.
5. (Optional) Provide a concrete Real-world Example or Analogy.
6. Provide a 1-sentence concise conceptual explanation.

Return ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "id": "sa1",
      "question": "Question text here",
      "modelAnswer": "Pristine model answer text...",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "terminology": ["Keyword 1", "Keyword 2"],
      "example": "Real-world example...",
      "explanation": "Core takeaway explanation..."
    }
  ]
}`;

    const { text, modelUsed } = await callModelWithFallback({
      preferredModel,
      prompt,
      expectJson: true,
      systemInstruction: 'You are an academic examination author creating revision Q&As in valid JSON format.',
    });

    const parsed = cleanAndParseJSON<{ questions: any[] }>(text, { questions: [] });

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      res.status(502).json({
        error: 'Failed to parse AI short-answer output. Please try again.',
        rawText: text.slice(0, 300),
      });
      return;
    }

    const sanitized = parsed.questions.map((q, idx) => ({
      id: q.id || `sa_${idx + 1}_${Date.now()}`,
      question: String(q.question || `Question ${idx + 1}`).trim(),
      modelAnswer: String(q.modelAnswer || '').trim(),
      keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints.map(String) : [],
      terminology: Array.isArray(q.terminology) ? q.terminology.map(String) : [],
      example: q.example ? String(q.example).trim() : undefined,
      explanation: String(q.explanation || '').trim(),
    }));

    res.json({
      id: `short_answers_${Date.now()}`,
      subject,
      topic,
      difficulty,
      length,
      academicLevel,
      timestamp: Date.now(),
      modelUsed,
      questions: sanitized,
    });
  } catch (err: any) {
    console.error('Error in /api/short-answers/generate:', err);
    res.status(500).json({ error: err.message || 'Failed to generate short answers.' });
  }
});

// 6. College Assistant (with Grounding & Anti-Hallucination Safeguards)
app.post('/api/college/ask', async (req: Request, res: Response) => {
  try {
    const { question, history = [], customKnowledge = [], preferredModel } = req.body;

    if (!question || !question.trim()) {
      res.status(400).json({ error: 'Question is required.' });
      return;
    }

    // Merge in-memory campus knowledge with any custom items supplied by user
    const combinedKnowledge = [...campusKnowledgeBase, ...(Array.isArray(customKnowledge) ? customKnowledge : [])];

    // Search relevant knowledge base items using keyword matching
    const qLower = question.toLowerCase();
    const relevantItems = combinedKnowledge.filter((item) => {
      const matchTag = item.tags.some((t: string) => qLower.includes(t.toLowerCase()));
      const matchTitle = item.title.toLowerCase().split(' ').some((word: string) => word.length > 3 && qLower.includes(word));
      const matchDept = item.department?.toLowerCase().includes(qLower);
      return matchTag || matchTitle || matchDept;
    });

    // Format verified knowledge context
    const knowledgeContext = relevantItems.length > 0
      ? relevantItems.map((item) => `[VERIFIED RECORD: ${item.title}]
Category: ${item.category}
Department: ${item.department || 'N/A'}
Location: ${item.officeLocation || 'N/A'}
Contact: ${item.contactEmail || 'N/A'}
Timings: ${item.timings || 'N/A'}
Official Details:
${item.content}`).join('\n\n---\n\n')
      : 'NONE_MATCHED';

    const recentHistory = Array.isArray(history)
      ? history.slice(-6).map((h: any) => `${h.role === 'user' ? 'Student' : 'CampusMate'}: ${h.content}`).join('\n')
      : '';

    const prompt = `You are CampusMate AI, the trusted college information and student assistance advisor.
You are powered by Google's Gemma 4 model.

CRITICAL ACCURACY RULES:
1. Do NOT invent college-specific phone numbers, office locations, faculty names, opening hours, deadlines, event dates, fees, policies, or procedures.
2. If verified records are provided below under "VERIFIED COLLEGE RECORDS", use them directly and cite the exact office location, contact, and timings.
3. If the user's question asks for specific college facts (e.g. "Where is the dean's office?", "When does library close?", "Who is the placement director?") and the verified records do NOT contain the information, DO NOT GUESS. You MUST explicitly state:
"I don't have verified information about this specific college service yet. Please check your college's official website or contact the relevant department."
4. If the question is about general study techniques, academic concepts, or standard collegiate best practices, provide helpful academic guidance while clarifying that it is general advice rather than institutional policy.
5. Provide 3 thoughtful follow-up questions the student might want to ask next.

VERIFIED COLLEGE RECORDS:
${knowledgeContext}

RECENT CONVERSATION HISTORY:
${recentHistory || 'No previous messages in session.'}

STUDENT QUESTION:
"${question}"

Output your response ONLY in this JSON format:
{
  "answer": "Your comprehensive, friendly, and accurate response in markdown formatting.",
  "isVerifiedInfo": true or false,
  "citedDepartments": ["Department Name(s) if applicable"],
  "followUpSuggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ]
}`;

    const { text, modelUsed } = await callModelWithFallback({
      preferredModel,
      prompt,
      expectJson: true,
      systemInstruction: 'You are an accurate campus assistant grounded strictly in verified institutional knowledge.',
    });

    const parsed = cleanAndParseJSON<{
      answer: string;
      isVerifiedInfo: boolean;
      citedDepartments: string[];
      followUpSuggestions: string[];
    }>(text, {
      answer: relevantItems.length > 0
        ? `Based on verified campus records for ${relevantItems[0].title}:\n\n${relevantItems[0].content}\n\n**Office Location:** ${relevantItems[0].officeLocation || 'Main Campus'}\n**Timings:** ${relevantItems[0].timings || 'Check notice board'}\n**Contact:** ${relevantItems[0].contactEmail || 'N/A'}`
        : "I don't have verified information about this specific college service yet. Please check your college's official website or contact the relevant department.",
      isVerifiedInfo: relevantItems.length > 0,
      citedDepartments: relevantItems.map((i) => i.department).filter(Boolean) as string[],
      followUpSuggestions: [
        'How can I get my college ID card replaced?',
        'Where can I find the academic calendar?',
        'What are the central library timings?',
      ],
    });

    res.json({
      id: `ans_${Date.now()}`,
      answer: parsed.answer,
      isVerifiedInfo: parsed.isVerifiedInfo,
      citedDepartments: parsed.citedDepartments || [],
      followUpSuggestions: parsed.followUpSuggestions || [],
      modelUsed,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('Error in /api/college/ask:', err);
    res.status(500).json({ error: err.message || 'Failed to process college question.' });
  }
});

// 7. College Knowledge Base Management
app.get('/api/college/knowledge', (_req: Request, res: Response) => {
  res.json({
    total: campusKnowledgeBase.length,
    items: campusKnowledgeBase,
  });
});

app.post('/api/college/knowledge', (req: Request, res: Response) => {
  try {
    const { category, title, content, department, contactEmail, officeLocation, timings, tags } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required.' });
      return;
    }

    const newItem = {
      id: `kb-custom-${Date.now()}`,
      category: category || 'General',
      title: title.trim(),
      content: content.trim(),
      department: department?.trim(),
      contactEmail: contactEmail?.trim(),
      officeLocation: officeLocation?.trim(),
      timings: timings?.trim(),
      tags: Array.isArray(tags) ? tags : [title.toLowerCase()],
      isVerified: true,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    campusKnowledgeBase.unshift(newItem);
    res.status(201).json({ success: true, item: newItem });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add knowledge item.' });
  }
});

app.delete('/api/college/knowledge/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  campusKnowledgeBase = campusKnowledgeBase.filter((item) => item.id !== id);
  res.json({ success: true, message: 'Item deleted.' });
});

// ----------------------------------------------------
// FRONTEND STATIC / VITE INTEGRATION
// ----------------------------------------------------
async function startServer() {
  if (!isProd) {
    // Dynamic import vite for dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built static assets from dist/
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusMate AI Server running on http://0.0.0.0:${PORT} [mode: ${isProd ? 'production' : 'development'}]`);
    console.log(`Primary AI Engine: ${DEFAULT_MODEL} | Fallback: ${FALLBACK_MODEL}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CampusMate AI server:', err);
  process.exit(1);
});
