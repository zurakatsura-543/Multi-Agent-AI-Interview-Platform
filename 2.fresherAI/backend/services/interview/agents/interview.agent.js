import llm from "../config/llm.js"
import hrInterviewPrompt from "../prompts/hrInterviewPrompt.js"
import technicalInterviewPrompt from "../prompts/technicalInterviewPrompt.js"

const toList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return [value].filter(Boolean);
}

const clip = (text = "", limit = 360) => {
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    return normalized.length > limit ? `${normalized.slice(0, limit)}...` : normalized;
}

const buildRagEvidencePack = (resume = {}) => {
    const hybridMatches = toList(resume.ragHybridMatches).slice(0, 6);
    const keywordMatches = toList(resume.ragKeywordMatches).slice(0, 4);
    const vectorMatches = toList(resume.ragVectorMatches).slice(0, 4);
    const gaps = [
        ...toList(resume.keywordGaps),
        ...toList(resume.missingSkills),
    ].filter((item, index, list) => list.indexOf(item) === index).slice(0, 10);

    const evidence = hybridMatches.length ? hybridMatches : [...keywordMatches, ...vectorMatches].slice(0, 6);

    if (!evidence.length && !gaps.length) {
        return "";
    }

    const evidenceLines = evidence.map((match, index) => [
        `Evidence ${index + 1}:`,
        `JD asks: ${clip(match.queryText)}`,
        `Resume shows: ${clip(match.resumeText)}`,
        match.matchedTerms?.length ? `Matched terms: ${match.matchedTerms.slice(0, 8).join(", ")}` : "",
        match.retrievalSignals?.length ? `Signals: ${match.retrievalSignals.join(", ")}` : "",
    ].filter(Boolean).join("\n")).join("\n\n");

    return [
        "RAG Evidence Pack:",
        evidenceLines,
        gaps.length ? `Uncovered / weak JD skills: ${gaps.join(", ")}` : "",
        resume.ragHybridStats?.method ? `Retrieval method: ${resume.ragHybridStats.method}` : "",
    ].filter(Boolean).join("\n\n");
}

const buildRagEvidenceItems = (resume = {}) => {
    const hybridMatches = toList(resume.ragHybridMatches).slice(0, 6);
    const keywordMatches = toList(resume.ragKeywordMatches).slice(0, 4);
    const vectorMatches = toList(resume.ragVectorMatches).slice(0, 4);
    const matches = hybridMatches.length ? hybridMatches : [...keywordMatches, ...vectorMatches].slice(0, 6);
    const gaps = [
        ...toList(resume.keywordGaps),
        ...toList(resume.missingSkills),
    ].filter((item, index, list) => list.indexOf(item) === index);

    return matches.map((match, index) => ({
        type: "resume_jd_match",
        title: index === 0 ? "Top resume-JD match" : "Retrieved resume-JD evidence",
        jdRequirement: clip(match.queryText, 260),
        resumeEvidence: clip(match.resumeText, 260),
        testedGap: gaps[index] || "",
        retrievalMethod: resume.ragHybridStats?.method || resume.ragRetrievalStats?.method || "hybrid",
        signals: [
            ...toList(match.retrievalSignals),
            ...(match.matchedTerms?.length ? [`terms: ${match.matchedTerms.slice(0, 5).join(", ")}`] : []),
        ].slice(0, 4),
    }));
}

const parseQuestionJson = (rawResponse = "") => {
    const cleaned = rawResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        const start = cleaned.indexOf("[");
        const end = cleaned.lastIndexOf("]");

        if (start !== -1 && end !== -1 && end > start) {
            return JSON.parse(cleaned.slice(start, end + 1));
        }

        throw error;
    }
}

const attachRagEvidenceToQuestions = (questions = [], evidenceItems = [], useResume = false) => {
    if (!useResume || !evidenceItems.length) return questions;

    let evidenceIndex = 0;

    return questions.map((question) => {
        if (question?.source !== "resume") return question;

        const evidence = evidenceItems[evidenceIndex % evidenceItems.length];
        evidenceIndex += 1;

        return {
            ...question,
            evidence,
        };
    });
}



export const interviewAgent = async (data) => {
    let rawResponse = "";

    try {
        const shouldUseResume = Boolean(data.useResume && data.resume);
        const ragEvidenceItems = shouldUseResume ? buildRagEvidenceItems(data.resume) : [];
        const promptData = {
            ...data,
            useResume: shouldUseResume,
            resume: shouldUseResume ? data.resume : null,
            ragEvidencePack: shouldUseResume ? buildRagEvidencePack(data.resume) : "",
        }

        const prompt = data.type?.toLowerCase() === "hr" ? hrInterviewPrompt(promptData) : technicalInterviewPrompt(promptData)

        const response = await llm.invoke(prompt)
        rawResponse = response.content

        const questions = parseQuestionJson(rawResponse)
        return attachRagEvidenceToQuestions(questions, ragEvidenceItems, shouldUseResume)
    } catch (error) {
        console.log("Interview Agent Parse Error");
    console.log(rawResponse || error.message);

    throw new Error("Failed to generate interview questions.");
        
    }
}
