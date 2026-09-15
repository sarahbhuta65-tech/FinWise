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
import jsPDF from "jspdf";
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
    const [showPremiumReport, setShowPremiumReport] = useState(false);
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
                            `${import.meta.env.VITE_API_URL}/api/sip/${currentUser._id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                            }
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
                            `${import.meta.env.VITE_API_URL}/api/emi/${currentUser._id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                            }
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
                : 0;


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
    PREMIUM REPORT — DERIVED METRICS
    (everything below is computed purely from state we already
    fetch above — no extra API calls needed)
    ============================================================
    */

    const savingsRate =
        monthlyBudget > 0
            ? Math.round((savingsAmount / monthlyBudget) * 100)
            : 0;

    const emiRatio =
        monthlyBudget > 0
            ? Math.round((monthlyEmi / monthlyBudget) * 100)
            : 0;

    const topCategory =
        chartData.length > 0 ? chartData[0] : null;

    const topCategoryPercent =
        topCategory && totalExpenses > 0
            ? Math.round((topCategory.value / totalExpenses) * 100)
            : 0;

    // suggested trim: 10% off the top spending category
    const potentialMonthlySaving =
        topCategory ? Math.round(topCategory.value * 0.1) : 0;

    const potentialAnnualSaving =
        potentialMonthlySaving * 12;

    const avgSixMonthSpend =
        trendData.length > 0
            ? Math.round(
                trendData.reduce((sum, d) => sum + d.amount, 0) /
                trendData.length
            )
            : 0;

    const projectedAnnualSavings =
        Math.round(savingsAmount * 12);

    const recommendedSavingsRate = 20;

    const riskFlags = useMemo(() => {

        const flags = [];

        if (monthChange !== null && Number(monthChange) > 15) {
            flags.push(
                `Spending is up ${monthChange}% vs last month — worth a closer look.`
            );
        }

        if (savingsRate < 15) {
            flags.push(
                `Your savings rate is ${savingsRate}%, below the ${recommendedSavingsRate}% target.`
            );
        }

        if (emiRatio > 40) {
            flags.push(
                `EMI is taking up ${emiRatio}% of your budget — that's a heavy debt load.`
            );
        }

        if (topCategory && topCategoryPercent > 50) {
            flags.push(
                `${topCategory.name} alone accounts for ${topCategoryPercent}% of this month's spending.`
            );
        }

        if (sipValue === 0) {
            flags.push(
                "No active SIP detected — you're not currently investing."
            );
        }

        if (goalData && Number(goalData.progress || 0) < 20) {
            flags.push(
                "Your savings goal progress is falling behind schedule."
            );
        }

        return flags;

    }, [monthChange, savingsRate, emiRatio, topCategory, topCategoryPercent, sipValue, goalData]);

    const actionPlan = useMemo(() => {

        const actions = [];

        if (topCategory && potentialMonthlySaving > 0) {
            actions.push(
                `Trim ${topCategory.name} spending by ₹${potentialMonthlySaving.toLocaleString("en-IN")}/month — that adds up to ₹${potentialAnnualSaving.toLocaleString("en-IN")}/year.`
            );
        }

        if (savingsRate < recommendedSavingsRate) {
            const targetSavings = Math.round(monthlyBudget * (recommendedSavingsRate / 100));
            actions.push(
                `Raise monthly savings from ₹${Math.round(savingsAmount).toLocaleString("en-IN")} to ₹${targetSavings.toLocaleString("en-IN")} to hit a ${recommendedSavingsRate}% savings rate.`
            );
        }

        if (sipValue === 0) {
            actions.push(
                "Start a SIP, even a small one — consistent investing compounds far better than idle savings."
            );
        } else {
            actions.push(
                "Consider increasing your SIP contribution by ₹1,000/month to accelerate long-term growth."
            );
        }

        return actions.slice(0, 3);

    }, [topCategory, potentialMonthlySaving, potentialAnnualSaving, savingsRate, monthlyBudget, savingsAmount, sipValue]);


    /*
    ============================================================
    PDF EXPORT — Premium Financial Report
    ============================================================
    */

    const handleDownloadPDF = () => {

        const doc = new jsPDF({ unit: "pt", format: "a4" });

        const pageWidth = doc.internal.pageSize.getWidth();
        const marginX = 48;
        let y = 56;

        const rupee = (value) =>
            `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

        const addHeading = (text, size = 14) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(size);
            doc.setTextColor(20, 60, 45);
            doc.text(text, marginX, y);
            y += size * 0.9;
        };

        const addLine = (text, size = 10.5) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(size);
            doc.setTextColor(40, 40, 40);
            const wrapped = doc.splitTextToSize(text, pageWidth - marginX * 2);
            doc.text(wrapped, marginX, y);
            y += wrapped.length * (size * 1.15) + 4;
        };

        const addSpacer = (amount = 10) => {
            y += amount;
        };

        const ensureRoom = (needed = 60) => {
            if (y + needed > doc.internal.pageSize.getHeight() - 40) {
                doc.addPage();
                y = 56;
            }
        };

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(20, 60, 45);
        doc.text("FinWise — Premium Financial Report", marginX, y);
        y += 22;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(110, 110, 110);
        doc.text(`Generated for ${user?.name || "User"} on ${statementDate}`, marginX, y);
        y += 26;

        // Score
        addHeading(`Financial Health Score: ${healthScore}/100 — ${healthStatus}`);
        addLine(healthMessage);
        addSpacer();

        // Executive Summary
        ensureRoom();
        addHeading("Executive Summary");
        addLine(`Budget: ${rupee(monthlyBudget)}   |   Expenses: ${rupee(totalExpenses)}   |   Savings: ${rupee(savingsAmount)} (${savingsRate}% rate)`);
        addLine(`EMI load: ${emiRatio}% of budget   |   SIP value: ${rupee(sipValue)}`);
        addSpacer();

        // Spending
        ensureRoom();
        addHeading("Spending Analysis");
        addLine(`Total spend this month: ${rupee(totalExpenses)}`);
        if (topCategory) {
            addLine(`Top category: ${topCategory.name} (${topCategoryPercent}% of total spend)`);
        }
        addSpacer();

        // Savings & Investment
        ensureRoom();
        addHeading("Savings & Investment");
        addLine(`Available savings this month: ${rupee(savingsAmount)}`);
        addLine(sipValue > 0
            ? "You are actively investing through SIP."
            : "No active SIP — consider starting one to build long-term wealth.");
        addSpacer();

        // EMI
        ensureRoom();
        addHeading("EMI Analysis");
        addLine(`Monthly EMI: ${rupee(monthlyEmi)}`);
        addLine(monthlyEmi > 20000
            ? "EMI burden is relatively high — manage debt carefully."
            : "Current EMI level appears manageable.");
        addSpacer();

        // Goal
        ensureRoom();
        addHeading("Savings Goal");
        if (goalData) {
            addLine(`Goal: ${goalData.goalName} — ${Number(goalData.progress || 0).toFixed(1)}% complete`);
        } else {
            addLine("No savings goal has been created yet.");
        }
        addSpacer();

        // Trend & Forecast
        ensureRoom();
        addHeading("Trend & 12-Month Forecast");
        addLine(`This month: ${rupee(thisMonthSpent)}   |   Last month: ${rupee(lastMonthSpent)}`);
        addLine(`6-month average spend: ${rupee(avgSixMonthSpend)}/month`);
        addLine(`Projected savings over the next 12 months at current pace: ${rupee(projectedAnnualSavings)}`);
        addSpacer();

        // Risks
        ensureRoom();
        addHeading("Financial Risk Check");
        if (riskFlags.length > 0) {
            riskFlags.forEach((flag) => addLine(`- ${flag}`));
        } else {
            addLine("No major financial risks detected this month.");
        }
        addSpacer();

        // Action Plan
        ensureRoom();
        addHeading("Your Personalized Action Plan");
        actionPlan.forEach((action, i) => addLine(`${i + 1}. ${action}`));

        doc.save(`FinWise-Premium-Report-${statementDate.replace(/\s/g, "-")}.pdf`);
    };


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

                            <div className="premium-report-action">

                                {user?.subscription?.plan === "premium" ? (
                                    <button
                                        className="premium-report-btn"
                                        onClick={() => {
                                            setShowScoreDetails(false);
                                            setShowPremiumReport(true);
                                        }}
                                    >
                                        View Detailed Financial Report →
                                    </button>
                                ) : (
                                    <button
                                        className="premium-report-btn"
                                        onClick={() => {
                                            alert(
                                                "Detailed Financial Report is available for Premium users."
                                            );
                                        }}
                                    >
                                        🔒 Unlock Detailed Financial Report
                                    </button>
                                )}

                            </div>



                        </div>

                    </div>,

                    document.body
                )}

                {/* =================================================
                    PREMIUM FINANCIAL REPORT MODAL
                ================================================= */}

                {showPremiumReport &&
                    createPortal(

                        <div
                            className="score-modal-overlay"
                            onClick={() => setShowPremiumReport(false)}
                        >

                            <div
                                className="score-modal premium-report-modal"
                                onClick={(e) => e.stopPropagation()}
                            >

                                <button
                                    className="score-modal-close"
                                    onClick={() => setShowPremiumReport(false)}
                                >
                                    ×
                                </button>

                                <span className="panel-label">
                                    PREMIUM FINANCIAL REPORT
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
                                        <h3 style={{ color: healthColor }}>
                                            {healthStatus}
                                        </h3>

                                        <p>
                                            A detailed overview of your current
                                            financial position.
                                        </p>
                                    </div>

                                </div>


                                <div className="premium-report-download-row">

                                    <button
                                        className="premium-report-btn"
                                        onClick={handleDownloadPDF}
                                    >
                                        📄 Download PDF Report
                                    </button>

                                </div>


                                <div className="premium-report-grid">

                                    {/* Executive Summary — new */}

                                    <div className="report-card">

                                        <span className="report-icon">
                                            🧾
                                        </span>

                                        <h4>
                                            Executive Summary
                                        </h4>

                                        <p>
                                            Budget: <strong>₹{Number(monthlyBudget).toLocaleString("en-IN")}</strong>
                                        </p>

                                        <p>
                                            Expenses: <strong>₹{Number(totalExpenses).toLocaleString("en-IN")}</strong>
                                        </p>

                                        <p>
                                            Savings: <strong>₹{Number(savingsAmount).toLocaleString("en-IN")}</strong>
                                            {" "}({savingsRate}% rate)
                                        </p>

                                        <p>
                                            EMI load: <strong>{emiRatio}%</strong> of budget
                                        </p>

                                    </div>


                                    {/* Spending */}

                                    <div className="report-card">

                                        <span className="report-icon">
                                            📊
                                        </span>

                                        <h4>
                                            Spending Analysis
                                        </h4>

                                        <p>
                                            You spent
                                            <strong>
                                                {" "}₹{Number(
                                                    totalExpenses
                                                ).toLocaleString("en-IN")}
                                            </strong>
                                            {" "}this month.
                                        </p>

                                        {chartData.length > 0 && (
                                            <p>
                                                Your highest spending category is
                                                <strong>
                                                    {" "}{chartData[0].name}
                                                </strong>
                                                {" "}({topCategoryPercent}% of total spend).
                                            </p>
                                        )}

                                    </div>


                                    {/* Savings */}

                                    <div className="report-card">

                                        <span className="report-icon">
                                            💰
                                        </span>

                                        <h4>
                                            Savings Analysis
                                        </h4>

                                        <p>
                                            Estimated available savings:
                                        </p>

                                        <strong>
                                            ₹{Number(
                                                savingsAmount
                                            ).toLocaleString("en-IN")}
                                        </strong>

                                        <p>
                                            Keep monitoring your monthly
                                            spending to increase your savings.
                                        </p>

                                    </div>


                                    {/* Investment */}

                                    <div className="report-card">

                                        <span className="report-icon">
                                            📈
                                        </span>

                                        <h4>
                                            Investment Analysis
                                        </h4>

                                        <p>
                                            Current SIP value:
                                        </p>

                                        <strong>
                                            ₹{Number(
                                                sipValue
                                            ).toLocaleString("en-IN")}
                                        </strong>

                                        <p>
                                            {sipValue > 0
                                                ? "You are actively investing through SIP."
                                                : "Consider starting a SIP to build long-term wealth."}
                                        </p>

                                    </div>


                                    {/* EMI */}

                                    <div className="report-card">

                                        <span className="report-icon">
                                            💳
                                        </span>

                                        <h4>
                                            EMI Analysis
                                        </h4>

                                        <p>
                                            Monthly EMI:
                                        </p>

                                        <strong>
                                            ₹{Number(
                                                monthlyEmi
                                            ).toLocaleString("en-IN")}
                                        </strong>

                                        <p>
                                            {monthlyEmi > 20000
                                                ? "Your EMI burden is relatively high. Consider managing debt carefully."
                                                : "Your current EMI level appears manageable."}
                                        </p>

                                    </div>


                                    {/* Goal */}

                                    <div className="report-card">

                                        <span className="report-icon">
                                            🎯
                                        </span>

                                        <h4>
                                            Savings Goal
                                        </h4>

                                        {goalData ? (
                                            <>
                                                <p>
                                                    Goal:
                                                    <strong>
                                                        {" "}{goalData.goalName}
                                                    </strong>
                                                </p>

                                                <strong>
                                                    {Number(
                                                        goalData.progress || 0
                                                    ).toFixed(1)}%
                                                </strong>

                                                <p>
                                                    completed
                                                </p>
                                            </>
                                        ) : (
                                            <p>
                                                No savings goal has been created yet.
                                            </p>
                                        )}

                                    </div>


                                    {/* Monthly Trend */}

                                    <div className="report-card">

                                        <span className="report-icon">
                                            📅
                                        </span>

                                        <h4>
                                            Monthly Trend
                                        </h4>

                                        <p>
                                            This month:
                                            <strong>
                                                {" "}₹{Number(
                                                    thisMonthSpent
                                                ).toLocaleString("en-IN")}
                                            </strong>
                                        </p>

                                        <p>
                                            Last month:
                                            <strong>
                                                {" "}₹{Number(
                                                    lastMonthSpent
                                                ).toLocaleString("en-IN")}
                                            </strong>
                                        </p>

                                    </div>


                                    {/* Forecast — new */}

                                    <div className="report-card">

                                        <span className="report-icon">
                                            🔮
                                        </span>

                                        <h4>
                                            12-Month Forecast
                                        </h4>

                                        <p>
                                            6-month average spend:
                                            <strong>
                                                {" "}₹{avgSixMonthSpend.toLocaleString("en-IN")}/mo
                                            </strong>
                                        </p>

                                        <p>
                                            At your current savings pace, you're on track for
                                            <strong>
                                                {" "}₹{projectedAnnualSavings.toLocaleString("en-IN")}
                                            </strong>
                                            {" "}saved over the next 12 months.
                                        </p>

                                    </div>

                                </div>


                                {/* Risk Detection — new */}

                                <div className="premium-recommendation">

                                    <span>
                                        {riskFlags.length > 0 ? "🚨" : "🟢"}
                                    </span>

                                    <div>

                                        <strong>
                                            Financial Risk Check
                                        </strong>

                                        {riskFlags.length > 0 ? (
                                            <ul>
                                                {riskFlags.map((flag, i) => (
                                                    <li key={i}>{flag}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>
                                                No major financial risks detected this month.
                                            </p>
                                        )}

                                    </div>

                                </div>


                                {/* Action Plan — new, replaces the old generic recommendation */}

                                <div className="premium-recommendation">

                                    <span>
                                        ⭐
                                    </span>

                                    <div>

                                        <strong>
                                            Your Personalized Action Plan
                                        </strong>

                                        <ol>
                                            {actionPlan.map((action, i) => (
                                                <li key={i}>{action}</li>
                                            ))}
                                        </ol>

                                    </div>

                                </div>

                            </div>

                        </div>,

                        document.body
                    )
                }

        </div>
    );
}


export default Dashboard;