import mongoose from "mongoose";

const ragChunkSchema = new mongoose.Schema(
  {
    chunkId: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["resume", "job_description"],
      required: true,
    },
    section: {
      type: String,
      default: "general",
    },
    text: {
      type: String,
      required: true,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    embeddingProvider: {
      type: String,
      default: "",
    },
    embeddingModel: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const ragStatsSchema = new mongoose.Schema(
  {
    resumeChunks: {
      type: Number,
      default: 0,
    },
    jdChunks: {
      type: Number,
      default: 0,
    },
    totalChunks: {
      type: Number,
      default: 0,
    },
    maxWords: {
      type: Number,
      default: 0,
    },
    overlapWords: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const ragKeywordMatchSchema = new mongoose.Schema(
  {
    queryChunkId: {
      type: String,
      required: true,
    },
    querySection: {
      type: String,
      default: "requirements",
    },
    queryText: {
      type: String,
      required: true,
    },
    resumeChunkId: {
      type: String,
      required: true,
    },
    resumeSection: {
      type: String,
      default: "resume",
    },
    resumeText: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    matchedTerms: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const ragVectorMatchSchema = new mongoose.Schema(
  {
    queryChunkId: {
      type: String,
      required: true,
    },
    querySection: {
      type: String,
      default: "requirements",
    },
    queryText: {
      type: String,
      required: true,
    },
    resumeChunkId: {
      type: String,
      required: true,
    },
    resumeSection: {
      type: String,
      default: "resume",
    },
    resumeText: {
      type: String,
      required: true,
    },
    similarity: {
      type: Number,
      default: 0,
    },
    embeddingProvider: {
      type: String,
      default: "",
    },
    embeddingModel: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const ragHybridMatchSchema = new mongoose.Schema(
  {
    queryChunkId: {
      type: String,
      required: true,
    },
    querySection: {
      type: String,
      default: "requirements",
    },
    queryText: {
      type: String,
      required: true,
    },
    resumeChunkId: {
      type: String,
      required: true,
    },
    resumeSection: {
      type: String,
      default: "resume",
    },
    resumeText: {
      type: String,
      required: true,
    },
    keywordScore: {
      type: Number,
      default: 0,
    },
    normalizedKeywordScore: {
      type: Number,
      default: 0,
    },
    vectorSimilarity: {
      type: Number,
      default: 0,
    },
    hybridScore: {
      type: Number,
      default: 0,
    },
    matchedTerms: {
      type: [String],
      default: [],
    },
    retrievalSignals: {
      type: [String],
      default: [],
    },
    embeddingProvider: {
      type: String,
      default: "",
    },
    embeddingModel: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const ragRetrievalStatsSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      default: "bm25",
    },
    queryChunks: {
      type: Number,
      default: 0,
    },
    corpusChunks: {
      type: Number,
      default: 0,
    },
    topK: {
      type: Number,
      default: 0,
    },
    returned: {
      type: Number,
      default: 0,
    },
    minScore: {
      type: Number,
      default: 0,
    },
    minSimilarity: {
      type: Number,
      default: 0,
    },
    provider: {
      type: String,
      default: "",
    },
    model: {
      type: String,
      default: "",
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    keywordWeight: {
      type: Number,
      default: 0,
    },
    vectorWeight: {
      type: Number,
      default: 0,
    },
    keywordMatches: {
      type: Number,
      default: 0,
    },
    vectorMatches: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);


const resumeSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    extractedText: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    matchScore: {
      type: Number,
      default: 0,
    },

    jobTitle: {
      type: String,
      default: "",
    },

    jobDescription: {
      type: String,
      default: "",
    },

    requiredExperience: {
      type: String,
      default: "",
    },

    summary: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    education: {
      type: [String],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    projects: {
      type: [String],
      default: [],
    },

    experience: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    suggestedRole: {
      type: String,
      default: "",
    },

    targetRole: {
      type: String,
      default: "",
    },

    roleFitSummary: {
      type: String,
      default: "",
    },

    candidateExperience: {
      type: String,
      default: "",
    },

    experienceFitSummary: {
      type: String,
      default: "",
    },

    keywordMatches: {
      type: [String],
      default: [],
    },

    keywordGaps: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },

    ragChunks: {
      type: [ragChunkSchema],
      default: [],
    },

    ragStats: {
      type: ragStatsSchema,
      default: () => ({}),
    },

    ragKeywordMatches: {
      type: [ragKeywordMatchSchema],
      default: [],
    },

    ragRetrievalStats: {
      type: ragRetrievalStatsSchema,
      default: () => ({}),
    },

    ragVectorMatches: {
      type: [ragVectorMatchSchema],
      default: [],
    },

    ragVectorStats: {
      type: ragRetrievalStatsSchema,
      default: () => ({}),
    },

    ragHybridMatches: {
      type: [ragHybridMatchSchema],
      default: [],
    },

    ragHybridStats: {
      type: ragRetrievalStatsSchema,
      default: () => ({}),
    },

    ragScoringMode: {
      type: String,
      default: "",
    },

    ragScoringEvidenceCount: {
      type: Number,
      default: 0,
    },
},{timestamps:true})


const Resume = mongoose.model("Resume" , resumeSchema)

export default Resume
