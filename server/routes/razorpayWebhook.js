// routes/razorpayWebhook.js
const express = require("express");
const crypto = require("crypto");

const router = express.Router();
const User = require("../models/User");
const Payment = require("../models/Payment");

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(req.body) // raw buffer
            .digest("hex");

        if (signature !== expectedSignature) {
            console.warn("Razorpay webhook: signature mismatch");
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        const event = JSON.parse(req.body.toString());
        const subscriptionEntity = event.payload?.subscription?.entity;
        const paymentEntity = event.payload?.payment?.entity;

        if (!subscriptionEntity) {
            // Not a subscription event we care about (e.g. payment.captured on its own) — ack and ignore
            return res.status(200).json({ success: true });
        }

        const razorpaySubscriptionId = subscriptionEntity.id;
        const user = await User.findOne({ "subscription.razorpaySubscriptionId": razorpaySubscriptionId });

        if (!user) {
            console.warn(`Razorpay webhook: no user found for subscription ${razorpaySubscriptionId}`);
            return res.status(200).json({ success: true }); // ack anyway so Razorpay stops retrying
        }

        switch (event.event) {
            case "subscription.charged":
                user.subscription.status = "active";
                if (subscriptionEntity.current_end) {
                    user.subscription.currentPeriodEnd = new Date(subscriptionEntity.current_end * 1000);
                }

                if (paymentEntity) {
                    const alreadyLogged = await Payment.findOne({ razorpayPaymentId: paymentEntity.id });
                    if (!alreadyLogged) {
                        await Payment.create({
                            user: user._id,
                            razorpayPaymentId: paymentEntity.id,
                            razorpaySubscriptionId,
                            amount: paymentEntity.amount / 100, // Razorpay sends paise
                            currency: paymentEntity.currency || "INR",
                            status: "captured",
                            billingCycle: user.subscription.billingCycle,
                        });
                    }
                }
                break;

            case "subscription.cancelled":
                user.subscription.status = "cancelled";
                user.subscription.plan = "free";
                break;

            case "subscription.completed":
                user.subscription.status = "expired";
                user.subscription.plan = "free";
                break;

            case "subscription.pending":
                user.subscription.status = "pending";
                break;

            default:
                return res.status(200).json({ success: true });
        }

        await user.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Razorpay Webhook Error:", error);
        res.status(500).json({ success: false, message: "Webhook processing failed" });
    }
});

module.exports = router;