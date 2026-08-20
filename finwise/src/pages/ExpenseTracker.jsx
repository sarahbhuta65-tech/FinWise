import { useState, useEffect } from "react";
import InputField from "../components/InputField";
import "./ExpenseTracker.css";
import toast from "react-hot-toast";
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
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Current month's Budget document (same shape returned by
  // budgetController.getBudget) — used to restrict which
  // categories can be picked when logging an expense, so an
  // expense can't be logged against a category the budget
  // doesn't track.
  const [currentBudget, setCurrentBudget] = useState(null);


  const addCategory = async () => {
    if (!newCategory.trim()) {
        toast.error("Please enter a category name");
        return;
    }

    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id || user?._id;

        if (!userId) {
            toast.error("Please log in again.");
            return;
        }

        const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/categories`,
            {
                user: userId,
                name: newCategory.trim(),
            }
        );

        setCategories((prev) => [...prev, res.data]);

        // Automatically select the new category
        setCategory(res.data.name);

        setNewCategory("");
        setShowAddCategory(false);

        toast.success("Category added successfully");

    } catch (error) {
        console.error(error);

        toast.error(
            error.response?.data?.message ||
            "Failed to add category"
        );
    }
};

const handleCsvUpload = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".csv")) {
    toast.error("Please upload a CSV file.");
    return;
  }

  setCsvFile(file);

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const text = e.target.result;

      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        toast.error("CSV file does not contain enough data.");
        return;
      }

      const headers = lines[0]
        .split(",")
        .map((header) => header.trim().toLowerCase());

      const requiredHeaders = [
        "name",
        "amount",
        "category",
        "date",
      ];

      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        toast.error(
          `Missing columns: ${missingHeaders.join(", ")}`
        );
        return;
      }

      const parsedRows = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]
          .split(",")
          .map((value) => value.trim());

        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        const numericAmount = Number(row.amount);

        const validDate = row.date
          ? !isNaN(new Date(row.date).getTime())
          : false;

        parsedRows.push({
          name: row.name,
          amount: numericAmount,
          category: row.category,
          date: row.date,
          valid:
            Boolean(row.name) &&
            numericAmount > 0 &&
            Boolean(row.category) &&
            validDate,
        });
      }

      setCsvPreview(parsedRows);
      setShowCsvPreview(true);

      const validCount = parsedRows.filter(
        (row) => row.valid
      ).length;

      toast.success(
        `${validCount} valid transaction${
          validCount !== 1 ? "s" : ""
        } found.`
      );
    } catch (error) {
      console.error("CSV parsing error:", error);
      toast.error("Failed to read CSV file.");
    }
  };

  reader.readAsText(file);

  // Allow selecting the same file again
  event.target.value = "";
};

const importCsvTransactions = async () => {
  if (!csvFile) {
    toast.error("Please select a CSV file.");
    return;
  }

  try {
    setIsImporting(true);

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id || user?._id;

    if (!userId) {
      toast.error("Please log in again.");
      return;
    }

    const formData = new FormData();

    formData.append("file", csvFile);
    formData.append("user", userId);

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/expenses/import`,
      formData
    );

    const importedExpenses = res.data.expenses || [];

    setExpenses((prev) => [
      ...importedExpenses,
      ...prev,
    ]);

    setCsvFile(null);
    setCsvPreview([]);
    setShowCsvPreview(false);

    toast.success(
      res.data.message ||
      `${importedExpenses.length} transactions imported successfully!`
    );

    if (res.data.skippedCount > 0) {
      toast(
        `${res.data.skippedCount} invalid transaction${
          res.data.skippedCount !== 1 ? "s" : ""
        } skipped.`,
        {
          icon: "⚠️",
        }
      );
    }

  } catch (error) {
    console.error("CSV import error:", error);

    toast.error(
      error.response?.data?.message ||
      "Failed to import CSV transactions."
    );
  } finally {
    setIsImporting(false);
  }
};

const cancelCsvImport = () => {
  setCsvFile(null);
  setCsvPreview([]);
  setShowCsvPreview(false);
};

  const addExpense = async () => {
    if (!expenseName || !amount) {
      toast.error("Please fill all fields");
      setError("Please fill all fields");
      return;
    }

    if (Number(amount) <= 0) {
      toast.error("Expense amount must be greater than 0");
      setError("Expense amount must be greater than 0");
      return;
    }

    if (Number(amount) >= 10000000) {
      toast.error("Expense amount is too large");
      setError("Expense amount is too large");
      return;
    }

    setError("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id || user?._id;

      if (!userId) {
        toast.error("Please log in again to continue.");
        setError("Please log in again to continue.");
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/expenses`,
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
              `${import.meta.env.VITE_API_URL}/api/expenses/${id}`
          );

          setExpenses((prevExpenses) =>
              prevExpenses.filter((expense) => (expense._id || expense.id) !== id)
          );
          toast.success("Expense deleted successfully");

      } catch (error) {
          console.error(error);
          toast.error("Failed to delete expense.");
          setError("Failed to delete expense.");
      }
  };

  // =====================================================
  // DATE CONTEXT
  //
  // Moved above the category/pie-chart calculations below,
  // since those now need "this month" to filter against —
  // previously they ran on the full, all-time expense list.
  // =====================================================

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  const lastMonthExpenses = expenses.filter((expense) => {
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
  });

  const thisMonthTotal = thisMonthExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const lastMonthTotal = lastMonthExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // FIX: this used to reduce over the full, all-time `expenses`
  // array, so the pie chart, "Top Category", and the recommendation
  // text were all quietly showing all-time data even though the
  // panels around them ("This Month" / "Last Month") implied a
  // monthly view. Now scoped to thisMonthExpenses to match.
  const categoryTotals = thisMonthExpenses.reduce((totals, expense) => {
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
    budgetStatus = "Safe";
    budgetColor = "#1f6d4c";
  } else if (budgetUsedPercentage < 90) {
    budgetStatus = "Warning";
    budgetColor = "#a9862e";
  } else {
    budgetStatus = "Critical";
    budgetColor = "#b3541e";
  }

  let spendingInsight = "";

  if (lastMonthTotal === 0 && thisMonthTotal > 0) {
    spendingInsight = "This is your first month of tracked expenses.";
  } else if (thisMonthTotal > lastMonthTotal) {
    spendingInsight = `Spending increased by ${percentageChange}% compared to last month`;
  } else if (thisMonthTotal < lastMonthTotal) {
    spendingInsight = `Spending decreased by ${Math.abs(
      percentageChange
    )}% compared to last month`;
  } else {
    spendingInsight = "Your spending is unchanged from last month.";
  }

  let recommendation = "";

  if (topCategory[0] === "Food") {
    recommendation = "Try reducing food delivery expenses.";
  } else if (topCategory[0] === "Shopping") {
    recommendation = "Consider limiting non-essential shopping.";
  } else if (topCategory[0] === "Travel") {
    recommendation = "Travel costs are high. Plan routes wisely.";
  } else if (topCategory[0] === "Bills") {
    recommendation = "Review utility usage to reduce bills.";
  } else {
    recommendation = "Your spending looks balanced.";
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
    "#1F6D4C",
    "#A9862E",
    "#3B5A73",
    "#B3541E",
    "#6B4E71",
  ];

  // =====================================================
  // CATEGORY <-> BUDGET LINKING
  //
  // If a budget exists for the current month, the expense
  // form should only offer categories that budget actually
  // tracks — otherwise you can log an expense against a
  // category the Budget Planner has no line item for, which
  // is exactly the kind of "disconnect" that made the two
  // features feel unrelated.
  //
  // If there's no budget yet for this month, we fall back to
  // showing every saved category so the tracker still works
  // standalone.
  // =====================================================

  const budgetCategoryNames = (
    currentBudget?.categories || []
  ).map((item) => item.name);

  const hasBudgetCategories = budgetCategoryNames.length > 0;

  const dropdownCategories = hasBudgetCategories
    ? categories.filter((item) =>
        budgetCategoryNames.some(
          (name) =>
            name.toLowerCase() === item.name.toLowerCase()
        )
      )
    : categories;

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id || user?._id;

        if (!userId) return;

        // Fetch expenses
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/expenses/${userId}`
        );

        setExpenses(res.data);

        // Fetch categories
        const categoryRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/categories/${userId}`
        );

        setCategories(categoryRes.data);

        // Fetch this month's budget so the category dropdown
        // can be restricted to categories the budget tracks.
        let budgetData = null;

        try {
          const budgetRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/budgets/${userId}/${currentMonth}/${currentYear}`
          );

          budgetData = budgetRes.data;
          setCurrentBudget(budgetData);
        } catch (budgetError) {
          console.error(
            "Failed to fetch current budget:",
            budgetError
          );
          setCurrentBudget(null);
        }

        // Pick a sensible default category: prefer the first
        // budget-linked category if one exists, otherwise the
        // first saved category.
        const budgetNames = (budgetData?.categories || []).map(
          (item) => item.name
        );

        const linkedCategories =
          budgetNames.length > 0
            ? categoryRes.data.filter((item) =>
                budgetNames.some(
                  (name) =>
                    name.toLowerCase() ===
                    item.name.toLowerCase()
                )
              )
            : categoryRes.data;

        if (linkedCategories.length > 0) {
          setCategory(linkedCategories[0].name);
        } else if (categoryRes.data.length > 0) {
          setCategory(categoryRes.data[0].name);
        }

      } catch (error) {
        console.error("Failed to fetch expenses/categories:", error);
        toast.error("Failed to load expense data");
      }
    };

    fetchExpenses();
  }, []);

  return (
    <div className={`expense-page ${darkMode ? "dark" : ""}`}>

      <div className="expense-page-header">
        <span className="eyebrow">Track &amp; Analyze</span>
        <h1>Expense Tracker</h1>
      </div>

      {/* ROW 1 */}
      <div className="expense-top-section">
        <div className="statement-panel expense-form-card">
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

          <div className="category-input-row">
              <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
              >
                  {dropdownCategories.map((item) => (
                      <option
                          key={item._id}
                          value={item.name}
                      >
                          {item.name}
                      </option>
                  ))}
              </select>

              {!hasBudgetCategories && (
                  <button
                      type="button"
                      className="add-category-btn"
                      onClick={() => setShowAddCategory((prev) => !prev)}
                  >
                      +
                  </button>
              )}
          </div>

          <p className="category-linked-hint">
              {hasBudgetCategories
                  ? "Categories are pulled from this month's Budget Planner. Add or rename categories there to change this list."
                  : "No budget set for this month yet — showing all saved categories. Set up a budget to link these automatically."}
          </p>

          {showAddCategory && !hasBudgetCategories && (
              <div className="new-category-row">
                  <input
                      type="text"
                      placeholder="New category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                  />

                  <button
                      type="button"
                      className="save-category-btn"
                      onClick={addCategory}
                  >
                      Add
                  </button>
                  
              </div>
          )}

          {error && <p className="error-message">{error}</p>}

          <button className="add-expense-btn" onClick={addExpense}>
            Add Expense
          </button>
          {/* IMPORT TRANSACTIONS */}
          <div className="import-transactions-card">

            <div className="import-transactions-header">

              <div className="import-icon">
                CSV
              </div>

              <div className="import-content">

                <span className="import-eyebrow">
                  Import
                </span>

                <h3>
                  Import Transactions
                </h3>

                <p>
                  Upload your existing expenses from a CSV file.
                </p>

                <p className="import-required">
                  Required columns: name, amount, category, date
                </p>

                <div className="import-actions">

                  <label className="import-upload-btn">
                    + Upload CSV

                    <input
                      type="file"
                      accept=".csv"
                      className="import-file-input"
                      onChange={handleCsvUpload}
                    />
                  </label>

                  <span className="import-file-name">
                    {csvFile ? csvFile.name : "No file selected"}
                  </span>

                  <button
                    type="button"
                    className="import-submit-btn"
                    onClick={importCsvTransactions}
                    disabled={
                      isImporting ||
                      csvPreview.filter((row) => row.valid).length === 0
                    }
                  >
                    {isImporting ? "Importing..." : "Import"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Summary */}
        <div className="statement-panel expense-summary-card">
          <h2>Monthly Summary</h2>

          <div className="summary-stats-grid">
            <div className="summary-stat-box month-box">
              <h4>This Month</h4>
              <h3 className="mono-figure">₹{thisMonthTotal}</h3>
            </div>

            <div className="summary-stat-box last-box">
              <h4>Last Month</h4>
              <h3 className="mono-figure">₹{lastMonthTotal}</h3>
            </div>

            <div className="summary-stat-box change-box">
              <h4>Change</h4>
              <h3 className="mono-figure">
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
        <div className="statement-panel budget-planner-card">
          <h2>Quick Budget</h2>

          <p className="quick-budget-hint">
            A scratchpad estimate for this session only — it isn't saved.
            For the real budget that Category Breakdown and this dropdown
            use, see the Budget Planner page.
          </p>

          <InputField
            placeholder="Set Monthly Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />

          <div className="budget-stats">
            <div className="budget-stat">
              <span>Budget</span>
              <strong className="mono-figure">₹{budgetValue}</strong>
            </div>

            <div className="budget-stat">
              <span>Spent</span>
              <strong className="mono-figure">₹{thisMonthTotal}</strong>
            </div>

            <div className="budget-stat">
              <span>Remaining</span>
              <strong className="mono-figure">₹{remainingBudget}</strong>
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
            <strong className="mono-figure">{budgetUsedPercentage.toFixed(1)}% used</strong>
          </div>
        </div>

        {/* Smart Insights */}
        <div className="statement-panel insights-card">
          <h2>Smart Insights</h2>

          <div className="mini-insight-card">
            <h4>Spending Trend</h4>
            <p>{spendingInsight}</p>
          </div>

          <div className="mini-insight-card">
            <h4>Top Category</h4>
            <p>{topCategory[0]}</p>
          </div>

          <div className="mini-insight-card">
            <h4>Advice</h4>
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
        <div className="statement-panel expense-chart-card">
          <h2>
            {chartView === "daily"
              ? "Daily Spending Trend"
              : "Monthly Spending Trend"}
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--ink-400)", fontFamily: "var(--font-mono)" }} axisLine={{stroke:"var(--line-strong)"}} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--ink-400)", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 4, border: "1px solid #e3ddcd", fontFamily: "var(--font-mono)", fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#1F6D4C"
                strokeWidth={2}
                dot={{ r: 3, fill: "#1F6D4C" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="statement-panel expense-pie-card">
          <h2>This Month's Category Breakdown</h2>

          {pieData.length > 0 ? (
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
                      stroke="var(--surface)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>

                <Tooltip contentStyle={{ borderRadius: 4, border: "1px solid #e3ddcd", fontFamily: "var(--font-mono)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-body)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No expenses logged this month yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ROW 4 */}
      <div className="statement-panel expense-history-card">
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

      {showCsvPreview && (
        <div className="csv-modal-overlay">

          <div className="csv-modal">

            <div className="csv-modal-header">

              <div>
                <span className="eyebrow">
                  CSV IMPORT
                </span>

                <h2>
                  Review Transactions
                </h2>

                <p>
                  {csvFile?.name}
                </p>
              </div>

              <button
                className="csv-close-btn"
                onClick={cancelCsvImport}
              >
                ×
              </button>

            </div>

            <div className="csv-import-summary">

              <div>
                <span>Total Rows</span>
                <strong>
                  {csvPreview.length}
                </strong>
              </div>

              <div>
                <span>Valid</span>
                <strong>
                  {csvPreview.filter(
                    (row) => row.valid
                  ).length}
                </strong>
              </div>

              <div>
                <span>Skipped</span>
                <strong>
                  {csvPreview.filter(
                    (row) => !row.valid
                  ).length}
                </strong>
              </div>

            </div>

            <div className="csv-preview-table">

              <div className="csv-table-head">
                <span>Name</span>
                <span>Amount</span>
                <span>Category</span>
                <span>Date</span>
                <span>Status</span>
              </div>

              {csvPreview.map((row, index) => (

                <div
                  className={`csv-table-row ${
                    !row.valid ? "invalid-row" : ""
                  }`}
                  key={index}
                >

                  <span>{row.name || "—"}</span>

                  <span>
                    ₹
                    {Number(row.amount || 0).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  <span>
                    {row.category || "—"}
                  </span>

                  <span>
                    {row.date || "—"}
                  </span>

                  <span>
                    {row.valid ? (
                      <span className="csv-valid">
                        ✓ Valid
                      </span>
                    ) : (
                      <span className="csv-invalid">
                        ✕ Invalid
                      </span>
                    )}
                  </span>

                </div>

              ))}

            </div>

            <div className="csv-modal-footer">

              <button
                className="csv-cancel-btn"
                onClick={cancelCsvImport}
              >
                Cancel
              </button>

              <button
                className="csv-confirm-btn"
                onClick={importCsvTransactions}
                disabled={
                  isImporting ||
                  csvPreview.filter(
                    (row) => row.valid
                  ).length === 0
                }
              >
                {isImporting
                  ? "Importing..."
                  : "Import Transactions"}
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default ExpenseTracker;