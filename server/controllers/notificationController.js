const Notification = require("../models/Notification");
const FinancialSummary = require("../models/FinancialSummary");

// ==========================================
// GET USER NOTIFICATIONS
// ==========================================

const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    //Generate latest notifications //
    await generateNotifications(userId);
    

    const notifications = await Notification.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(50);

    res.status(200).json(notifications);

  } catch (error) {

    console.error(
      "Get Notifications Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================

const markNotificationRead = async (req, res) => {
  try {

    const notification =
      await Notification.findById(
        req.params.id
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    notification.read = true;

    await notification.save();

    res.status(200).json(notification);

  } catch (error) {

    console.error(
      "Mark Notification Read Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

const markAllNotificationsRead = async (req, res) => {
  try {

    await Notification.updateMany(
      {
        user: req.params.userId,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.status(200).json({
      message: "All notifications marked as read.",
    });

  } catch (error) {

    console.error(
      "Mark All Notifications Read Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GENERATE FINANCIAL NOTIFICATIONS
// ==========================================

const generateNotifications = async (userId) => {
  try {
    const today = new Date();

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    // Upcoming = next 3 days
    const upcomingDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 3,
      23,
      59,
      59,
      999
    );

    // Get unpaid financial commitments
    const items = await FinancialSummary.find({
      user: userId,
      paid: false,
      dueDate: {
        $lte: upcomingDate,
      },
    });

    for (const item of items) {

      const dueDate = new Date(item.dueDate);

      let type;
      let title;
      let message;

      // ======================================
      // OVERDUE
      // ======================================

      if (dueDate < startOfToday) {

        type = "overdue";

        title = `${item.type} Overdue`;

        message =
          `${item.title} of ₹${Number(
            item.amount
          ).toLocaleString("en-IN")} was due on ${dueDate.toLocaleDateString(
            "en-IN"
          )}.`;
      }

      // ======================================
      // DUE TODAY
      // ======================================

      else if (
        dueDate >= startOfToday &&
        dueDate <= endOfToday
      ) {

        type = "due";

        title = `${item.type} Due Today`;

        message =
          `${item.title} of ₹${Number(
            item.amount
          ).toLocaleString("en-IN")} is due today.`;
      }

      // ======================================
      // UPCOMING
      // ======================================

      else {

        type = "upcoming";

        title = `${item.type} Coming Up`;

        message =
          `${item.title} of ₹${Number(
            item.amount
          ).toLocaleString("en-IN")} is due on ${dueDate.toLocaleDateString(
            "en-IN"
          )}.`;
      }

      // ======================================
      // PREVENT DUPLICATES
      // ======================================

      const notificationExists =
        await Notification.findOne({
          user: userId,
          source: item.source,
          sourceId: item.sourceId,
          notificationDate: dueDate,
          type,
        });

      if (!notificationExists) {

        await Notification.create({
          user: userId,

          title,

          message,

          type,

          source:
            item.source || "system",

          sourceId:
            item.sourceId || null,

          read: false,

          notificationDate: dueDate,
        });
      }
    }

  } catch (error) {

    console.error(
      "Generate Notifications Error:",
      error
    );
  }
};


module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  generateNotifications,
};
