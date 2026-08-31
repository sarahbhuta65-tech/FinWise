const Expense = require("../models/Expense");
const csv = require("csv-parser");
const fs = require("fs");

// Add Expense
const addExpense = async (req, res) => {
    try {
        const { user, name, amount, category, date } = req.body;

        const expense = await Expense.create({
            user,
            name,
            amount,
            category,
            date,
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


// Get Expenses
const getExpenses = async (req, res) => {
    try {
        const { user } = req.params;

        const expenses = await Expense.find({ user }).sort({
            createdAt: -1,
        });

        res.json(expenses);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


// Delete Expense
const deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);

        res.json({
            message: "Expense deleted",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


// Import Expenses from CSV
const importExpenses = async (req, res) => {
    try {
        const { user } = req.body;

        if (!user) {
            return res.status(400).json({
                message: "User ID is required.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "CSV file is required.",
            });
        }

        const expenses = [];
        const errors = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (row) => {
                try {
                    const name = row.name?.trim();
                    const amount = Number(row.amount);
                    const category = row.category?.trim();
                    const date = row.date
                        ? new Date(row.date)
                        : new Date();

                    // Validate row
                    if (!name) {
                        errors.push({
                            row,
                            error: "Name is missing.",
                        });
                        return;
                    }

                    if (!amount || amount < 0) {
                        errors.push({
                            row,
                            error: "Invalid amount.",
                        });
                        return;
                    }

                    if (!category) {
                        errors.push({
                            row,
                            error: "Category is missing.",
                        });
                        return;
                    }

                    if (isNaN(date.getTime())) {
                        errors.push({
                            row,
                            error: "Invalid date.",
                        });
                        return;
                    }

                    expenses.push({
                        user,
                        name,
                        amount,
                        category,
                        date,
                    });
                } catch (error) {
                    errors.push({
                        row,
                        error: error.message,
                    });
                }
            })
            .on("end", async () => {
                try {
                    if (expenses.length === 0) {
                        fs.unlinkSync(req.file.path);

                        return res.status(400).json({
                            message: "No valid expenses found in CSV.",
                            errors,
                        });
                    }

                    const savedExpenses =
                        await Expense.insertMany(expenses);

                    // Remove uploaded file after processing
                    fs.unlinkSync(req.file.path);

                    res.status(201).json({
                        message: `${savedExpenses.length} expenses imported successfully.`,
                        importedCount: savedExpenses.length,
                        skippedCount: errors.length,
                        expenses: savedExpenses,
                        errors,
                    });
                } catch (error) {
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    res.status(500).json({
                        message: error.message,
                    });
                }
            })
            .on("error", (error) => {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                res.status(500).json({
                    message: error.message,
                });
            });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Export Expenses to CSV
const exportExpenses = async (req, res) => {
    try {
        const userId = req.user.userId;

        const expenses = await Expense.find({ user: userId })
            .sort({ date: -1 });

        if (expenses.length === 0) {
            return res.status(404).json({
                message: "No expenses found to export.",
            });
        }

        let csvData = "Name,Amount,Category,Date\n";

        expenses.forEach((expense) => {
            csvData += `"${expense.name}",${expense.amount},"${expense.category}","${expense.date.toISOString()}"\n`;
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=finwise-expenses.csv"
        );

        res.status(200).send(csvData);

    } catch (error) {
        console.error("Export CSV Error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    addExpense,
    getExpenses,
    deleteExpense,
    importExpenses,
    exportExpenses,
};