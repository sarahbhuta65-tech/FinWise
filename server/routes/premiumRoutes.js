const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const premiumMiddleware = require("../middlewares/premiumMiddleware");

const Expense = require("../models/Expense");
const Goal = require("../models/Goal");
const Sip = require("../models/sip");
const Emi = require("../models/emi");

// ==========================================
// PREMIUM ANALYTICS
// ==========================================

router.get(
    "/analytics",
    authMiddleware,
    premiumMiddleware,
    async (req, res) => {
        try {
            const userId = req.user.userId;

            // Fetch user's financial data
            const expenses = await Expense.find({
                user: userId,
            });

            const goals = await Goal.find({
                user: userId,
            });

            const sips = await Sip.find({
                user: userId,
            });

            const emis = await Emi.find({
                user: userId,
                active: true,
            });

            // ==========================================
            // EXPENSE ANALYTICS
            // ==========================================

            const totalExpenses = expenses.reduce(
                (sum, expense) => sum + Number(expense.amount),
                0
            );

            const categoryTotals = {};

            expenses.forEach((expense) => {
                const category = expense.category || "Other";

                categoryTotals[category] =
                    (categoryTotals[category] || 0) +
                    Number(expense.amount);
            });

            const categoryBreakdown = Object.entries(
                categoryTotals
            )
                .map(([category, amount]) => ({
                    category,
                    amount,
                }))
                .sort((a, b) => b.amount - a.amount);

            const highestSpendingCategory =
                categoryBreakdown.length
                    ? categoryBreakdown[0]
                    : null;

            // ==========================================
            // MONTHLY EXPENSE ANALYTICS
            // ==========================================

            const now = new Date();

            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const previousMonthDate = new Date(
                currentYear,
                currentMonth - 1,
                1
            );

            const previousMonth =
                previousMonthDate.getMonth();

            const previousMonthYear =
                previousMonthDate.getFullYear();

            let currentMonthExpenses = 0;
            let previousMonthExpenses = 0;

            expenses.forEach((expense) => {
                const expenseDate = new Date(expense.date);

                const month = expenseDate.getMonth();
                const year = expenseDate.getFullYear();

                if (
                    month === currentMonth &&
                    year === currentYear
                ) {
                    currentMonthExpenses += Number(
                        expense.amount
                    );
                }

                if (
                    month === previousMonth &&
                    year === previousMonthYear
                ) {
                    previousMonthExpenses += Number(
                        expense.amount
                    );
                }
            });

            let expenseChangePercentage = 0;

            if (previousMonthExpenses > 0) {
                expenseChangePercentage =
                    ((currentMonthExpenses -
                        previousMonthExpenses) /
                        previousMonthExpenses) *
                    100;
            }

            // ==========================================
            // GOAL ANALYTICS
            // ==========================================

            let goalAnalytics = null;

            if (goals.length > 0) {
                const goal = goals[0];

                const remainingAmount = Math.max(
                    Number(goal.goalAmount) -
                        Number(goal.savedAmount),
                    0
                );

                const monthsRemaining =
                    Number(goal.monthsRemaining) || 0;

                const monthlyRequired =
                    monthsRemaining > 0
                        ? remainingAmount /
                          monthsRemaining
                        : remainingAmount;

                goalAnalytics = {
                    goalName: goal.goalName,
                    goalAmount: Number(goal.goalAmount),
                    savedAmount: Number(goal.savedAmount),
                    remainingAmount,
                    progress: Number(goal.progress),
                    monthsRemaining,
                    monthlyRequired: Number(
                        monthlyRequired.toFixed(2)
                    ),
                };
            }

            // ==========================================
            // SIP ANALYTICS
            // ==========================================

            const activeSips = sips.filter(
                (sip) => sip.active
            );

            const totalMonthlySip =
                activeSips.reduce(
                    (sum, sip) =>
                        sum +
                        Number(sip.monthlyInvestment),
                    0
                );

            const totalInvestedSoFar =
                activeSips.reduce(
                    (sum, sip) =>
                        sum +
                        Number(sip.investedSoFar || 0),
                    0
                );

            const totalEstimatedReturns =
                activeSips.reduce(
                    (sum, sip) =>
                        sum +
                        Number(sip.estimatedReturns || 0),
                    0
                );

            const totalInvestmentValue =
                activeSips.reduce(
                    (sum, sip) =>
                        sum +
                        Number(sip.totalValue || 0),
                    0
                );

            // ==========================================
            // EMI ANALYTICS
            // ==========================================

            const totalMonthlyEmi =
                emis.reduce(
                    (sum, emi) =>
                        sum + Number(emi.emi),
                    0
                );

            const totalLoanAmount =
                emis.reduce(
                    (sum, emi) =>
                        sum + Number(emi.loanAmount),
                    0
                );

            const totalInterest =
                emis.reduce(
                    (sum, emi) =>
                        sum + Number(emi.totalInterest),
                    0
                );

            const remainingEmiAmount =
                emis.reduce(
                    (sum, emi) =>
                        sum +
                        Number(emi.remainingAmount || 0),
                    0
                );

            // ==========================================
            // FINANCIAL HEALTH SCORE
            // ==========================================

            let score = 50;

            // Expense behavior
            if (totalExpenses === 0) {
                score -= 5;
            } else if (currentMonthExpenses <
                       previousMonthExpenses &&
                       previousMonthExpenses > 0) {
                score += 10;
            }

            // Goal progress
            if (goalAnalytics) {
                if (goalAnalytics.progress >= 80) {
                    score += 15;
                } else if (goalAnalytics.progress >= 50) {
                    score += 10;
                } else if (goalAnalytics.progress >= 25) {
                    score += 5;
                }
            }

            // Investment activity
            if (totalMonthlySip > 0) {
                score += 10;
            }

            // Debt
            if (activeSips.length > 0 && emis.length === 0) {
                score += 10;
            }

            // Keep score between 0 and 100
            score = Math.max(
                0,
                Math.min(100, score)
            );

            let scoreLabel = "Needs Attention";

            if (score >= 80) {
                scoreLabel = "Excellent";
            } else if (score >= 65) {
                scoreLabel = "Good";
            } else if (score >= 50) {
                scoreLabel = "Fair";
            }

            // ==========================================
            // RESPONSE
            // ==========================================

            res.json({
                success: true,

                analytics: {
                    expenses: {
                        total: totalExpenses,
                        count: expenses.length,
                        currentMonth: currentMonthExpenses,
                        previousMonth: previousMonthExpenses,
                        changePercentage: Number(
                            expenseChangePercentage.toFixed(2)
                        ),
                        highestCategory:
                            highestSpendingCategory,
                        categoryBreakdown,
                    },

                    goal: goalAnalytics,

                    investments: {
                        activeSips: activeSips.length,
                        monthlyInvestment:
                            totalMonthlySip,
                        investedSoFar:
                            totalInvestedSoFar,
                        estimatedReturns:
                            totalEstimatedReturns,
                        totalValue:
                            totalInvestmentValue,
                    },

                    debt: {
                        activeEmis: emis.length,
                        monthlyEmi:
                            totalMonthlyEmi,
                        totalLoanAmount,
                        totalInterest,
                        remainingAmount:
                            remainingEmiAmount,
                    },

                    financialHealth: {
                        score,
                        label: scoreLabel,
                    },
                },
            });

        } catch (error) {
            console.error(
                "Premium Analytics Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to generate premium analytics",
            });
        }
    }
);


// ==========================================
// PREMIUM AI INSIGHTS
// ==========================================

router.get(
    "/ai-insights",
    authMiddleware,
    premiumMiddleware,
    async (req, res) => {
        res.json({
            success: true,
            message: "Premium AI insights access granted",
        });
    }
);


// ==========================================
// PREMIUM REPORTS
// ==========================================

router.get(
    "/reports",
    authMiddleware,
    premiumMiddleware,
    async (req, res) => {
        res.json({
            success: true,
            message: "Premium reports access granted",
        });
    }
);

module.exports = router;