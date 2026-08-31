import { useState } from "react";

function ExpTracker(){
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [expenses, setExpenses] = useState([]);

    const addExpense = () => {
        if(!title || !amount || !category) return;
        const newExpense = {
            title,
            category,
            amount,
        }

        setExpenses([...expenses, newExpense]);

        setTitle("");
        setAmount("");
        setCategory("");
    }

    const handleDelete = (index) => {
        const updatedExpenses = expenses.filter((expense, expenseIndex) => {
           return expenseIndex !== index;
        })

        setExpenses(updatedExpenses);
    }

    return (
       <div>
        <h1>Expense Tracker</h1>

        <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        />

        <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        />

        <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        />

        <button onClick={addExpense}>Add Expense</button>
        <button onClick={handleDelete(index)}>Delete</button>

        {expenses.map((expense, index) => {
            return(
                <div key = {index}>
                    {expense.title},
                    {expense.amount},
                    {expense.category}
                </div>
            );
        })}

       </div>
    );

}

export default ExpTracker;