import { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./SavingsGoal.css";
import toast from "react-hot-toast";
import axios from "axios";

function SavingsGoal() {
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [totalMonths, setTotalMonths] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dueDay, setDueDay] = useState(1);
  const [paidMonths, setPaidMonths] = useState(0);
  const [monthsRemaining, setMonthsRemaining] = useState(0);
  const [monthlyTarget, setMonthlyTarget] = useState(0);
  

  const calculateProgress = async () => {
    const goal = Number(goalAmount);
    const saved = Number(savedAmount) || 0;

    if (!goalName || !goalAmount) {
        toast.error("Please fill all fields");
        setError("Please fill all fields");
        return;
    }

    if (goal <= 0) {
        toast.error("Invalid goal amount");
        setError("Invalid goal amount");
        return;
    }

    if (Number(dueDay) < 1 || Number(dueDay) > 31) {
      toast.error("Due day must be between 1 and 31");
      setError("Due day must be between 1 and 31");
      return;
    }

    if (!totalMonths || Number(totalMonths) <= 0) {
        toast.error("Please enter a valid target duration");
        setError("Please enter a valid target duration");
        return;
    }

    setError("");
    const percentage = Math.min((saved / goal) * 100, 100);
    setProgress(percentage);

    try{
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user._id) {
        toast.error("Please login first");
        return;
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/api/goals`, {
        user: user._id,
        goalName,
        goalAmount: goal,
        savedAmount: saved,
        progress: percentage,
        dueDay: Number(dueDay),
        totalMonths: Number(totalMonths),
      });

      toast.success("Goal saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save goal");
    }
  };

 useEffect(() => {
    const fetchGoal = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user._id) return;

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/goals/${user._id}`
        );

        if (res.data) {
            setGoalName(res.data.goalName);
            setGoalAmount(res.data.goalAmount);
            setSavedAmount(res.data.savedAmount);
            setProgress(res.data.progress);
            setDueDay(res.data.dueDay || 1);

            setPaidMonths(
                Number(res.data.paidMonths || 0)
            );

             setMonthsRemaining(
                Number(res.data.monthsRemaining || 0)
            );

            setTotalMonths(
                Number(res.data.totalMonths || 0)
            );

            const calculatedMonthlyTarget =
                Number(res.data.totalMonths) > 0
                    ? Number(res.data.goalAmount) /
                      Number(res.data.totalMonths)
                    : 0;

            setMonthlyTarget(calculatedMonthlyTarget);

        }

      } catch (error) {
        console.error(error);
      }
    };

    fetchGoal();
  }, []);

  const clearGoal = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/goals/${user._id}`
      );

      setGoalName("");
      setGoalAmount("");
      setSavedAmount("");
      setProgress(0);
      setError("");
      setPaidMonths(0);
      setTotalMonths(0);
      setMonthsRemaining(0);

    } catch (error) {
      console.error(error);
      toast.error("Failed to delete goal");
    }
  };

  const remainingAmount = Math.max(Number(goalAmount) - Number(savedAmount), 0);


  let goalStatus = "Excellent progress";
  if (progress < 30) goalStatus = "Just getting started";
  else if (progress < 70) goalStatus = "Good progress";

  let goalMessage = "Start your savings journey";
  if (progress > 0 && progress < 25) goalMessage = "Great start! Keep saving";
  else if (progress < 50 && progress >= 25) goalMessage = "Nice progress! Moving ahead";
  else if (progress < 75 && progress >= 50) goalMessage = "More than halfway there";
  else if (progress < 100 && progress >= 75) goalMessage = "Almost there! Don't stop";
  else if (progress >= 100) goalMessage = "Goal achieved! Congratulations";

  return (
    <div className="goal-page">
      <h1 className="goal-title">Savings Goal Tracker</h1>
      <p className="goal-subtitle">
        Stay consistent. Reach milestone faster.
      </p>

      <div className="goal-dashboard">
        {/* LEFT PANEL */}
        <div className="dashboard-card form-card">
          <div className="card-header">
            <h2>Create Goal</h2>
            <p className="card-subtitle">Plan your savings goal</p>
          </div>
          
          <div className="form-groups">
            <div className="input-container">
              <label>Goal Name</label>
              <input
                type="text"
                placeholder="e.g., PS5, MacBook"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>

            <div className="input-container">
              <label>Target Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g., 50000"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
              />
            </div>

            <div className="input-container">
              <label>Target Duration (Months)</label>

              <input
                  type="number"
                  min="1"
                  placeholder="e.g., 12"
                  value={totalMonths}
                  onChange={(e) =>
                      setTotalMonths(e.target.value)
                  }
              />
          </div>

            <div className="input-container">
              <label>Monthly Due Day</label>

              <input
                type="number"
                min="1"
                max="31"
                placeholder="e.g., 15"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="action-buttons">
            <button className="calculate-btn" onClick={calculateProgress}>
              Calculate Progress
            </button>
            <button className="clear-btn" onClick={clearGoal}>
              Reset Goal
            </button>
          </div>

          <div className="goal-tip">
            Small savings daily create big results
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="dashboard-card progress-card">
          <div className="goal-icon">🎯</div>
          <h2>{goalName || "Current Goal"}</h2>
          
          <div className="progress-circle-wrapper">
            <CircularProgressbar
              value={progress}
              text={`${progress.toFixed(0)}%`}
              styles={buildStyles({
                pathColor: progress < 30 ? "#B3541E" : progress < 70 ? "#A9862E" : "#1F6D4C",
                textColor: "#14181f",
                trailColor: "#e3ddcd",
                strokeLinecap: "round"
              })}
            />
          </div>

          <div className="progress-stats">
            <h3 className="mono-figure">₹{Number(savedAmount).toLocaleString('en-IN') || 0}</h3>
            <p>saved out of ₹{Number(goalAmount).toLocaleString('en-IN') || 0}</p>
          </div>

          <div className="goal-message">{goalMessage}</div>
          <div className="milestone-track">
            <div className="milestone-item">
              <div className={progress >= 25 ? "milestone active" : "milestone"}>25%</div>
              <div className={progress >= 25 ? "line active-line" : "line"}></div>
            </div>

            <div className="milestone-item">
              <div className={progress >= 50 ? "milestone active" : "milestone"}>50%</div>
              <div className={progress >= 50 ? "line active-line" : "line"}></div>
            </div>

            <div className="milestone-item">
              <div className={progress >= 75 ? "milestone active" : "milestone"}>75%</div>
              <div className={progress >= 75 ? "line active-line" : "line"}></div>
            </div>

            <div className="milestone-item">
              <div className={progress >= 100 ? "milestone active" : "milestone"}>🏁</div>
            </div>
            
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="dashboard-card insights-card">
          <div className="card-header">
            <h2>Insights</h2>
            <p className="card-subtitle">Smart financial insights</p>
          </div>

          <div className="mini-cards-container">
            <div className="mini-card">
              <span className="mini-label">Status</span>
              <h4 className="mini-value">{goalStatus}</h4>
            </div>

            <div className="mini-card">
              <span className="mini-label">Remaining Balance</span>
              <h4 className="mini-value text-financial">₹{remainingAmount.toLocaleString('en-IN')}</h4>
            </div>

            <div className="mini-card">
              <span className="mini-label">
                  Months Paid
              </span>

              <h4 className="mini-value">
                  {progress >= 100
                      ? totalMonths
                      : paidMonths}{" "}
                  {paidMonths === 1 ? "month" : "months"}
              </h4>
          </div>

          <div className="mini-card">
              <span className="mini-label">
                  Monthly Target
              </span>

              <h4 className="mini-value text-financial">
                  ₹{Number(monthlyTarget).toLocaleString("en-IN")}
              </h4>
          </div>

          <div className="mini-card">
              <span className="mini-label">
                  Paid Months
              </span>

              <h4 className="mini-value">
                  {paidMonths} / {totalMonths}
              </h4>
          </div>

          <div className="mini-card">
              <span className="mini-label">
                  Months Remaining
              </span>

              <h4 className="mini-value">
                  {progress >= 100
                      ? "Completed"
                      : `${monthsRemaining} months`}
              </h4>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavingsGoal;