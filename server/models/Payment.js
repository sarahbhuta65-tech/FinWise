const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        razorpayPaymentId: {
            type: String,
            required: true,
            unique: true,
        },
        razorpaySubscriptionId: {
            type: String,
            default: null,
        },
        amount: {
            type: Number, // stored in rupees, not paise — convert on write
            required: true,
        },
        currency: {
            type: String,
            default: "INR",
        },
        status: {
            type: String,
            enum: ["captured", "failed", "refunded"],
            default: "captured",
        },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);