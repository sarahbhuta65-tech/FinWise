const express = require("express");
const router = express.Router();

const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/status", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("subscription");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            subscription: user.subscription,
        });

    } catch (error) {
        console.error("Subscription Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch subscription status",
        });
    }
});

module.exports = router;