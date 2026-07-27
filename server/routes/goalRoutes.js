const express = require("express");
const router = express.Router();

const {
  saveGoal,
  getGoal,
  deleteGoal,
} = require("../controllers/goalController");

router.post("/", saveGoal);

router.get("/:user", getGoal);

router.delete("/:user", deleteGoal);

module.exports = router;