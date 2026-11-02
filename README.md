# CelebrAI — Every Celebration Deserves a Perfect Plan

> **PromptWars Virtual by Hack2Skill • Challenge 5: Celebration & Event Planner**  
> An elite AI-powered event planning and budget optimization platform that transforms simple ideas into beautifully organized celebrations.

---

## 🌟 5 Standout Hackathon Innovations

1. **One-Prompt Event Creation Engine**: Converts free-form conversational instructions (e.g. *"Plan a beautiful birthday celebration for 30 people with a pastel blue aesthetic, vegetarian food, elegant decorations and a total budget of ₹15,000"*) into a 14-section structured JSON master plan validated with Pydantic schemas.
2. **Context-Aware Conversational AI Assistant**: An intelligent copilot that maintains continuous situational awareness of the currently selected celebration (budget, guest count, location, theme) and executes **live data modifications** on command (theme updates, menu replacements, budget cuts).
3. **Intelligent Verbal Budget Optimizer**: Dynamically reallocates vendor expenses while guaranteeing zero budget creep (e.g. *"Reduce decorations by ₹1,000 and increase food budget by ₹1,000"*). Displays instant alerts if the plan exceeds spending caps and visualizes category distributions using interactive Recharts.
4. **AI Moodboard & Theme Studio**: Visual discovery studio with 9 aesthetic presets (Pastel, Minimalist, Royal & Gold, Bohemian, Traditional Indian, Floral) featuring interactive color palettes, table styling, lighting parameters, dress codes, and cake concepts.
5. **Smart 24-Hour Last-Minute Rescue**: An emergency triage matrix specifically designed for eleventh-hour event panic. Categorizes critical path tasks vs distractions that can be skipped, identifies ready-to-buy store purchases, and provides an hour-by-hour countdown timeline.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts, Canvas Confetti, HTML2Canvas |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2, Python-dotenv |
| **AI / NLP** | Google Gemini API with structured JSON output + Heuristic Heuristic Heuristics Fallback Engine |
| **Database** | SQLite persistent storage (Supabase PostgreSQL migration ready) |
| **Design System** | Linear/Stripe-grade pastel luxury palette (`#EAE6FF`, `#6750A4`, `#20243A`, `#FAF9F7`, `#DCEBFA`, `#F4DCE9`), Inter + Playfair Display typography, responsive light and dark mode |

---

## 📁 Project Architecture

```
celebrai/
├── backend/
│   ├── main.py              # FastAPI endpoints (Events, AI, Budget, Guests, Expenses)
│   ├── models.py            # Pydantic v2 data models & JSON schema contracts
│   ├── database.py          # SQLite persistence & Supabase-compatible repository
│   ├── ai_engine.py         # Gemini API client, NLP parser & heuristic fallback
│   ├── requirements.txt     # Python backend dependencies
│   ├── .env.example         # Environment template
│   └── celebrai.db          # Persistent SQLite database
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── EventContext.tsx     # Global celebration state, dark mode & toasts
    │   ├── services/
    │   │   └── api.ts               # Type-safe API client & proxy integration
    │   ├── components/
    │   │   ├── Navbar.tsx           # Global brand header, event switcher & theme toggle
    │   │   ├── Sidebar.tsx          # Linear-style dashboard navigation (12 modules)
    │   │   └── Toast.tsx            # Animated notifications
    │   ├── pages/
    │   │   ├── LandingPage.tsx          # Luxury SaaS landing page with photo showcases
    │   │   ├── DashboardOverview.tsx    # Executive control center & Recharts analytics
    │   │   ├── CreateEventPage.tsx      # One-Prompt AI generator & guided wizard
    │   │   ├── EventPlanView.tsx        # Comprehensive 14-section master plan viewer
    │   │   ├── BudgetPlannerPage.tsx    # Interactive budget tracker & verbal AI rebalancer
    │   │   ├── ThemeStudioPage.tsx      # Visual moodboards & 9 aesthetic presets
    │   │   ├── InvitationStudioPage.tsx # Customizable card designer & PNG export
    │   │   ├── GuestManagerPage.tsx     # RSVP tracker, dietary needs & plus-ones
    │   │   ├── EventTimelinePage.tsx    # Run-of-show schedule & milestone tracking
    │   │   ├── ShoppingChecklistPage.tsx# Categorized supply procurement list
    │   │   ├── AIAssistantPage.tsx      # Context-aware chat copilot
    │   │   ├── LastMinuteRescuePage.tsx # 24-hour emergency triage matrix
    │   │   ├── MyEventsPage.tsx         # Event portfolio manager
    │   │   └── SettingsPage.tsx         # Demo authentication & API status
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js v18+ (tested on v22)
- Python 3.10+

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# (Optional) Add your Gemini API key to .env:
# GEMINI_API_KEY="your-api-key"
# If omitted, CelebrAI automatically runs in its intelligent offline heuristic mode!

python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API docs are available at `http://127.0.0.1:8000/docs`.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend interface is live at `http://127.0.0.1:5173/`.*
