

// pdf  ---->  pdf Storage  ---> text ---> llm ---> agent ---> promt ---> data ---> save mongoDb ---> redis -->pdf delete ---> resume data ( score , missing skills , recommen.)

import redis from "../../../shared/redis/redis.js";
import { resumeAgent } from "../agents/resume.agent.js";
import extractText from "../config/pdf.js";
import Resume from "../models/resume.model.js";
import fs from "fs"

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

        const aiResponse = await resumeAgent(resumeText, {
            jobTitle,
            jobDescription,
            requiredExperience
        })

        const parsedResponse = JSON.parse(aiResponse)
        const resumeData = normalizeResumeData({
            ...parsedResponse,
            targetRole: jobTitle || parsedResponse.targetRole || "",
            jobTitle,
            jobDescription,
            requiredExperience,
        })

        let resume = await Resume.findOne({userId})

        if(resume){
            Object.assign(resume,{
                ...resumeData,
                extractedText:resumeText,
                jobTitle,
                jobDescription,
                requiredExperience

            }    
            )
            await resume.save()
        }else{
            resume = await Resume.create({
                userId,
                extractedText:resumeText,
                jobTitle,
                jobDescription,
                requiredExperience,
                ...resumeData
            })
        }

        await redis.set(`resume:${userId}`,JSON.stringify(resume));

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
    const resume = await Resume.findOne({userId})

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
