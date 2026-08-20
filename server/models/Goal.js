const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ FIX: prevents duplicate Goal documents for the same user
    },

    goalName: {
      type: String,
      required: true,
    },

    goalAmount: {
      type: Number,
      required: true,
    },

    savedAmount: {
      type: Number,
      required: true,
    },

    // Track the initial saved amount separately to preserve it
    initialSavedAmount: {
      type: Number,
      default: null,
    },

    progress: {
      type: Number,
      default: 0,
    },

    dueDay: {
      type: Number,
      min: 1,
      max: 31,
      default: 1,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    paid: {
        type: Boolean,
        default: false,
    },

    paidDate: {
        type: Date,
        default: null,
    },

    lastPaidMonth: {
        type: Number,
        default: null,
    },

    lastPaidYear: {
        type: Number,
        default: null,
    },

    lastPaymentAmount: {
        type: Number,
        default: 0,
    },

    paidMonths: {
        type: Number,
        default: 0,
    },

    totalMonths: {
        type: Number,
        required: true,
        min: 1,
    },

    monthsRemaining: {
        type: Number,
        default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", goalSchema);