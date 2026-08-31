const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

router.post("/create-order", authMiddleware, async (req, res) => {
    try {
        const options = {
            amount: 49900,
            currency: "INR",
            receipt: `finwise_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
        });

    } catch (error) {
        console.error("Razorpay Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create Razorpay order",
        });
    }
});


// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

router.post("/verify-payment", authMiddleware, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are missing",
            });
        }

        // Create the signature using Razorpay secret
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(
                razorpay_order_id +
                "|" +
                razorpay_payment_id
            )
            .digest("hex");

        // Compare signatures
        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        // Find logged-in user
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update subscription
        user.subscription = {
            plan: "premium",
            status: "active",
            razorpaySubscriptionId: razorpay_payment_id,
            startDate: new Date(),
            endDate: null,
        };

        await user.save();

        res.json({
            success: true,
            message: "Premium activated successfully",
            subscription: user.subscription,
        });

    } catch (error) {
        console.error(
            "Razorpay Payment Verification Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to verify payment",
        });
    }
});

module.exports = router;