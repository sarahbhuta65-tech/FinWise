const Expense = require("../models/Expense");

const addExpense = async (req,res) => {
    try{
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

const getExpenses = async (req, res) => {
    try{
        const {user} = req.params;

        const expenses = await Expense.find({user}).sort({
            createdAt: -1,
        });

        res.json(expenses);
    } catch(error) {
        res.status(500).json({
            message:error.message,
        });
    }
};

const deleteExpense = async (req, res) => {
    try{

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

module.exports = {
    addExpense,
    getExpenses,
    deleteExpense,
};