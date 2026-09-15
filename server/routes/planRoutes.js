const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");

router.get("/", async (req, res) => {
    try {
        const plans = await Plan.find({}).sort({ price: 1 });
        res.json({ success: true, plans });
    } catch (error) {
        console.error("Public Plans Error:", error);
        res.status(500).json({ success: false, message: "Unable to fetch plans" });
    }
});

module.exports = router;