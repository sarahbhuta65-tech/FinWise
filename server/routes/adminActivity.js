const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const Faq = require("../models/Faq"); // adjust to your actual model names
const User = require("../models/User");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.get("/", adminMiddleware, async (req, res) => {
    try {
        const [recentBlog, recentFaq, recentUser] = await Promise.all([
            Blog.findOne({}).sort({ createdAt: -1 }).select("title createdAt"),
            Faq.findOne({}).sort({ createdAt: -1 }).select("question createdAt"),
            User.findOne({}).sort({ createdAt: -1 }).select("name createdAt"),
        ]);

        const items = [];
        if (recentBlog) items.push({ type: "blog", text: `New blog: ${recentBlog.title}`, date: recentBlog.createdAt });
        if (recentFaq) items.push({ type: "faq", text: `New FAQ: ${recentFaq.question}`, date: recentFaq.createdAt });
        if (recentUser) items.push({ type: "user", text: `New signup: ${recentUser.name}`, date: recentUser.createdAt });

        items.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json({ success: true, items });
    } catch (error) {
        console.error("Admin Activity Error:", error);
        res.status(500).json({ success: false, message: "Unable to fetch activity" });
    }
});

module.exports = router;