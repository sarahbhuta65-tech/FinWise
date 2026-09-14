const express = require("express");

const router = express.Router();

const {
    getFaqs,
    getAdminFaqs,
    getFaqById,
    createFaq,
    updateFaq,
    deleteFaq,
} = require("../controllers/faqController");

const adminMiddleware = require("../middlewares/adminMiddleware");

// Public routes
router.get("/", getFaqs);
router.get("/:id", getFaqById);

// Admin-only routes
router.get("/admin/all", adminMiddleware, getAdminFaqs);
router.post("/", adminMiddleware, createFaq);
router.put("/:id", adminMiddleware, updateFaq);
router.delete("/:id", adminMiddleware, deleteFaq);

module.exports = router;