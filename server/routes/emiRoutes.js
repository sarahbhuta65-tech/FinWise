const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  saveEmi,
  getEmi,
} = require("../controllers/emiController");

router.post("/", authMiddleware, saveEmi);

router.get("/:user", authMiddleware, getEmi);

module.exports = router;