const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "with",
  "you",
  "your",
  "we",
  "will",
]);

const tokenize = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const termFrequency = (tokens) =>
  tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

const buildCorpus = (chunks = []) => {
  const documents = chunks.map((chunk) => {
    const tokens = tokenize(chunk.text);
    return {
      ...chunk,
      tokens,
      termFrequency: termFrequency(tokens),
      length: tokens.length || 1,
    };
  });

  const documentFrequency = {};
  documents.forEach((doc) => {
    new Set(doc.tokens).forEach((token) => {
      documentFrequency[token] = (documentFrequency[token] || 0) + 1;
    });
  });

  const averageLength =
    documents.reduce((sum, doc) => sum + doc.length, 0) / (documents.length || 1);

  return {
    documents,
    documentFrequency,
    averageLength,
  };
};

const bm25Score = ({
  queryTokens,
  document,
  documentFrequency,
  totalDocuments,
  averageLength,
  k1 = 1.5,
  b = 0.75,
}) => {
  const uniqueQueryTokens = [...new Set(queryTokens)];

  return uniqueQueryTokens.reduce((score, token) => {
    const frequency = document.termFrequency[token] || 0;
    if (!frequency) return score;

    const df = documentFrequency[token] || 0;
    const idf = Math.log(1 + (totalDocuments - df + 0.5) / (df + 0.5));
    const denominator =
      frequency + k1 * (1 - b + b * (document.length / averageLength));

    return score + idf * ((frequency * (k1 + 1)) / denominator);
  }, 0);
};

export const retrieveKeywordEvidence = ({
  chunks = [],
  topK = 8,
  minScore = 0.05,
}) => {
  const resumeChunks = chunks.filter((chunk) => chunk.source === "resume");
  const jdChunks = chunks.filter((chunk) => chunk.source === "job_description");

  if (!resumeChunks.length || !jdChunks.length) {
    return {
      matches: [],
      stats: {
        method: "bm25",
        queryChunks: jdChunks.length,
        corpusChunks: resumeChunks.length,
        topK,
        returned: 0,
      },
    };
  }

  const corpus = buildCorpus(resumeChunks);
  const matches = [];

  jdChunks.forEach((queryChunk) => {
    const queryTokens = tokenize(queryChunk.text);
    if (!queryTokens.length) return;

    corpus.documents.forEach((document) => {
      const score = bm25Score({
        queryTokens,
        document,
        documentFrequency: corpus.documentFrequency,
        totalDocuments: corpus.documents.length,
        averageLength: corpus.averageLength,
      });

      if (score < minScore) return;

      const matchedTerms = [...new Set(queryTokens)]
        .filter((token) => document.termFrequency[token])
        .slice(0, 12);

      matches.push({
        queryChunkId: queryChunk.chunkId,
        querySection: queryChunk.section,
        queryText: queryChunk.text,
        resumeChunkId: document.chunkId,
        resumeSection: document.section,
        resumeText: document.text,
        score: Number(score.toFixed(4)),
        matchedTerms,
      });
    });
  });

  const rankedMatches = matches
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return {
    matches: rankedMatches,
    stats: {
      method: "bm25",
      queryChunks: jdChunks.length,
      corpusChunks: resumeChunks.length,
      topK,
      returned: rankedMatches.length,
      minScore,
    },
  };
};
