const express = require("express");

const router = express.Router();

const {
    generateNudge,
    getLatestNudge,
    dismissNudge,
} = require("../controllers/financialNudgeController");

router.get(
    "/:userId",
    getLatestNudge
);

router.post(
    "/generate/:userId",
    generateNudge
);

router.patch(
    "/dismiss/:id",
    dismissNudge
);

module.exports = router;