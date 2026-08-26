const DEFAULT_MAX_WORDS = 90;
const DEFAULT_OVERLAP_WORDS = 18;

const SECTION_PATTERNS = [
  ["summary", /\b(summary|profile|objective|about)\b/i],
  ["skills", /\b(skills|technical skills|technologies|tools)\b/i],
  ["projects", /\b(projects|academic projects|personal projects)\b/i],
  ["experience", /\b(experience|work experience|internship|employment)\b/i],
  ["education", /\b(education|qualification|academic)\b/i],
  ["certifications", /\b(certifications|certificates|achievements)\b/i],
];

const normalizeWhitespace = (text = "") =>
  String(text)
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const detectSection = (text = "", fallback = "general") => {
  const firstLine = text.split("\n").find(Boolean) || text;
  const match = SECTION_PATTERNS.find(([, pattern]) => pattern.test(firstLine));
  return match?.[0] || fallback;
};

const splitIntoBlocks = (text = "") => {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return [];

  const paragraphBlocks = normalized
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  if (paragraphBlocks.length > 1) return paragraphBlocks;

  return normalized
    .split(/\n|(?<=[.!?])\s+(?=[A-Z0-9])/g)
    .map((block) => block.trim())
    .filter(Boolean);
};

const chunkWords = (text, maxWords, overlapWords) => {
  const words = normalizeWhitespace(text).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return [words.join(" ")];

  const chunks = [];
  const step = Math.max(maxWords - overlapWords, 1);

  for (let start = 0; start < words.length; start += step) {
    const current = words.slice(start, start + maxWords);
    if (!current.length) break;
    chunks.push(current.join(" "));
    if (start + maxWords >= words.length) break;
  }

  return chunks;
};

const createChunkId = ({ source, section, index }) =>
  `${source}:${section}:${String(index + 1).padStart(3, "0")}`;

export const chunkText = ({
  text,
  source,
  fallbackSection = "general",
  maxWords = DEFAULT_MAX_WORDS,
  overlapWords = DEFAULT_OVERLAP_WORDS,
}) => {
  const blocks = splitIntoBlocks(text);
  const chunks = [];

  blocks.forEach((block) => {
    const section = detectSection(block, fallbackSection);
    const wordChunks = chunkWords(block, maxWords, overlapWords);

    wordChunks.forEach((chunk) => {
      const wordCount = chunk.split(/\s+/).filter(Boolean).length;
      if (wordCount < 4) return;

      chunks.push({
        chunkId: createChunkId({ source, section, index: chunks.length }),
        source,
        section,
        text: chunk,
        wordCount,
      });
    });
  });

  return chunks;
};

export const buildResumeJdChunks = ({
  resumeText = "",
  jobDescription = "",
  jobTitle = "",
  requiredExperience = "",
}) => {
  const resumeChunks = chunkText({
    text: resumeText,
    source: "resume",
    fallbackSection: "resume",
  });

  const jdContext = [
    jobTitle ? `Target Role: ${jobTitle}` : "",
    requiredExperience ? `Required Experience: ${requiredExperience}` : "",
    jobDescription,
  ]
    .filter(Boolean)
    .join("\n\n");

  const jdChunks = chunkText({
    text: jdContext,
    source: "job_description",
    fallbackSection: "requirements",
  });

  return {
    chunks: [...resumeChunks, ...jdChunks],
    stats: {
      resumeChunks: resumeChunks.length,
      jdChunks: jdChunks.length,
      totalChunks: resumeChunks.length + jdChunks.length,
      maxWords: DEFAULT_MAX_WORDS,
      overlapWords: DEFAULT_OVERLAP_WORDS,
    },
  };
};
