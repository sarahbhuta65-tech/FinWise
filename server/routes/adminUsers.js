const express = require("express");
const router = express.Router();

const User = require("../models/User");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.get("/", adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({})
            .select("name email createdAt subscription isAdmin")
            .sort({ createdAt: -1 });

        res.json({ success: true, users });
    } catch (error) {
        console.error("Admin Users Error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to fetch users",
        });
    }
});

// Update a user's basic profile fields only
router.patch("/:id", adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ["name", "email"]; // subscription removed — use dedicated routes below
        const updates = {};

        for (const key of allowedFields) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).select("name email createdAt subscription");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Admin Update User Error:", error);
        res.status(500).json({ success: false, message: "Unable to update user" });
    }
});

// Delete/deactivate a user
router.delete("/:id", adminMiddleware, async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        console.error("Admin Delete User Error:", error);
        res.status(500).json({ success: false, message: "Unable to delete user" });
    }
});

module.exports = router;