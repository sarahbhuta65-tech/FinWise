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
    You are FinWise AI, a smart personal financial advisor.

    The user is already inside the FinWise app.
    Do NOT introduce yourself in every reply.

    =========================
    USER
    =========================
    Name: ${user?.name}

    =========================
    FINANCIAL DATA
    =========================

    Total Expenses: ₹${totalExpense}

    Expenses:
    ${expenses.map((e) => `• ${e.name}: ₹${e.amount}`).join("\n") || "No expenses"}

    Goals:
    ${goals.map((g) => `• ${g.goalName}: ${g.progress}% completed`).join("\n") || "No goals"}

    SIPs:
    ${sips.map((s) => `• Monthly SIP ₹${s.monthlyInvestment}, ${s.interestRate}% for ${s.years} years`).join("\n") || "No SIPs"}

    EMIs:
    ${emis.map((e) => `• EMI ₹${e.emi} (${e.interestRate}% interest)`).join("\n") || "No EMIs"}

    =========================
    QUESTION
    =========================

    ${message}

    =========================
    RESPONSE RULES
    =========================

    - Keep replies under 120 words.
    - Never write essays.
    - Do NOT greet the user every time.
    - Use short bullet points.
    - Give only the most relevant advice.
    - Mention the user's own financial data when useful.
    - Use emojis naturally (💰 📈 🎯 💡).
    - End with ONE helpful suggestion or ONE follow-up question.
    - Do NOT repeat information unnecessarily.
    - Sound like ChatGPT, not a blog article.
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

router.get("/history/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({
      user: req.params.userId,
    })
      .sort({ updatedAt: -1 })
      .select("_id title updatedAt");

    res.json(chats);
  } catch (err) {
    res.status(500).json({
      message: "Unable to fetch history",
    });
  }
});

router.get("/insights/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const expenses = await Expense.find({ user: userId });
    const goals = await Goal.find({ user: userId });
    const sips = await Sip.find({ user: userId });
    const emis = await Emi.find({ user: userId });

    const insights = [];

    // Total Expense
    const totalExpense = expenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    // 1️⃣ Spending Insight
    if (totalExpense === 0) {
      insights.push({
        type: "info",
        icon: "📊",
        text: "Start tracking your expenses to receive personalized AI insights.",
      });
    } else if (totalExpense > 10000) {
      insights.push({
        type: "warning",
        icon: "⚠️",
        text: `You've spent ₹${totalExpense.toLocaleString()} this month. Consider reducing unnecessary expenses.`,
      });
    } else {
      insights.push({
        type: "success",
        icon: "✅",
        text: `Great! Your total spending is only ₹${totalExpense.toLocaleString()}.`,
      });
    }

    // 2️⃣ Highest Expense Category
    if (expenses.length) {
      const categoryTotals = {};

      expenses.forEach((expense) => {
        categoryTotals[expense.category] =
          (categoryTotals[expense.category] || 0) + Number(expense.amount);
      });

      const highestCategory = Object.entries(categoryTotals).sort(
        (a, b) => b[1] - a[1]
      )[0];

      insights.push({
        type: "info",
        icon: "📌",
        text: `${highestCategory[0]} is your highest spending category (₹${highestCategory[1].toLocaleString()}).`,
      });
    }

    // 3️⃣ Savings Goal
    if (goals.length) {
      const goal = goals[0];

      insights.push({
        type: goal.progress >= 80 ? "success" : "warning",
        icon: "🎯",
        text:
          goal.progress >= 80
            ? `Amazing! You've completed ${goal.progress.toFixed(1)}% of your savings goal.`
            : `You've completed ${goal.progress.toFixed(1)}% of your savings goal. Keep going!`,
      });
    }

    // 4️⃣ SIP Insight
    if (sips.length) {
      const totalSip = sips.reduce(
        (sum, sip) => sum + Number(sip.monthlyInvestment),
        0
      );

      insights.push({
        type: "success",
        icon: "📈",
        text: `You're investing ₹${totalSip.toLocaleString()} every month through SIP.`,
      });
    }

    // 5️⃣ EMI Insight
    if (emis.length) {
      const totalEmi = emis.reduce(
        (sum, emi) => sum + Number(emi.emi),
        0
      );

      insights.push({
        type: "warning",
        icon: "💳",
        text: `Your monthly EMI is ₹${totalEmi.toLocaleString()}. Make sure to pay it on time.`,
      });
    }

    res.json(insights);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Unable to generate insights",
    });
  }
});

module.exports = router;