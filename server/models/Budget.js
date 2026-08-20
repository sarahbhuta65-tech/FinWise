const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        month: {
            type: Number,
            required: true,
            min: 0,
            max: 11,
        },

        year: {
            type: Number,
            required: true,
        },

        totalBudget: {
            type: Number,
            required: true,
            min: 0,
        },

        categories: [
            {
                name: {
                    type: String,
                    required: true,
                },

                plannedAmount: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Budget", budgetSchema);