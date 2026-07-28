const { GoogleGenAI } = require("@google/genai");

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-flash-latest";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: "v1alpha",
});

console.log("Gemini API key loaded:", !!process.env.GEMINI_API_KEY);
console.log("Gemini model selected:", MODEL_NAME);

async function askGemini(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text;

  } catch (error) {
    console.error("Gemini Error:", {
      name: error?.name,
      message: error?.message,
      status: error?.status,
      errors: error?.errors,
      response: error?.response?.data || error?.response,
    });
    throw error;
  }
}

module.exports = askGemini;