const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

router.get("/protected", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Authentication successful!",
        userId: req.user.userId,
    });
});

module.exports = router;