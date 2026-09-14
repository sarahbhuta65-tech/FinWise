const express = require("express");

const router = express.Router();

const {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    getAdminBlogs,
} = require("../controllers/blogController");

const adminMiddleware = require("../middlewares/adminMiddleware");

// Public routes
router.get("/", getBlogs);
router.get("/:id", getBlogById);

// Admin-only routes
router.get("/admin/all", adminMiddleware, getAdminBlogs);
router.post("/", adminMiddleware, createBlog);
router.put("/:id", adminMiddleware, updateBlog);
router.delete("/:id", adminMiddleware, deleteBlog);

module.exports = router;