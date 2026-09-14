const express = require("express");
const multer = require("multer");

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const premiumMiddleware = require("../middlewares/premiumMiddleware");
const {
    addExpense,
    getExpenses,
    deleteExpense,
    importExpenses,
    exportExpenses,
} = require("../controllers/expenseController");

// Multer configuration
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
});

// Add expense
router.post("/", addExpense);

router.get(
    "/export",
    authMiddleware,
    premiumMiddleware,
    exportExpenses
);

// Get expenses
router.get("/:user", getExpenses);

// Delete expense
router.delete("/:id", deleteExpense);

// Import CSV
router.post(
    "/import",
    authMiddleware,
    premiumMiddleware,
    upload.single("file"),
    importExpenses
);

module.exports = router;