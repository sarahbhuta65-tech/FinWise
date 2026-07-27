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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Emi", emiSchema);