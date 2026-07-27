const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

    progress: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", goalSchema);