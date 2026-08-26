const DEFAULT_DIMENSIONS = 384;

const normalizeText = (text = "") =>
  String(text).replace(/\s+/g, " ").trim().slice(0, 7000);

const hashToken = (token) => {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const normalizeVector = (vector) => {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
};

const createLocalEmbedding = (text, dimensions = DEFAULT_DIMENSIONS) => {
  const vector = new Array(dimensions).fill(0);
  const tokens = normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);

  tokens.forEach((token) => {
    const hash = hashToken(token);
    const index = hash % dimensions;
    const sign = hash % 2 === 0 ? 1 : -1;
    vector[index] += sign;
  });

  return normalizeVector(vector);
};

const cosineSimilarity = (left = [], right = []) => {
  const length = Math.min(left.length, right.length);
  if (!length) return 0;

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let i = 0; i < length; i += 1) {
    dotProduct += left[i] * right[i];
    leftMagnitude += left[i] * left[i];
    rightMagnitude += right[i] * right[i];
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator ? dotProduct / denominator : 0;
};

const createOpenAIEmbeddings = async (texts) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: texts.map(normalizeText),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI embeddings failed: ${response.status} ${message}`);
  }

  const data = await response.json();
  return {
    embeddings: data.data.map((item) => item.embedding),
    provider: "openai",
    model,
  };
};

const createEmbeddings = async (texts) => {
  const provider = (process.env.EMBEDDING_PROVIDER || "auto").toLowerCase();

  if (provider !== "local") {
    try {
      return await createOpenAIEmbeddings(texts);
    } catch (error) {
      if (provider === "openai") {
        throw error;
      }
      console.warn(`[rag] Falling back to local embeddings: ${error.message}`);
    }
  }

  return {
    embeddings: texts.map((text) => createLocalEmbedding(text)),
    provider: "local",
    model: `hashing-${DEFAULT_DIMENSIONS}`,
  };
};

export const retrieveVectorEvidence = async ({
  chunks = [],
  topK = 8,
  minSimilarity = 0.12,
}) => {
  const startedAt = Date.now();
  const resumeChunks = chunks.filter((chunk) => chunk.source === "resume");
  const jdChunks = chunks.filter((chunk) => chunk.source === "job_description");

  if (!resumeChunks.length || !jdChunks.length) {
    return {
      chunks,
      matches: [],
      stats: {
        method: "vector",
        provider: "none",
        model: "none",
        queryChunks: jdChunks.length,
        corpusChunks: resumeChunks.length,
        topK,
        returned: 0,
        minSimilarity,
        latencyMs: Date.now() - startedAt,
      },
    };
  }

  const texts = chunks.map((chunk) => `${chunk.source} ${chunk.section} ${chunk.text}`);
  const { embeddings, provider, model } = await createEmbeddings(texts);
  const embeddedChunks = chunks.map((chunk, index) => ({
    ...chunk,
    embedding: embeddings[index],
    embeddingProvider: provider,
    embeddingModel: model,
  }));

  const embeddedResumeChunks = embeddedChunks.filter((chunk) => chunk.source === "resume");
  const embeddedJdChunks = embeddedChunks.filter((chunk) => chunk.source === "job_description");
  const matches = [];

  embeddedJdChunks.forEach((queryChunk) => {
    embeddedResumeChunks.forEach((resumeChunk) => {
      const similarity = cosineSimilarity(queryChunk.embedding, resumeChunk.embedding);
      if (similarity < minSimilarity) return;

      matches.push({
        queryChunkId: queryChunk.chunkId,
        querySection: queryChunk.section,
        queryText: queryChunk.text,
        resumeChunkId: resumeChunk.chunkId,
        resumeSection: resumeChunk.section,
        resumeText: resumeChunk.text,
        similarity: Number(similarity.toFixed(4)),
        embeddingProvider: provider,
        embeddingModel: model,
      });
    });
  });

  const rankedMatches = matches
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return {
    chunks: embeddedChunks,
    matches: rankedMatches,
    stats: {
      method: "vector",
      provider,
      model,
      queryChunks: jdChunks.length,
      corpusChunks: resumeChunks.length,
      topK,
      returned: rankedMatches.length,
      minSimilarity,
      latencyMs: Date.now() - startedAt,
    },
  };
};
