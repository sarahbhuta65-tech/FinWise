const Sip = require("../models/sip");
const FinancialSummary = require("../models/FinancialSummary");

// ===============================
// SYNC SIP WITH FINANCIAL SUMMARY
// ===============================

const syncSipWithFinancialSummary = async (sipId) => {
  try {
    const sip = await Sip.findById(sipId);

    if (!sip) return null;

    const paidItems = await FinancialSummary.find({
      source: "sip",
      sourceId: sipId,
      paid: true,
    });

    const paidMonths = paidItems.length;

    const investedSoFar = paidItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalMonths = Number(sip.years) * 12;

    const monthsRemaining = Math.max(
      totalMonths - paidMonths,
      0
    );

    const totalPlannedInvestment =
      Number(sip.monthlyInvestment) * totalMonths;

    const remainingInvestment = Math.max(
      totalPlannedInvestment - investedSoFar,
      0
    );

    sip.paidMonths = paidMonths;
    sip.totalMonths = totalMonths;
    sip.monthsRemaining = monthsRemaining;
    sip.investedSoFar = investedSoFar;
    sip.remainingInvestment = remainingInvestment;

    await sip.save();

    return sip;

  } catch (error) {
    console.error("Sync SIP Error:", error);
    return null;
  }
};
// Add or Update SIP
const saveSip = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      monthlyInvestment,
      interestRate,
      years,
      investedAmount,
      estimatedReturns,
      totalValue,
      dueDay,
      startDate,
    } = req.body;
    const totalMonths = Number(years) * 12;
    const totalPlannedInvestment = Number(monthlyInvestment) * totalMonths;

    // Check if user already has SIP data
    let sip = await Sip.findOne({ user: userId });

    if (sip) {
      sip.monthlyInvestment = monthlyInvestment;
      sip.interestRate = interestRate;
      sip.years = years;
      sip.investedAmount = investedAmount;
      sip.estimatedReturns = estimatedReturns;
      sip.totalValue = totalValue;

      sip.dueDay = dueDay;
      sip.startDate = startDate;

      sip.totalMonths = totalMonths;

      await sip.save();
    } else {
      sip = await Sip.create({
        user: userId,
        monthlyInvestment,
        interestRate,
        years,
        investedAmount,
        estimatedReturns,
        totalValue,
        dueDay,
        startDate,

        totalMonths,
        paidMonths: 0,
        monthsRemaining: totalMonths,
        investedSoFar: 0,
        remainingInvestment: totalPlannedInvestment,
      });
    }

    res.status(200).json(sip);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get SIP Data
const getSip = async (req, res) => {
  try {
    const sip = await Sip.findOne({
      user: req.user.userId,
    });

    if (!sip) {
      return res.json(null);
    }

    await syncSipWithFinancialSummary(sip._id);

    const updatedSip = await Sip.findById(sip._id);

    res.json(updatedSip);

  } catch (error) {
    console.error("Get SIP Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  saveSip,
  getSip,
  syncSipWithFinancialSummary,
};
