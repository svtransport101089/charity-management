import { GoogleGenAI } from "@google/genai";
import { MODELS } from "../constants";

// Helper to get AI client. 
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  // Fast Categorization (Flash Lite)
  categorizeExpense: async (description: string, amount: number) => {
    const ai = getAiClient();
    const prompt = `Categorize this expense: "${description}" amount: ${amount}. Return ONLY the category name from this list: Operational, Fundraising, Program Service, Administrative, Marketing, Other.`;
    
    const response = await ai.models.generateContent({
      model: MODELS.TEXT_FAST,
      contents: prompt,
    });
    return response.text?.trim() || 'Other';
  },
};
