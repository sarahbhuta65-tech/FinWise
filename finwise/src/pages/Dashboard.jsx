import { useState, useEffect, useMemo } from "react";
import * as CountUpModule from "react-countup";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LabelList,
    LineChart,
    Line,
    ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { createPortal } from "react-dom";
import "./Dashboard.css";
import FinancialNudge from "../components/FinancialNudge";


function Dashboard() {

    const CountUp =
        CountUpModule?.default?.default ||
        CountUpModule?.default ||
        CountUpModule;

    const [totalExpenses, setTotalExpenses] = useState(0);
    const [sipValue, setSipValue] = useState(0);
    const [monthlyEmi, setMonthlyEmi] = useState(0);

    const [savingsScore, setSavingsScore] = useState("Good");

    const [chartData, setChartData] = useState([]);
    const [goalData, setGoalData] = useState(null);

    const [healthScore, setHealthScore] = useState(100);

    const [trendData, setTrendData] = useState([]);
    const [monthlyTrendData, setMonthlyTrendData] = useState([]);

    const [thisMonthSpent, setThisMonthSpent] = useState(0);
    const [lastMonthSpent, setLastMonthSpent] = useState(0);

    const [recentTransactions, setRecentTransactions] = useState([]);

    const [showScoreDetails, setShowScoreDetails] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    const currentHour = new Date().getHours();

    let greeting = "Good Evening";

    if (currentHour < 12) {
        greeting = "Good Morning";
    } else if (currentHour < 17) {
        greeting = "Good Afternoon";
    }

    const statementDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });


    /*
    ============================================================
    DASHBOARD DATA
    ============================================================
    */

    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                const currentUser =
                    JSON.parse(localStorage.getItem("user"));

                if (!currentUser || !currentUser._id) {
                    return;
                }


                /* =================================================
                   FETCH EXPENSES
                ================================================= */

                const expenseRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/expenses/${currentUser._id}`
                );

                const savedExpenses = Array.isArray(expenseRes.data)
                    ? expenseRes.data
                    : [];


                /* =================================================
                   CURRENT DATE
                ================================================= */

                const now = new Date();

                const currentMonth =
                    now.getMonth();

                const currentYear =
                    now.getFullYear();


                /* =================================================
                   FILTER CURRENT MONTH EXPENSES
                ================================================= */

                const currentMonthExpenses =
                    savedExpenses.filter((expense) => {

                        if (!expense.date) {
                            return false;
                        }

                        const date =
                            new Date(expense.date);

                        return (
                            date.getMonth() === currentMonth &&
                            date.getFullYear() === currentYear
                        );
                    });


                /* =================================================
                   LAST MONTH
                ================================================= */

                const previousDate =
                    new Date(
                        currentYear,
                        currentMonth - 1,
                        1
                    );

                const previousMonth =
                    previousDate.getMonth();

                const previousYear =
                    previousDate.getFullYear();


                const lastMonthExpenses =
                    savedExpenses.filter((expense) => {

                        if (!expense.date) {
                            return false;
                        }

                        const date =
                            new Date(expense.date);

                        return (
                            date.getMonth() === previousMonth &&
                            date.getFullYear() === previousYear
                        );
                    });


                /* =================================================
                   THIS MONTH TOTAL
                ================================================= */

                const thisTotal =
                    currentMonthExpenses.reduce(
                        (sum, expense) =>
                            sum + Number(expense.amount || 0),
                        0
                    );


                /* =================================================
                   LAST MONTH TOTAL
                ================================================= */

                const previousTotal =
                    lastMonthExpenses.reduce(
                        (sum, expense) =>
                            sum + Number(expense.amount || 0),
                        0
                    );


                setTotalExpenses(thisTotal);

                setThisMonthSpent(thisTotal);

                setLastMonthSpent(previousTotal);


                /* =================================================
                   RECENT TRANSACTIONS
                   CURRENT MONTH ONLY
                ================================================= */

                const sortedTransactions =
                    [...currentMonthExpenses]
                        .sort(
                            (a, b) =>
                                new Date(b.date) -
                                new Date(a.date)
                        )
                        .slice(0, 5);

                setRecentTransactions(
                    sortedTransactions
                );


                /* =================================================
                   CATEGORY ANALYTICS
                   CURRENT MONTH ONLY
                ================================================= */

                const categoryTotals =
                    currentMonthExpenses.reduce(
                        (acc, expense) => {

                            const category =
                                expense.category ||
                                "Other";

                            acc[category] =
                                (acc[category] || 0) +
                                Number(expense.amount || 0);

                            return acc;

                        },
                        {}
                    );


                const chartArray =
                    Object.entries(categoryTotals)
                        .map(
                            ([name, value]) => ({
                                name,
                                value,
                            })
                        )
                        .sort(
                            (a, b) =>
                                b.value - a.value
                        );


                setChartData(chartArray);


                /* =================================================
                   DAILY SPENDING — CURRENT MONTH
                   ================================================= */

                const dailyTotals = {};

                currentMonthExpenses.forEach(
                    (expense) => {

                        if (!expense.date) {
                            return;
                        }

                        const date =
                            new Date(expense.date);

                        const day =
                            date.getDate();

                        dailyTotals[day] =
                            (dailyTotals[day] || 0) +
                            Number(expense.amount || 0);
                    }
                );


                const daysInMonth =
                    new Date(
                        currentYear,
                        currentMonth + 1,
                        0
                    ).getDate();


                const dailyTrend =
                    Array.from(
                        { length: daysInMonth },
                        (_, index) => {

                            const day =
                                index + 1;

                            return {
                                day: `Day ${day}`,
                                amount:
                                    dailyTotals[day] || 0,
                            };
                        }
                    );


                setMonthlyTrendData(
                    dailyTrend
                );


                /* =================================================
                   SIX MONTH TREND
                   ================================================= */

                const sixMonthTrend = [];

                for (
                    let i = 5;
                    i >= 0;
                    i--
                ) {

                    const date =
                        new Date(
                            currentYear,
                            currentMonth - i,
                            1
                        );

                    const month =
                        date.getMonth();

                    const year =
                        date.getFullYear();


                    const total =
                        savedExpenses
                            .filter((expense) => {

                                if (!expense.date) {
                                    return false;
                                }

                                const expenseDate =
                                    new Date(
                                        expense.date
                                    );

                                return (
                                    expenseDate.getMonth() === month &&
                                    expenseDate.getFullYear() === year
                                );
                            })
                            .reduce(
                                (sum, expense) =>
                                    sum +
                                    Number(
                                        expense.amount || 0
                                    ),
                                0
                            );


                    sixMonthTrend.push({
                        month:
                            date.toLocaleString(
                                "default",
                                {
                                    month: "short",
                                }
                            ),
                        amount: total,
                    });
                }


                setTrendData(
                    sixMonthTrend
                );


                /* =================================================
                   SIP
                ================================================= */

                let sipAmount = 0;
                let hasSip = false;

                try {

                    const sipRes =
                        await axios.get(
                            `${import.meta.env.VITE_API_URL}/api/sip/${currentUser._id}`
                        );

                    if (sipRes.data) {

                        sipAmount =
                            Number(
                                sipRes.data.totalValue || 0
                            );

                        hasSip = true;
                    }

                } catch (error) {

                    console.error(
                        "Failed to fetch SIP:",
                        error
                    );
                }

                setSipValue(
                    sipAmount
                );


                /* =================================================
                   EMI
                ================================================= */

                let emiAmount = 0;

                try {

                    const emiRes =
                        await axios.get(
                            `${import.meta.env.VITE_API_URL}/api/emi/${currentUser._id}`
                        );

                    if (emiRes.data) {

                        emiAmount =
                            Number(
                                emiRes.data.emi || 0
                            );
                    }

                } catch (error) {

                    console.error(
                        "Failed to fetch EMI:",
                        error
                    );
                }

                setMonthlyEmi(
                    emiAmount
                );


                /* =================================================
                   SAVINGS GOAL
                ================================================= */

                let savedGoal = null;

                try {

                    const goalRes =
                        await axios.get(
                            `${import.meta.env.VITE_API_URL}/api/goals/${currentUser._id}`
                        );

                    savedGoal =
                        goalRes.data;

                    setGoalData(
                        savedGoal
                    );

                } catch (error) {

                    console.error(
                        "Failed to fetch goal:",
                        error
                    );

                    setGoalData(null);
                }


                /* =================================================
                   SAVINGS SCORE
                ================================================= */

                if (
                    thisTotal < 5000 &&
                    emiAmount < 20000
                ) {

                    setSavingsScore(
                        "Good"
                    );

                } else if (
                    thisTotal < 15000 &&
                    emiAmount < 50000
                ) {

                    setSavingsScore(
                        "Average"
                    );

                } else {

                    setSavingsScore(
                        "Poor"
                    );
                }


                /* =================================================
                   FINANCIAL HEALTH SCORE
                ================================================= */

                let score = 100;


                if (thisTotal > 15000) {

                    score -= 30;

                } else if (thisTotal > 5000) {

                    score -= 15;
                }


                if (emiAmount > 20000) {

                    score -= 20;

                } else if (emiAmount > 10000) {

                    score -= 10;
                }


                if (!hasSip) {

                    score -= 10;
                }


                if (!savedGoal) {

                    score -= 10;
                }


                if (savedGoal) {

                    const progress =
                        Number(
                            savedGoal.progress || 0
                        );

                    if (progress >= 80) {

                        score += 5;

                    } else if (progress < 20) {

                        score -= 5;
                    }
                }


                score =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            score
                        )
                    );


                setHealthScore(
                    score
                );

            } catch (error) {

                console.error(
                    "Dashboard Error:",
                    error
                );
            }
        };


        fetchDashboard();

    }, []);


    /*
    ============================================================
    COLORS
    ============================================================
    */

    const COLORS = [
        "#1F6D4C",
        "#A9862E",
        "#3B5A73",
        "#B3541E",
        "#6B4E71",
    ];


    /*
    ============================================================
    MONTHLY BUDGET
    ============================================================
    */

    const monthlyBudget =
        goalData?.monthlyBudget
            ? Number(goalData.monthlyBudget)
            : user?.monthlyIncome
                ? Number(user.monthlyIncome)
                : 60000;


    /*
    ============================================================
    SAVINGS
    ============================================================
    */

    const savingsAmount =
        Math.max(
            0,
            Number(monthlyBudget || 0) -
            Number(totalExpenses || 0) -
            Number(monthlyEmi || 0) -
            Number(sipValue || 0)
        );


    /*
    ============================================================
    BUDGET USAGE (spent vs monthlyBudget, for the progress bar)
    ============================================================
    */

    const budgetUsedPercent =
        monthlyBudget > 0
            ? Math.min(
                100,
                Math.round(
                    (Number(totalExpenses || 0) / monthlyBudget) * 100
                )
            )
            : 0;

    const budgetRemaining =
        Math.max(0, monthlyBudget - Number(totalExpenses || 0));

    let budgetBarColor = "#1F6D4C";

    if (budgetUsedPercent >= 90) {
        budgetBarColor = "#B3541E";
    } else if (budgetUsedPercent >= 70) {
        budgetBarColor = "#A9862E";
    }


    /*
    ============================================================
    MONTH COMPARISON
    ============================================================
    */

    const comparisonData = [
        {
            name: "Last Month",
            amount:
                Number(lastMonthSpent) || 0,
        },
        {
            name: "This Month",
            amount:
                Number(thisMonthSpent) || 0,
        },
    ];


    const monthChange =
        lastMonthSpent
            ? (
                (
                    (thisMonthSpent -
                        lastMonthSpent) /
                    lastMonthSpent
                ) * 100
            ).toFixed(1)
            : null;


    /*
    ============================================================
    HEALTH STATUS
    ============================================================
    */

    let healthStatus = "";
    let healthColor = "";
    let healthMessage = "";


    if (healthScore >= 80) {

        healthStatus = "Excellent";

        healthColor = "#1F6D4C";

        healthMessage =
            "Your finances are well balanced. Keep maintaining this consistency.";

    } else if (healthScore >= 60) {

        healthStatus = "Good";

        healthColor = "#3B5A73";

        healthMessage =
            "You're doing well. A little more saving can improve your score.";

    } else if (healthScore >= 40) {

        healthStatus = "Average";

        healthColor = "#A9862E";

        healthMessage =
            "Try reducing unnecessary expenses and increase your savings.";

    } else {

        healthStatus =
            "Needs Improvement";

        healthColor =
            "#B3541E";

        healthMessage =
            "Focus on controlling expenses and improving your financial habits.";
    }


    /*
    ============================================================
    SUBTITLE
    ============================================================
    */

    let subtitle =
        "Keep tracking your finances.";

    if (healthScore >= 80) {

        subtitle =
            "Excellent! Your finances look healthy this month.";

    } else if (healthScore >= 60) {

        subtitle =
            "Your finances are stable. Keep it up.";

    } else {

        subtitle =
            "Try reducing expenses to improve your financial health.";
    }


    /*
    ============================================================
    SCORE BREAKDOWN
    ============================================================
    */

    const scoreBreakdown = [

        {
            label: "Expense Control",

            score:
                totalExpenses > 15000
                    ? 10
                    : totalExpenses > 5000
                        ? 15
                        : 20,

            max: 20,
        },

        {
            label: "EMI Management",

            score:
                monthlyEmi > 20000
                    ? 10
                    : monthlyEmi > 10000
                        ? 15
                        : 20,

            max: 20,
        },

        {
            label: "Investment",

            score:
                sipValue > 0
                    ? 20
                    : 10,

            max: 20,
        },

        {
            label: "Goal Progress",

            score:
                goalData
                    ? Math.min(
                        Math.round(
                            (
                                Number(
                                    goalData.progress || 0
                                ) / 100
                            ) * 20
                        ),
                        20
                    )
                    : 0,

            max: 20,
        },

        {
            label: "Savings",

            score:
                savingsAmount > 10000
                    ? 20
                    : savingsAmount > 5000
                        ? 15
                        : 10,

            max: 20,
        },
    ];


    /*
    ============================================================
    RENDER
    ============================================================
    */

    return (

        <div className="dashboard">


            {/* =================================================
                MASTHEAD
            ================================================= */}

            <div className="statement-header animate">

                <div className="statement-id">

                    <span className="wordmark">
                        FinWise
                    </span>

                    <span className="eyebrow">
                        Personal Ledger
                    </span>

                </div>


                <div className="statement-meta">

                    <span className="date-label">
                        Statement Date
                    </span>

                    <span className="date-mono">
                        {statementDate}
                    </span>

                </div>

            </div>



            {/* =================================================
                HERO
            ================================================= */}

            <div className="hero-statement animate hero-delay">


                <div className="hero-greeting">

                    <h1>
                        {greeting},{" "}
                        {user?.name}
                    </h1>

                    <p>
                        {subtitle}
                    </p>


                    {/* BUDGET PROGRESS */}

                    <div className="hero-budget-progress">

                        <div className="hero-budget-progress-row">

                            <span>
                                ₹{Number(totalExpenses).toLocaleString("en-IN")} of ₹{Number(monthlyBudget).toLocaleString("en-IN")} spent
                            </span>

                            <span className="hero-budget-progress-remaining">
                                ₹{budgetRemaining.toLocaleString("en-IN")} left
                            </span>

                        </div>

                        <div className="hero-budget-progress-track">

                            <div
                                className="hero-budget-progress-fill"
                                style={{
                                    width: `${budgetUsedPercent}%`,
                                    background: budgetBarColor,
                                }}
                            />

                        </div>

                    </div>

                </div>



                {/* FINANCIAL NUDGE */}

                <FinancialNudge
                    totalExpenses={totalExpenses}
                    monthlyEmi={monthlyEmi}
                    sipValue={sipValue}
                    savingsAmount={savingsAmount}
                    goalData={goalData}
                    thisMonthSpent={thisMonthSpent}
                    lastMonthSpent={lastMonthSpent}
                    chartData={chartData}
                />



                {/* FINANCIAL HEALTH */}

                <div
                    className="hero-health"
                    onClick={() =>
                        setShowScoreDetails(true)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {

                        if (
                            e.key === "Enter" ||
                            e.key === " "
                        ) {
                            setShowScoreDetails(
                                true
                            );
                        }

                    }}
                >

                    <span className="panel-label">
                        Financial Health
                    </span>


                    <div className="health-readout">

                        <span className="health-score mono-figure">
                            {healthScore}
                        </span>

                        <span className="health-max">
                            /100
                        </span>

                    </div>


                    <h4
                        style={{
                            color: healthColor,
                        }}
                    >
                        {healthStatus}
                    </h4>


                    <small>
                        {healthMessage}
                    </small>


                    <span className="score-details-hint">
                        Click to view score details →
                    </span>

                </div>

            </div>



            {/* =================================================
                STAT STRIP
            ================================================= */}

            <div className="ledger-strip animate stats-delay">


                <div className="ledger-item">

                    <span className="ledger-label">

                        <span
                            className="tick"
                            style={{
                                background:
                                    "#1F6D4C",
                            }}
                        />

                        This Month's Expenses

                    </span>


                    <span className="ledger-value mono-figure">

                        ₹
                        <CountUp
                            end={
                                Number(
                                    totalExpenses
                                ) || 0
                            }
                            duration={2}
                            separator=","
                        />

                    </span>

                </div>



                <div className="ledger-item">

                    <span className="ledger-label">

                        <span
                            className="tick"
                            style={{
                                background:
                                    "#3B5A73",
                            }}
                        />

                        SIP Value

                    </span>


                    <span className="ledger-value mono-figure">

                        ₹
                        <CountUp
                            end={
                                Number(
                                    sipValue
                                ) || 0
                            }
                            duration={2}
                            separator=","
                        />

                    </span>

                </div>



                <div className="ledger-item">

                    <span className="ledger-label">

                        <span
                            className="tick"
                            style={{
                                background:
                                    "#B3541E",
                            }}
                        />

                        Monthly EMI

                    </span>


                    <span className="ledger-value mono-figure">

                        ₹
                        <CountUp
                            end={
                                Number(
                                    monthlyEmi
                                ) || 0
                            }
                            duration={2}
                            separator=","
                        />

                    </span>

                </div>



                <div className="ledger-item">

                    <span className="ledger-label">

                        <span
                            className="tick"
                            style={{
                                background:
                                    "#A9862E",
                            }}
                        />

                        Savings Goal

                    </span>


                    <span className="ledger-value mono-figure">

                        <CountUp
                            end={
                                Number(
                                    goalData?.progress
                                ) || 0
                            }
                            duration={2}
                            decimals={1}
                        />

                        %

                    </span>

                </div>

            </div>



            {/* =================================================
                ANALYTICS
            ================================================= */}

            <div className="analytics-grid animate analytics-delay">


                {/* =================================================
                    CURRENT MONTH EXPENSE ANALYTICS
                ================================================= */}

                <div className="statement-panel">

                    <div className="panel-heading-row">

                        <div>

                            <h2>
                                Expense Analytics
                            </h2>

                            <p className="comparison-subtitle">
                                Spending breakdown for this month
                            </p>

                        </div>

                        <span className="period-label">
                            {new Date().toLocaleString(
                                "default",
                                {
                                    month: "long",
                                }
                            )}
                        </span>

                    </div>


                    {chartData.length > 0 ? (

                        <div className="chart-wrapper">


                            <div className="donut-wrapper">

                                <PieChart
                                    width={380}
                                    height={380}
                                >

                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={92}
                                        outerRadius={150}
                                        paddingAngle={1}
                                        dataKey="value"
                                    >

                                        {chartData.map(
                                            (
                                                entry,
                                                index
                                            ) => (

                                                <Cell
                                                    key={
                                                        `cell-${index}`
                                                    }
                                                    fill={
                                                        COLORS[
                                                            index %
                                                            COLORS.length
                                                        ]
                                                    }
                                                    stroke="var(--surface)"
                                                    strokeWidth={2}
                                                />

                                            )
                                        )}

                                    </Pie>


                                    <Tooltip
                                        formatter={(
                                            value
                                        ) =>
                                            `₹${Number(
                                                value
                                            ).toLocaleString(
                                                "en-IN"
                                            )}`
                                        }
                                    />

                                </PieChart>


                                <div className="center-text">

                                    <h3>

                                        ₹
                                        <CountUp
                                            end={
                                                Number(
                                                    totalExpenses
                                                ) || 0
                                            }
                                            duration={2}
                                            separator=","
                                        />

                                    </h3>

                                    <p>
                                        This Month
                                    </p>

                                </div>

                            </div>



                            <div className="custom-legend">

                                {chartData.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <div
                                            className="legend-item"
                                            key={
                                                item.name
                                            }
                                        >

                                            <div
                                                className="legend-color"
                                                style={{
                                                    backgroundColor:
                                                        COLORS[
                                                            index %
                                                            COLORS.length
                                                        ],
                                                }}
                                            />

                                            <span>
                                                {item.name}
                                            </span>

                                            <strong>
                                                ₹
                                                <CountUp
                                                    end={
                                                        Number(
                                                            item.value
                                                        ) || 0
                                                    }
                                                    duration={2}
                                                    separator=","
                                                />
                                            </strong>

                                        </div>

                                    )
                                )}


                                {/* SUMMARY — fills the leftover space below the legend */}

                                <div className="legend-summary">

                                    <div className="legend-summary-row">

                                        <span>
                                            Top Category
                                        </span>

                                        <strong>
                                            {chartData[0].name}
                                        </strong>

                                    </div>


                                    <div className="legend-summary-row">

                                        <span>
                                            Daily Average
                                        </span>

                                        <strong>
                                            ₹
                                            {Math.round(
                                                totalExpenses /
                                                new Date().getDate()
                                            ).toLocaleString("en-IN")}
                                        </strong>

                                    </div>


                                    <div className="legend-summary-row">

                                        <span>
                                            Categories
                                        </span>

                                        <strong>
                                            {chartData.length}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>

                    ) : (

                        <div className="empty-state">

                            <p>
                                No expenses recorded this month.
                            </p>

                        </div>

                    )}

                </div>



                {/* =================================================
                    RECENT TRANSACTIONS
                ================================================= */}

                <div className="side-panel">

                    <div className="statement-panel">

                        <div className="panel-heading-row">

                            <div>

                                <h3>
                                    Recent Transactions
                                </h3>

                                <p className="comparison-subtitle">
                                    Latest activity this month
                                </p>

                            </div>

                        </div>


                        <div className="ledger-list">

                            {recentTransactions.length > 0 ? (

                                recentTransactions.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <div
                                            className="ledger-row"
                                            key={
                                                item._id ||
                                                index
                                            }
                                        >

                                            <div>

                                                <span>
                                                    {item.category ||
                                                        "Other"}
                                                </span>

                                                {item.date && (

                                                    <small>
                                                        {new Date(
                                                            item.date
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                            }
                                                        )}
                                                    </small>

                                                )}

                                            </div>


                                            <strong>

                                                ₹
                                                <CountUp
                                                    end={
                                                        Number(
                                                            item.amount
                                                        ) || 0
                                                    }
                                                    duration={2}
                                                    separator=","
                                                />

                                            </strong>

                                        </div>

                                    )
                                )

                            ) : (

                                <div className="empty-state">

                                    <p>
                                        No transactions this month.
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>



            {/* =================================================
                CURRENT MONTH DAILY SPENDING
            ================================================= */}

            <div className="comparison-panel animate comparison-delay">


                <div className="comparison-head">

                    <div>

                        <h2>
                            This Month's Spending
                        </h2>

                        <p className="comparison-subtitle">
                            Daily spending activity
                        </p>

                    </div>


                    {monthChange !== null && (

                        <div
                            title={`Change from last month: ${monthChange}%`}
                            className={`change-badge ${
                                Number(monthChange) >= 0
                                    ? "up"
                                    : "down"
                            }`}
                        >

                            {Number(monthChange) >= 0
                                ? "▲"
                                : "▼"}

                            {" "}

                            {Math.abs(
                                monthChange
                            )}
                            %

                            <span>
                                {" "}vs last month
                            </span>

                        </div>

                    )}

                </div>



                <div
                    className="comparison-wrapper"
                    style={{
                        width: "100%",
                        height: 340,
                    }}
                >

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <LineChart
                            data={
                                monthlyTrendData
                            }
                            margin={{
                                top: 20,
                                right: 20,
                                left: 10,
                                bottom: 10,
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--line)"
                                vertical={false}
                            />


                            <XAxis
                                dataKey="day"
                                interval={
                                    monthlyTrendData.length >
                                    20
                                        ? 2
                                        : 0
                                }
                                tick={{
                                    fontSize: 11,
                                    fill:
                                        "var(--ink-500)",
                                    fontFamily:
                                        "var(--font-mono)",
                                }}
                                axisLine={{
                                    stroke:
                                        "var(--line-strong)",
                                }}
                                tickLine={false}
                            />


                            <YAxis
                                tickFormatter={(
                                    value
                                ) =>
                                    `₹${Number(
                                        value
                                    ).toLocaleString(
                                        "en-IN"
                                    )}`
                                }
                                tick={{
                                    fill:
                                        "var(--ink-400)",
                                    fontSize: 11,
                                    fontFamily:
                                        "var(--font-mono)",
                                }}
                                axisLine={false}
                                tickLine={false}
                            />


                            <Tooltip
                                formatter={(
                                    value
                                ) =>
                                    `₹${Number(
                                        value
                                    ).toLocaleString(
                                        "en-IN"
                                    )}`
                                }
                                labelFormatter={(
                                    label
                                ) =>
                                    ` ${label}`
                                }
                                contentStyle={{
                                    borderRadius:
                                        "6px",
                                    border:
                                        "1px solid var(--line)",
                                    boxShadow:
                                        "none",
                                    background:
                                        "var(--surface)",
                                    color:
                                        "var(--ink-900)",
                                    fontFamily:
                                        "var(--font-mono)",
                                    fontSize: 12,
                                }}
                            />


                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#1F6D4C"
                                strokeWidth={3}
                                dot={{
                                    r: 3,
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                                animationDuration={
                                    900
                                }
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>



            {/* =================================================
                LAST MONTH VS THIS MONTH
            ================================================= */}

            <div className="comparison-panel animate comparison-delay">


                <div className="comparison-head">

                    <div>

                        <h2>
                            Monthly Comparison
                        </h2>

                        <p className="comparison-subtitle">
                            This month vs last month
                        </p>

                    </div>

                </div>


                <div
                    className="comparison-wrapper"
                    style={{
                        width: "100%",
                        height: 320,
                    }}
                >

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <BarChart
                            data={
                                comparisonData
                            }
                            barCategoryGap={100}
                        >

                            <defs>

                                <linearGradient
                                    id="gradLast"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >

                                    <stop
                                        offset="0%"
                                        stopColor="#5B6B7A"
                                        stopOpacity={1}
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#3B4754"
                                        stopOpacity={1}
                                    />

                                </linearGradient>


                                <linearGradient
                                    id="gradThis"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >

                                    <stop
                                        offset="0%"
                                        stopColor="#2E8B63"
                                        stopOpacity={1}
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#14503A"
                                        stopOpacity={1}
                                    />

                                </linearGradient>

                            </defs>


                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--line)"
                                vertical={false}
                            />


                            <XAxis
                                dataKey="name"
                                tick={{
                                    fontSize: 13,
                                    fill:
                                        "var(--ink-600)",
                                    fontFamily:
                                        "var(--font-mono)",
                                }}
                                axisLine={{
                                    stroke:
                                        "var(--line-strong)",
                                }}
                                tickLine={false}
                            />


                            <YAxis
                                tickFormatter={(
                                    value
                                ) =>
                                    `₹${Number(
                                        value
                                    ).toLocaleString(
                                        "en-IN"
                                    )}`
                                }
                                tick={{
                                    fill:
                                        "var(--ink-400)",
                                    fontSize: 11,
                                    fontFamily:
                                        "var(--font-mono)",
                                }}
                                axisLine={false}
                                tickLine={false}
                            />


                            <Tooltip
                                formatter={(
                                    value
                                ) =>
                                    `₹${Number(
                                        value
                                    ).toLocaleString(
                                        "en-IN"
                                    )}`
                                }
                                contentStyle={{
                                    borderRadius:
                                        "6px",
                                    border:
                                        "1px solid var(--line)",
                                    boxShadow:
                                        "none",
                                    background:
                                        "var(--surface)",
                                    color:
                                        "var(--ink-900)",
                                    fontFamily:
                                        "var(--font-mono)",
                                    fontSize: 12,
                                }}
                            />


                            <Bar
                                dataKey="amount"
                                radius={[
                                    4,
                                    4,
                                    0,
                                    0,
                                ]}
                                barSize={120}
                                animationDuration={
                                    900
                                }
                            >

                                {comparisonData.map(
                                    (
                                        entry,
                                        index
                                    ) => (

                                        <Cell
                                            key={
                                                `comparison-${index}`
                                            }
                                            fill={
                                                entry.name ===
                                                "This Month"
                                                    ? "url(#gradThis)"
                                                    : "url(#gradLast)"
                                            }
                                        />

                                    )
                                )}


                                <LabelList
                                    dataKey="amount"
                                    position="top"
                                    formatter={(
                                        value
                                    ) =>
                                        `₹${Number(
                                            value
                                        ).toLocaleString(
                                            "en-IN"
                                        )}`
                                    }
                                    style={{
                                        fill:
                                            "var(--ink-900)",
                                        fontFamily:
                                            "var(--font-mono)",
                                        fontWeight: 600,
                                        fontSize: 12,
                                    }}
                                />

                            </Bar>

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>



            {/* =================================================
                FINANCIAL SCORE MODAL
            ================================================= */}

            {showScoreDetails &&
                createPortal(

                    <div
                        className="score-modal-overlay"
                        onClick={() =>
                            setShowScoreDetails(
                                false
                            )
                        }
                    >

                        <div
                            className="score-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <button
                                className="score-modal-close"
                                onClick={() =>
                                    setShowScoreDetails(
                                        false
                                    )
                                }
                                aria-label="Close financial score"
                            >
                                ×
                            </button>


                            <span className="panel-label">
                                Financial Score
                            </span>


                            <div className="score-modal-header">

                                <div>

                                    <span className="score-number">
                                        {healthScore}
                                    </span>

                                    <span className="score-total">
                                        /100
                                    </span>

                                </div>


                                <div>

                                    <h3
                                        style={{
                                            color:
                                                healthColor,
                                        }}
                                    >
                                        {healthStatus}
                                    </h3>

                                    <p>
                                        {healthMessage}
                                    </p>

                                </div>

                            </div>



                            <div className="score-breakdown">

                                {scoreBreakdown.map(
                                    (item) => (

                                        <div
                                            className="score-breakdown-item"
                                            key={
                                                item.label
                                            }
                                        >

                                            <div className="score-row">

                                                <span>
                                                    {item.label}
                                                </span>

                                                <strong>
                                                    {
                                                        item.score
                                                    }
                                                    /
                                                    {
                                                        item.max
                                                    }
                                                </strong>

                                            </div>


                                            <div className="score-progress">

                                                <div
                                                    className="score-progress-fill"
                                                    style={{
                                                        width: `${
                                                            (
                                                                item.score /
                                                                item.max
                                                            ) *
                                                            100
                                                        }%`,
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    </div>,

                    document.body
                )}

        </div>
    );
}


export default Dashboard;