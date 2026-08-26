# Resume RAG Pipeline

This folder contains the resume/JD retrieval layer used by the Resume Scorer.

## Current Flow

1. `chunker.js` splits the resume and job description into labeled chunks.
2. `bm25Retriever.js` performs keyword/BM25-style retrieval for exact skill evidence.
3. `vectorRetriever.js` creates embeddings and performs cosine similarity retrieval for semantic evidence.
4. `hybridRetriever.js` combines BM25 and vector results into a single ranked evidence list.
5. `resume.controller.js` sends the top hybrid evidence packet into the scoring LLM so job-match scoring is grounded in retrieved evidence.
6. `resume.controller.js` stores keyword matches, vector matches, hybrid matches, chunk stats, retrieval stats, and scoring mode with the resume.

## Embedding Modes

By default, vector retrieval uses `EMBEDDING_PROVIDER=auto`.

In auto mode:
- If `OPENAI_API_KEY` is available, it uses OpenAI embeddings.
- If no embedding key is configured, it falls back to deterministic local hashing embeddings so local development keeps working.

For production-style semantic retrieval, add these to `backend/services/resume/.env`:

```env
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

For free local development:

```env
EMBEDDING_PROVIDER=local
```

## Resume Talking Point

Implemented resume/JD chunking with BM25 keyword retrieval, embedding-based semantic retrieval, hybrid evidence ranking, and evidence-grounded LLM scoring, storing grounded evidence pairs, retrieval metadata, provider/model details, latency, and match scores for transparent AI resume scoring.
