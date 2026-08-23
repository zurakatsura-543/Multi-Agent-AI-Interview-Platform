import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import llm from "../config/llm.js"

export const resumeAgent = async (resumeText) => {
    const response = await llm.invoke([
        new SystemMessage(`
You are an Expert ATS Resume Analyzer.

Analyze the given resume.

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
- Recommendations

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do not use markdown.
3. Do not explain anything.
4. Do not add extra text.
5. Every field must exist.
6. Array fields must be arrays of strings only.
7. Do not return objects inside arrays.

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
