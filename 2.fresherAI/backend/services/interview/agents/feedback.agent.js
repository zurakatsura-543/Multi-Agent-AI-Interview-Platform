import llm from "../config/llm.js";
import feedbackPrompt from "../prompts/feedbackPrompt.js";


const parseFeedbackJson = (rawResponse = "") => {
    const cleaned = rawResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start !== -1 && end !== -1 && end > start) {
            return JSON.parse(cleaned.slice(start, end + 1));
        }

        throw error;
    }
}


export const feedbackAgent = async (data) => {
    let rawResponse = "";

    try {
        const prompt = feedbackPrompt(data)

        const response = await llm.invoke(prompt)
        rawResponse = response.content

        return parseFeedbackJson(rawResponse)
    } catch (error) {
        console.log("Feedback Agent Parse Error");
    console.log(rawResponse || error.message);

    throw new Error("Failed to generate feedback");
        
    }
}
