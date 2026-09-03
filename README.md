# HireGen-AI

An AI-powered interview preparation platform that turns resumes and job descriptions into grounded resume scores, personalized mock interviews, role-specific roadmaps, and progress insights.

HireGen-AI is built as a production-ready full-stack application with a React/Vite frontend, an Express backend, Firebase authentication, MongoDB persistence, Redis-backed session support, Razorpay billing, and a hybrid RAG pipeline using BM25 keyword retrieval plus semantic vector retrieval.

## Live

- Frontend: https://multi-agent-ai-interview-platform.vercel.app
- Backend health: https://hiregen-ai-backend.onrender.com/health

## Product Snapshot

HireGen-AI helps candidates answer one question: "Am I ready for this role?"

The platform supports:

- Resume upload and ATS-style resume building
- Resume scoring against a real job description
- RAG-grounded match analysis with retrieved evidence
- Resume-aware mock interview generation
- Technical and HR interview modes
- Answer feedback and interview reports
- Role-specific weekly roadmap generation
- Coin-based usage and Razorpay payments
- Firebase Google authentication
- Production deployment on Vercel and Render

## What Makes It Different

Most resume scorers send a resume and job description directly to an LLM and hope the model reasons correctly. HireGen-AI adds a retrieval layer before generation.

The system extracts resume and JD text, chunks both documents, retrieves exact keyword matches with BM25, retrieves semantic matches with embeddings, ranks the best evidence with a hybrid strategy, and only then asks the LLM to score or generate questions.

That makes the AI output more grounded, more explainable, and more useful for real interview preparation.

```text
Resume PDF + Job Description
        |
        v
Text Extraction and Chunking
        |
        v
BM25 Retrieval + Vector Retrieval
        |
        v
Hybrid Evidence Ranking
        |
        v
Grounded LLM Scoring and Interview Generation
        |
        v
Evidence-backed UI, Feedback, and Reports
```

## Core Features

### Resume Scorer

- Scores a resume against a target role and job description
- Extracts matched skills, missing skills, keyword gaps, and recommendations
- Stores RAG evidence pairs and retrieval metadata
- Supports saved resume evaluations and history

### Hybrid RAG Engine

- `chunker.js` splits resume and JD text into labeled chunks
- `bm25Retriever.js` finds exact keyword and skill overlap
- `vectorRetriever.js` finds semantic similarity with embeddings
- `hybridRetriever.js` combines both signals into ranked evidence
- Local fallback embeddings keep development usable without paid keys

### AI Interview Studio

- Generates role-specific interview questions
- Supports technical and HR interview modes
- Uses resume/JD evidence when resume-aware mode is selected
- Produces answer feedback and final reports

### Roadmap Builder

- Generates weekly learning plans for a target role, package, skill level, and experience range
- Can use resume gap analysis for stronger personalization
- Designed for campus placement and role-focused preparation

### Billing and Credits

- Coin-based access for AI features
- Razorpay order creation and payment verification
- Backend-side credential validation
- Lazy-loaded checkout script so the public landing page stays fast

### Production UX

- Public landing page loads immediately without waiting for backend auth checks
- Protected routes check authentication only when needed
- Route-level code splitting reduces first-load bundle size
- Vercel rewrite support for client-side routing
- Render health endpoint for backend monitoring

## Tech Stack

Frontend:

- React
- Vite
- React Router
- Redux Toolkit
- Tailwind CSS
- Motion
- Recharts
- Firebase client auth

Backend:

- Node.js
- Express
- MongoDB and Mongoose
- Firebase Admin
- Redis / Upstash
- Razorpay
- LangChain / LangGraph
- Groq LLM integration
- OpenAI embeddings with local fallback

Deployment:

- Vercel for frontend
- Render for backend
- MongoDB Atlas for database
- Upstash Redis for session/cache support

## Repository Structure

```text
2.fresherAI/
  frontend/
    src/
      pages/
      components/
      apis/
      redux/
      utils/
    index.html
    package.json

  backend/
    index.js
    gateway/
    services/
      auth/
      billing/
      interview/
      resume/
        rag/
      roadmap/
    package.json

  docs/
    RAG_ARCHITECTURE.md
```

## Local Setup

Clone the project and install dependencies:

```bash
git clone https://github.com/zurakatsura-543/Multi-Agent-AI-Interview-Platform.git
cd Multi-Agent-AI-Interview-Platform/2.fresherAI
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev:single
```

Open:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8000/health
```

## Environment Variables

Create environment files locally. Do not commit real `.env` files or service account JSON files.

### Frontend `.env`

```env
VITE_BACKEND_URL=http://localhost:8000
VITE_FIREBASE_APIKEY=your_firebase_web_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

For production on Vercel:

```env
VITE_BACKEND_URL=https://hiregen-ai-backend.onrender.com
VITE_FIREBASE_APIKEY=your_firebase_web_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Backend `.env`

```env
NODE_ENV=development
MONGODB_URL=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_encoded_firebase_service_account

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

EMBEDDING_PROVIDER=auto
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

REDIS_URL=your_redis_url
```

For local free development, semantic retrieval can run with deterministic local embeddings:

```env
EMBEDDING_PROVIDER=local
```

## Deployment Notes

### Vercel Frontend

Set the project root to:

```text
2.fresherAI/frontend
```

Required production variables:

```env
VITE_BACKEND_URL=https://hiregen-ai-backend.onrender.com
VITE_FIREBASE_APIKEY=your_firebase_web_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

The app includes a Vercel rewrite configuration so direct routes like `/dashboard`, `/billing`, `/scorer`, and `/roadmap` load correctly.

### Render Backend

Set the root directory to:

```text
2.fresherAI/backend
```

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Health check path:

```text
/health
```

Render free instances can spin down after inactivity. The landing page is optimized to load without waiting for the backend, but authenticated actions may still take longer on a cold backend.

## RAG Implementation Details

The RAG implementation is documented in detail here:

- [docs/RAG_ARCHITECTURE.md](docs/RAG_ARCHITECTURE.md)
- [backend/services/resume/rag/README.md](backend/services/resume/rag/README.md)

Key engineering points:

- Hybrid retrieval combines lexical and semantic search
- Evidence packets are stored with resume evaluations
- Interview generation can use retrieved resume/JD evidence
- Feedback and final reports can reason over role-aligned context
- Local embedding fallback keeps the app usable without external embedding APIs

## Resume Talking Points

- Built and deployed a full-stack AI interview preparation platform with React, Express, MongoDB, Firebase, Redis, Razorpay, and LLM integrations.
- Implemented a hybrid RAG pipeline with resume/JD chunking, BM25 retrieval, semantic vector retrieval, hybrid ranking, and evidence-grounded scoring.
- Designed resume-aware interview generation where questions are based on real resume strengths and JD gaps.
- Improved production UX with route-level code splitting, lazy payment SDK loading, protected-route auth checks, and faster public landing-page rendering.
- Added production deployment support across Vercel, Render, MongoDB Atlas, Upstash Redis, Firebase, Groq, OpenAI embeddings, and Razorpay.

## Status

HireGen-AI is live with:

- Frontend deployed on Vercel
- Backend deployed on Render
- MongoDB connected
- Firebase auth enabled
- RAG-powered resume scoring and interview flows
- Production CORS configured for the live frontend

## License

This project is built for portfolio, learning, and demonstration purposes.
