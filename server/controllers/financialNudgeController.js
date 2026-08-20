const FinancialNudge = require("../models/FinancialNudge");
const Expense = require("../models/Expense");
const Emi = require("../models/emi");
const Sip = require("../models/Sip");
const Goal = require("../models/Goal");

const generateNudge = async (req, res) => {
    try {
        const { userId } = req.params;

        const expenses = await Expense.find({
            user: userId,
        });

        const emiData = await Emi.findOne({
            user: userId,
        });

        const sipData = await Sip.findOne({
            user: userId,
            active: true,
        });

        const goalData = await Goal.findOne({
            user: userId,
        });

        const now = new Date();

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const previousDate = new Date(
            currentYear,
            currentMonth - 1,
            1
        );

        const previousMonth = previousDate.getMonth();
        const previousYear = previousDate.getFullYear();

        let thisMonthSpent = 0;
        let lastMonthSpent = 0;

        const categoryTotals = {};

        expenses.forEach((expense) => {
            const date = new Date(expense.date);

            if (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            ) {
                thisMonthSpent += Number(expense.amount || 0);

                const category = expense.category;

                categoryTotals[category] =
                    (categoryTotals[category] || 0) +
                    Number(expense.amount || 0);
            }

            if (
                date.getMonth() === previousMonth &&
                date.getFullYear() === previousYear
            ) {
                lastMonthSpent += Number(
                    expense.amount || 0
                );
            }
        });

        const monthlyEmi = Number(
            emiData?.emi || 0
        );

        const sipValue = Number(
            sipData?.totalValue || 0
        );

        const goalProgress = Number(
            goalData?.progress || 0
        );

        let nudge = {
            type: "positive",
            title: "You're on track",
            message:
                "Your finances are looking balanced. Keep maintaining your current habits.",
            action: "VIEW DASHBOARD",
            path: "/dashboard",
            priority: "low",
        };

        // 1. Spending increased
        if (
            lastMonthSpent > 0 &&
            thisMonthSpent >
                lastMonthSpent * 1.2
        ) {
            nudge = {
                type: "spending",
                title: "Spending is rising",
                message:
                    "Your spending is higher than last month. Consider reviewing your non-essential expenses.",
                action: "REVIEW EXPENSES",
                path: "/expense",
                priority: "high",
            };
        }

        // 2. High EMI
        else if (monthlyEmi > 20000) {
            nudge = {
                type: "emi",
                title: "Keep an eye on your EMI",
                message:
                    "Your monthly EMI is taking a significant part of your budget. Try to keep other commitments flexible.",
                action: "VIEW EMI",
                path: "/emi",
                priority: "high",
            };
        }

        // 3. Savings goal
        else if (
            goalData &&
            goalProgress < 40
        ) {
            nudge = {
                type: "goal",
                title: "Your goal needs attention",
                message:
                    "You're still below 40% of your savings goal. A small increase in monthly savings could help you catch up.",
                action: "VIEW SAVINGS GOAL",
                path: "/goal",
                priority: "medium",
            };
        }

        // 4. No SIP
        else if (!sipData) {
            nudge = {
                type: "investment",
                title: "Start investing",
                message:
                    "You don't have an active SIP yet. Even a small monthly investment can help build a long-term habit.",
                action: "EXPLORE SIP",
                path: "/sip",
                priority: "medium",
            };
        }

        // 5. Dominant category
        else {
            const highestCategory =
                Object.entries(categoryTotals)
                    .sort((a, b) => b[1] - a[1])[0];

            if (
                highestCategory &&
                thisMonthSpent > 0 &&
                highestCategory[1] >
                    thisMonthSpent * 0.4
            ) {
                nudge = {
                    type: "category",
                    title:
                        `${highestCategory[0]} is dominating`,
                    message:
                        `${highestCategory[0]} accounts for a large part of your spending this month. Consider setting a limit for this category.`,
                    action: "REVIEW EXPENSES",
                    path: "/expense",
                    priority: "medium",
                };
            }
        }

        // Save generated nudge
        await FinancialNudge.updateMany(
            {
                user: userId,
                status: "active",
            },
            {
                status: "dismissed",
            }
        );

        const savedNudge =
            await FinancialNudge.create({
                user: userId,
                ...nudge,
            });

        res.status(200).json(savedNudge);

    } catch (error) {
        console.error(
            "Generate Financial Nudge Error:",
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};


// Get latest active nudge
const getLatestNudge = async (req, res) => {
    try {
        const { userId } = req.params;

        const nudge =
            await FinancialNudge.findOne({
                user: userId,
                status: "active",
            }).sort({
                createdAt: -1,
            });

        res.status(200).json(nudge);

    } catch (error) {
        console.error(
            "Get Financial Nudge Error:",
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};


// Dismiss nudge
const dismissNudge = async (req, res) => {
    try {
        const { id } = req.params;

        const nudge =
            await FinancialNudge.findByIdAndUpdate(
                id,
                {
                    status: "dismissed",
                },
                {
                    new: true,
                }
            );

        if (!nudge) {
            return res.status(404).json({
                message: "Nudge not found.",
            });
        }

        res.status(200).json(nudge);

    } catch (error) {
        console.error(
            "Dismiss Nudge Error:",
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};


module.exports = {
    generateNudge,
    getLatestNudge,
    dismissNudge,
};