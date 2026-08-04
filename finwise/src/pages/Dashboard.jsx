import { useState, useEffect } from "react";
import * as CountUpModule from "react-countup";
import {FaWallet} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, LineChart, Line, ResponsiveContainer } from "recharts";
import axios from "axios";
import toast from "react-hot-toast";
import "./Dashboard.css";
import AIInsights from "../components/AIInsights";


function Dashboard(){
    const CountUp = CountUpModule?.default?.default || CountUpModule?.default || CountUpModule;
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [sipValue, setSipValue] = useState(0);
    const [monthlyEmi, setMonthlyEmi] = useState(0);
    const [savingsScore, setSavingsScore] = useState("Good");
    const [chartData, setChartData] = useState([]);
    const [goalData, setGoalData] = useState(null);
    const [healthScore, setHealthScore] = useState(100);
    const [insightMessage, setInsightmessage] = useState("");
    const [trendData, setTrendData] = useState([]);
    const [thisMonthSpent, setThisMonthSpent] = useState(0);
    const [lastMonthSpent, setLastMonthSpent] = useState(0);
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
                setSipValue(Number(sipRes.data.totalValue || 0));
            }
        } catch (error) {
            console.error("Failed to fetch SIP data:", error);
        }

        // Fetch EMI data from API
        try {
            const emiRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/emi/${user._id}`
            );
            if (emiRes.data) {
                setMonthlyEmi(Number(emiRes.data.emi || 0));
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
        // Compute this month and last month totals (by month and year)
        let thisTotal = 0;
        let prevTotal = 0;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonth = prev.getMonth();
        const prevYear = prev.getFullYear();

        savedExpenses.forEach((expense) => {
            if (!expense.date) return;
            const d = new Date(expense.date);
            if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) thisTotal += expense.amount;
            else if (d.getMonth() === prevMonth && d.getFullYear() === prevYear) prevTotal += expense.amount;
        });

        setThisMonthSpent(thisTotal);
        setLastMonthSpent(prevTotal);
        
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
    // Determine a sensible monthly budget to compute "savings" (fallback to 60000 if none available)
    const monthlyBudget =
        (goalData && goalData.monthlyBudget)
            ? Number(goalData.monthlyBudget)
            : (user && user.monthlyIncome)
            ? Number(user.monthlyIncome)
            : 60000;

    const savingsAmount = Math.max(
        0,
        Number(monthlyBudget || 0) - Number(totalExpenses || 0) - Number(monthlyEmi || 0) - Number(sipValue || 0)
    );

    // Use a more meaningful comparison: This month vs Last month spending (raw amounts)
    const comparisonData = [
        { name: "Last Month", amount: Number(lastMonthSpent) || 0 },
        { name: "This Month", amount: Number(thisMonthSpent) || 0 },
    ];

    const monthChange = lastMonthSpent
        ? (((thisMonthSpent - lastMonthSpent) / (lastMonthSpent || 1)) * 100).toFixed(1)
        : null;

    // Prepare sparkline data for last 6 months using `trendData`
    const lastSixMonths = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return d.toLocaleString("default", { month: "short" });
    });

    const getAmountForMonth = (m) => {
        const found = trendData.find((t) => t.month === m);
        return found ? Number(found.amount) : 0;
    };

    const sparkData = lastSixMonths.map((m) => ({ month: m, amount: getAmountForMonth(m) }));
    console.log(totalExpenses);
    console.log(monthlyEmi);
    console.log(comparisonData);

    let healthStatus = "";
    let healthColor = "";
    let healthMessage = "";

    if (healthScore >= 80) {
    healthStatus = "Excellent";
    healthColor = "#22c55e";
    healthMessage =
        "Your finances are well balanced. Keep maintaining this consistency.";
    } else if (healthScore >= 60) {
    healthStatus = "Good";
    healthColor = "#3b82f6";
    healthMessage =
        "You're doing well. A little more saving can improve your score.";
    } else if (healthScore >= 40) {
    healthStatus = "Average";
    healthColor = "#f59e0b";
    healthMessage =
        "Try reducing unnecessary expenses and increase your savings.";
    } else {
    healthStatus = "Needs Improvement";
    healthColor = "#ef4444";
    healthMessage =
        "Focus on controlling expenses and improving your financial habits.";
    }

    return(
        <div className="dashboard">
            <div className="hero-banner animate hero-delay">
                <div className="hero-left">
                    <h1>{greeting}, {user?.name} 👋</h1>
                    <p>{subtitle}</p>
                </div>

                <div>
                    <AIInsights/>
                </div>

                <div className="health-box">
                    <span>{healthScore}/100</span>
                    <h4 style={{ color: healthColor }}>
                        {healthStatus}
                    </h4>
                    <p>Financial Health</p>
                    <small>{healthMessage}</small>
               </div>
            </div>

            {/* STATS CARDS */}
            <div className="stats-grid animate stats-delay">
            <div className="stat-card">
                <h3>💸 Total Expenses</h3>
                <p>₹<CountUp end={Number(totalExpenses) || 0} duration={2} separator="," /></p>
            </div>

            <div className="stat-card">
                <h3>📈 SIP Value</h3>
                <p>₹<CountUp end={Number(sipValue) || 0} duration={2} separator="," /></p>
            </div>

            <div className="stat-card">
                <h3>🏦 Monthly EMI</h3>
                <p>₹<CountUp end={Number(monthlyEmi) || 0} duration={2} separator="," /></p>
            </div>

            <div className="stat-card">
                <h3>🎯 Savings Goal</h3>
                <p><CountUp end={Number(goalData?.progress) || 0} duration={2} decimals={1} />%</p>
            </div>
            </div>

            {/* ANALYTICS SECTION */}
            <div className="analytics-grid animate analytics-delay">

            {/* LEFT SIDE BIG CHART */}
            <div className="main-chart-card">
                <h2>Expense Analytics 📊</h2>

                {chartData.length > 0 ? (
                <div className="chart-wrapper">
                    <div className="donut-wrapper">
                    <div className="pie-animation">
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
                    </div>

                    <div className="center-text">
                        <h3>₹<CountUp end={Number(totalExpenses) || 0} duration={2} separator="," /></h3>
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
                        <strong>₹<CountUp end={Number(item.value) || 0} duration={2} separator="," /></strong>
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
                        <strong>₹<CountUp end={Number(item.amount) || 0} duration={2} separator="," /></strong>
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
            <div className="comparison-chart animate comparison-delay">
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexDirection: 'column'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap:12}}>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                            <h2 style={{margin:0}}>Monthly Spending Comparison 📈</h2>
                            <p className="comparison-subtitle" style={{marginTop:6}}>This month vs last month spending</p>
                        </div>

                        <div style={{width:220}}>
                            <ResponsiveContainer width="100%" height={48}>
                                <LineChart data={sparkData}>
                                    <defs>
                                        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                            <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} contentStyle={{borderRadius:8}} />
                                            <Line type="monotone" dataKey="amount" stroke="url(#sparkGrad)" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {monthChange !== null && (
                            <div title={`Change from last month: ${monthChange}%`} className={`change-badge ${Number(monthChange) >= 0 ? 'up' : 'down'}`}>
                                {Number(monthChange) >= 0 ? '▲' : '▼'} {Math.abs(monthChange)}%
                            </div>
                        )}
                    </div>
                </div>

                <div className="comparison-wrapper">
                    <BarChart width={820} height={360} data={comparisonData} barCategoryGap={120}>
                        <defs>
                            <linearGradient id="gradLast" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fb7185" stopOpacity={1} />
                                <stop offset="100%" stopColor="#f43f5e" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="gradThis" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="rgba(3,7,18,0.06)" />
                        <XAxis dataKey="name" tick={{ fontSize: 15, fill: "#0f172a", fontWeight: 700 }} />
                        <YAxis tickFormatter={(v) => `₹${Number(v).toLocaleString()}`} tick={{ fill: "#0f172a" }} />
                        <Tooltip
                            formatter={(value) => `₹${Number(value).toLocaleString()}`}
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,.12)", background:'#fff', color:'#0f172a' }}
                        />
                            <Bar dataKey="amount" radius={[16, 16, 0, 0]} barSize={140} animationDuration={1200}>
                                {comparisonData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === "This Month" ? 'url(#gradThis)' : 'url(#gradLast)'} />
                                ))}
                                <LabelList
                                    dataKey="amount"
                                    position="top"
                                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                                    style={{ fill: '#061124', fontWeight: 800 }}
                                />
                            </Bar>
                    </BarChart>
                </div>
            </div>
        </div>
);
}

export default Dashboard;