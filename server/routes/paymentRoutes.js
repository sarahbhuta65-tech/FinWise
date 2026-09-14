const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();
const User = require("../models/User");
const Payment = require("../models/Payment");
const authMiddleware = require("../middlewares/authMiddleware");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const plans = {
    monthly: process.env.RAZORPAY_MONTHLY_PLAN_ID,
    yearly: process.env.RAZORPAY_YEARLY_PLAN_ID,
};

router.post("/create-subscription", authMiddleware, async (req, res) => {
    try {
        const { billingCycle = "monthly" } = req.body;
        const planId = plans[billingCycle];

        if (!planId) {
            return res.status(503).json({
                success: false,
                message: `${billingCycle} Premium plan is not configured yet.`,
            });
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: billingCycle === "monthly" ? 12 : 5,
            customer_notify: 1,
            notes: {
                userId: String(req.user.userId),
                billingCycle,
            },
        });

        res.json({ success: true, subscription, billingCycle });
    } catch (error) {
        console.error("Razorpay Subscription Error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to start Premium subscription.",
        });
    }
});

router.post("/verify-subscription", authMiddleware, async (req, res) => {
    try {
        const {
            razorpay_subscription_id,
            razorpay_payment_id,
            razorpay_signature,
            billingCycle,
        } = req.body;

        if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Subscription verification details are missing.",
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Subscription verification failed.",
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "yearly" ? 12 : 1));

        user.subscription = {
            plan: "premium",
            billingCycle: billingCycle === "yearly" ? "yearly" : "monthly",
            status: "active",
            razorpaySubscriptionId: razorpay_subscription_id,
            startDate: new Date(),
            endDate: periodEnd,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
        };

        await user.save();

        // The checkout response is the first reliable source for the initial payment.
        // Webhooks continue recording later subscription charges.
        try {
            const payment = await razorpay.payments.fetch(razorpay_payment_id);
            const alreadyLogged = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });

            if (!alreadyLogged) {
                await Payment.create({
                    user: user._id,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySubscriptionId: razorpay_subscription_id,
                    amount: payment.amount / 100,
                    currency: payment.currency || "INR",
                    status: payment.status === "captured" ? "captured" : "failed",
                    billingCycle: user.subscription.billingCycle,
                });
            }
        } catch (paymentError) {
            // Payment logging must not undo a successfully verified subscription.
            console.error("Initial Razorpay Payment Logging Error:", paymentError);
        }

        res.json({
            success: true,
            message: "Premium subscription activated successfully.",
            subscription: user.subscription,
        });
    } catch (error) {
        console.error("Razorpay Subscription Verification Error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to verify Premium subscription.",
        });
    }
});

module.exports = router;
