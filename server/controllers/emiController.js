const Emi = require("../models/emi");

// Save / Update EMI
const saveEmi = async (req, res) => {
  try {
    const {
      user,
      loanAmount,
      interestRate,
      years,
      emi,
      totalPayment,
      totalInterest,
    } = req.body;

    let emiData = await Emi.findOne({ user });

    if (emiData) {
      emiData.loanAmount = loanAmount;
      emiData.interestRate = interestRate;
      emiData.years = years;
      emiData.emi = emi;
      emiData.totalPayment = totalPayment;
      emiData.totalInterest = totalInterest;

      await emiData.save();
    } else {
      emiData = await Emi.create({
        user,
        loanAmount,
        interestRate,
        years,
        emi,
        totalPayment,
        totalInterest,
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
      user: req.params.user,
    });

    res.json(emiData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  saveEmi,
  getEmi,
};
