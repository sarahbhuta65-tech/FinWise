const express = require("express");
const router = express.Router();

const {
  saveEmi,
  getEmi,
} = require("../controllers/emiController");

router.post("/", saveEmi);

router.get("/:user", getEmi);

module.exports = router;