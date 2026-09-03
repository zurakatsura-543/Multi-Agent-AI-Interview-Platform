# HireGen-AI Frontend

React/Vite frontend for HireGen-AI, the AI-powered interview preparation platform.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Environment

Create `frontend/.env` locally:

```env
VITE_BACKEND_URL=http://localhost:8000
VITE_FIREBASE_APIKEY=your_firebase_web_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

For production:

```env
VITE_BACKEND_URL=https://hiregen-ai-backend.onrender.com
VITE_FIREBASE_APIKEY=your_firebase_web_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

See the root [README.md](../README.md) for the full architecture, deployment, and RAG documentation.
