import { useState, useEffect } from "react";
import {FaWallet} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, } from "recharts";
import axios from "axios";
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
    const user = JSON.parse(localStorage.getItem("user"));

        const currentHour = new Date().getHours();

        let greeting = "Good Evening";

        if (currentHour < 12) {
        greeting = "Good Morning";
        } else if (currentHour < 17) {
        greeting = "Good Afternoon";
        }
    
    let subtitle = "Keep tracking your finances.";

    if (healthScore >= 80) {
    subtitle = "Excellent! Your finances look healthy today. 🎉";
    } else if (healthScore >= 60) {
    subtitle = "Your finances are stable. Keep it up! 💪";
    } else {
    subtitle = "Try reducing expenses to improve your financial health. 💰";
    }

    useEffect(() => {

        const fetchDashboard = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user || !user._id) return;

            // Fetch Expenses
            const expenseRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/expenses/${user._id}`
            );

            const savedExpenses = expenseRes.data;

            setRecentTransactions(savedExpenses.slice(-4).reverse());

            const total = savedExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
            );

            setTotalExpenses(total);

        // Fetch SIP data from API
        try {
            const sipRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/sip/${user._id}`
            );
            if (sipRes.data) {
                setSipValue(Number(sipRes.data.totalValue || 0).toFixed(2));
            }
        } catch (error) {
            console.error("Failed to fetch SIP data:", error);
        }

        // Fetch EMI data from API
        try {
            const emiRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/expenses/${user._id}`
            );
            if (emiRes.data) {
                setMonthlyEmi(Number(emiRes.data.emi || 0).toFixed(2));
            }
        } catch (error) {
            console.error("Failed to fetch EMI data:", error);
        }

        const goalRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/goals/${user._id}`
        );

        const savedGoal = goalRes.data;

        setGoalData(savedGoal);

        // Fetch fresh EMI data for health score calculation
        let emiAmount = 0;
        try {
            const emiRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/emi/${user._id}`
            );
            if (emiRes.data) {
                emiAmount = emiRes.data.emi || 0;
            }
        } catch (error) {
            console.error("Failed to fetch EMI:", error);
        }

        if (total < 5000 && Number(emiAmount || 0) < 20000) {
           setSavingsScore("Good");
        } else if (
          total < 15000 &&
          Number(emiAmount || 0) < 50000
          ) {
          setSavingsScore("Average");
        } else {
          setSavingsScore("Poor");
        }

        let score = 100;

        if(total > 15000) score -= 30;
        else if (total > 5000) score -= 15;

        if(Number(emiAmount || 0) > 10000) score -= 20;

        let hasSip = false;
        try {
            const sipRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/sip/${user._id}`
            );
            if (sipRes.data) hasSip = true;
        } catch (error) {
            console.error("Failed to check SIP:", error);
        }

        if(!hasSip) score -=10;
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
        
        if (total > 15000) {
            setInsightmessage(
                "Your spending is high this month. Try reducing non-essential expenses."
            );
        } else if (total > 5000) {
            setInsightmessage(
                "Your spending is moderate. Small Savings can improve your goals."
            );
        } else {
            setInsightmessage(
                "Excellent control over spending. Keep maintaining this habit."
            );
        }

      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboard();
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
            <div className="hero-banner">
            <div className="hero-left">
                <h1>{greeting}, {user?.name} 👋</h1>
                <p>{subtitle}</p>
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