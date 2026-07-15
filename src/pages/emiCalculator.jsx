import {useState, useEffect} from "react";
import InputField from "../components/InputField";
import CalculatorCard from "../components/CalculatorCard";
import "./emiCalculator.css";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,} from "recharts";

function EmiCalculator(){
const [loanAmount, setLoanAmount] = useState("");
const [interestRate, setInterestRate] = useState("");
const [years, setYears] = useState("");
const [result, setResult] = useState(null);
const [error, setError] = useState("");

const calculateEMI = () => {
  const P = Number(loanAmount);
  const annualRate = Number(interestRate);
  const time = Number(years);

  if (!P || !annualRate || !time){
    setError("Please fill all fields");
    return;
  }

  if (P <= 0){
    setError("Loan amount must be greater than 0");
    return;
  }

  if (annualRate <= 0 || annualRate > 30) {
    setError("Interest rate must be between 1 and 30");
    return;
  }

  if (time <= 0 || time > 40) {
    setError("Loan years must be between 1 and 40 years");
    return;
  }
  setError("");
  const r = annualRate / 12 / 100;
  const n = time * 12;

  const emi =(P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  setResult({
    emi: emi.toFixed(2),
    totalPayment: totalPayment.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
 });

 const emiData = {
  loanAmount,
  interestRate,
  years,
  result: {
    emi: emi.toFixed(2),
    totalPayment: totalPayment.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
  },
};

localStorage.setItem("emiData", JSON.stringify(emiData));
};

useEffect(() => {
  const savedEmi = localStorage.getItem("emiData");

  if (savedEmi) {
    const parsedData = JSON.parse(savedEmi);

    setLoanAmount(parsedData.loanAmount);
    setInterestRate(parsedData.interestRate);
    setYears(parsedData.years);
    setResult(parsedData.result);
  }
}, []);

const clearEMI = () => {
  setLoanAmount("");
  setInterestRate("");
  setYears("");
  setResult(null);

  localStorage.removeItem("emiData");
}

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

  const COLORS = ["#2563eb", "#ef4444"];

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

                {error && <p className="error-message">⚠ {error}</p>}

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
                      <h4>💳 Monthly EMI</h4>
                      <h3>₹{result.emi}</h3>
                    </div>

                    <div className="result-box interest-box">
                      <h4>📈 Total Interest</h4>
                      <h3>₹{result.totalInterest}</h3>
                    </div>

                    <div className="result-box payment-box">
                      <h4>💰 Total Payment</h4>
                      <h3>₹{result.totalPayment}</h3>
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
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
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
                ) : (
                  <div className="empty-state">
                    <p>Chart will appear after calculation</p>
                  </div>
                )}
              </div>
              <div className="emi-insights-card">
                <h2>Smart Insights</h2>

                <div className="mini-emi-card">
                  <h4>📊 EMI Burden</h4>
                  <p>{emiBurden}</p>
                </div>

                <div className="mini-emi-card">
                  <h4>💡 Recommendation</h4>
                  <p>{recommendation}</p>
                </div>

                <div className="mini-emi-card">
                  <h4>🎯 Loan Duration</h4>
                  <p>{years || 0} years repayment period</p>
                </div>
              </div>
            </div>
          </div>
    );
}

export default EmiCalculator;