const mongoose = require("mongoose");

const emiSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    loanAmount: {
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

    emi: {
      type: Number,
      required: true,
    },

    totalPayment: {
      type: Number,
      required: true,
    },

    totalInterest: {
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

    paidAmount: {
      type: Number,
      default: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Emi", emiSchema);