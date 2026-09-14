const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const{
    saveSip,
    getSip,
} = require("../controllers/sipController");

router.post("/", authMiddleware, saveSip);

router.get("/:user", authMiddleware, getSip);

module.exports = router;