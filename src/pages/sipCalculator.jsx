import {useState, useEffect} from "react";
import InputField from "../components/InputField";
import "./sipCalculator.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function SipCalculator(){
const [monthlyInvestment, setMonthlyInvestment] = useState("");
const [interestRate, setInterestRate] = useState("");
const [years, setYears] = useState("");
const [result, setResult] = useState(null);
const [error, setError] = useState("");

const calculateSIP = () => {
  const P = Number(monthlyInvestment);
  const annualRate = Number(interestRate);
  const time = Number(years);
  
  if (!P || !annualRate || !time){
    setError("Please fill all fields");
    return;
  }

  if (P <= 0) {
    setError("Monthly investment must be greater than 0");
    return;
  }

  if (annualRate <= 0 || annualRate > 50) {
    setError("Tnterest rate must be between 1 and 50");
    return;

  }

  if(time <= 0 || time > 50){
    setError("Investment period must be between 1 and 50 years");
    return;
  }
  setError("");
  const r = annualRate / 12 / 100;
  const n = time * 12;

  const maturityAmount = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));

  const investedAmount = P * n;
  const estimatedReturns = maturityAmount - investedAmount;

  setResult({
    investedAmount: investedAmount.toFixed(2),
    estimatedReturns: estimatedReturns.toFixed(2),
    totalValue: maturityAmount.toFixed(2),
 });

  const sipData = {
    monthlyInvestment,
    interestRate,
    years,
    result: {
         investedAmount: investedAmount.toFixed(2),
         estimatedReturns: estimatedReturns.toFixed(2),
         totalValue: maturityAmount.toFixed(2),
    },
  };
  localStorage.setItem("sipData", JSON.stringify(sipData));
};

      useEffect(() => {
        const savedSip = localStorage.getItem("sipData");

        if (savedSip) {
          const parsedData = JSON.parse(savedSip);

          setMonthlyInvestment(parsedData.monthlyInvestment);
          setInterestRate(parsedData.interestRate);
          setYears(parsedData.years);
          setResult(parsedData.result);
        }
      }, []);

      const clearSIP = () => {
        setMonthlyInvestment("");
        setInterestRate("");
        setYears("");
        setResult(null);

        localStorage.removeItem("sipData");
      }
      const pieData = result
        ? [
            {
              name: "Invested Amount",
              value: Number(result.investedAmount),
            },
            {
              name: "Returns",
              value: Number(result.estimatedReturns),
            },
          ]
        : [];

      const COLORS = ["#2563eb", "#10b981"];

      const growthMultiple = result
      ?(
        Number(result.totalValue) /
        Number(result.investedAmount)
      ).toFixed(2)
      : 0;

      const profitPercent = result
      ? (
        (Number(result.estimatedReturns) /
         Number(result.totalValue)) * 100
      ).toFixed(1)
      : 0;

      let sipAdvice = "Start investing to get insights";

      if (Number(years) < 5){
        sipAdvice = "Longer duration can significantly boost compunding.";
      } else if (Number(years) <= 15) {
        sipAdvice = "Good investment horizon for healthy growth.";  
      } else {
        sipAdvice = "Excellent long-term planning. Compounding is working strongly.";
      }

    return(
        <div className="sip-container">
          <h1>SIP Calculator</h1>
          <div className="sip-top-section">
            <div className="sip-input-card">
              <h2>Plan Your Investment</h2>

              <label>Monthly Investment (₹)</label>
              <InputField
             placeholder="MonthlyInvestment (₹)"
             value={monthlyInvestment}
             onChange={(e) =>setMonthlyInvestment(e.target.value) }
            />

            <label>Annual Interest Rate (%)</label>
            <InputField
             placeholder="Annual Interest Rate (%)"
             value={interestRate}
             onChange={(e) =>setInterestRate(e.target.value) }
            />

            <label>Investment Period (Years)</label>
            <InputField
             placeholder="Investment Period (Years)"
             value={years}
             onChange={(e) =>setYears(e.target.value) }
            />
            {error && <p className="error-message">⚠ {error}</p>}

            <button className="calculate-btn" onClick={calculateSIP}>
              Calculate
            </button>
            <button className="clear-btn" onClick={clearSIP}>
               Clear
            </button>
            </div>

            <div className="sip-result-card">
              <h2>Investment Summary</h2>
              {result && (
            <div className="sip-results-grid">
             <div className="result-box invested-card">
                <h4>💵 Invested Amount</h4>
                <h3>₹{result.investedAmount}</h3>
             </div>

             <div className="result-box returns-card">
                <h4>📈 Estimated Returns</h4>
                <h3>₹{result.estimatedReturns}</h3>
             </div>

             <div className="result-box total-card">
                <h4>🏆 Total Value</h4>
                <h3>₹{result.totalValue}</h3>
             </div>
           </div>
            )}
            </div>
          </div>

          <div className="sip-bottom-section">
              {result && (
              <div className="sip-chart-card">
                <h2>Investment Breakdown</h2>

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
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              )}

            <div className="sip-insights-card">
              <h2>Smart Insights</h2>

              <div className="mini-sip-card">
                <h4>📈 Growth</h4>
                <p>{growthMultiple}x wealth growth</p>
              </div>

              <div className="mini-sip-card">
                <h4>💰 Profit Share</h4>
                <p>{profitPercent}% of final value</p>
              </div>

              <div className="mini-sip-card">
                <h4>💡 Advice</h4>
                <p>{sipAdvice}</p>
              </div>
            </div>
          </div>

        </div>
    );
}

export default SipCalculator;