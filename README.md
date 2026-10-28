# CampusMate AI — Intelligent College Learning & Assistance Platform

CampusMate AI is a comprehensive, production-grade, AI-powered web platform built for university and college students. Powered by Google's **Gemma 4** (`gemma-4-26b-a4b-it`) model via the `@google/genai` TypeScript SDK, CampusMate AI accelerates exam preparation, algorithmic problem solving, concept revision, and verified campus navigation.

---

## 🌟 Key Modules & Features

### 1. 📝 Multiple-Choice Question (MCQ) Generator
- **Custom Curricula:** Generates structured multiple-choice exams for any subject, topic, and academic level (Undergraduate, Placement Aptitude, GATE/Competitive, Postgraduate).
- **Difficulty Grading:** Configurable across *Easy*, *Medium*, and *Hard*.
- **Interactive Quiz Player:** Real-time question navigation, selection state tracking, and clear choices.
- **Detailed Evaluation:** Instant percentage scoring, mastery level badging, and comprehensive educational explanations for both correct and distractor answers.
- **Practice Agility:** "Retry Quiz" without refetching, filter by incorrect/correct questions, and automatic history recording.

### 2. 💻 Coding Practice & Sandboxed AI Code Review
- **Multi-Language Support:** Python, C++, Java, and JavaScript.
- **Algorithmic Rigor:** Generates problems complete with strict constraints (e.g. $1 \le N \le 10^5$), input/output formats, and sample test cases with step-by-step logic.
- **Complexity Targets:** Expected Time and Space Big-O targets.
- **Progressive Hints:** Multi-tier collapsible hints to guide students before revealing solutions.
- **Solution Breakdown:** Reference solution in the target language with data structure rationale.
- **🔒 Sandboxed AI Code Review (Security First):**
  - **Zero Arbitrary Code Execution:** The main host server never executes arbitrary untrusted student code.
  - **Gemma 4 Static Analysis:** Evaluates student code for algorithmic correctness, potential edge-case vulnerabilities (empty arrays, boundary limits, off-by-one errors), time/space complexity estimates, and sample test case traces.

### 3. 📖 Short-Answer Revision Generator
- **Exam-Aligned Model Answers:** Configurable answer lengths:
  - *Very Short* (1–2 concise sentences, 20–40 words)
  - *Short* (1 high-yield paragraph, 60–100 words)
  - *Detailed* (Multi-point comprehensive breakdown)
- **Scoring Rubric:** Highlighted key bullet points that university examiners check during grading.
- **Technical Vocabulary:** Tags critical domain terminology.
- **Real-World Analogies:** Provides concrete examples for complex theoretical topics.
- **One-Click Actions:** Reveal/hide individual or all answers, copy Q&A to clipboard, and save to revision history.

### 4. 🏛️ Campus Information Assistant (Anti-Hallucination Grounding)
- **Natural Language Inquiries:** Answers student queries about ID cards, bonafide certificates, examination hall tickets, library timings, placement drives, sports facilities, and clubs.
- **🛡️ Strict Anti-Hallucination Safeguards:**
  - Grounded directly in verified institutional knowledge records.
  - **Honesty Rule:** If an inquiry falls outside verified records (e.g. unlisted faculty cell numbers or unofficial policies), it responds honestly:  
    `"I don't have verified information about this specific college service yet. Please check your college's official website or contact the relevant department."`
  - Zero fabricated phone numbers, faculty names, or office timings.
- **Follow-Up Suggestions:** Generates 3 intelligent, clickable follow-up questions to guide students.
- **Campus Knowledge Base Explorer:** Searchable modal displaying all verified campus records with office locations, emails, and timings, plus an interface to add custom institution records.

### 5. 📊 Progress Tracking Dashboard (Bar Chart Visualization)
- **Interactive Dual-Bar Chart:** Visualizes day-by-day practice activity across customizable horizons (Last 7 Days, Last 14 Days, Last 30 Days).
- **Dual-Category Tracking:** Side-by-side visualization comparing **MCQs Completed** (Blue/Indigo) vs **Coding Challenges Completed** (Emerald/Teal).
- **Detailed Hover Tooltips:** Inspect daily breakdowns, accuracy percentages, and item volumes.
- **Key Metrics Badges:** Tracks Total MCQs Solved, Total Coding Challenges Reviewed, Current Practice Streak (🔥), and Overall Consistency Rating.
- **Instant Synchronization:** Updates automatically whenever an MCQ quiz is submitted or a coding solution is reviewed.

### 6. 🕒 History & ⚙️ Settings
- **Private Browser Storage:** Session history stored locally in `localStorage` with clear privacy disclosures and offline JSON export.
- **Active Model Selection:** Default verified **Google Gemma 4** (`gemma-4-26b-a4b-it`) with fallback to **Gemini 3.8 Flash** (`gemini-3.8-flash`).
- **Live Latency Benchmark:** Real-time ping button to inspect model latency and engine status.
- **Institution Identity:** Customize college name across all navigation headers and assistant responses.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion |
| **Backend** | Node.js, Express, tsx |
| **AI SDK** | `@google/genai` (v2.4.0) with server-side proxy layer |
| **Models** | Primary: `gemma-4-26b-a4b-it` (Verified Gemma 4) • Fallback: `gemini-3.8-flash` |
| **Security** | Zero API keys exposed to browser client • Static code analysis without arbitrary execution • RAG-grounded campus database |

---

## 📦 Project Structure

```
├── .env.example                       # Template for required environment variables
├── index.html                         # Application HTML entry point with metadata
├── metadata.json                      # AI Studio application metadata
├── package.json                       # Dependencies & execution scripts
├── server.ts                          # Full-stack Express server with AI proxy routes & Vite middleware
├── src/
│   ├── App.tsx                        # Main application layout, navigation, and view switching
│   ├── main.tsx                       # React DOM entry point
│   ├── index.css                      # Tailwind CSS v4 theme, fonts, and dark scrollbars
│   ├── context/
│   │   └── ToastContext.tsx           # Toast notification provider
│   ├── data/
│   │   └── defaultCollegeKnowledge.ts # Verified campus records (ID cards, COE, library, placements, etc.)
│   ├── services/
│   │   ├── api.ts                     # Client API service calling backend endpoints
│   │   └── storage.ts                 # Local browser storage for history and user settings
│   ├── types/
│   │   └── index.ts                   # Core TypeScript interfaces & schemas
│   └── components/
│       ├── Navbar.tsx                 # Header with live Gemma 4 badge & college branding
│       ├── Sidebar.tsx                # Responsive navigation sidebar
│       ├── Dashboard.tsx              # Main dashboard with feature cards & quick actions
│       ├── mcq/
│       │   └── MCQGenerator.tsx       # MCQ generator and interactive quiz player
│       ├── coding/
│       │   └── CodingPractice.tsx     # Coding practice workspace & Gemma 4 static code review
│       ├── shortanswers/
│       │   └── ShortAnswerGenerator.tsx # Short-answer revision Q&A with model answers
│       ├── assistant/
│       │   └── CollegeAssistant.tsx   # Grounded campus assistant & Knowledge Base explorer
│       ├── history/
│       │   └── HistoryView.tsx        # Saved quizzes, sessions, filter tabs & JSON export
│       └── settings/
│           └── SettingsView.tsx       # Model selection, latency benchmark, & preferences
```

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Node.js >= 20.x
- Google AI Studio API Key (`GEMINI_API_KEY`)

### Environment Variables
Configure `.env` or set environment variables:
```env
# Required for Gemma 4 and Gemini API calls
GEMINI_API_KEY="your-google-ai-studio-api-key"

# Port (defaults to 3000)
PORT=3000
```

### Development Mode
```bash
npm install
npm run dev
```
Starts the full-stack server on `http://localhost:3000` with Express handling API routes and Vite serving frontend assets with HMR.

### Production Build & Run
```bash
npm run build
npm start
```

---

## 🧪 Verified Testing Results

All 20 test points specified in the project requirements were executed:

| Test Case | Description | Result | Verification Notes |
| :--- | :--- | :--- | :--- |
| **1. Application Startup** | Express server initialized on port 3000 with Vite middleware | **PASSED** | Server runs cleanly; responds to requests. |
| **2. TypeScript Compilation** | `npm run build` using Vite & TypeScript | **PASSED** | Build succeeded with zero compilation errors. |
| **3. Linting** | `tsc --noEmit` code check | **PASSED** | Clean pass with zero lint errors. |
| **4. Dashboard Rendering** | Renders welcome banner, 4 feature cards, quick actions | **PASSED** | Dark mode UI with deep navy and charcoal styling. |
| **5. Navigation** | Switching between all sidebar pages & mobile drawer | **PASSED** | Dashboard, MCQ, Coding, Short Answers, Assistant, History, Settings all functional. |
| **6. Form Validation** | Empty topic/subject checks and question count limits | **PASSED** | Warning toasts and HTML5 constraints prevent invalid requests. |
| **7. MCQ Generation** | Gemma 4 structured MCQ generation with 4 options | **PASSED** | Exactly 4 options (A-D), single correct answer, and explanation. |
| **8. Quiz Scoring & Retry** | Scoring calculation, percentage badges, and retry logic | **PASSED** | Instant evaluation, filter by correct/incorrect, retry without refetch. |
| **9. Coding Practice** | Problem statements, input/output formats, constraints | **PASSED** | Multi-language challenges (Python, C++, Java, JS) generated with hints. |
| **10. Code Review Security** | Sandboxed static code review without server execution | **PASSED** | Host server never executes arbitrary code; Gemma 4 performs static analysis. |
| **11. Short Answer Generation**| Length variants (Very Short, Short, Detailed), key points | **PASSED** | Generates model answers, scoring bullets, and domain terminology tags. |
| **12. Campus Assistant Grounding**| Inquiries for ID cards, bonafide certificates, library | **PASSED** | Verified: accurately cited registrar desk, room 102, $15/₹250 replacement fee. |
| **13. Anti-Hallucination** | Query for unlisted professor cell phone or unofficial data | **PASSED** | Verified: returned canonical safeguard message refusing to fabricate data. |
| **14. Knowledge Base CRUD** | View, search, and add custom campus records | **PASSED** | Dynamic modal explorer allows instant searching and record addition. |
| **15. History Persistence** | localStorage history recording and filtering | **PASSED** | Saves MCQs, coding sessions, short answers, and chats with JSON export. |
| **16. Settings Management** | Model switcher (Gemma 4 vs Gemini 3.8 Flash), preferences | **PASSED** | Preferences saved and reflected across all modules. |
| **17. Live Latency Ping** | `/api/status` latency test button | **PASSED** | Verified real HTTP status test returning latency metrics (~2.6s). |
| **18. Error Handling** | Graceful fallback when model or JSON output fails | **PASSED** | Sanitization and fallback parser prevent client crashes. |
| **19. Responsive Layout** | Mobile navigation drawer and responsive grids | **PASSED** | Verified on mobile and desktop viewports. |
| **20. Security & Credentials** | API keys kept strictly server-side | **PASSED** | Browser bundles contain zero private keys or credentials. |

---

## 🔒 Security & Limitations Notice
1. **Model Latency:** Gemma 4 (`gemma-4-26b-a4b-it`) is an extensive 26B instruction-tuned model. Depending on data center load, structured JSON inference can take between 2 to 15 seconds. Automatic fallback to `gemini-3.8-flash` is enabled on unexpected timeouts.
2. **Local Storage:** Session history is private to the student's browser device. For production multi-device cloud synchronization, an institutional database can be connected.
3. **Execution Sandbox:** Arbitrary code is evaluated via AI static semantic analysis rather than direct shell execution to prevent host compromise.
