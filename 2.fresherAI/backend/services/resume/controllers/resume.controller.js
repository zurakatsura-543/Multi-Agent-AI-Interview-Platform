

// pdf  ---->  pdf Storage  ---> text ---> llm ---> agent ---> promt ---> data ---> save mongoDb ---> redis -->pdf delete ---> resume data ( score , missing skills , recommen.)

import redis from "../../../shared/redis/redis.js";
import { repairResumeJson, resumeAgent } from "../agents/resume.agent.js";
import extractText from "../config/pdf.js";
import Resume from "../models/resume.model.js";
import { retrieveKeywordEvidence } from "../rag/bm25Retriever.js";
import { buildResumeJdChunks } from "../rag/chunker.js";
import { retrieveHybridEvidence } from "../rag/hybridRetriever.js";
import { retrieveVectorEvidence } from "../rag/vectorRetriever.js";
import fs from "fs"

let resumeIndexReadyPromise;

const ensureResumeHistoryIndexes = async () => {
    if (!resumeIndexReadyPromise) {
        resumeIndexReadyPromise = Resume.collection.dropIndex("userId_1").catch((error) => {
            if (error?.codeName !== "IndexNotFound" && error?.code !== 27) {
                console.warn(`[resume] Could not drop legacy unique userId index: ${error.message}`);
            }
        });
    }

    return resumeIndexReadyPromise;
}

const toStringArray = (value) => {
    if (!Array.isArray(value)) {
        return value ? [String(value)] : [];
    }

    return value.map((item) => {
        if (typeof item === "string") {
            return item;
        }

        if (!item || typeof item !== "object") {
            return String(item);
        }

        return Object.values(item)
            .flat()
            .filter(Boolean)
            .join(" - ");
    }).filter(Boolean);
}

const normalizeResumeData = (data) => ({
    ...data,
    skills: toStringArray(data.skills),
    projects: toStringArray(data.projects),
    education: toStringArray(data.education),
    experience: toStringArray(data.experience),
    strengths: toStringArray(data.strengths),
    weaknesses: toStringArray(data.weaknesses),
    missingSkills: toStringArray(data.missingSkills),
    keywordMatches: toStringArray(data.keywordMatches),
    keywordGaps: toStringArray(data.keywordGaps),
    recommendations: toStringArray(data.recommendations),
    score: Number(data.score) || 0,
    matchScore: Number(data.matchScore) || Number(data.score) || 0,
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    summary: data.summary || "",
    suggestedRole: data.suggestedRole || "",
    targetRole: data.targetRole || "",
    roleFitSummary: data.roleFitSummary || "",
    requiredExperience: data.requiredExperience || "",
    candidateExperience: data.candidateExperience || "",
    experienceFitSummary: data.experienceFitSummary || "",
})

const extractJsonObject = (content = "") => {
    const cleaned = String(content)
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
        return cleaned;
    }

    return cleaned.slice(start, end + 1);
}

const parseResumeResponse = async (content) => {
    const jsonText = extractJsonObject(content);

    try {
        return JSON.parse(jsonText);
    } catch (error) {
        console.warn(`[resume] Invalid analyzer JSON, attempting repair: ${error.message}`);
        const repairedJson = await repairResumeJson(jsonText, error.message);
        return JSON.parse(extractJsonObject(repairedJson));
    }
}

const buildGroundedScoringContext = ({ ragData, ragHybridData, ragKeywordData, ragVectorData }) => {
    const matchedQueryChunkIds = new Set(
        (ragHybridData.matches || []).map((match) => match.queryChunkId)
    );
    const uncoveredJdChunks = (ragData.chunks || [])
        .filter((chunk) => chunk.source === "job_description" && !matchedQueryChunkIds.has(chunk.chunkId))
        .slice(0, 6);

    const evidenceLines = (ragHybridData.matches || [])
        .slice(0, 8)
        .map((match, index) => {
            const signals = (match.retrievalSignals || []).join("+") || "unknown";
            const terms = (match.matchedTerms || []).join(", ") || "semantic-only";
            return [
                `Evidence ${index + 1}`,
                `Hybrid Score: ${match.hybridScore}`,
                `Signals: ${signals}`,
                `BM25: ${match.keywordScore || 0}`,
                `Vector Similarity: ${match.vectorSimilarity || 0}`,
                `Matched Terms: ${terms}`,
                `JD Chunk (${match.querySection}): ${match.queryText}`,
                `Resume Chunk (${match.resumeSection}): ${match.resumeText}`,
            ].join("\n");
        })
        .join("\n\n");

    const uncoveredLines = uncoveredJdChunks
        .map((chunk, index) => `Uncovered JD Requirement ${index + 1} (${chunk.section}): ${chunk.text}`)
        .join("\n");

    return [
        "Use this retrieval packet as the primary source for job-match scoring.",
        `Hybrid retrieval weights: keyword ${ragHybridData.stats.keywordWeight}, vector ${ragHybridData.stats.vectorWeight}.`,
        `BM25 matches: ${ragKeywordData.stats.returned}. Vector matches: ${ragVectorData.stats.returned}. Hybrid matches: ${ragHybridData.stats.returned}.`,
        "",
        "Top hybrid evidence:",
        evidenceLines || "No hybrid evidence found.",
        "",
        "JD requirements with no top hybrid evidence:",
        uncoveredLines || "Every JD chunk has at least one retrieved resume evidence pair.",
    ].join("\n");
}


export const uploadResume = async (req,res) => {
    let file;
    try {
        file = req.file;
        if(!file){
            return res.status(400).json({
                success:false,
                message:"Resume PDF is required"
            })
        }
        const userId = req.headers["x-user-id"];
        const jobTitle = req.body?.jobTitle || "";
        const jobDescription = req.body?.jobDescription || "";
        const requiredExperience = req.body?.requiredExperience || "";

          if(!userId){
            return res.status(400).json({
                success:false,
                message:"UserId is required"
            })
        }

        const resumeText = await extractText(file.path)
        const ragData = buildResumeJdChunks({
            resumeText,
            jobDescription,
            jobTitle,
            requiredExperience,
        });
        const ragKeywordData = retrieveKeywordEvidence({
            chunks: ragData.chunks,
            topK: 8,
        });
        const ragVectorData = await retrieveVectorEvidence({
            chunks: ragData.chunks,
            topK: 8,
        });
        const ragHybridData = retrieveHybridEvidence({
            keywordMatches: ragKeywordData.matches,
            vectorMatches: ragVectorData.matches,
            topK: 8,
        });
        const ragContext = buildGroundedScoringContext({
            ragData,
            ragHybridData,
            ragKeywordData,
            ragVectorData,
        });

        const aiResponse = await resumeAgent(resumeText, {
            jobTitle,
            jobDescription,
            requiredExperience,
            ragContext,
        })

        const parsedResponse = await parseResumeResponse(aiResponse)
        const resumeData = normalizeResumeData({
            ...parsedResponse,
            targetRole: jobTitle || parsedResponse.targetRole || "",
            jobTitle,
            jobDescription,
            requiredExperience,
        })

        await ensureResumeHistoryIndexes();

        const resume = await Resume.create({
                userId,
                extractedText:resumeText,
                jobTitle,
                jobDescription,
                requiredExperience,
                ragChunks: ragVectorData.chunks,
                ragStats: ragData.stats,
                ragKeywordMatches: ragKeywordData.matches,
                ragRetrievalStats: ragKeywordData.stats,
                ragVectorMatches: ragVectorData.matches,
                ragVectorStats: ragVectorData.stats,
                ragHybridMatches: ragHybridData.matches,
                ragHybridStats: ragHybridData.stats,
                ragScoringMode: "hybrid-rag-grounded",
                ragScoringEvidenceCount: ragHybridData.matches.length,
                ...resumeData
            })

        await redis.set(`resume:${userId}`,JSON.stringify(resume));
        await redis.del(`resume-history:${userId}`);

        fs.unlinkSync(file.path);

        return res.status(200).json({
            success:true,
            message:"Resume analyzed successfully",
            data:resume
        })

        
    } catch (error) {
        console.log(error)

        if(file && fs.existsSync(file.path)){
            fs.unlinkSync(file.path);
        }
        return res.status(500).json({
            success:false,
            message:error.message,
        })
        
    }
}


export const getResume = async (req,res) => {
    try {
        const userId = req.headers["x-user-id"];

    const cache = await redis.get(`resume:${userId}`)

    if(cache){
        return res.status(200).json({
            success:true,
            source:"redis",
            data:JSON.parse(cache)
        })
    }
    const resume = await Resume.findOne({userId}).sort({ createdAt: -1 })

    if(!resume){
        return res.status(404).json({
            success:false,
            message:"resume not found"
        })
    }

    await redis.set(`resume:${userId}`,JSON.stringify(resume));
   

     return res.status(200).json({
            success:true,
            source:"mongoDb",
            data:resume
        })
        
    } catch (error) {
        console.log(error)
         return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
    


}

export const getAllResumeEvaluations = async (req,res) => {
    try {
        const userId = req.headers["x-user-id"];

        if(!userId){
            return res.status(400).json({
                success:false,
                message:"UserId is required"
            })
        }

        const cache = await redis.get(`resume-history:${userId}`)

        if(cache){
            return res.status(200).json({
                success:true,
                source:"redis",
                data:JSON.parse(cache)
            })
        }

        const resumes = await Resume.find({userId}).sort({ createdAt: -1 }).limit(20)

        await redis.set(`resume-history:${userId}`,JSON.stringify(resumes));

        return res.status(200).json({
            success:true,
            source:"mongoDb",
            data:resumes
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
