const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        author: {
            type: String,
            required: true,
        },

        thumbnail: {
            type: String,
            required: true,
        },

        publishDate: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            default: "Published",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Blog", blogSchema);
