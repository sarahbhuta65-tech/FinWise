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

    dueDay: {
      type: Number,
      default: 1,
      min: 1,
      max: 31,
    },

    startDate: {
        type: Date,
        default: Date.now,
    },

    active: {
        type: Boolean,
        default: true,
    },

    paid: {
      type: Boolean,
      default: false,
    },

    paidDate: {
        type: Date,
        default: null,
    },

     paidMonth: {
      type: Number,
      default: null,
    },

    paidYear: {
        type: Number,
        default: null,
    },

    paidMonths: {
      type: Number,
      default: 0,
    },

    totalMonths: {
      type: Number,
      default: 0,
    },

    monthsRemaining: {
      type: Number,
      default: 0,
    },

    investedSoFar: {
      type: Number,
      default: 0,
    },

    remainingInvestment: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Sip ||
  mongoose.model("Sip", sipSchema);