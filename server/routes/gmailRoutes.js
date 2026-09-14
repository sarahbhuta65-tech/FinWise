const express = require("express");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const createOAuth2Client = require("../config/googleAuth");
const authMiddleware = require("../middlewares/authMiddleware");
const Expense = require("../models/Expense");
const User = require("../models/User");

const router = express.Router();

router.get("/auth", (req, res) => {
    const { userId } = req.query;

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(400).send("A valid user ID is required.");
    }

    const oauth2Client = createOAuth2Client();
    const state = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/gmail.readonly",
        ],
        prompt: "consent",
        state,
    });

    res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return res.status(400).send("Authorization code or state not found.");
        }

        const { userId } = jwt.verify(state, process.env.JWT_SECRET);
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send("User not found.");
        }

        const oauth2Client = createOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token && !user.gmailRefreshToken) {
            return res.status(400).send(
                "Google did not provide a refresh token. Please reconnect Gmail."
            );
        }

        if (tokens.refresh_token) {
            user.gmailRefreshToken = tokens.refresh_token;
        }
        await user.save();

        console.log("Gmail authorization successful!");
        console.log("Tokens received.");

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/expense?gmail=connected`);
    } catch (error) {
        console.error("Gmail OAuth Error:", error);
        res.status(500).send("Failed to connect Gmail.");
    }
});

router.get("/status", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("gmailRefreshToken");

        res.json({
            success: true,
            connected: Boolean(user?.gmailRefreshToken),
        });
    } catch (error) {
        console.error("Gmail Status Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check Gmail connection status.",
        });
    }
});

function isTransactionEmail(snippet) {
    const transactionKeywords = [
        "transaction",
        "debited",
        "credited",
        "payment",
        "upi",
        "amount",
        "merchant"
    ];

    const text = snippet.toLowerCase();

    return transactionKeywords.some(keyword =>
        text.includes(keyword)
    );
}

function extractTransaction(snippet) {
    const amountMatch = snippet.match(/(?:Rs\.?|₹)\s?([\d,]+(?:\.\d{1,2})?)/i);
    const merchantMatch = snippet.match(/payment to\s+([^.]+)/i);
    const dateMatch = snippet.match(/Transaction Date:\s*(\d{2}\/\d{2}\/\d{4})/i);
    const typeMatch = snippet.match(/Transaction Type:\s*(\w+)/i);

    return {
        amount: amountMatch
            ? Number(amountMatch[1].replace(/,/g, ""))
            : null,

        merchant: merchantMatch
            ? merchantMatch[1].trim()
            : null,

        date: dateMatch
            ? dateMatch[1]
            : null,

        type: typeMatch
            ? typeMatch[1].toLowerCase()
            : null
    };
}

router.get("/messages", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
        }

        if (String(req.user.userId) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: "You can only access your own Gmail messages.",
            });
        }

        const user = await User.findById(userId).select("gmailRefreshToken");

        if (!user?.gmailRefreshToken) {
            return res.status(400).json({
                success: false,
                message: "Gmail is not connected. Please connect Gmail first.",
            });
        }

        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials({
            refresh_token: user.gmailRefreshToken,
        });

        const gmail = google.gmail({
            version: "v1",
            auth: oauth2Client,
        });

        // Get Gmail messages
        const response = await gmail.users.messages.list({
            userId: "me",
            maxResults: 5,
        });

        const messages = response.data.messages || [];

        // Get Gmail message IDs that are already imported
        const existingExpenses = await Expense.find(
            {
                user: userId,
                sourceMessageId: {
                    $exists: true,
                    $ne: null,
                },
            },
            "sourceMessageId"
        );

        const importedMessageIds = new Set(
            existingExpenses.map(
                (expense) => expense.sourceMessageId
            )
        );

        const emailDetails = [];

        for (const message of messages) {

            // Skip Gmail messages that are already imported
            if (importedMessageIds.has(message.id)) {
                continue;
            }

            const email = await gmail.users.messages.get({
                userId: "me",
                id: message.id,
                format: "full",
            });

            const isTransaction = isTransactionEmail(
                email.data.snippet
            );

            const transaction = isTransaction
                ? {
                    ...extractTransaction(
                        email.data.snippet
                    ),
                    messageId: email.data.id,
                }
                : null;

            console.log("Transaction:", transaction);

            emailDetails.push({
                id: email.data.id,
                snippet: email.data.snippet,
                isTransaction,
                transaction,
            });
        }

        res.json({
            success: true,
            messages: emailDetails,
        });

    } catch (error) {

        console.error("Gmail Fetch Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch Gmail messages.",
        });
    }
});
module.exports = router;