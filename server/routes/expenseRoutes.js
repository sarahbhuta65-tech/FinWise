const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
    addExpense,
    getExpenses,
    deleteExpense,
    importExpenses,
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


// Get expenses
router.get("/:user", getExpenses);


// Delete expense
router.delete("/:id", deleteExpense);


// Import CSV
router.post(
    "/import",
    upload.single("file"),
    importExpenses
);


module.exports = router;