import {useState} from "react";

function Expense(){

    const[title, setTitle] = useState(0);
    const[amount, setAmount] = useState(0);
    const[category, setCategory] = useState(0);
    const[date, setDate] = useState(0);

    const expenses = [
         { title: "Pizza", amount: 200, category: "Food", date: "25-08-2026"},
         { title: "Rapido", amount: 100, category: "Travel", date: "25-08-2026"},
         { title: "Amazon prime", amount: 200, category: "Entertainment", date: "25-08-2026"},
         { title: "white shirt", amount: 400, category: "Shopping", date: "25-08-2026"},
         { title: "Electricity", amount: 2000, category: "Bills", date: "25-08-2026"}              
    ]

    function calculateTotal(expenses){
        return expenses.reduce((total, expense) => {
          return total + expense.amount;
    }, 0);
    }

    function getFoodExpenses(expense) {
        return expense.filter((expense) => {
          return expense.category === "Food";
        });
    }

    function describeExpense(expense){
       return `i spent $(expense.amount) on $(expense.title)`;
    }

    const Expenses = [
        { title: "Pizza", amount: 200, category: "Food" },
        { title: "Uber", amount: 300, category: "Travel" },
        { title: "Burger", amount: 150, category: "Food" },
        { title: "Shirt", amount: 800, category: "Shopping" }
    ];

    function calculateTotal(expenses){
        return expenses.reduce((total, expense) => {
            return total + expense.amount;
        },0);
    }

    function getFoodExpenses(expenses){
        return expenses.filter((expense) => {
            return expense.category === "Food";
        });
    }

    function getFoodTotal(expenses){
        const foodExpenses = expenses.filter((expense)=>{
            return expense.category === "Food";
        });

        return foodExpenses.reduce((total, expense)=>{
            return total + expense.amount;
        },0);
    }

    function getExpensiveFood(expenses) {
        const foodExpenses = expenses.filter((expense)=>{
            return expense.category == "Food";
        });

        return foodExpenses.filter((expense) => {
            return expense.amount > 150;
        });
    }

    function getExpensiveFood(expenses) {
        return expenses.filter((expense) => {
            return expense.category === "Food" && expense.amount > 150;
        });
    }

    function getCategoryTotal(expenses, category){
        const categoryTotal = expenses.filter((expense) => {
            return expense.category === category;
        });

        return categoryTotal.reduce((total, expense) => {
            return total + expense.amount;
        },0);
    }

    function getCategorySummary(expenses, category){
        const foodExpenses = expenses.filter((expense)=>{
            return expense.category === category;
        });

        const total = foodExpenses.reduce((total, expense) => {
            return total + expense.amount;
        },0);

       return {
        category: category,
        total: total,
        count: foodExpenses.length
    };
    }

    function getHighestExpense(expenses) {
       return expenses.reduce((highest, expense) => {
         if (expense.amount > highest.amount){
            return expense;
         }

         return highest;
       }, expenses[0]);
    }

    function getMonthlyTotal(expenses, month) {
      const monthlyTotal = expenses.filter((expense) => {
        return expense.date.startsWith(month);
      });

      return monthlyTotal.reduce((total, expense) => {
            return total + expense.amount;
      },0);
    }

    function getAverageExpense(expenses) {

        const total = expenses.reduce((total, expense) => {
            return total +  expense.amount;
        }, 0);

        return total/expenses.length;

    }

    function createExpense(title, amount, category) {
     return{
        title: title,
        amount: amount,
        category: category,
     };
    }

    function addExpense(expenses, expense) {
       const newExpense = createExpense("Pizza",200,"Food");
       expenses.push(newExpense);
       return expenses;
    }

    const addExpense = () => {

        const newExpense = {
            title: title,
            amount: amount,
            category: category
        };
        setExpenses([...expenses, newExpense]);
    };

    {expenses.map((expense, index) => {
        return (
            <div key={index}>
                {expense.title},
                {expense.amount},
                {expense.category}
            </div>
        );
    })}

    function deleteExpense(expenses, id) {
       return expenses.filter((expense) =>{
        if(expense.id != id){
            return expense;
        }
       });
    }

    const handleDelete = (id) => {
        const updatedExpenses = deleteExpense(expenses,id);
        setExpenses(updatedExpenses);
       }
    };


    function getExpenseStats(expenses) {
       const total = expenses.reduce((total, expense) => {
            return total +  expense.amount;
        }, 0);

        return {
            total: total,
            count: expenses.length,
            average: total/expenses.length
        };
    }


    return(
        <div>

            <h2>Expense Tracker</h2>
            <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}/>

            <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}/>

            <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}/>

            <input
            type="date"
            placeholder="enter the date"
            value={date}
            onChange={(e) => setDate(e.target.value)}/>


        </div>

    );


export default Expense;