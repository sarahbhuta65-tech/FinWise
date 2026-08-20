const FinancialSummary = require("../models/FinancialSummary");
const Sip = require("../models/sip");
const Emi = require("../models/emi");
const Goal = require("../models/Goal");

// =====================================================
// CREATE DUE DATE
// =====================================================

const createDueDate = (year, month, day) => {
    const lastDayOfMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const validDay = Math.min(
        Number(day) || 1,
        lastDayOfMonth
    );

    return new Date(
        year,
        month,
        validDay
    );
};

// =====================================================
// GET COMPLETE FINANCIAL SUMMARY
// =====================================================

const getFinancialSummary = async (req, res) => {
    try {
        const userId = req.params.userId;

        const requestedMonth = req.query.month
            ? Number(req.query.month)
            : new Date().getMonth() + 1;

        const requestedYear = req.query.year
            ? Number(req.query.year)
            : new Date().getFullYear();

        const monthIndex = requestedMonth - 1;

        // =====================================================
        // FETCH SOURCE DATA
        // =====================================================

        const [sip, emi, goal] = await Promise.all([
            Sip.findOne({
                user: userId,
                active: true,
            }),

            Emi.findOne({
                user: userId,
                active: true,
            }),

            Goal.findOne({
                user: userId,
            }),
        ]);

        // =====================================================
        // CREATE MONTHLY RECURRING ITEM
        // =====================================================

        const findOrCreateRecurringItem = async ({
            source,
            sourceId,
            type,
            title,
            amount,
            dueDay,
            notes,
        }) => {

            let item = await FinancialSummary.findOne({
                user: userId,
                source,
                sourceId,
                month: requestedMonth,
                year: requestedYear,
            });

            if (item) {
                return item;
            }

            item = await FinancialSummary.create({
                user: userId,

                type,
                title,
                amount: Number(amount),

                dueDate: createDueDate(
                    requestedYear,
                    monthIndex,
                    dueDay
                ),

                notes,

                paid: false,
                paidDate: null,

                month: requestedMonth,
                year: requestedYear,

                source,
                sourceId,

                recurring: true,
            });

            return item;
        };

        // =====================================================
        // SIP
        // =====================================================

        if (sip) {
            const sipStartDate = new Date(sip.startDate);

            const sipStartMonth = new Date(
                sipStartDate.getFullYear(),
                sipStartDate.getMonth(),
                1
            );

            const selectedMonthStart = new Date(
                requestedYear,
                monthIndex,
                1
            );

            const totalSipMonths = Number(sip.years) * 12;

            const sipEndMonth = new Date(
                sipStartDate.getFullYear(),
                sipStartDate.getMonth() + totalSipMonths - 1,
                1
            );

            // Create SIP commitment only while SIP is active
            if (
                selectedMonthStart >= sipStartMonth &&
                selectedMonthStart <= sipEndMonth
            ) {
                await findOrCreateRecurringItem({
                    source: "sip",
                    sourceId: sip._id,
                    type: "SIP",
                    title: "Monthly SIP",
                    amount: Number(sip.monthlyInvestment),
                    dueDay: sip.dueDay,
                    notes:
                        `Monthly SIP • ₹${Number(
                            sip.monthlyInvestment
                        ).toLocaleString("en-IN")} • ${sip.years} years`,
                });
            }
        }

        // =====================================================
        // EMI
        // =====================================================

        if (emi) {

            const emiStartDate = new Date(
                emi.startDate
            );

            const emiStartMonth = new Date(
                emiStartDate.getFullYear(),
                emiStartDate.getMonth(),
                1
            );

            const selectedMonthStart = new Date(
                requestedYear,
                monthIndex,
                1
            );

            const emiEndMonth = new Date(
                emiStartDate.getFullYear(),
                emiStartDate.getMonth() + (Number(emi.years) * 12) - 1,
                1
            );

            // Only create EMI commitment while loan is active
            if (
                selectedMonthStart >= emiStartMonth &&
                selectedMonthStart <= emiEndMonth
            ) {

                await findOrCreateRecurringItem({
                    source: "emi",

                    sourceId: emi._id,

                    type: "EMI",

                    title: "Monthly EMI",

                    amount: Number(
                        emi.emi
                    ),

                    dueDay: emi.dueDay,

                    notes:
                        `Loan EMI • ${emi.years} years • ${emi.interestRate}% interest`,
                });
            }
        }

        // =====================================================
        // SAVINGS GOAL
        // =====================================================

        if (goal) {

            const goalStartDate = new Date(goal.createdAt);

            const goalStartMonth = new Date(
                goalStartDate.getFullYear(),
                goalStartDate.getMonth(),
                1
            );

            const selectedMonthStart = new Date(
                requestedYear,
                monthIndex,
                1
            );

            if (
                selectedMonthStart >= goalStartMonth &&
                Number(goal.progress) < 100
            ) {

                const remainingAmount = Math.max(
                    Number(goal.goalAmount) -
                    Number(goal.savedAmount),
                    0
                );

                const monthsRemaining =
                    Math.max(
                        Number(goal.monthsRemaining) || Number(goal.totalMonths) || 0,
                        1
                    );

                const monthlyTarget =
                    remainingAmount > 0
                        ? Math.ceil(
                            remainingAmount / monthsRemaining
                        )
                        : 0;

                if (monthlyTarget > 0) {

                    await findOrCreateRecurringItem({

                        source: "savings",

                        sourceId: goal._id,

                        type: "Savings",

                        title: goal.goalName,

                        amount: monthlyTarget,

                        dueDay: goal.dueDay,

                        notes:
                            `Savings goal: ₹${Number(
                                goal.goalAmount
                            ).toLocaleString("en-IN")} target`,
                    });
                }
            }
        }

        // =====================================================
        // GET MONTH ITEMS
        // =====================================================

        const allItems =
            await FinancialSummary.find({
                user: userId,
                month: requestedMonth,
                year: requestedYear,
            }).sort({
                dueDate: 1,
            });

        // =====================================================
        // RETURN
        // =====================================================

        res.status(200).json(allItems);

    } catch (error) {

        console.error(
            "Financial Summary Error:",
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};

// =====================================================
// ADD MANUAL FINANCIAL SUMMARY ITEM
// =====================================================

const addFinancialSummary = async (req, res) => {

    try {

        const {
            type,
            title,
            amount,
            dueDate,
            notes,
        } = req.body;

        const date = new Date(dueDate);

        const month =
            date.getMonth() + 1;

        const year =
            date.getFullYear();

        const newItem =
            await FinancialSummary.create({

                user: req.params.userId,

                type,

                title,

                amount: Number(amount),

                dueDate,

                notes,

                month,

                year,

                source: "manual",

                sourceId: null,

                recurring: false,

                paid: false,

                paidDate: null,
            });

        res.status(201).json(newItem);

    } catch (error) {

        console.error(
            "Add Financial Summary Error:",
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};

// =====================================================
// MARK FINANCIAL SUMMARY ITEM AS PAID
// =====================================================

const togglePaymentStatus = async (req, res) => {

    try {

        const { id } = req.params;

        // Find actual FinancialSummary document
        const item =
            await FinancialSummary.findById(id);

        if (!item) {

            return res.status(404).json({
                message: "Financial commitment not found.",
            });
        }

        // =====================================================
        // TOGGLE PAYMENT
        // =====================================================

        item.paid = !item.paid;

        item.paidDate = item.paid
            ? new Date()
            : null;

        await item.save();

        // =====================================================
        // UPDATE SOURCE DOCUMENT
        // =====================================================

        if (item.source === "sip") {

        const sip = await Sip.findById(item.sourceId);

        if (sip) {

            // Current payment status
            sip.paid = item.paid;

            sip.paidDate = item.paid
                ? item.paidDate
                : null;

            sip.paidMonth = item.paid
                ? item.month
                : null;

            sip.paidYear = item.paid
                ? item.year
                : null;


            // Total SIP duration
            const totalMonths = Number(sip.years) * 12;


            // Get all paid SIP payments
            const paidItems = await FinancialSummary.find({
                source: "sip",
                sourceId: sip._id,
                paid: true,
            });


            // Number of payments completed
            const paidMonths = paidItems.length;


            // Amount invested so far
            const investedSoFar =
                paidMonths * Number(sip.monthlyInvestment);


            // Remaining months
            const monthsRemaining = Math.max(
                totalMonths - paidMonths,
                0
            );


            // Remaining investment
            const remainingInvestment = Math.max(
                Number(sip.investedAmount) - investedSoFar,
                0
            );


            // Save tracking information
            sip.totalMonths = totalMonths;

            sip.paidMonths = paidMonths;

            sip.monthsRemaining = monthsRemaining;

            sip.investedSoFar = investedSoFar;

            sip.remainingInvestment = remainingInvestment;


            await sip.save();
        }
    }

        // =====================================================
        // EMI
        // =====================================================

        if (item.source === "emi") {

        const emi = await Emi.findById(item.sourceId);

        if (emi) {

            // Current payment status
            emi.paid = item.paid;

            emi.paidDate = item.paid
                ? item.paidDate
                : null;

            emi.paidMonth = item.paid
                ? item.month
                : null;

            emi.paidYear = item.paid
                ? item.year
                : null;


            // Total number of EMIs
            const totalMonths =
                Number(emi.years) * 12;


            // Find all paid EMI payments
            const paidItems =
                await FinancialSummary.find({
                    source: "emi",
                    sourceId: emi._id,
                    paid: true,
                });


            // Number of EMIs already paid
            const paidMonths =
                paidItems.length;


            // Total amount paid so far
            const paidAmount =
                paidMonths * Number(emi.emi);


            // Remaining EMIs
            const monthsRemaining =
                Math.max(
                    totalMonths - paidMonths,
                    0
                );


            // Remaining loan repayment amount
            const remainingAmount =
                Math.max(
                    Number(emi.totalPayment) - paidAmount,
                    0
                );


            // Save tracking information
            emi.totalMonths = totalMonths;

            emi.paidMonths = paidMonths;

            emi.monthsRemaining = monthsRemaining;

            emi.paidAmount = paidAmount;

            emi.remainingAmount = remainingAmount;


            await emi.save();
        }
    }

       // =====================================================
// SAVINGS GOAL
// =====================================================

if (item.source === "savings") {

    const goal = await Goal.findById(item.sourceId);

    if (goal) {

        // Get ALL paid savings commitments
        const paidItems = await FinancialSummary.find({
            source: "savings",
            sourceId: goal._id,
            paid: true,
        });

        // Total amount paid through Financial Summary
        const totalFromPayments = paidItems.reduce(
            (sum, payment) =>
                sum + Number(payment.amount || 0),
            0
        );

        // Initial amount saved when goal was created
        const initialSaved =
            Number(goal.initialSavedAmount) || 0;

        // Current saved amount
        const savedAmount = Math.min(
            initialSaved + totalFromPayments,
            Number(goal.goalAmount)
        );

        // Progress
        const progress =
            Number(goal.goalAmount) > 0
                ? Math.min(
                    (savedAmount /
                        Number(goal.goalAmount)) *
                        100,
                    100
                )
                : 0;

        // Total duration selected by user
        const totalMonths =
            Number(goal.totalMonths) || 0;

        // Number of actual paid commitments
        let paidMonths = paidItems.length;

        // If goal is completely achieved,
        // consider the entire goal duration completed.
        if (progress >= 100) {
            paidMonths = totalMonths;
        }

        const monthsRemaining = Math.max(
            totalMonths - paidMonths,
            0
        );

        // Save everything
        goal.savedAmount = savedAmount;

        goal.progress = progress;

        goal.paidMonths = paidMonths;

        goal.monthsRemaining = monthsRemaining;

        if (item.paid) {

            goal.lastPaidMonth = item.month;

            goal.lastPaidYear = item.year;

            goal.lastPaymentAmount =
                Number(item.amount);

        }

        await goal.save();
    }
}

        // =====================================================
        // RESPONSE
        // =====================================================

        res.status(200).json({

            message: item.paid
                ? "Payment marked as paid."
                : "Payment marked as unpaid.",

            payment: item,
        });

    } catch (error) {

        console.error(
            "Toggle Payment Error:",
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};

// =====================================================
// DELETE FINANCIAL SUMMARY ITEM
// =====================================================

const deleteFinancialSummary = async (
    req,
    res
) => {

    try {

        const item =
            await FinancialSummary.findById(
                req.params.id
            );

        if (!item) {

            return res.status(404).json({
                message: "Item not found.",
            });
        }

        // Prevent accidental deletion of
        // automatically generated SIP / EMI / Savings
        if (item.recurring) {

            return res.status(400).json({
                message:
                    "Automatic SIP, EMI and Savings commitments cannot be deleted here.",
            });
        }

        await item.deleteOne();

        res.status(200).json({
            message: "Deleted successfully.",
        });

    } catch (error) {

        console.error(
            "Delete Financial Summary Error:",
            error
        );

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