const mongoose = require("mongoose");

const financialSummarySchema = new mongoose.Schema(
    {
        user: {
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

        dueDate: {
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

        paidDate: {
            type: Date,
            default: null,
        },

        month: {
            type: Number,
            required: true,
        },

        year: {
            type: Number,
            required: true,
        },

        // Where this commitment came from
        source: {
            type: String,
            enum: ["manual", "sip", "emi", "savings"],
            default: "manual",
        },

        // ID of the original SIP / EMI / Goal document
        sourceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        // Whether this commitment repeats every month
        recurring: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "FinancialSummary",
    financialSummarySchema
);