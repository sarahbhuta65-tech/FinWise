const Goal = require("../models/Goal");

const saveGoal = async (req, res) => {
  try {
    const { user, goalName, goalAmount, savedAmount, progress } = req.body;

    let goal = await Goal.findOne({ user });

    if (goal) {
      goal.goalName = goalName;
      goal.goalAmount = goalAmount;
      goal.savedAmount = savedAmount;
      goal.progress = progress;

      await goal.save();
    } else {
      goal = await Goal.create({
        user,
        goalName,
        goalAmount,
        savedAmount,
        progress,
      });
    }

    res.status(200).json(goal);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      user: req.params.user,
    });

    res.json(goal);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndDelete({
      user: req.params.user,
    });

    res.json({
      message: "Goal deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  saveGoal,
  getGoal,
  deleteGoal,
};