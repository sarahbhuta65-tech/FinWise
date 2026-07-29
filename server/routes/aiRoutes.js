const express = require("express");
const router = express.Router();

const askGemini = require("../services/aiService");

const User = require("../models/User");
const Expense = require("../models/Expense");
const Goal = require("../models/Goal");
const Sip = require("../models/sip");
const Emi = require("../models/emi");
const Chat = require("../models/Chat");

router.post("/chat", async (req, res) => {
  try {
    const { message, userId, chatId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({
        message: "Message and User ID are required.",
      });
    }

    const user = await User.findById(userId);

    const expenses = await Expense.find({ user: userId });
    const goals = await Goal.find({ user: userId });
    const sips = await Sip.find({ user: userId });
    const emis = await Emi.find({ user: userId });

    const totalExpense = expenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const prompt = `
You are FinWise AI.

User Name: ${user?.name}

Expenses:
${expenses
  .map((e) => `${e.name} ₹${e.amount}`)
  .join("\n")}

Goals:
${goals
  .map((g) => `${g.goalName} ${g.progress}%`)
  .join("\n")}

SIPs:
${sips
  .map((s) => `₹${s.monthlyInvestment}`)
  .join("\n")}

EMIs:
${emis
  .map((e) => `₹${e.emi}`)
  .join("\n")}

Question:
${message}

Give professional financial advice.
`;

    const reply = await askGemini(prompt);

    let chat;

    // Existing chat
    if (chatId) {
      chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(404).json({
          message: "Chat not found",
        });
      }
    }

    // New chat
    else {
      chat = await Chat.create({
        user: userId,
        title: message.substring(0, 40),
        messages: [],
      });
    }

    // Save user message
    chat.messages.push({
      sender: "user",
      text: message,
    });

    // Save AI reply
    chat.messages.push({
      sender: "ai",
      text: reply,
    });

    await chat.save();

    res.json({
      reply,
      chatId: chat._id,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "AI Error",
    });
  }
});

module.exports = router;