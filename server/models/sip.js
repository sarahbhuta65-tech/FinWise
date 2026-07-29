const mongoose = require("mongoose");

const sipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    monthlyInvestment: {
      type: Number,
      required: true,
    },

    interestRate: {
      type: Number,
      required: true,
    },

    years: {
      type: Number,
      required: true,
    },

    investedAmount: {
      type: Number,
      required: true,
    },

    estimatedReturns: {
      type: Number,
      required: true,
    },

    totalValue: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Sip ||
  mongoose.model("Sip", sipSchema);