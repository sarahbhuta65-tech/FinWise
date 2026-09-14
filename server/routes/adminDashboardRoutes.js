const express = require("express");

const router = express.Router();

const {
    getDashboardStats,
} = require("../controllers/adminDashboardController");

const adminMiddleware = require("../middlewares/adminMiddleware");

router.get(
    "/stats",
    adminMiddleware,
    getDashboardStats
);

module.exports = router;