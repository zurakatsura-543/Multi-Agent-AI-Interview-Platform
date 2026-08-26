# HireGen-AI RAG Architecture

## 1. Executive Summary

HireGen-AI uses a resume and job-description focused Retrieval-Augmented Generation pipeline to make resume scoring, interview question generation, interview feedback, and final readiness reports more grounded.

The system does not ask the LLM to judge a resume directly from one large prompt only. Instead, it first extracts and chunks resume/JD text, retrieves the most relevant evidence using keyword and semantic retrieval, ranks that evidence with a hybrid strategy, and only then sends the top evidence to the LLM.

This gives three major benefits:

- Better JD-specific scoring because the LLM sees the most relevant resume and JD evidence.
- Lower hallucination risk because scoring and interview questions are tied to retrieved evidence.
- Better explainability because the UI can show why a resume scored well or why an interview question was asked.

High-level flow:

```text
Resume PDF + Job Description
        |
        v
PDF Text Extraction
        |
        v
Resume/JD Chunking
        |
        v
BM25 Keyword Retrieval + Vector Retrieval
        |
        v
Hybrid Evidence Ranking
        |
        v
Grounded LLM Scoring
        |
        v
Resume Scorer Evidence UI
        |
        v
Resume-Aware Interview Questions
        |
        v
Evidence-Grounded Feedback
        |
        v
Final Resume-JD Readiness Report
```

## 2. Problem This RAG System Solves

A normal LLM-only resume scorer has several weaknesses:

- It may miss exact JD keywords such as "Redis", "Docker", "CI/CD", "AWS", or "React".
- It may over-score a resume based on general writing quality instead of JD fit.
- It may hallucinate claims that are not present in the resume.
- It cannot easily explain which resume lines matched which JD requirements.
- Interview questions may become generic instead of being based on real resume/JD gaps.

HireGen-AI solves this by treating the resume and JD as retrievable evidence.

The system asks:

- What does the JD require?
- Which resume chunks support those requirements?
- Which requirements are missing or weak?
- Which evidence should be shown to the LLM?
- Which gaps should become interview questions and practice recommendations?

## 3. RAG Is Used For Four Product Flows

### 3.1 Resume Scoring

The scorer compares resume chunks with JD chunks and generates:

- Match score
- Role fit summary
- Experience fit summary
- Keyword matches
- Keyword gaps
- Missing skills
- Recommendations
- RAG evidence pairs

The UI then shows the evidence behind the score.

### 3.2 Resume-Aware Interview Questions

When the user selects resume-aware interview mode, the system sends compact RAG evidence into the interview agent.

The interview agent uses:

- Strong matched evidence to ask deep-dive questions.
- Weak JD gaps to ask gap-probing questions.
- Resume context to personalize the interview.

For example:

```text
JD Requirement:
Experience with distributed caching and scalable backend systems.

Resume Evidence:
Built APIs with Redis caching for session and response optimization.

Generated Question:
Your resume mentions Redis caching, and the JD expects scalable backend systems.
How would you design cache invalidation for this system?
```

### 3.3 Evidence-Grounded Feedback

Feedback does not only check whether the answer is generally correct. It also checks whether the answer addressed the retrieved JD/resume evidence.

The feedback agent returns:

- Normal interview score
- Evidence coverage
- JD alignment
- Groundedness risk
- Improvements

### 3.4 Final Resume-JD Readiness Report

At the end of the interview, the report summarizes:

- Role readiness score
- Average JD alignment
- Evidence coverage summary
- Groundedness risk
- Strongest matched skills
- Weakest JD gaps
- Next practice plan

This makes the final report more like a hiring-readiness assessment than a simple mock interview score.

## 4. Backend Architecture

The RAG pipeline mainly lives in the resume service and is consumed by the interview service.

Important files:

```text
backend/services/resume/rag/chunker.js
backend/services/resume/rag/bm25Retriever.js
backend/services/resume/rag/vectorRetriever.js
backend/services/resume/rag/hybridRetriever.js
backend/services/resume/controllers/resume.controller.js
backend/services/resume/agents/resume.agent.js
backend/services/resume/models/resume.model.js

backend/services/interview/agents/interview.agent.js
backend/services/interview/agents/feedback.agent.js
backend/services/interview/agents/summary.agent.js
backend/services/interview/prompts/technicalInterviewPrompt.js
backend/services/interview/prompts/hrInterviewPrompt.js
backend/services/interview/prompts/feedbackPrompt.js
backend/services/interview/prompts/summaryPrompt.js
backend/services/interview/models/interview.model.js
```

## 5. Step 1: Text Extraction

The resume service receives a PDF file from the frontend.

The PDF is parsed into raw text before chunking. The extracted text becomes the main resume document.

Inputs:

- Resume PDF
- Target role
- Required experience
- Job description

Output:

- Extracted resume text
- JD text
- Metadata such as role and required experience

Why this matters:

- RAG quality depends heavily on clean text.
- Bad extraction produces poor chunks.
- Poor chunks produce weak retrieval.

Production improvement:

- Add OCR fallback for scanned PDFs.
- Detect parsing quality, empty pages, and layout failures.
- Normalize bullets, section headers, and table-like content.

## 6. Step 2: Chunking Strategy

Chunking is implemented in:

```text
backend/services/resume/rag/chunker.js
```

The system chunks both resume and JD into smaller sections.

Each chunk has metadata:

```js
{
  chunkId: "resume-1",
  source: "resume",
  section: "skills",
  text: "...",
  wordCount: 74
}
```

For JD chunks:

```js
{
  chunkId: "jd-1",
  source: "job_description",
  section: "requirements",
  text: "...",
  wordCount: 81
}
```

### Why Chunking Is Needed

LLMs have context limits and are sensitive to noisy input. A full resume plus JD can contain:

- Irrelevant details
- Repeated sections
- Contact info
- Formatting artifacts
- Long descriptions

Chunking allows retrieval to select only the useful evidence.

### Current Chunking Approach

The system uses practical chunking:

- Separates resume and JD content.
- Keeps source labels.
- Preserves section-level metadata.
- Uses configurable chunk size and overlap.

### Chunk Size Tradeoff

Small chunks:

- Better precision
- Easier citations
- Lower token usage
- Risk losing context

Large chunks:

- More context
- Better for long projects
- Higher token usage
- More noise

For resumes, medium-small chunks usually work best because skills, projects, education, and experience are compact.

## 7. Step 3: BM25 Keyword Retrieval

Keyword retrieval is implemented in:

```text
backend/services/resume/rag/bm25Retriever.js
```

BM25 is used to find exact lexical matches between JD requirements and resume chunks.

Example:

```text
JD: "Experience with Redis, Docker, CI/CD"
Resume: "Built Redis caching and deployed Dockerized services"
```

BM25 is strong at matching exact terms like:

- Redis
- Docker
- MongoDB
- React
- AWS
- CI/CD
- REST API
- Kubernetes

### Why BM25 Matters

Recruiter screening and ATS systems often care about exact keywords. If the JD says "Redis" and the resume says "Redis", BM25 should strongly reward that.

Vector search alone may blur exact requirements. BM25 gives deterministic keyword evidence.

### BM25 Strengths

- Fast
- Explainable
- Good for exact skills/tools
- No embedding cost
- Easy to debug

### BM25 Weaknesses

- Weak on synonyms
- Weak on semantic equivalents
- May miss "distributed cache" vs "Redis"
- May overvalue repeated keywords

This is why the system also uses vector retrieval.

## 8. Step 4: Vector Retrieval

Vector retrieval is implemented in:

```text
backend/services/resume/rag/vectorRetriever.js
```

Vector retrieval converts text chunks into numeric embeddings and compares them using cosine similarity.

Example:

```text
JD: "Experience with distributed caching"
Resume: "Used Redis to reduce response latency"
```

BM25 may not strongly match this because "distributed caching" and "Redis" are not the same exact words. Vector search can understand that these are semantically related.

### Embedding Modes

The project supports:

```env
EMBEDDING_PROVIDER=auto
```

In auto mode:

- If `OPENAI_API_KEY` exists, it uses OpenAI embeddings.
- If no key exists, it falls back to local deterministic embeddings.

Production mode:

```env
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Free local mode:

```env
EMBEDDING_PROVIDER=local
```

### Why Local Embeddings Exist

The local embedding fallback is not meant to beat production embeddings. It exists so the project can run without paid API calls during development.

This improves developer experience:

- No key required
- No cost during local testing
- RAG flow still works
- UI can be tested end-to-end

In interviews, explain clearly:

> For production semantic retrieval I use OpenAI embeddings. For local development I added a deterministic fallback so the pipeline remains testable without external API cost.

## 9. Step 5: Hybrid Retrieval

Hybrid retrieval is implemented in:

```text
backend/services/resume/rag/hybridRetriever.js
```

Hybrid retrieval combines:

- BM25 keyword score
- Vector similarity score

Current weighting:

```text
Hybrid score = 0.40 * normalized BM25 + 0.60 * vector similarity
```

Why 40/60?

- Resume/JD matching needs exact keywords.
- But semantic fit is often more important than word overlap.
- A 60 percent vector weight helps catch meaning.
- A 40 percent BM25 weight keeps exact skills visible.

This can be tuned later based on evaluation.

### Hybrid Retrieval Example

JD requirement:

```text
Experience with caching systems and scalable backend APIs.
```

Resume chunk:

```text
Implemented Redis caching in Node.js APIs to reduce repeated database calls.
```

BM25 finds:

- caching
- APIs
- Redis maybe if JD includes it

Vector retrieval understands:

- Redis is related to caching systems
- Node.js APIs are backend APIs
- Reducing DB calls relates to scalability

Hybrid ranking combines both.

## 10. Step 6: Evidence Packet Construction

The resume controller builds a compact evidence packet from the top hybrid matches.

This packet is sent to the scoring LLM instead of blindly sending every chunk.

Evidence pair example:

```json
{
  "queryText": "Must have experience with machine learning models",
  "resumeText": "Built ML models using scikit-learn and evaluated performance",
  "matchedTerms": ["machine", "learning", "models"],
  "vectorSimilarity": 0.82,
  "hybridScore": 0.78
}
```

The LLM is instructed to score using this evidence.

Why this is important:

- Reduces prompt noise
- Reduces hallucination
- Improves explainability
- Makes UI citations possible
- Makes debugging easier

## 11. Step 7: Grounded Resume Scoring

The resume scoring agent uses:

- Extracted resume text
- Target role
- Required experience
- Job description
- RAG evidence context
- Uncovered JD gaps

The scoring output includes:

- `matchScore`
- `roleFitSummary`
- `candidateExperience`
- `experienceFitSummary`
- `keywordMatches`
- `keywordGaps`
- `missingSkills`
- `strengths`
- `weaknesses`
- `recommendations`

Stored RAG fields include:

```js
ragChunks
ragStats
ragKeywordMatches
ragRetrievalStats
ragVectorMatches
ragVectorStats
ragHybridMatches
ragHybridStats
ragScoringMode
ragScoringEvidenceCount
```

This makes the scorer transparent and auditable.

## 12. Step 8: Resume Scorer UI Evidence

The frontend shows retrieval evidence in:

```text
frontend/src/pages/Scorer.jsx
```

The UI displays:

- Hybrid RAG evidence
- Keyword evidence
- Vector evidence
- Matched terms
- Resume/JD evidence pairs

This is important because users should not only see "84/100". They should see why.

Explainability is a major production requirement for AI systems.

## 13. Step 9: Resume-Aware Interview RAG

The interview service consumes the saved resume RAG fields.

Important file:

```text
backend/services/interview/agents/interview.agent.js
```

The interview agent builds a compact RAG evidence pack from:

- `ragHybridMatches`
- `ragKeywordMatches`
- `ragVectorMatches`
- `keywordGaps`
- `missingSkills`

Then the technical or HR prompt uses this evidence.

### Technical Interview Behavior

If resume-aware mode is enabled:

- Q1 uses a strong matched resume/JD evidence pair.
- Q2 probes a weak JD gap.
- Later questions mix role fundamentals, scenario, and coding/practical questions.

If resume-aware mode is disabled:

- Questions are role-specific but general.
- No resume claims are used.
- No project or gap references are made.

### HR Interview Behavior

HR mode uses RAG evidence differently.

It does not ask:

- Implement this
- Design this architecture
- Explain this algorithm
- Debug this system

Instead, it asks about:

- Ownership
- Communication
- Learning attitude
- Handling gaps
- Teamwork
- Career growth

Example:

```text
Your resume has strong backend evidence, but the JD expects AWS exposure.
How would you communicate and close that gap in your first 60 days?
```

## 14. Step 10: Interview Evidence UI

The live interview UI shows why a question was asked.

Important file:

```text
frontend/src/components/interview/Step2interview.jsx
```

The panel shows:

- JD requirement
- Resume evidence
- Tested gap
- Retrieval method
- Retrieval signals

This improves user trust.

Instead of a black-box AI question, the user sees:

```text
Why this question?

JD Requirement:
Experience with scalable backend APIs.

Resume Evidence:
Built Node.js APIs and used Redis caching.

Gap Being Tested:
Cloud deployment experience.
```

## 15. Step 11: Evidence-Grounded Feedback

Feedback is generated by:

```text
backend/services/interview/agents/feedback.agent.js
backend/services/interview/prompts/feedbackPrompt.js
```

The feedback agent receives:

- Question
- Candidate answer
- Difficulty
- Retrieved evidence

It evaluates normal interview metrics:

- Correctness
- Clarity
- Relevance
- Detail
- Efficiency
- Communication
- Problem solving
- Creativity

It also evaluates RAG-specific metrics:

- `evidenceCoverage`
- `jdAlignment`
- `groundednessRisk`

### Evidence Coverage

Possible values:

```text
not_applicable
weak
partial
strong
```

Meaning:

- `strong`: Answer directly addressed the JD requirement and resume evidence.
- `partial`: Answer addressed some evidence but missed important pieces.
- `weak`: Answer was generic or did not address the evidence.
- `not_applicable`: No RAG evidence was attached.

### JD Alignment

A number from 0 to 100 measuring how well the answer addressed the target JD requirement.

### Groundedness Risk

Possible values:

```text
not_applicable
low
medium
high
```

Meaning:

- `low`: Answer is specific and supported.
- `medium`: Some claims are vague or weakly supported.
- `high`: Answer makes unsupported or contradictory claims.

## 16. Step 12: Final Resume-JD Readiness Report

The final report is generated by:

```text
backend/services/interview/agents/summary.agent.js
backend/services/interview/prompts/summaryPrompt.js
frontend/src/components/interview/Step3report.jsx
```

The report includes:

- `readinessScore`
- `averageJdAlignment`
- `groundednessRisk`
- `evidenceCoverageSummary`
- `strongestMatchedSkills`
- `weakestJdGaps`
- `nextPracticePlan`

This is the end-to-end RAG loop:

```text
Resume/JD Retrieval
        |
        v
Question Generation
        |
        v
Evidence-Grounded Feedback
        |
        v
Final Readiness Report
```

## 17. Data Model

Resume model stores retrieval and scoring evidence.

Important fields:

```js
ragChunks
ragKeywordMatches
ragVectorMatches
ragHybridMatches
ragStats
ragRetrievalStats
ragVectorStats
ragHybridStats
ragScoringMode
ragScoringEvidenceCount
```

Interview question model stores:

```js
question
difficulty
timer
source
focus
evidence
feedback
```

Question evidence stores:

```js
type
title
jdRequirement
resumeEvidence
testedGap
retrievalMethod
signals
```

Feedback stores:

```js
score
correctness
clarity
relevance
detail
efficiency
communication
problemSolving
creativity
evidenceCoverage
jdAlignment
groundednessRisk
feedback
improvements
```

Final interview report stores:

```js
overallScore
readinessScore
summary
strengths
weaknesses
recommendations
evidenceCoverageSummary
averageJdAlignment
groundednessRisk
strongestMatchedSkills
weakestJdGaps
nextPracticePlan
```

## 18. Guardrails

The system includes several guardrails:

### Prompt Guardrails

Prompts instruct the LLM to:

- Return valid JSON only.
- Avoid unsupported claims.
- Use retrieved evidence when available.
- Not invent companies, projects, tools, or years of experience.
- Keep HR questions non-technical.
- Keep general interviews independent from resume data.

### Parsing Guardrails

Agents use JSON cleanup and fallback parsing:

- Strip markdown code fences.
- Extract JSON arrays or objects from extra text.
- Throw controlled errors if parsing fails.

Implemented in:

```text
interview.agent.js
feedback.agent.js
summary.agent.js
resume.agent.js
```

### Evidence Guardrails

The interview agent attaches evidence metadata deterministically after question generation. This is better than trusting the LLM to invent citations.

This means:

- Evidence shown in UI comes from retrieval results.
- The LLM can ask the question, but evidence display stays grounded.
- General interviews do not receive resume evidence.

## 19. Latency and Cost Tradeoffs

### Where Latency Comes From

Main latency sources:

- PDF parsing
- Embedding generation
- Vector similarity search
- LLM scoring
- LLM interview question generation
- LLM feedback generation
- LLM final summary generation

### Current Optimizations

- Local embedding fallback for development.
- Compact evidence packets instead of sending every chunk.
- Redis caching exists in the project for repeated interview/dashboard data.
- Metadata is persisted in MongoDB to avoid recomputing evidence after scoring.

### Production Improvements

For large-scale production:

- Cache embeddings by content hash.
- Store vectors in a real vector database.
- Precompute resume embeddings after upload.
- Use async jobs for long resume analysis.
- Stream partial progress to frontend.
- Add timeout fallbacks.
- Track token usage and latency per request.

## 20. Scaling Architecture

Current architecture is good for a portfolio project and small production demo.

For larger scale:

```text
Frontend
   |
API Gateway
   |
Resume Service
   |
Queue / Worker
   |
Embedding Provider
   |
Vector DB + MongoDB + Redis
   |
Interview Service
   |
LLM Provider
```

### Recommended Production Components

- MongoDB for user, resume, interview, and metadata.
- Redis for cache, rate limits, and job state.
- Qdrant, Pinecone, Weaviate, or MongoDB Atlas Vector Search for vector storage.
- BullMQ or similar queue for async parsing/embedding jobs.
- OpenAI or another embedding provider for semantic retrieval.
- Groq/OpenAI/Gemini for LLM reasoning.
- Observability with structured logs, latency metrics, and error traces.

## 21. Vector Database Upgrade Path

Currently, vector retrieval can work in-process for local development.

For production, move vectors to a vector DB.

Recommended schema:

```json
{
  "id": "resumeId:chunkId",
  "vector": [0.012, -0.034, "..."],
  "payload": {
    "userId": "123",
    "resumeId": "abc",
    "source": "resume",
    "section": "projects",
    "text": "Implemented Redis caching...",
    "createdAt": "..."
  }
}
```

Search flow:

```text
Embed JD chunk
     |
Vector DB topK search over resume chunks
     |
BM25 keyword retrieval
     |
Hybrid merge and rerank
     |
Top evidence to LLM
```

## 22. Reranking Upgrade Path

Current hybrid retrieval uses weighted scoring.

Future reranking options:

- Cross-encoder reranker
- LLM-based reranking
- Reciprocal Rank Fusion
- Learning-to-rank based on historical feedback

Simple production upgrade:

```text
BM25 top 20 + Vector top 20
        |
Merge candidates
        |
Rerank top 10 using cross-encoder
        |
Send top 5 to LLM
```

## 23. Evaluation Metrics

For a production-ready RAG system, track:

### Retrieval Metrics

- Recall@K
- Precision@K
- Mean Reciprocal Rank
- Hit rate
- Evidence coverage

### Generation Metrics

- Groundedness
- Faithfulness
- Answer relevance
- JSON validity rate
- Hallucination rate

### Product Metrics

- Resume score consistency
- User completion rate
- Interview completion rate
- Feedback helpfulness
- Time to first result

### System Metrics

- Embedding latency
- Retrieval latency
- LLM latency
- Token usage
- Cache hit rate
- Error rate

## 24. How To Explain This In Interviews

Short version:

> I built a resume and job-description focused RAG pipeline for HireGen-AI. The system chunks resumes and JDs, retrieves relevant evidence using BM25 and vector similarity, combines them with hybrid ranking, and grounds resume scoring, interview questions, feedback, and final readiness reports on retrieved evidence.

Medium version:

> Instead of sending the full resume and JD directly to the LLM, I first convert them into chunks with source metadata. Then I run BM25 retrieval for exact skill matches and vector retrieval for semantic matches. I merge both using a hybrid score, send only the top evidence pairs to the LLM, and store the evidence in MongoDB. This lets the UI show why a resume was scored a certain way and why an interview question was asked.

Advanced version:

> The RAG pipeline uses a hybrid retrieval strategy because resume/JD matching needs both lexical precision and semantic recall. BM25 catches exact skills such as Redis, Docker, AWS, and React, while embeddings catch semantically related evidence such as "distributed caching" matching "Redis optimization". The final hybrid score weights semantic similarity slightly higher while preserving keyword matches. The evidence is reused across scoring, interview generation, feedback grounding, and final readiness reporting.

## 25. Common Interview Questions And Answers

### Q1. Why did you use hybrid retrieval instead of only vector search?

Because resume/JD matching needs both exact keyword matching and semantic understanding.

BM25 is better for exact tools and skills:

- Redis
- Docker
- React
- AWS
- CI/CD

Vector search is better for semantic matches:

- "distributed caching" and "Redis"
- "API scalability" and "optimized backend endpoints"
- "model evaluation" and "tested ML performance"

Hybrid retrieval gives better recall and better explainability.

### Q2. What is the difference between BM25 and vector search?

BM25 is lexical. It matches words and terms based on frequency and rarity.

Vector search is semantic. It embeds text into numeric vectors and retrieves chunks with similar meaning.

BM25 answers:

> Did the same important words appear?

Vector search answers:

> Are these two chunks talking about the same concept?

### Q3. How do you reduce hallucination?

The system reduces hallucination by:

- Retrieving top evidence before generation.
- Passing compact evidence packets to the LLM.
- Instructing the LLM to avoid unsupported claims.
- Showing evidence in the UI.
- Tracking groundedness risk in feedback.
- Storing source chunks and evidence pairs.

### Q4. How do you handle missing skills?

The JD chunks are treated as queries against resume chunks. If a JD requirement has weak or no resume evidence, it becomes a potential gap.

Those gaps are used in:

- Resume score weaknesses
- Resume recommendations
- Interview questions
- Feedback
- Final practice plan

### Q5. How would you scale this to many users?

I would:

- Move vector storage to Qdrant/Pinecone/MongoDB Atlas Vector Search.
- Cache embeddings by content hash.
- Run PDF parsing and embeddings in background workers.
- Use Redis for queues, caching, and rate limits.
- Store retrieval metadata for observability.
- Add latency and token usage tracking.
- Add retrieval evals to monitor quality.

### Q6. What happens if embedding API fails?

The system supports fallback behavior.

In local development it can use deterministic local embeddings. In production, I would add:

- Retry with exponential backoff
- Provider fallback
- Queue retry
- Graceful degradation to BM25-only retrieval
- User-visible retry state

### Q7. What are the main tradeoffs?

Main tradeoffs:

- More retrieval steps increase latency but improve quality.
- Larger chunks give more context but reduce precision.
- Smaller chunks improve citations but can lose context.
- Vector search improves semantic recall but costs more.
- BM25 is cheap and explainable but misses synonyms.
- Reranking improves precision but adds latency.

## 26. Resume Bullet Points

Use these on your resume:

- Built a production-style RAG pipeline for resume-JD matching using chunking, BM25 retrieval, embedding-based semantic search, and hybrid evidence ranking.
- Implemented evidence-grounded resume scoring with transparent JD/resume citations, keyword gaps, semantic matches, and role-fit recommendations.
- Extended RAG evidence into AI interview generation, producing resume-aware questions from retrieved JD requirements and candidate resume evidence.
- Added grounded feedback metrics including evidence coverage, JD alignment, and hallucination risk for each interview answer.
- Designed a final readiness report that summarizes strongest matched skills, weakest JD gaps, groundedness risk, and a personalized practice plan.
- Added local embedding fallback for development and OpenAI embedding support for production-style semantic retrieval.

## 27. System Design Talking Point

If asked to draw the architecture, draw this:

```text
                +------------------+
                |  React Frontend  |
                +--------+---------+
                         |
                         v
                +------------------+
                |   API Gateway    |
                +--------+---------+
                         |
        +----------------+----------------+
        |                                 |
        v                                 v
+------------------+             +------------------+
|  Resume Service  |             | Interview Service|
+--------+---------+             +--------+---------+
         |                                |
         v                                v
+------------------+             +------------------+
| PDF Extraction   |             | Question Agent   |
+--------+---------+             +--------+---------+
         |                                |
         v                                v
+------------------+             +------------------+
| Chunking         |             | Feedback Agent   |
+--------+---------+             +--------+---------+
         |                                |
         v                                v
+------------------+             +------------------+
| BM25 + Vectors   |             | Summary Agent    |
+--------+---------+             +--------+---------+
         |                                |
         v                                v
+------------------+             +------------------+
| Hybrid Retrieval |------------>| RAG Evidence Use |
+--------+---------+             +------------------+
         |
         v
+------------------+
| MongoDB + Redis  |
+------------------+
```

## 28. Current Limitations

The current implementation is strong for a portfolio project, but these are known limitations:

- Vectors are not yet stored in a dedicated vector database.
- Retrieval evaluation dashboard is not fully built yet.
- Local fallback embeddings are for development, not production-grade semantic quality.
- Only the latest resume per user is stored.
- PDF parsing may struggle with scanned resumes.
- No cross-encoder reranker yet.

These are not failures. They are realistic next steps and good interview discussion points.

## 29. Future Improvements

Recommended next improvements:

- Add Qdrant or MongoDB Atlas Vector Search.
- Add retrieval evaluation dashboard.
- Add OCR for scanned PDFs.
- Add multi-resume history and resume versioning.
- Add reranker for top evidence.
- Add async job queue for parsing and embeddings.
- Add token and latency analytics.
- Add groundedness trend across interviews.
- Add admin dashboard for RAG quality monitoring.

## 30. One-Minute Interview Pitch

> HireGen-AI has a resume/JD RAG engine that grounds the full career-prep workflow. A resume and job description are parsed, chunked, and indexed. BM25 finds exact keyword matches while vector retrieval finds semantic matches. A hybrid retriever ranks the strongest evidence pairs, and the LLM uses only the top evidence to score the resume, generate personalized interview questions, evaluate answers, and produce a final readiness report. The UI also exposes the evidence, so the system is explainable rather than a black-box AI score.



<!-- 
24. How To Explain This In Interviews
25. Common Interview Questions And Answers
26. Resume Bullet Points
27. System Design Talking Point
30. One-Minute Interview Pitch -->