const Goal = require("../models/Goal");
const FinancialSummary = require("../models/FinancialSummary");


// ===============================
// SYNC GOAL WITH FINANCIAL SUMMARY
// ===============================

const syncGoalWithFinancialSummary = async (goalId) => {
    try {
        const goal = await Goal.findById(goalId);

        if (!goal) return null;

        // Get all paid savings commitments for this goal
        const paidItems = await FinancialSummary.find({
            source: "savings",
            sourceId: goalId,
            paid: true,
        });

        // Number of monthly payments already completed
        const paidMonths = paidItems.length;

        // Calculate total from paid monthly contributions
        const totalFromPayments = paidItems.reduce(
            (sum, item) => sum + Number(item.amount),
            0
        );

        // Preserve initial saved amount
        if (
            goal.initialSavedAmount === null ||
            goal.initialSavedAmount === undefined
        ) {
            goal.initialSavedAmount =
                Number(goal.savedAmount) || 0;
        }

        // Actual saved amount
        const newSavedAmount = Math.min(
            Number(goal.initialSavedAmount) + totalFromPayments,
            Number(goal.goalAmount)
        );

        goal.savedAmount = newSavedAmount;

        // Progress
        goal.progress =
            Number(goal.goalAmount) > 0
                ? Math.min(
                      (newSavedAmount /
                          Number(goal.goalAmount)) *
                          100,
                      100
                  )
                : 0;

        // ===============================
        // MONTH CALCULATION
        // ===============================

        // User-entered target duration
        const totalMonths =
            Number(goal.totalMonths) || 0;

        // Months already paid
        goal.paidMonths = paidMonths;

        // Months remaining
        goal.monthsRemaining = Math.max(
            totalMonths - paidMonths,
            0
        );

        await goal.save();

        return goal;
    } catch (error) {
        console.error("Sync Goal Error:", error);
        return null;
    }
};

// ===============================
// SAVE / UPDATE GOAL
// ===============================
//
// ✅ FIX: This now uses a single atomic findOneAndUpdate + upsert
// instead of "find, then create-or-save". The old version could
// create TWO Goal documents for the same user if this endpoint was
// ever called twice in quick succession (double-click, retry, etc).
// Those duplicate Goal docs were the real reason deleting a goal
// only cleared some months and left others behind.

const saveGoal = async (req, res) => {
  try {
    const {
      user,
      goalName,
      goalAmount,
      savedAmount,
      progress,
      dueDay,
      totalMonths,
    } = req.body;

    const day = Number(dueDay);

    if (day < 1 || day > 31) {
      return res.status(400).json({
        message: "Due day must be between 1 and 31",
      });
    }

    // Create due date for current month
    const now = new Date();

    // Prevent invalid dates like February 31
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const validDay = Math.min(day, lastDayOfMonth);

    const dueDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      validDay
    );

    // Atomic upsert: finds the user's goal and updates it, OR
    // creates it if it doesn't exist yet — all in one DB operation,
    // so two duplicate goals can never be created for the same user.
    const goal = await Goal.findOneAndUpdate(
      { user },
      {
        $set: {
          goalName,
          goalAmount,
          savedAmount,
          progress,
          dueDay: day,
          dueDate,
          totalMonths: Number(totalMonths),
        },
        // $setOnInsert only applies the FIRST time this goal is created.
        // On every later update, initialSavedAmount is left untouched,
        // which is exactly what "preserve the initial saved amount" means.
        $setOnInsert: {
          initialSavedAmount: savedAmount,
          paidMonths: 0,
          monthsRemaining: Number(totalMonths),
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json(goal);

  } catch (error) {
    console.error("Save Goal Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ===============================
// GET GOAL
// ===============================

const getGoal = async (req, res) => {
  try {

    const goal = await Goal.findOne({
      user: req.params.user,
    });

    // Sync goal with Financial Summary to get accurate saved amount
    if (goal) {
      await syncGoalWithFinancialSummary(goal._id);
      // Fetch updated goal
      const updatedGoal = await Goal.findById(goal._id);
      return res.json(updatedGoal);
    }

    res.json(goal);

  } catch (error) {

    console.error("Get Goal Error:", error);

    res.status(500).json({
      message: error.message,
    });

  }
};


// ===============================
// DELETE GOAL
// ===============================
//
// ✅ FIX: FinancialSummary cleanup now matches by { user, source }
// instead of { sourceId: goal._id }. Since "savings" items are ONLY
// ever created from a goal, and a user can only have one goal (see
// the unique index in Goal.js), this guarantees every savings entry
// for this user — in every month, past or future, no matter which
// goal document originally created it — gets removed. This closes
// the loophole where leftover items from an old/duplicate goal _id
// used to survive deletion.

const deleteGoal = async (req, res) => {
    try {

        const userId = req.params.user;

        // Find the existing goal first
        const goal = await Goal.findOne({
            user: userId,
        });

        if (!goal) {
            return res.status(404).json({
                message: "No goal found.",
            });
        }

        // Delete ALL savings-related Financial Summary entries
        // for this user, across every month — not just the ones
        // tied to this exact goal._id.
        await FinancialSummary.deleteMany({
            user: userId,
            source: "savings",
        });

        // Delete the goal itself
        await Goal.deleteOne({
            _id: goal._id,
        });

        res.json({
            message: "Goal and related financial commitments deleted successfully.",
        });

    } catch (error) {

        console.error(
            "Delete Goal Error:",
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};


module.exports = {
  saveGoal,
  getGoal,
  deleteGoal,
  syncGoalWithFinancialSummary,
};