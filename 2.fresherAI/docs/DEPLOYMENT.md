# HireGen-AI Deployment Guide

This project originally runs as local microservices:

- `services/auth`
- `services/resume`
- `services/interview`
- `services/roadmap`
- `services/billing`
- `gateway`

For deployment, the backend now also has a single production entry point:

```bash
backend/index.js
```

That server mounts all service routes under one Express app, so hosted users only need:

- one frontend URL
- one backend URL
- no local Docker
- no local Redis server
- no manual multi-terminal startup

## Production Architecture

```text
Vercel Frontend
    |
    | HTTPS API calls with cookies
    v
Render Backend: backend/index.js
    |
    | MongoDB data
    v
MongoDB Atlas
    |
    | Sessions/cache
    v
Upstash Redis
```

External services:

- Firebase Authentication
- Groq LLM
- OpenAI embeddings for RAG
- Razorpay payments

## Backend Deploy

Recommended host: Render Web Service.

Render settings:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Required backend environment variables:

```env
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-custom-domain.com

MONGODB_URL=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/hiregenai
REDIS_URL=rediss://default:PASSWORD@your-upstash-host:6379

FIREBASE_SERVICE_ACCOUNT_BASE64=base64_encoded_firebase_service_account_json

GROQ_API_KEY=your_groq_api_key

EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Use `backend/.env.example` as the template.

## Frontend Deploy

Recommended host: Vercel.

Vercel settings:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Required frontend environment variables:

```env
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

VITE_FIREBASE_APIKEY=your_firebase_web_api_key
VITE_FIREBASE_AUTHDOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECTID=your_project_id
VITE_FIREBASE_STORAGEBUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGINGSENDERID=your_sender_id
VITE_FIREBASE_APPID=your_app_id
```

Use `frontend/.env.example` as the template.

## Firebase Setup

In Firebase Console:

1. Enable Google Authentication.
2. Add your production frontend domain to Authorized domains.
3. Download the Firebase Admin service account JSON.
4. Convert it to base64:

```bash
base64 -w 0 serviceAccountKey.json
```

5. Put the output into Render as `FIREBASE_SERVICE_ACCOUNT_BASE64`.

Do not commit `serviceAccountKey.json`.

## Razorpay Setup

Use the same Razorpay key pair in both places:

- Backend:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
- Frontend:
  - `VITE_RAZORPAY_KEY_ID`

If the frontend key id and backend key secret are from different key pairs, payment verification will fail.

## Local Production Test

After installing root backend dependencies:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

For local frontend testing:

```env
VITE_BACKEND_URL=http://localhost:8000
```

## Health Check

After backend deployment, open:

```text
https://your-backend.onrender.com/health
```

Expected response:

```json
{
  "success": true,
  "status": "ok",
  "mongo": "connected"
}
```

## Important Notes

- The old microservice dev command still exists:

```bash
cd backend
npm run dev
```

- The production deploy command is:

```bash
cd backend
npm start
```

- Use hosted Redis in production. Do not depend on local Docker Redis.
- Keep `.env` files private. Commit only `.env.example`.
