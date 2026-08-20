import {useState, useEffect} from "react";
import InputField from "../components/InputField";
import "./sipCalculator.css";
import axios from "axios";
import toast from "react-hot-toast";
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
const [dueDay, setDueDay] = useState(1);
const [startDate, setStartDate] = useState(new Date());
const [paidMonths, setPaidMonths] = useState(0);
const [totalMonths, setTotalMonths] = useState(0);
const [monthsRemaining, setMonthsRemaining] = useState(0);
const [investedSoFar, setInvestedSoFar] = useState(0);
const [remainingInvestment, setRemainingInvestment] = useState(0);

const calculateSIP = async () => {
  const P = Number(monthlyInvestment);
  const annualRate = Number(interestRate);
  const time = Number(years);
  
  if (!P || !annualRate || !time){
    toast.error("Please fill all fields");
    setError("Please fill all fields");
    return;
  }

  if (P <= 0) {
    toast.error("Monthly investment must be greater than 0");
    setError("Monthly investment must be greater than 0");
    return;
  }

  if (annualRate <= 0 || annualRate > 50) {
    toast.error("Interest rate must be between 1 and 50");
    setError("Interest rate must be between 1 and 50");
    return;

  }

  if(time <= 0 || time > 50){
    toast.error("Investment period must be between 1 and 50 years");
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

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user._id) {
    toast.error("Please login first");
    return;
  }

  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/sip`, {
      user: user._id,
      monthlyInvestment: Number(monthlyInvestment),
      interestRate: Number(interestRate),
      years: Number(years),
      investedAmount,
      estimatedReturns,
      totalValue: maturityAmount, 
      dueDay: Number(dueDay),
      startDate: new Date(),
    });
    toast.success("SIP saved successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to save SIP");
  }
};

    useEffect(() => {
      const fetchSip = async () => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));

          if(!user || !user._id) return;

          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/sip/${user._id}`
          );

          console.log(res.data);

          if(!res.data) return;

          setMonthlyInvestment(res.data.monthlyInvestment);
          setInterestRate(res.data.interestRate);
          setYears(res.data.years);
          setDueDay(res.data.dueDay);
          setStartDate(res.data.startDate);
          
          setPaidMonths(
            Number(res.data.paidMonths || 0)
          );

          setTotalMonths(
            Number(res.data.totalMonths || 0)
          );

          setMonthsRemaining(
            Number(res.data.monthsRemaining || 0)
          );

          setInvestedSoFar(
            Number(res.data.investedSoFar || 0)
          );

          setRemainingInvestment(
            Number(res.data.remainingInvestment || 0)
          );

          setResult({
            investedAmount: Number(res.data.investedAmount).toFixed(2),
            estimatedReturns: Number(res.data.estimatedReturns).toFixed(2),
            totalValue: Number(res.data.totalValue).toFixed(2),
          });
        } catch (error) {
          console.error(error);
        }
      };

      fetchSip();

    }, []);

      const clearSIP = () => {
        setMonthlyInvestment("");
        setInterestRate("");
        setYears("");
        setResult(null);

        setPaidMonths(0);
        setTotalMonths(0);
        setMonthsRemaining(0);
        setInvestedSoFar(0);
        setRemainingInvestment(0);

        //localStorage.removeItem("sipData");
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

      const COLORS = ["#3B5A73", "#1F6D4C"];

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
             placeholder="Monthly Investment (₹)"
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

            <label>SIP Due Date</label>
            <InputField
             placeholder="SIP Due Date"
             value={dueDay}
             onChange={(e) =>setDueDay(e.target.value) }
            />
            {error && <p className="error-message">{error}</p>}

            <button className="calculate-btn" onClick={calculateSIP}>
              Calculate
            </button>
            <button className="clear-btn" onClick={clearSIP}>
               Clear
            </button>
            </div>

            <div className="sip-result-card">
              <h2>Investment Summary</h2>
              {result ? (
            <div className="sip-results-grid">
             <div className="result-box invested-card">
                <h4>Invested Amount</h4>
                <h3 className="mono-figure">₹{result.investedAmount}</h3>
             </div>

             <div className="result-box returns-card">
                <h4>Estimated Returns</h4>
                <h3 className="mono-figure">₹{result.estimatedReturns}</h3>
             </div>

             <div className="result-box total-card">
                <h4>Total Value</h4>
                <h3 className="mono-figure">₹{result.totalValue}</h3>
             </div>
           </div>
              ) : (
                <p className="empty-state">Enter your investment details to see a summary.</p>
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
                          stroke="var(--surface)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>

                    <Tooltip contentStyle={{ borderRadius: 4, border: "1px solid #e3ddcd", fontFamily: "var(--font-mono)", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-body)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              )}

            <div className="sip-insights-card">
              <h2>Smart Insights</h2>

              <div className="mini-sip-card">
                <h4>Invested So Far</h4>

                <p>
                  <span className="mono-figure">
                    ₹{investedSoFar.toLocaleString("en-IN")}
                  </span>
                </p>
              </div>

              <div className="mini-sip-card">
                <h4>Remaining Investment</h4>

                <p>
                  <span className="mono-figure">
                    ₹{remainingInvestment.toLocaleString("en-IN")}
                  </span>
                </p>
              </div>

              <div className="mini-sip-card">
                <h4>Monthly Investment</h4>

                <p>
                  <span className="mono-figure">
                    ₹{Number(monthlyInvestment).toLocaleString("en-IN")}
                  </span>
                  /month
                </p>
              </div>

              <div className="mini-sip-card">
                <h4>Paid Months</h4>

                <p>
                  <span className="mono-figure">
                    {paidMonths} / {totalMonths}
                  </span>
                </p>
              </div>

              <div className="mini-sip-card">
                <h4>Months Remaining</h4>

                <p>
                  <span className="mono-figure">
                    {monthsRemaining === 0 && totalMonths > 0
                      ? "Completed"
                      : monthsRemaining}
                  </span>

                  {monthsRemaining > 0 &&
                    ` ${monthsRemaining === 1 ? "month" : "months"}`}
                </p>
              </div>

              <div className="mini-sip-card">
                <h4>Growth</h4>

                <p>
                  <span className="mono-figure">
                    {growthMultiple}x
                  </span>{" "}
                  wealth growth
                </p>
              </div>

              <div className="mini-sip-card">
                <h4>Advice</h4>

                <p>{sipAdvice}</p>
              </div>
            </div>
          </div>

        </div>
    );
}

export default SipCalculator;