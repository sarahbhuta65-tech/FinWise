const Faq = require("../models/Faq");

// Get all FAQs
const getFaqs = async (req, res) => {
    try {
        const faqs = await Faq.find({
            status: "Published",
        }).sort({
            createdAt: -1,
        });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get FAQ by ID
const getFaqById = async (req, res) => {
    try {
        const faq = await Faq.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({
                message: "FAQ not found",
            });
        }
        res.json(faq);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Create FAQ
const createFaq = async (req, res) => {
    try {
        const faq = await Faq.create(req.body);
        res.status(201).json(faq);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Update FAQ
const updateFaq = async (req, res) => {
    try {
        const faq = await Faq.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );
        if (!faq) {
            return res.status(404).json({
                message: "FAQ not found",
            });
        }
        res.json(faq);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Delete FAQ
const deleteFaq = async (req, res) => {
    try {
        await Faq.findByIdAndDelete(req.params.id);
        res.json({
            message: "FAQ deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    getFaqs,
    getFaqById,
    createFaq,
    updateFaq,
    deleteFaq,
};