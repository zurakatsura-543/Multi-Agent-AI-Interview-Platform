import llm from "../config/llm.js";
import summaryPrompt from "../prompts/summaryPrompt.js";

const parseSummaryJson = (rawResponse = "") => {
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

export const summaryAgent = async (data) => {
    let rawResponse = "";

    try {
        const prompt = summaryPrompt(data)

        const response = await llm.invoke(prompt)
        rawResponse = response.content

        return parseSummaryJson(rawResponse)
    } catch (error) {
        console.log("Summary Agent Parse Error");
    console.log(rawResponse || error.message);

    throw new Error("Failed to generate Summary");
        
    }
}
