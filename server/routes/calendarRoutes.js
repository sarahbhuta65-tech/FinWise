const express = require("express");

const router = express.Router();

const {
    getCalendarEvents,
} = require("../controllers/calendarController");


// GET monthly calendar events
router.get("/:userId", getCalendarEvents);


module.exports = router;