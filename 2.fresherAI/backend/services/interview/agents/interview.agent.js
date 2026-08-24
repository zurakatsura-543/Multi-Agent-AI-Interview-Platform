import llm from "../config/llm.js"
import hrInterviewPrompt from "../prompts/hrInterviewPrompt.js"
import technicalInterviewPrompt from "../prompts/technicalInterviewPrompt.js"



export const interviewAgent = async (data) => {
    let rawResponse = "";

    try {
        const prompt = data.type?.toLowerCase() === "hr" ? hrInterviewPrompt(data) : technicalInterviewPrompt(data)

        const response = await llm.invoke(prompt)
        rawResponse = response.content

        const cleaned = rawResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

        return JSON.parse(cleaned)
    } catch (error) {
        console.log("Interview Agent Parse Error");
    console.log(rawResponse || error.message);

    throw new Error("Failed to generate interview questions.");
        
    }
}
