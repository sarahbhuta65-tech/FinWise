const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const premiumMiddleware = require("../middlewares/premiumMiddleware");

router.get(
    "/protected",
    authMiddleware,
    premiumMiddleware,
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome to FinWise Premium! ⭐",
        });
    }
);

module.exports = router;