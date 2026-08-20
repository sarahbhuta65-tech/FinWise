const express = require("express");

const router = express.Router();

const {
    saveBudget,
    getBudget,
    deleteBudget,
} = require("../controllers/budgetController");


router.post("/", saveBudget);

router.get("/:user/:month/:year", getBudget);

router.delete("/:user/:month/:year", deleteBudget);


module.exports = router;