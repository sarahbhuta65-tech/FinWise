const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
    {
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        features: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);