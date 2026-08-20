import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./BudgetPlanner.css";

function BudgetPlanner() {
    const today = new Date();

    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    const [budget, setBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    const [budgetName, setBudgetName] = useState("");
    const [totalBudget, setTotalBudget] = useState("");
    const [categories, setCategories] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    const monthName = new Date(year, month).toLocaleString(
        "default",
        { month: "long" }
    );

    // =========================================
    // FETCH BUDGET
    // =========================================

    const fetchBudget = async () => {
        try {
            setLoading(true);

            if (!user?._id) return;

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/budgets/${user._id}/${month}/${year}`
            );

            setBudget(response.data);

        } catch (error) {

            if (error.response?.status === 404) {
                setBudget(null);
            } else {
                console.error("Fetch Budget Error:", error);
                toast.error("Failed to load budget.");
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudget();
    }, [month, year]);


    // =========================================
    // START CREATE / EDIT
    // =========================================

    const startEditing = () => {

        if (budget) {

            setBudgetName(budget.name || "");
            setTotalBudget(budget.totalBudget || "");

            setCategories(
                budget.categories?.map((category) => ({
                    name: category.name,
                    plannedAmount: category.plannedAmount,
                })) || []
            );

        } else {

            setBudgetName(`${monthName} Budget`);
            setTotalBudget("");

            setCategories([
                {
                    name: "Food",
                    plannedAmount: "",
                },
                {
                    name: "Transport",
                    plannedAmount: "",
                },
                {
                    name: "Shopping",
                    plannedAmount: "",
                },
                {
                    name: "Utilities",
                    plannedAmount: "",
                },
                {
                    name: "Entertainment",
                    plannedAmount: "",
                },
                {
                    name: "Savings",
                    plannedAmount: "",
                },
            ]);
        }

        setEditing(true);
    };


    // =========================================
    // CATEGORY FUNCTIONS
    // =========================================

    const updateCategory = (index, field, value) => {

        const updated = [...categories];

        updated[index][field] = value;

        setCategories(updated);
    };


    const addCategory = () => {

        setCategories([
            ...categories,
            {
                name: "",
                plannedAmount: "",
            },
        ]);
    };


    const removeCategory = (index) => {

        setCategories(
            categories.filter((_, i) => i !== index)
        );
    };


    // =========================================
    // SAVE BUDGET
    // =========================================

    const saveBudget = async () => {

        if (!user?._id) {
            toast.error("Please login first.");
            return;
        }

        if (!totalBudget || Number(totalBudget) <= 0) {
            toast.error("Enter a valid total budget.");
            return;
        }

        const validCategories = categories.filter(
            (category) =>
                category.name.trim() &&
                Number(category.plannedAmount) >= 0
        );

        if (validCategories.length === 0) {
            toast.error("Add at least one category.");
            return;
        }

        const plannedTotal = validCategories.reduce(
            (sum, category) =>
                sum + Number(category.plannedAmount || 0),
            0
        );

        if (plannedTotal > Number(totalBudget)) {
            toast.error(
                "Category allocation cannot exceed your total budget."
            );
            return;
        }

        try {

            const payload = {
                user: user._id,
                name: budgetName || `${monthName} Budget`,
                month,
                year,
                totalBudget: Number(totalBudget),
                categories: validCategories.map(
                    (category) => ({
                        name: category.name.trim(),
                        plannedAmount: Number(
                            category.plannedAmount || 0
                        ),
                    })
                ),
            };

            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/budgets`,
                payload
            );

            toast.success(
                budget
                    ? "Budget updated successfully!"
                    : "Budget created successfully!"
            );

            setEditing(false);

            await fetchBudget();

        } catch (error) {

            console.error("Save Budget Error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to save budget."
            );
        }
    };


    // =========================================
    // MONTH NAVIGATION
    // =========================================

    const previousMonth = () => {

        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };


    const nextMonth = () => {

        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };


    // =========================================
    // CALCULATIONS
    // =========================================

    const plannedTotal = categories.reduce(
        (sum, category) =>
            sum + Number(category.plannedAmount || 0),
        0
    );

    const unallocated = Math.max(
        Number(totalBudget || 0) - plannedTotal,
        0
    );


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (
            <div className="budget-page">
                <div className="budget-loading">
                    Loading your budget...
                </div>
            </div>
        );
    }


    // =========================================
    // CREATE / EDIT VIEW
    // =========================================

    if (editing) {

        return (
            <div className="budget-page">

                <div className="budget-header">

                    <div>
                        <span className="budget-eyebrow">
                            FINWISE
                        </span>

                        <h1>
                            {budget
                                ? "Edit Budget"
                                : "Create Budget"}
                        </h1>

                        <p>
                            Plan how you want to use your money this month.
                        </p>
                    </div>

                    <div className="budget-month">
                        <span>MONTH</span>

                        <strong>
                            {monthName} {year}
                        </strong>
                    </div>

                </div>


                {/* BUDGET DETAILS */}

                <div className="budget-editor">

                    <div className="editor-section">

                        <span className="editor-label">
                            BUDGET DETAILS
                        </span>


                        <div className="budget-input-grid">

                            <div className="budget-input-group">

                                <label>
                                    Budget Name
                                </label>

                                <input
                                    type="text"
                                    value={budgetName}
                                    onChange={(e) =>
                                        setBudgetName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Family Budget"
                                />

                            </div>


                            <div className="budget-input-group">

                                <label>
                                    Total Budget (₹)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={totalBudget}
                                    onChange={(e) =>
                                        setTotalBudget(
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. 50000"
                                />

                            </div>

                        </div>

                    </div>


                    {/* CATEGORIES */}

                    <div className="editor-section">

                        <div className="category-editor-header">

                            <div>
                                <span className="editor-label">
                                    SPENDING CATEGORIES
                                </span>

                                <p>
                                    Decide how much you want to allocate
                                    to each category.
                                </p>
                            </div>

                            <button
                                className="add-category-btn"
                                onClick={addCategory}
                            >
                                + Add Category
                            </button>

                        </div>


                        <div className="category-editor-list">

                            {categories.map(
                                (category, index) => (

                                    <div
                                        className="category-editor-row"
                                        key={index}
                                    >

                                        <input
                                            type="text"
                                            value={category.name}
                                            onChange={(e) =>
                                                updateCategory(
                                                    index,
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Category name"
                                        />

                                        <div className="amount-input">

                                            <span>₹</span>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    category.plannedAmount
                                                }
                                                onChange={(e) =>
                                                    updateCategory(
                                                        index,
                                                        "plannedAmount",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Amount"
                                            />

                                        </div>


                                        <button
                                            className="remove-category-btn"
                                            onClick={() =>
                                                removeCategory(
                                                    index
                                                )
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    </div>


                    {/* LIVE SUMMARY */}

                    <div className="budget-editor-summary">

                        <div>
                            <span>Total Budget</span>

                            <strong>
                                ₹
                                {Number(
                                    totalBudget || 0
                                ).toLocaleString("en-IN")}
                            </strong>
                        </div>

                        <div>
                            <span>Planned</span>

                            <strong>
                                ₹
                                {plannedTotal.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Unallocated</span>

                            <strong className="unallocated-value">
                                ₹
                                {unallocated.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>
                        </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="budget-editor-actions">

                        <button
                            className="cancel-budget-btn"
                            onClick={() =>
                                setEditing(false)
                            }
                        >
                            Cancel
                        </button>

                        <button
                            className="save-budget-btn"
                            onClick={saveBudget}
                        >
                            Save Budget
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =========================================
    // NO BUDGET
    // =========================================

    if (!budget) {

        return (
            <div className="budget-page">

                <div className="budget-header">

                    <div>

                        <span className="budget-eyebrow">
                            FINWISE
                        </span>

                        <h1>
                            Budget Planner
                        </h1>

                        <p>
                            Create a budget for {monthName} {year}.
                        </p>

                    </div>

                </div>


                <div className="budget-month-navigation">

                    <button onClick={previousMonth}>
                        ←
                    </button>

                    <strong>
                        {monthName} {year}
                    </strong>

                    <button onClick={nextMonth}>
                        →
                    </button>

                </div>


                <div className="budget-empty">

                    <div className="empty-icon">
                        ₹
                    </div>

                    <h2>
                        No budget for this month
                    </h2>

                    <p>
                        Set your own monthly budget and decide how
                        much to allocate to each category.
                    </p>

                    <button
                        className="create-budget-btn"
                        onClick={startEditing}
                    >
                        Create Budget
                    </button>

                </div>

            </div>
        );
    }


    // =========================================
    // BUDGET DISPLAY
    // =========================================

    const totalBudgetValue =
        Number(budget.totalBudget) || 0;

    const totalSpent =
        Number(budget.totalSpent) || 0;

    const remainingBudget =
        Number(budget.remainingBudget) || 0;

    const usedPercentage =
        totalBudgetValue > 0
            ? Math.min(
                  (totalSpent / totalBudgetValue) * 100,
                  100
              )
            : 0;

    const allocatedAmount =
        budget.categories.reduce(
            (sum, category) =>
                sum +
                Number(
                    category.plannedAmount || 0
                ),
            0
        );

    const unallocatedAmount = Math.max(
        totalBudgetValue - allocatedAmount,
        0
    );


    return (
        <div className="budget-page">

            {/* HEADER */}

            <div className="budget-header">

                <div>

                    <span className="budget-eyebrow">
                        FINWISE
                    </span>

                    <h1>
                        Budget Planner
                    </h1>

                    <p>
                        {budget.name}
                    </p>

                </div>


                <div className="budget-header-actions">

                    <div className="budget-month">

                        <span>MONTH</span>

                        <strong>
                            {monthName} {year}
                        </strong>

                    </div>

                    <button
                        className="edit-budget-btn"
                        onClick={startEditing}
                    >
                        Edit Budget
                    </button>

                </div>

            </div>


            {/* MONTH NAVIGATION */}

            <div className="budget-month-navigation">

                <button onClick={previousMonth}>
                    ←
                </button>

                <strong>
                    {monthName} {year}
                </strong>

                <button onClick={nextMonth}>
                    →
                </button>

            </div>


            {/* OVERVIEW */}

            <div className="budget-main-card">

                <div className="budget-card-top">

                    <div>

                        <span className="budget-label">
                            TOTAL BUDGET
                        </span>

                        <h2>
                            ₹
                            {totalBudgetValue.toLocaleString(
                                "en-IN"
                            )}
                        </h2>

                    </div>

                    <span
                        className={
                            usedPercentage >= 80
                                ? "status-warning"
                                : "status-good"
                        }
                    >
                        {usedPercentage >= 80
                            ? "High usage"
                            : "On track"}
                    </span>

                </div>


                <div className="budget-progress-section">

                    <div className="budget-progress-info">

                        <span>
                            ₹
                            {totalSpent.toLocaleString(
                                "en-IN"
                            )}{" "}
                            spent
                        </span>

                        <span>
                            {usedPercentage.toFixed(1)}% used
                        </span>

                    </div>


                    <div className="budget-progress">

                        <div
                            className={`budget-progress-fill ${
                                usedPercentage >= 80
                                    ? "warning"
                                    : ""
                            }`}
                            style={{
                                width: `${usedPercentage}%`,
                            }}
                        />

                    </div>

                </div>


                <div className="budget-card-footer">

                    <div>
                        <span>Remaining</span>

                        <strong>
                            ₹
                            {remainingBudget.toLocaleString(
                                "en-IN"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Planned</span>

                        <strong>
                            ₹
                            {allocatedAmount.toLocaleString(
                                "en-IN"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Unallocated</span>

                        <strong>
                            ₹
                            {unallocatedAmount.toLocaleString(
                                "en-IN"
                            )}
                        </strong>
                    </div>

                </div>

            </div>


            {/* CATEGORY BREAKDOWN */}

            <div className="budget-section-header">

                <div>

                    <span className="budget-label">
                        SPENDING PLAN
                    </span>

                    <h2>
                        Category Breakdown
                    </h2>

                </div>

                <span className="category-count">
                    {budget.categories.length} categories
                </span>

            </div>


            <div className="budget-category-grid">

                {budget.categories.map(
                    (category, index) => {

                        const planned =
                            Number(
                                category.plannedAmount
                            ) || 0;

                        const spent =
                            Number(
                                category.spentAmount
                            ) || 0;

                        const remaining =
                            Number(
                                category.remainingAmount
                            ) || 0;

                        const isOverBudget =
                            spent > planned;

                        // FIX: when a category has no planned amount
                        // (planned === 0) but has spending against it,
                        // the old code fell through to 0% width while
                        // still being labeled "Over" — an invisible-bar
                        // contradiction. Now an unplanned category with
                        // any spend renders as a full, over-budget bar.
                        const percentage =
                            planned > 0
                                ? Math.min(
                                      (spent /
                                          planned) *
                                          100,
                                      100
                                  )
                                : spent > 0
                                    ? 100
                                    : 0;

                        return (
                            <div
                                className="budget-category-card"
                                key={
                                    category._id ||
                                    `${category.name}-${index}`
                                }
                            >

                                <div className="category-header">

                                    <div>

                                        <h3>
                                            {category.name}
                                        </h3>

                                        <span>
                                            {percentage.toFixed(
                                                0
                                            )}
                                            % used
                                        </span>

                                    </div>

                                    <strong>
                                        ₹
                                        {Math.abs(
                                            remaining
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>

                                </div>


                                <div className="category-progress">

                                    <div
                                        className={`category-progress-fill ${
                                            isOverBudget
                                                ? "over-budget"
                                                : ""
                                        }`}
                                        style={{
                                            width: `${percentage}%`,
                                        }}
                                    />

                                </div>


                                <div className="category-details">

                                    <div>
                                        <span>
                                            Planned
                                        </span>

                                        <strong>
                                            ₹
                                            {planned.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Spent
                                        </span>

                                        <strong>
                                            ₹
                                            {spent.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            {isOverBudget
                                                ? "Over"
                                                : "Left"}
                                        </span>

                                        <strong
                                            className={
                                                isOverBudget
                                                    ? "over-text"
                                                    : ""
                                            }
                                        >
                                            ₹
                                            {Math.abs(
                                                remaining
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>
                                    </div>

                                </div>

                            </div>
                        );
                    }
                )}

            </div>


            {/* NOTE */}

            <div className="budget-note">

                <div className="budget-note-mark">
                    ₹
                </div>

                <div>

                    <span>
                        SMART BUDGET NOTE
                    </span>

                    <p>
                        {unallocatedAmount > 0
                            ? `You still have ₹${unallocatedAmount.toLocaleString(
                                  "en-IN"
                              )} of your budget unallocated.`
                            : remainingBudget > 0
                            ? `You have ₹${remainingBudget.toLocaleString(
                                  "en-IN"
                              )} remaining in your budget this month.`
                            : "Your monthly budget has been fully utilized."}
                    </p>

                </div>

            </div>

        </div>
    );
}

export default BudgetPlanner;