import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import llm from "../config/llm.js"

export const resumeAgent = async (resumeText, target = {}) => {
    const jobTitle = target.jobTitle || "";
    const jobDescription = target.jobDescription || "";
    const requiredExperience = target.requiredExperience || "";
    const response = await llm.invoke([
        new SystemMessage(`
You are an Expert ATS Resume Analyzer and Job Description Match Scorer.

Analyze the given resume against the target role, required experience, and job description.

Target Job Title:
${jobTitle || "Not provided"}

Required Experience:
${requiredExperience || "Not provided"}

Target Job Description:
${jobDescription || "Not provided"}

Extract the following information:

- Full Name
- Email
- Phone Number
- Professional Summary
- Technical Skills
- Projects
- Education
- Experience
- Strengths
- Weaknesses
- Missing Skills
- Suggested Job Role
- ATS Score (0-100)
- Job Match Score (0-100)
- Keyword Matches
- Keyword Gaps
- Role Fit Summary
- Required Experience
- Candidate Experience
- Experience Fit Summary
- Recommendations

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do not use markdown.
3. Do not explain anything.
4. Do not add extra text.
5. Every field must exist.
6. Array fields must be arrays of strings only.
7. Do not return objects inside arrays.
8. If job title or job description is provided, score primarily based on role fit, relevant skills, project alignment, experience alignment, and missing JD keywords.
9. Experience fit matters strongly. Estimate candidate experience from resume dates, work history, internships, projects, and seniority signals.
10. If the required experience is higher than the candidate experience, reduce matchScore and clearly mention the experience gap in experienceFitSummary and weaknesses.
11. If job description is not provided, make matchScore equal to score and keep keywordMatches/keywordGaps based on the suggested role.

Response Format:

{
  "name":"",
  "email":"",
  "phone":"",
  "summary":"",
  "skills":["JavaScript","React","Node.js"],
  "projects":["Project name - tech stack - short description"],
  "education":["Degree - institution - duration - score"],
  "experience":["Role - company - duration - short description"],
  "strengths":["Clear project experience"],
  "weaknesses":["Missing deployment experience"],
  "missingSkills":["Docker"],
  "suggestedRole":"",
  "score":0,
  "matchScore":0,
  "targetRole":"",
  "roleFitSummary":"",
  "requiredExperience":"",
  "candidateExperience":"",
  "experienceFitSummary":"",
  "keywordMatches":["React"],
  "keywordGaps":["Docker"],
  "recommendations":["Add measurable project impact"]
}
`),
   new HumanMessage(resumeText),
    ])

    return response.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
}
