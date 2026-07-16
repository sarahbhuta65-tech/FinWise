import { useState, useEffect } from "react";
import InputField from "../components/InputField";
import "./ExpenseTracker.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axios from "axios";

function ExpenseTracker({darkMode}) {
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");
  const [chartView, setChartView] = useState("daily");

  const addExpense = async () => {
    if (!expenseName || !amount) {
      setError("Please fill all fields");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Expense amount must be greater than 0");
      return;
    }

    if (Number(amount) >= 10000000) {
      setError("Expense amount is too large");
      return;
    }

    setError("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id || user?._id;

      if (!userId) {
        setError("Please log in again to continue.");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/expenses",
        {
          user: userId,
          name: expenseName,
          amount: Number(amount),
          category,
        }
      );

      setExpenses([res.data, ...expenses]);

      setExpenseName("");
      setAmount("");
      setCategory("Food");

    } catch (error) {
      console.error(error);
      setError("Failed to add expense.");
    }
  };

  const deleteExpense = async (id) => {
      try {
          await axios.delete(
              `http://localhost:5000/api/expenses/${id}`
          );

          setExpenses((prevExpenses) =>
              prevExpenses.filter((expense) => (expense._id || expense.id) !== id)
          );

      } catch (error) {
          console.error(error);
          setError("Failed to delete expense.");
      }
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const categoryTotals = expenses.reduce((totals, expense) => {
    if (totals[expense.category]) {
      totals[expense.category] += expense.amount;
    } else {
      totals[expense.category] = expense.amount;
    }
    return totals;
  }, {});

  const topCategory = Object.entries(categoryTotals).reduce(
    (max, current) => (current[1] > max[1] ? current : max),
    ["None", 0]
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTotal = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce((total, expense) => total + expense.amount, 0);

  const lastMonthTotal = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);

      let lastMonth = currentMonth - 1;
      let year = currentYear;

      if (lastMonth < 0) {
        lastMonth = 11;
        year--;
      }

      return (
        expenseDate.getMonth() === lastMonth &&
        expenseDate.getFullYear() === year
      );
    })
    .reduce((total, expense) => total + expense.amount, 0);

  const percentageChange =
    lastMonthTotal > 0
      ? (
          ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) *
          100
        ).toFixed(1)
      : 0;

  const budgetValue = Number(budget) || 0;
  const remainingBudget = budgetValue - thisMonthTotal;

  const budgetUsedPercentage =
    budgetValue > 0
      ? Math.min((thisMonthTotal / budgetValue) * 100, 100)
      : 0;

  let budgetStatus = "";
  let budgetColor = "";

  if (budgetUsedPercentage < 70) {
    budgetStatus = "🟢 Safe";
    budgetColor = "#22c55e";
  } else if (budgetUsedPercentage < 90) {
    budgetStatus = "🟡 Warning";
    budgetColor = "#f59e0b";
  } else {
    budgetStatus = "🔴 Critical";
    budgetColor = "#ef4444";
  }

  let spendingInsight = "";

  if (lastMonthTotal === 0 && thisMonthTotal > 0) {
    spendingInsight = "This is your first month of tracked expenses.";
  } else if (thisMonthTotal > lastMonthTotal) {
    spendingInsight = `⚠ Spending increased by ${percentageChange}% compared to last month`;
  } else if (thisMonthTotal < lastMonthTotal) {
    spendingInsight = `✅ Spending decreased by ${Math.abs(
      percentageChange
    )}% compared to last month`;
  } else {
    spendingInsight = "Your spending is unchanged from last month.";
  }

  let recommendation = "";

  if (topCategory[0] === "Food") {
    recommendation = "🍕 Try reducing food delivery expenses.";
  } else if (topCategory[0] === "Shopping") {
    recommendation = "🛍️ Consider limiting non-essential shopping.";
  } else if (topCategory[0] === "Travel") {
    recommendation = "🚙 Travel costs are high. Plan routes wisely.";
  } else if (topCategory[0] === "Bills") {
    recommendation = "💡 Review utility usage to reduce bills.";
  } else {
    recommendation = "✅ Your spending looks balanced.";
  }

  const chartData = Object.values(
    expenses.reduce((acc, expense) => {
      const expenseDate = new Date(expense.date);

      const key =
        chartView === "daily"
          ? expenseDate.toLocaleDateString()
          : expenseDate.toLocaleString("default", { month: "short" });

      if (!acc[key]) {
        acc[key] = {
          label: key,
          amount: 0,
        };
      }

      acc[key].amount += expense.amount;
      return acc;
    }, {})
  );

  const pieData = Object.entries(categoryTotals).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id || user?._id;

        if (!userId) return;

        const res = await axios.get(
          `http://localhost:5000/api/expenses/${userId}`
        );

        setExpenses(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchExpenses();
  }, []);
  
  return (
    <div className={`expense-page ${darkMode ? "dark" : ""}`}>
      <h1>Expense Tracker</h1>

      {/* ROW 1 */}
      <div className="expense-top-section">
        <div className="expense-form-card">
          <h2>Add Expense</h2>

          <InputField
            placeholder="Expense Name"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
          />

          <InputField
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Other</option>
          </select>

          {error && <p className="error-message">⚠ {error}</p>}

          <button className="add-expense-btn" onClick={addExpense}>
            Add Expense
          </button>
        </div>

        {/* Summary */}
        <div className="expense-summary-card">
          <h2>Monthly Summary</h2>

          <div className="summary-stats-grid">
            <div className="summary-stat-box month-box">
              <h4>This Month</h4>
              <h3>₹{thisMonthTotal}</h3>
            </div>

            <div className="summary-stat-box last-box">
              <h4>Last Month</h4>
              <h3>₹{lastMonthTotal}</h3>
            </div>

            <div className="summary-stat-box change-box">
              <h4>Change</h4>
              <h3>
                {percentageChange > 0 ? "+" : ""}
                {percentageChange}%
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="secondary-grid">
        {/* Budget Planner */}
        <div className="budget-planner-card">
          <h2>Budget Planner</h2>

          <InputField
            placeholder="Set Monthly Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />

          <div className="budget-stats">
            <div className="budget-stat">
              <span>Budget</span>
              <strong>₹{budgetValue}</strong>
            </div>

            <div className="budget-stat">
              <span>Spent</span>
              <strong>₹{thisMonthTotal}</strong>
            </div>

            <div className="budget-stat">
              <span>Remaining</span>
              <strong>₹{remainingBudget}</strong>
            </div>
          </div>

          <div className="budget-progress-bar">
            <div
              className="budget-progress-fill"
              style={{
                width: `${budgetUsedPercentage}%`,
                background: budgetColor,
              }}
            />
          </div>

          <div className="budget-footer">
            <span style={{ color: budgetColor }}>{budgetStatus}</span>
            <strong>{budgetUsedPercentage.toFixed(1)}% used</strong>
          </div>
        </div>

        {/* Smart Insights */}
        <div className="insights-card">
          <h2>Smart Insights</h2>

          <div className="mini-insight-card">
            <h4>📊 Spending Trend</h4>
            <p>{spendingInsight}</p>
          </div>

          <div className="mini-insight-card">
            <h4>🏆 Top Category</h4>
            <p>{topCategory[0]}</p>
          </div>

          <div className="mini-insight-card">
            <h4>💡 Advice</h4>
            <p>{recommendation}</p>
          </div>
        </div>
      </div>

      {/* ROW 3 */}
      <div className="chart-toggle">
        <button
          className={chartView === "daily" ? "active-toggle" : ""}
          onClick={() => setChartView("daily")}
        >
          Daily
        </button>

        <button
          className={chartView === "monthly" ? "active-toggle" : ""}
          onClick={() => setChartView("monthly")}
        >
          Monthly
        </button>
      </div>

      <div className="charts-wrapper">
        <div className="expense-chart-card">
          <h2>
            {chartView === "daily"
              ? "Daily Spending Trend"
              : "Monthly Spending Trend"}
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="expense-pie-card">
          <h2>Category Breakdown</h2>

          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 4 */}
      <div className="expense-history-card">
        <h2>Expense History</h2>

        <div className="expense-list">
          {expenses.map((expense) => (
            <div key={expense._id || expense.id} className="expense-item">
              <div className="expense-name-block">
                <strong>{expense.name}</strong>
                <small>{expense.category}</small>
              </div>

              <span>₹{expense.amount}</span>

              <small>
                {new Date(expense.date).toLocaleDateString()}
              </small>

              <button
                className="delete-btn"
                onClick={() => deleteExpense(expense._id || expense.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExpenseTracker;