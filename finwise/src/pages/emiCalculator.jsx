import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import CalculatorCard from "../components/CalculatorCard";
import "./emiCalculator.css";
import axios from "axios";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,} from "recharts";

function EmiCalculator(){
const navigate = useNavigate();
const [loanAmount, setLoanAmount] = useState("");
const [interestRate, setInterestRate] = useState("");
const [years, setYears] = useState("");
const [result, setResult] = useState(null);
const [error, setError] = useState("");
const [dueDay, setDueDay] = useState(1); // Default due day is 1
const [paidMonths, setPaidMonths] = useState(0);
const [totalMonths, setTotalMonths] = useState(0);
const [monthsRemaining, setMonthsRemaining] = useState(0);
const [paidAmount, setPaidAmount] = useState(0);
const [remainingAmount, setRemainingAmount] = useState(0);

const [startDate, setStartDate] = useState(new Date()); // Default start date is today
const calculateEMI = async () => {
  const P = Number(loanAmount);
  const annualRate = Number(interestRate);
  const time = Number(years);

  if (!P || !annualRate || !time) {
    toast.error("Please fill all fields");
    setError("Please fill all fields");
    return;
  }

  if (P <= 0) {
    toast.error("Loan amount must be greater than 0");
    setError("Loan amount must be greater than 0");
    return;
  }

  if (annualRate <= 0 || annualRate > 30) {
    toast.error("Interest rate must be between 1 and 30");
    setError("Interest rate must be between 1 and 30");
    return;
  }

  if (time <= 0 || time > 40) {
    toast.error("Loan years must be between 1 and 40 years");
    setError("Loan years must be between 1 and 40 years");
    return;
  }

  setError("");
  const r = annualRate / 12 / 100;
  const n = time * 12;

  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  setResult({
    emi: emi.toFixed(2),
    totalPayment: totalPayment.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
  });

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user._id) {
    toast.error("Please login first");
    return;
  }

  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/emi`, {
      loanAmount: Number(loanAmount),
      interestRate: Number(interestRate),
      years: Number(years),
      emi,
      totalPayment,
      totalInterest,
      dueDay,
      startDate,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    toast.success("EMI saved successfully");
  } catch (error) {
    console.error(error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      return;
    }
    toast.error("Failed to save EMI");
  }
};

useEffect(() => {
  const fetchEmi = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user._id) return;

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/emi/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.data) return;

      setLoanAmount(res.data.loanAmount);
      setInterestRate(res.data.interestRate);
      setYears(res.data.years);
      setDueDay(res.data.dueDay || 1); // Default to 1 if not set
      setStartDate(res.data.startDate || new Date()); // Default to current date if not set
      setPaidMonths(Number(res.data.paidMonths || 0));

      setTotalMonths(
        Number(res.data.totalMonths || Number(res.data.years) * 12)
      );

      setMonthsRemaining(
        Number(
          res.data.monthsRemaining ??
          Number(res.data.years) * 12
        )
      );

      setPaidAmount(Number(res.data.paidAmount || 0));

      setRemainingAmount(
        Number(
          res.data.remainingAmount ??
          res.data.totalPayment
        )
      );

      setResult({
        emi: Number(res.data.emi).toFixed(2),
        totalPayment: Number(res.data.totalPayment).toFixed(2),
        totalInterest: Number(res.data.totalInterest).toFixed(2),
      });
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      }
    }
  };

  fetchEmi();
}, []);

const clearEMI = () => {
  setLoanAmount("");
  setInterestRate("");
  setYears("");
  setResult(null);

  setPaidMonths(0);
  setTotalMonths(0);
  setMonthsRemaining(0);
  setPaidAmount(0);
  setRemainingAmount(0);
};

const pieData = result 
  ? [
    {
      name: "Principal amount",
      value: Number(loanAmount),
    },
    {
      name: "Interest Amount",
      value: Number(result.totalInterest),
    },
  ]
  : [];

  const COLORS = ["#3B5A73", "#B3541E"];

  const emiBurden = result
    ? Number(result.emi) > Number(loanAmount) * 0.03
      ? "High EMI burden"
      : "Comfortable EMI"
    : "Calculate EMI first";
    
  const recommendation =
    result
      ? Number(result.totalInterest) > Number(loanAmount)
        ? "Consider shorter tenure to reduce interest"
        : "Loan terms look balanced"
      : "Waiting for calculation";

    return(
        <div className="emi-container">
            <h1>EMI Calculator</h1>

            <div className="emi-top-section">
              <div className="emi-input-card">
                <h2>Plan Your Loan</h2>

                <label>Loan Amount (₹)</label>
                <InputField
                  placeholder="Enter loan amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />

                <label>Annual Interest Rate (%)</label>
                <InputField
                  placeholder="Enter interest rate"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />

                <label>Loan Tenure (Years)</label>
                <InputField
                  placeholder="Enter loan years"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                />

                <label>EMI Due Date</label>
                <InputField
                  placeholder="Enter EMI due date (1-31)"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                />

                {error && <p className="error-message">{error}</p>}

                <button className="calculate-btn" onClick={calculateEMI}>
                  Calculate
                </button>

                <button className="clear-btn" onClick={clearEMI}>
                  Clear
                </button>
              </div>

              <div className="emi-result-card">
                <h2>Loan Summary</h2>

                {result ? (
                  <div className="emi-results-grid">
                    <div className="result-box emi-box">
                      <h4>Monthly EMI</h4>
                      <h3 className="mono-figure">₹{result.emi}</h3>
                    </div>

                    <div className="result-box interest-box">
                      <h4>Total Interest</h4>
                      <h3 className="mono-figure">₹{result.totalInterest}</h3>
                    </div>

                    <div className="result-box payment-box">
                      <h4>Total Payment</h4>
                      <h3 className="mono-figure">₹{result.totalPayment}</h3>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Enter loan details to calculate EMI</p>
                  </div>
                )}
              </div>
            </div>

              <div className="emi-bottom-section">
              <div className="emi-chart-card">
                <h2>Payment Breakdown</h2>

                {result ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={140}
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
                    <p>Chart will appear after calculation</p>
                  </div>
                )}
              </div>

              <div className="emi-insights-card">
                <h2>Smart Insights</h2>

                <div className="mini-emi-card">
                  <h4>Paid So Far</h4>
                  <p>
                    <span className="mono-figure">
                      ₹{Number(paidAmount).toLocaleString("en-IN")}
                    </span>
                  </p>
                </div>

                <div className="mini-emi-card">
                  <h4>Remaining Amount</h4>
                  <p>
                    <span className="mono-figure">
                      ₹{Number(remainingAmount).toLocaleString("en-IN")}
                    </span>
                  </p>
                </div>

                <div className="mini-emi-card">
                  <h4>Monthly EMI</h4>
                  <p>
                    <span className="mono-figure">
                      ₹{result ? Number(result.emi).toLocaleString("en-IN") : 0}
                    </span>
                    /month
                  </p>
                </div>

                <div className="mini-emi-card">
                  <h4>Paid Months</h4>
                  <p>
                    <span className="mono-figure">
                      {paidMonths} / {totalMonths}
                    </span>
                  </p>
                </div>

                <div className="mini-emi-card">
                  <h4>Months Remaining</h4>
                  <p>
                    <span className="mono-figure">
                      {monthsRemaining}
                    </span>{" "}
                    {monthsRemaining === 1 ? "month" : "months"}
                  </p>
                </div>

                <div className="mini-emi-card">
                  <h4>Interest</h4>
                  <p>
                    <span className="mono-figure">
                      ₹{result ? Number(result.totalInterest).toLocaleString("en-IN") : 0}
                    </span>
                  </p>
                </div>

                <div className="mini-emi-card">
                  <h4>Recommendation</h4>
                  <p>{recommendation}</p>
                </div>
              </div>
            </div>
          </div>
    );
}

export default EmiCalculator;