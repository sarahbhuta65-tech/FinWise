const mongoose = require("mongoose");

const financialSummarySchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: ["Income", "EMI", "SIP", "Bill", "Savings"],
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        dueDate:{
            type: Date,
            required: true,
        },

        notes: {
            type: String,
            default: "",
        },

        paid: {
            type: Boolean,
            default: false,
        },

        paidDate:{
            type: Date,
            default: null,
        },

        month:{
            type: Number,
            required: true,
        },

        year: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("FinancialSummary", financialSummarySchema);