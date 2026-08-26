import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import llm from "../config/llm.js"

const RESPONSE_SCHEMA = `
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
`;

const cleanJsonContent = (content = "") =>
    String(content)
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

export const resumeAgent = async (resumeText, target = {}) => {
    const jobTitle = target.jobTitle || "";
    const jobDescription = target.jobDescription || "";
    const requiredExperience = target.requiredExperience || "";
    const ragContext = target.ragContext || "";
    const response = await llm.invoke([
        new SystemMessage(`
You are an Expert ATS Resume Analyzer and evidence-grounded Job Description Match Scorer.

Analyze the given resume against the target role, required experience, and job description.
When RAG evidence is provided, the Job Match Score, keyword matches, keyword gaps, role fit summary, experience fit summary, strengths, weaknesses, missing skills, and recommendations MUST be based on that retrieved evidence.
Use the full resume text only for identity extraction and broad resume fields such as name, email, phone, education, projects, experience, and skills.

Target Job Title:
${jobTitle || "Not provided"}

Required Experience:
${requiredExperience || "Not provided"}

Target Job Description:
${jobDescription || "Not provided"}

Retrieved Hybrid RAG Evidence:
${ragContext || "Not provided"}

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
12. If retrieved hybrid evidence is provided, do not invent unsupported skill matches.
13. If a JD requirement has weak or no resume evidence, include it in keywordGaps, missingSkills, weaknesses, or recommendations.
14. Mention evidence limits honestly. If evidence is weak, lower matchScore instead of guessing.
15. Recommendations must be concrete edits the candidate can make to improve alignment with the JD.

Response Format:

${RESPONSE_SCHEMA}
`),
   new HumanMessage(`
Resume text for profile extraction:
${resumeText}

Evidence-grounded scoring context:
${ragContext || "No retrieved evidence was provided. Use resume text and JD normally, but avoid unsupported claims."}
`),
    ])

    return cleanJsonContent(response.content);
}

export const repairResumeJson = async (brokenJson, parseError) => {
    const response = await llm.invoke([
        new SystemMessage(`
You repair invalid JSON from a resume analyzer.

Return ONLY valid JSON.
Do not use markdown.
Do not explain anything.
Keep the same meaning as much as possible.
Every field must exist.
Array fields must be arrays of strings only.
Do not return objects inside arrays.

Required schema:
${RESPONSE_SCHEMA}
`),
        new HumanMessage(`
JSON parse error:
${parseError}

Broken response:
${brokenJson}
`),
    ]);

    return cleanJsonContent(response.content);
}
