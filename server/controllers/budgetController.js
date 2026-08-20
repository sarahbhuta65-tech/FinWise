const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const Category = require("../models/Category");

// ===============================
// CREATE / UPDATE BUDGET
// ===============================

const saveBudget = async (req, res) => {
    try {
        const {
            user,
            name,
            month,
            year,
            totalBudget,
            categories,
        } = req.body;

        if (!user) {
            return res.status(400).json({
                message: "User is required.",
            });
        }

        if (!name) {
            return res.status(400).json({
                message: "Budget name is required.",
            });
        }

        if (Number(totalBudget) < 0) {
            return res.status(400).json({
                message: "Budget amount cannot be negative.",
            });
        }

        let budget = await Budget.findOne({
            user,
            month: Number(month),
            year: Number(year),
        });

        if (budget) {
            budget.name = name;
            budget.totalBudget = Number(totalBudget);
            budget.categories = categories || [];

            await budget.save();
        } else {
            budget = await Budget.create({
                user,
                name,
                month: Number(month),
                year: Number(year),
                totalBudget: Number(totalBudget),
                categories: categories || [],
            });
        }


        // ===============================
        // SYNC BUDGET CATEGORIES
        // WITH EXPENSE CATEGORIES
        // ===============================

        if (categories && categories.length > 0) {

            for (const category of categories) {

                const categoryName = category.name?.trim();

                if (!categoryName) continue;

                await Category.findOneAndUpdate(
                    {
                        user,
                        name: {
                            $regex: `^${categoryName}$`,
                            $options: "i",
                        },
                    },
                    {
                        $setOnInsert: {
                            user,
                            name: categoryName,
                        },
                    },
                    {
                        upsert: true,
                        new: true,
                    }
                );
            }
        }

        res.status(200).json(budget);

    } catch (error) {
        console.error("Save Budget Error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};


// ===============================
// GET BUDGET WITH ACTUAL SPENDING
// ===============================

const getBudget = async (req, res) => {
    try {
        const { user, month, year } = req.params;

        const budget = await Budget.findOne({
            user,
            month: Number(month),
            year: Number(year),
        });

        if (!budget) {
            return res.json(null);
        }

        // Get expenses for selected month
        const startDate = new Date(
            Number(year),
            Number(month),
            1
        );

        const endDate = new Date(
            Number(year),
            Number(month) + 1,
            1
        );

        const expenses = await Expense.find({
            user,
            date: {
                $gte: startDate,
                $lt: endDate,
            },
        });

        // ===============================
        // CALCULATE SPENDING BY CATEGORY
        //
        // NOTE: category names are matched case-insensitively
        // (and trimmed) here. Budget category names are freely
        // typed in the Budget Planner editor, while expense
        // category names come from the Category dropdown in
        // Expense Tracker — these can easily end up with
        // different casing (e.g. "Food" vs "food"), and an
        // exact-match lookup would silently show 0 spent for
        // an otherwise-matching category. Normalizing both
        // sides to the same case before matching fixes that.
        // ===============================

        const normalize = (value) =>
            (value || "").trim().toLowerCase();

        const categorySpent = {};

        expenses.forEach((expense) => {
            const key = normalize(expense.category);

            if (!key) return;

            if (!categorySpent[key]) {
                categorySpent[key] = 0;
            }

            categorySpent[key] += Number(
                expense.amount || 0
            );
        });

        // Add actual spending to each budget category
        const categories = budget.categories.map(
            (category) => {
                const spent =
                    categorySpent[
                        normalize(category.name)
                    ] || 0;

                return {
                    name: category.name,
                    plannedAmount:
                        Number(category.plannedAmount) || 0,
                    spentAmount: spent,
                    remainingAmount:
                        Number(category.plannedAmount || 0) -
                        spent,
                };
            }
        );

        const totalSpent = expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );

        const remainingBudget =
            Number(budget.totalBudget) - totalSpent;

        res.json({
            ...budget.toObject(),

            categories,

            totalSpent,

            remainingBudget,
        });

    } catch (error) {
        console.error("Get Budget Error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};


// ===============================
// DELETE BUDGET
// ===============================

const deleteBudget = async (req, res) => {
    try {
        const { user, month, year } = req.params;

        const budget = await Budget.findOneAndDelete({
            user,
            month: Number(month),
            year: Number(year),
        });

        if (!budget) {
            return res.status(404).json({
                message: "Budget not found.",
            });
        }

        res.json({
            message: "Budget deleted successfully.",
        });

    } catch (error) {
        console.error("Delete Budget Error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};


module.exports = {
    saveBudget,
    getBudget,
    deleteBudget,
};