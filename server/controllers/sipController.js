const Sip = require("../models/Sip");

// Add or Update SIP
const saveSip = async (req, res) => {
  try {
    const {
      user,
      monthlyInvestment,
      interestRate,
      years,
      investedAmount,
      estimatedReturns,
      totalValue,
    } = req.body;

    // Check if user already has SIP data
    let sip = await Sip.findOne({ user });

    if (sip) {
      sip.monthlyInvestment = monthlyInvestment;
      sip.interestRate = interestRate;
      sip.years = years;
      sip.investedAmount = investedAmount;
      sip.estimatedReturns = estimatedReturns;
      sip.totalValue = totalValue;

      await sip.save();
    } else {
      sip = await Sip.create({
        user,
        monthlyInvestment,
        interestRate,
        years,
        investedAmount,
        estimatedReturns,
        totalValue,
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
      user: req.params.user,
    });

    res.json(sip);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  saveSip,
  getSip,
};