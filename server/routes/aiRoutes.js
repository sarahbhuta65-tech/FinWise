const express = require("express");
const router = express.Router();

const askGemini = require("../services/aiService");

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const reply = await askGemini(message);

    res.json({
      reply,
    });

  } catch (error) {
    console.error("AI route error:", error?.message || error);
    if (error?.stack) console.error(error.stack);

    res.status(500).json({
      message: "AI Error",
    });
  }
});

module.exports = router;