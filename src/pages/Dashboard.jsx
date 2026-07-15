import { useState, useEffect } from "react";
import {FaWallet} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./Dashboard.css";

function Dashboard(){
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [sipValue, setSipValue] = useState(0);
    const [monthlyEmi, setMonthlyEmi] = useState(0);
    const [savingsScore, setSavingsScore] = useState("Good");
    const [chartData, setChartData] = useState([]);
    const [goalData, setGoalData] = useState(null);
    const [healthScore, setHealthScore] = useState(100);
    const [insightMessage, setInsightmessage] = useState("");
    const [trendData, setTrendData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);

    useEffect(() => {
        const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];

        const total = savedExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );

        setTotalExpenses(total);

        const savedSip = JSON.parse(localStorage.getItem("sipData"));
        
        if (savedSip) {
            setSipValue(savedSip.result.totalValue);
        }

        const savedEmi = JSON.parse(localStorage.getItem("emiData"));

        if (savedEmi) {
            setMonthlyEmi(savedEmi.result.emi);
        }

        const savedGoal = localStorage.getItem("goalData");

        if (savedGoal) {
          setGoalData(JSON.parse(savedGoal));
        }

        if (total < 5000 && Number(savedEmi?.result?.emi || 0) < 20000) {
           setSavingsScore("Good");
        } else if (
          total < 15000 &&
          Number(savedEmi?.result?.emi || 0) < 50000
          ) {
          setSavingsScore("Average");
        } else {
          setSavingsScore("Poor");
        }

        let score = 100;

        if(total > 15000) score -= 30;
        else if (total > 5000) score -= 15;

        if(Number(savedEmi?.result?.emi || 0) > 10000) score -= 20;

        if(!savedSip) score -=10;
        if(!savedGoal) score -=10;

        if(score < 0) score = 0;

        setHealthScore(score);

        const categoryTotals = savedExpenses.reduce((acc, expense) => {
            if (acc[expense.category]) {
                acc[expense.category] += expense.amount;
            } else {
                acc[expense.category] = expense.amount;
            }
            return acc;
        }, {});

        const chartArray = Object.entries(categoryTotals).map(
            ([name, value]) => ({
                name,
                value,
            })
        );

        setChartData(chartArray);

        const monthlyTrends = savedExpenses.reduce((acc, expense) => {
            const month = expense.date
               ? new Date(expense.date).toLocaleString("default", { month: "short" })
               : "Unknown";
            if (acc[month]) {
                acc[month] += expense.amount;
            } else {
                acc[month] = expense.amount;
            }
            return acc;
        }, {});

        setTrendData(Object.entries(monthlyTrends).map(([month, amount]) => ({ month, amount})));
        setRecentTransactions(savedExpenses.slice(-4).reverse());

        if (total >15000) {
            setInsightmessage(
                "Your spending is high this month. Try reducing non-essential expenses."
            );
        } else if (total > 5000) {
            setInsightmessage(
                "Your spending is moderate. Small Savings can improve your goals."
            );
        } else {
            setInsightmessage(
                "Excellent control over spending.  Keep Maintaing this habbit."
            );
        }
    }, []);

    const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6" ];
     const comparisonData = [
        {
            name: "Expenses",
            amount: totalExpenses || 0,
        },
        {
            name: "Savings",
            amount: Math.max(0, 60000 - totalExpenses - monthlyEmi),
        },
        ];
    console.log(totalExpenses);
    console.log(monthlyEmi);
    console.log(comparisonData);

    return(
        <div className="dashboard">

            {/* HERO SECTION */}
            <div className="hero-banner">
            <div className="hero-left">
                <h1>Good Evening, Sarah 👋</h1>
                <p>Your finances look stable today.</p>
            </div>

            <div className="health-box">
                <span>{healthScore}/100</span>
                <p>Financial Health</p>
            </div>
            </div>

            {/* STATS CARDS */}
            <div className="stats-grid">
            <div className="stat-card">
                <h3>💸 Total Expenses</h3>
                <p>₹{totalExpenses}</p>
            </div>

            <div className="stat-card">
                <h3>📈 SIP Value</h3>
                <p>₹{sipValue}</p>
            </div>

            <div className="stat-card">
                <h3>🏦 Monthly EMI</h3>
                <p>₹{monthlyEmi}</p>
            </div>

            <div className="stat-card">
                <h3>🎯 Savings Goal</h3>
                <p>{goalData ? `${goalData.progress.toFixed(1)}%` : "0%"}</p>
            </div>
            </div>

            {/* ANALYTICS SECTION */}
            <div className="analytics-grid">

            {/* LEFT SIDE BIG CHART */}
            <div className="main-chart-card">
                <h2>Expense Analytics 📊</h2>

                {chartData.length > 0 ? (
                <div className="chart-wrapper">
                    <div className="donut-wrapper">
                    <PieChart width={420} height={420}>
                        <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={150}
                        dataKey="value"
                        >
                        {chartData.map((entry, index) => (
                            <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                        </Pie>

                        <Tooltip formatter={(value) => `₹${value}`} />
                    </PieChart>

                    <div className="center-text">
                        <h3>₹{totalExpenses}</h3>
                        <p>Total</p>
                    </div>
                    </div>

                    <div className="custom-legend">
                    {chartData.map((item, index) => (
                        <div className="legend-item" key={index}>
                        <div
                            className="legend-color"
                            style={{
                            backgroundColor: COLORS[index % COLORS.length],
                            }}
                        ></div>
                        <span>{item.name}</span>
                        <strong>₹{item.value}</strong>
                        </div>
                    ))}
                    </div>
                </div>
                ) : (
                <p>No expense data yet</p>
                )}
            </div>

            {/* RIGHT SIDE PANEL */}
            <div className="side-panel">

                <div className="dashboard-card transactions-card">
                <h3>Recent Transactions</h3>

                {recentTransactions.length > 0 ? (
                    recentTransactions.map((item, index) => (
                    <div className="transaction-item" key={index}>
                        <span>{item.category}</span>
                        <strong>₹{item.amount}</strong>
                    </div>
                    ))
                ) : (
                    <p>No transactions yet</p>
                )}
                </div>

                <div className="ai-card">
                <h3>🤖 AI Insight</h3>
                <p>{insightMessage}</p>
                </div>
            </div>
            </div>

            {/* BOTTOM CHART */}
            <div className="comparison-chart">
            <p className="comparison-subtitle">
                This month spending vs remaining savings
            </p>

            <BarChart width={900} height={350} data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" radius={[14, 14, 0, 0]} label={{ position: "top", fill: "#111827"}}>
                   <Cell fill="#ef4444" />
                   <Cell fill="#22c55e" />
                </Bar>
            </BarChart>
            </div>

        </div>
);
}

export default Dashboard;