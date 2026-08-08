const FinancialSummary = require("../models/FinancialSummary");

const getFinancialSummary = async (req, res) => {
  try {
    const summary = await FinancialSummary.find({
    user: req.params.userId,
}).sort({ dueDate: 1 });

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const addFinancialSummary = async (req, res) => {
  try {
    const {
      type,
      title,
      amount,
      dueDate,
      notes,
    } = req.body;
    
    const month = new Date(dueDate).getMonth() + 1;
    const year = new Date(dueDate).getFullYear();

    const newItem = await FinancialSummary.create({
      user: req.params.userId,
      type,
      title,
      amount: Number(amount),
      dueDate,
      notes,
      month,
      year,
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const togglePaymentStatus = async (req, res) => {
  try {
    const item = await FinancialSummary.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    item.paid = !item.paid;
    item.paidDate = item.paid ? new Date() : null;

    await item.save();

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteFinancialSummary = async (req, res) => {
  try {
    const item = await FinancialSummary.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      message: "Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getFinancialSummary,
  addFinancialSummary,
  togglePaymentStatus,
  deleteFinancialSummary,
};