const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

const User = require("../models/User");
const Payment = require("../models/Payment");
const adminMiddleware = require("../middlewares/adminMiddleware");
const plans = require("../config/plans");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.get("/plans", adminMiddleware, (req, res) => {
    res.json({ success: true, plans: Object.values(plans) });
});

router.get("/subscribers", adminMiddleware, async (req, res) => {
    try {
        const subscribers = await User.find({
            "subscription.plan": "premium"
        })
            .select("name email subscription");

        res.json({ success: true, subscribers });
    } catch (error) {
        console.error("Admin Subscribers Error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to fetch subscribers",
        });
    }
});

router.get("/payments", adminMiddleware, async (req, res) => {
    try {
        const payments = await Payment.find({})
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, payments });
    } catch (error) {
        console.error("Admin Payments Error:", error);
        res.status(500).json({ success: false, message: "Unable to fetch payments" });
    }
});

router.post("/subscribers/:id/grant-premium", adminMiddleware, async (req, res) => {
    try {
        const { billingCycle = "monthly", days } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const periodEnd = new Date();
        const extendDays = days || (billingCycle === "yearly" ? 365 : 30);
        periodEnd.setDate(periodEnd.getDate() + extendDays);

        user.subscription.plan = "premium";
        user.subscription.billingCycle = billingCycle;
        user.subscription.status = "active";
        user.subscription.startDate = user.subscription.startDate || new Date();
        user.subscription.currentPeriodEnd = periodEnd;
        user.subscription.endDate = periodEnd;
        user.subscription.cancelAtPeriodEnd = false;

        await user.save();
        res.json({ success: true, subscriber: user });
    } catch (error) {
        console.error("Admin Grant Premium Error:", error);
        res.status(500).json({ success: false, message: "Unable to grant premium" });
    }
});

router.post("/subscribers/:id/revoke-premium", adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.subscription.razorpaySubscriptionId) {
            try {
                await razorpay.subscriptions.cancel(user.subscription.razorpaySubscriptionId);
            } catch (razorpayError) {
                console.warn(
                    `Razorpay cancel failed for ${user.subscription.razorpaySubscriptionId} — likely a stale/legacy ID. Proceeding with local revoke.`,
                    razorpayError?.error?.description || razorpayError.message
                );
            }
        }

        user.subscription.plan = "free";
        user.subscription.status = "cancelled";
        user.subscription.cancelAtPeriodEnd = false;
        user.subscription.razorpaySubscriptionId = null;

        await user.save();
        res.json({ success: true, subscriber: user });
    } catch (error) {
        console.error("Admin Revoke Premium Error:", error);
        res.status(500).json({ success: false, message: "Unable to revoke premium" });
    }
});

module.exports = router;