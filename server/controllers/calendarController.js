const FinancialSummary = require("../models/FinancialSummary");

const getCalendarEvents = async (req, res) => {
    try {
        const userId = req.params.userId;

        const month = req.query.month
            ? Number(req.query.month)
            : new Date().getMonth() + 1;

        const year = req.query.year
            ? Number(req.query.year)
            : new Date().getFullYear();

        const events = await FinancialSummary.find({
            user: userId,
            month,
            year,
        }).sort({
            dueDate: 1,
        });

        res.status(200).json(events);

    } catch (error) {
        console.error("Calendar Events Error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    getCalendarEvents,
};