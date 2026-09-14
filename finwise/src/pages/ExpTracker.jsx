import { useState, useEffect } from "react";

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
    

    function Users() {
        const [users, setUsers] = useState([]);
        useEffect(() => {
            const getUsers = async () => {
                    const response = await fetch("https://jsonplaceholder.typicode.com/users");
                    const data = await response.json();
                    setUsers(data);
                };
            getUsers();
        }, []);

    return (
        <div>
            {users.map((user) => {
                return <h3 key={user.id}>{user.name}</h3>;
            })}
        </div>
    );
       
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