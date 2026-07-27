const express = require("express");
const router = express.Router();

const{
    saveSip,
    getSip,
} = require("../controllers/sipController");

router.post("/", saveSip);

router.get("/:user", getSip);

module.exports = router;