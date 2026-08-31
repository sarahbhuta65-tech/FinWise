const { GoogleGenAI } = require("@google/genai");

const MODEL_NAME =
  process.env.GEMINI_MODEL || "gemini-flash-latest";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: "v1alpha",
});

console.log(
  "Gemini API key loaded:",
  !!process.env.GEMINI_API_KEY
);

console.log(
  "Gemini model selected:",
  MODEL_NAME
);


const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));


async function askGemini(prompt) {

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {

    try {

      const response =
        await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
        });

      return response.text;

    } catch (error) {

      console.error(
        `Gemini attempt ${attempt}/${maxRetries} failed:`,
        {
          name: error?.name,
          message: error?.message,
          status: error?.status,
        }
      );


      // Retry only for temporary server/unavailable errors
      const isTemporaryError =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.status === 500;


      if (!isTemporaryError || attempt === maxRetries) {
        throw error;
      }


      // Wait before trying again
      const delay = attempt * 2000;

      console.log(
        `Retrying Gemini in ${delay / 1000} seconds...`
      );

      await sleep(delay);
    }
  }
}


module.exports = askGemini;