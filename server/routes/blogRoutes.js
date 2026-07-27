const express = require("express");
const router = express.Router();

const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

router.get("/", getBlogs);
router.post("/", createBlog);
router.delete("/:id", deleteBlog);
router.get("/:id", getBlogById);
router.put("/:id", updateBlog);

module.exports = router;