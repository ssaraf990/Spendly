# Spendly — AI-Powered Expense Tracker

A full-stack personal finance application that tracks spending, detects patterns, and uses Google Gemini AI to give personalised financial advice.

**Live Demo:** [Coming soon after deployment]

---

## The Problem

As a college student, I consistently overspent without knowing where my money was going. I built Spendly to solve my own problem — a finance tracker that doesn't just log expenses but actually tells you what to do about them.

---

## Features

- **Expense Management** — Add, edit, delete expenses with categories, dates, and notes
- **Dashboard Analytics** — Real-time spending breakdown by category with animated progress bars
- **Charts & Trends** — Monthly spending trends, day-of-week patterns, category comparisons
- **Budget Limits** — Set monthly budgets per category with live alerts when approaching limits
- **AI Financial Advisor** — Powered by Google Gemini API, analyses your actual spending data and gives specific actionable advice
- **JWT Authentication** — Secure signup/login with bcrypt password hashing
- **CSV Export** — Download your expense history as a spreadsheet

---

## Tech Stack

**Frontend**
- React.js (Hooks, Context API, React Router)
- Recharts for data visualisation
- CSS with glassmorphism and micro-animations

**Backend**
- Node.js + Express.js REST API
- MongoDB Atlas + Mongoose ODM
- JWT authentication + bcrypt password hashing
- Google Gemini API integration

---

## Architecture
```
Frontend (React)     Backend (Express)      Database (MongoDB)
     │                      │                      │
     │  HTTP + JWT token     │                      │
     │──────────────────────►│                      │
     │                       │   Mongoose queries   │
     │                       │─────────────────────►│
     │                       │                      │
     │                       │◄─────────────────────│
     │◄──────────────────────│                      │
     │                       │
     │          ┌────────────┴──────────┐
     │          │    Gemini API         │
     │          │  (spending analysis)  │
     │          └───────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Google Gemini API key (free at aistudio.google.com)

### Installation

**Clone the repo**
```bash
git clone https://github.com/ssaraf990/spendly.git
cd spendly
```

**Backend setup**
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```
```bash
npm run dev
```

**Frontend setup**
```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`, API at `http://localhost:8000`

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | ✗ |
| POST | `/api/auth/login` | Login and get JWT | ✗ |
| GET | `/api/expenses` | Get all expenses | ✓ |
| POST | `/api/expenses` | Add new expense | ✓ |
| PUT | `/api/expenses/:id` | Edit expense | ✓ |
| DELETE | `/api/expenses/:id` | Delete expense | ✓ |
| GET | `/api/expenses/analytics` | Get spending analytics | ✓ |
| GET | `/api/budgets` | Get budgets with spending | ✓ |
| POST | `/api/budgets` | Set budget limit | ✓ |
| DELETE | `/api/budgets/:id` | Remove budget | ✓ |
| POST | `/api/ai/advice` | Get AI financial advice | ✓ |

---

## Key Technical Decisions

**Why JWT over sessions?**
JWT is stateless — any server instance can verify any token without shared state, making it suitable for horizontally scalable systems.

**Why MongoDB over SQL?**
Expense data has flexible structure (different categories, optional notes) and doesn't require complex joins. MongoDB's document model fits naturally.

**Why Gemini API on the backend?**
API keys must never be exposed to the client. The backend acts as a secure proxy, also allowing us to pre-process and structure the spending data before sending it to the AI.

---

## Screenshots

> Add screenshots after deployment

---

## Author

**Satyam Saraf** — 3rd year CCE student at Manipal Institute of Technology

[GitHub](https://github.com/ssaraf990) · [LinkedIn](https://linkedin.com/in/satyam-saraf-1a3bba285)