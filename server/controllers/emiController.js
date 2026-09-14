const Emi = require("../models/emi");
const FinancialSummary = require("../models/FinancialSummary");


// ===============================
// SYNC EMI WITH FINANCIAL SUMMARY
// ===============================

const syncEmiWithFinancialSummary = async (emiId) => {
  try {
    const emiData = await Emi.findById(emiId);

    if (!emiData) return null;

    // Get all paid EMI commitments
    const paidItems = await FinancialSummary.find({
      source: "emi",
      sourceId: emiId,
      paid: true,
    });

    const paidMonths = paidItems.length;

    // Total amount paid toward EMI
    const paidAmount = paidItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalMonths = Number(emiData.years) * 12;

    const monthsRemaining = Math.max(
      totalMonths - paidMonths,
      0
    );

    const remainingAmount = Math.max(
      Number(emiData.totalPayment) - paidAmount,
      0
    );

    emiData.paidMonths = paidMonths;
    emiData.totalMonths = totalMonths;
    emiData.monthsRemaining = monthsRemaining;
    emiData.paidAmount = paidAmount;
    emiData.remainingAmount = remainingAmount;

    await emiData.save();

    return emiData;

  } catch (error) {
    console.error("Sync EMI Error:", error);
    return null;
  }
};
// Save / Update EMI
const saveEmi = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      loanAmount,
      interestRate,
      years,
      emi,
      totalPayment,
      totalInterest,
      dueDay,
      startDate,
    } = req.body;
    const totalMonths = Number(years) * 12;

    let emiData = await Emi.findOne({ user: userId });

    if (emiData) {
      emiData.loanAmount = loanAmount;
      emiData.interestRate = interestRate;
      emiData.years = years;
      emiData.emi = emi;
      emiData.totalPayment = totalPayment;
      emiData.totalInterest = totalInterest;
      emiData.dueDay = dueDay;
      emiData.startDate = startDate;

      emiData.totalMonths = totalMonths;

      await emiData.save();
    } else {
      emiData = await Emi.create({
        user: userId,
        loanAmount,
        interestRate,
        years,
        emi,
        totalPayment,
        totalInterest,
        dueDay,
        startDate,

        totalMonths,
        paidMonths: 0,
        monthsRemaining: totalMonths,
        paidAmount: 0,
        remainingAmount: totalPayment,
      });
    }

    res.status(200).json(emiData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get EMI
const getEmi = async (req, res) => {
  try {
    const emiData = await Emi.findOne({
      user: req.user.userId,
    });

    if (!emiData) {
      return res.json(null);
    }

    await syncEmiWithFinancialSummary(emiData._id);

    const updatedEmi = await Emi.findById(emiData._id);

    res.json(updatedEmi);

  } catch (error) {
    console.error("Get EMI Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  saveEmi,
  getEmi,
  syncEmiWithFinancialSummary,
};
