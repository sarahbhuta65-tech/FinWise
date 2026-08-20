const express = require("express");

const router = express.Router();

const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");


// Get notifications
router.get(
  "/:userId",
  getNotifications
);


// Mark one as read
router.patch(
  "/read/:id",
  markNotificationRead
);


// Mark all as read
router.patch(
  "/read-all/:userId",
  markAllNotificationsRead
);


module.exports = router;