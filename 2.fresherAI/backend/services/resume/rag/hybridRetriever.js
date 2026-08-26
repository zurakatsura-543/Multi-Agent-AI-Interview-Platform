const normalizeBm25Score = (score = 0, maxScore = 1) => {
  if (!maxScore) return 0;
  return Math.min(Number(score) / maxScore, 1);
};

const pairKey = (match) => `${match.queryChunkId}::${match.resumeChunkId}`;

export const retrieveHybridEvidence = ({
  keywordMatches = [],
  vectorMatches = [],
  keywordWeight = 0.4,
  vectorWeight = 0.6,
  topK = 8,
}) => {
  const startedAt = Date.now();
  const maxKeywordScore = Math.max(
    ...keywordMatches.map((match) => Number(match.score) || 0),
    0
  );
  const mergedMatches = new Map();

  keywordMatches.forEach((match) => {
    mergedMatches.set(pairKey(match), {
      queryChunkId: match.queryChunkId,
      querySection: match.querySection,
      queryText: match.queryText,
      resumeChunkId: match.resumeChunkId,
      resumeSection: match.resumeSection,
      resumeText: match.resumeText,
      keywordScore: Number(match.score) || 0,
      normalizedKeywordScore: normalizeBm25Score(match.score, maxKeywordScore),
      vectorSimilarity: 0,
      matchedTerms: match.matchedTerms || [],
      retrievalSignals: ["keyword"],
    });
  });

  vectorMatches.forEach((match) => {
    const key = pairKey(match);
    const existing = mergedMatches.get(key);

    if (existing) {
      existing.vectorSimilarity = Number(match.similarity) || 0;
      existing.embeddingProvider = match.embeddingProvider || "";
      existing.embeddingModel = match.embeddingModel || "";
      existing.retrievalSignals = [...new Set([...existing.retrievalSignals, "semantic"])];
      return;
    }

    mergedMatches.set(key, {
      queryChunkId: match.queryChunkId,
      querySection: match.querySection,
      queryText: match.queryText,
      resumeChunkId: match.resumeChunkId,
      resumeSection: match.resumeSection,
      resumeText: match.resumeText,
      keywordScore: 0,
      normalizedKeywordScore: 0,
      vectorSimilarity: Number(match.similarity) || 0,
      embeddingProvider: match.embeddingProvider || "",
      embeddingModel: match.embeddingModel || "",
      matchedTerms: [],
      retrievalSignals: ["semantic"],
    });
  });

  const rankedMatches = [...mergedMatches.values()]
    .map((match) => {
      const hybridScore =
        match.normalizedKeywordScore * keywordWeight +
        match.vectorSimilarity * vectorWeight;

      return {
        ...match,
        hybridScore: Number(hybridScore.toFixed(4)),
      };
    })
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, topK);

  return {
    matches: rankedMatches,
    stats: {
      method: "hybrid",
      keywordWeight,
      vectorWeight,
      keywordMatches: keywordMatches.length,
      vectorMatches: vectorMatches.length,
      topK,
      returned: rankedMatches.length,
      latencyMs: Date.now() - startedAt,
    },
  };
};
