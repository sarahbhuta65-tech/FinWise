const express = require("express");
const router = express.Router();

const {
  getFinancialSummary,
  addFinancialSummary,
  togglePaymentStatus,
  deleteFinancialSummary,
} = require("../controllers/financialSummaryController");

// Get all commitments
router.get("/:userId", getFinancialSummary);

// Add new commitment
router.post("/:userId", addFinancialSummary);

// Mark Paid / Pending
router.patch("/:id", togglePaymentStatus);

// Delete commitment
router.delete("/:id", deleteFinancialSummary);

module.exports = router;