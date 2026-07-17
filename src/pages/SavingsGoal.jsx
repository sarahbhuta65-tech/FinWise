import { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./SavingsGoal.css";
import axios from "axios";

function SavingsGoal() {
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const calculateProgress = async () => {
    const goal = Number(goalAmount);
    const saved = Number(savedAmount);

    if (!goalName || !goalAmount || savedAmount === "") {
      setError("Please fill all fields");
      return;
    }

    if (goal <= 0 || saved < 0) {
      setError("Invalid amounts");
      return;
    }

    setError("");
    const percentage = Math.min((saved / goal) * 100, 100);
    setProgress(percentage);

    try{
      const user = JSON.parse(localStorage.getItem("user"));

      await axios.post("http://localhost:5000/api/goals", {
        user: user.id,
        goalName,
        goalAmount: goal,
        savedAmount: saved,
        progress: percentage,
      });

      alert("Goal saved successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save goal");
    }
  };

 useEffect(() => {
    const fetchGoal = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) return;

        const res = await axios.get(
          `http://localhost:5000/api/goals/${user.id}`
        );

        if (res.data) {
          setGoalName(res.data.goalName);
          setGoalAmount(res.data.goalAmount);
          setSavedAmount(res.data.savedAmount);
          setProgress(res.data.progress);
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
        `http://localhost:5000/api/goals/${user.id}`
      );

      setGoalName("");
      setGoalAmount("");
      setSavedAmount("");
      setProgress(0);
      setError("");

    } catch (error) {
      console.error(error);
      alert("Failed to delete goal");
    }
  };

  const remainingAmount = Math.max(Number(goalAmount) - Number(savedAmount), 0);
  const monthlySuggestion = remainingAmount > 0 ? (remainingAmount / 12).toFixed(0) : 0;

  let goalStatus = "Excellent progress 🚀";
  if (progress < 30) goalStatus = "Just getting started 🌱";
  else if (progress < 70) goalStatus = "Good progress 🔥";

  let goalMessage = "Start your savings journey 🚀";
  if (progress > 0 && progress < 25) goalMessage = "Great start! Keep saving 💪";
  else if (progress < 50 && progress >= 25) goalMessage = "Nice progress! Moving ahead 🌱";
  else if (progress < 75 && progress >= 50) goalMessage = "More than halfway there 🔥";
  else if (progress < 100 && progress >= 75) goalMessage = "Almost there! Don't stop 🎯";
  else if (progress >= 100) goalMessage = "Goal achieved! Congratulations 🎉";

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
              <label>Already Saved (₹)</label>
              <input
                type="number"
                placeholder="e.g., 15000"
                value={savedAmount}
                onChange={(e) => setSavedAmount(e.target.value)}
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
            💡 Small savings daily create big results
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="dashboard-card progress-card">
          <div className="goal-icon">🎮</div>
          <h2>{goalName || "Current Goal"}</h2>
          
          <div className="progress-circle-wrapper">
            <CircularProgressbar
              value={progress}
              text={`${progress.toFixed(0)}%`}
              styles={buildStyles({
                pathColor: progress < 30 ? "#ef4444" : progress < 70 ? "#f59e0b" : "#10b981",
                textColor: "#0f172a",
                trailColor: "#f1f5f9",
                strokeLinecap: "round"
              })}
            />
          </div>

          <div className="progress-stats">
            <h3>₹{Number(savedAmount).toLocaleString('en-IN') || 0}</h3>
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
              <div className={progress >= 100 ? "milestone active" : "milestone"}>🎯</div>
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
              <span className="mini-label">Recommended Monthly Target</span>
              <h4 className="mini-value text-financial">₹{Number(monthlySuggestion).toLocaleString('en-IN')}/mo</h4>
            </div>

            <div className="mini-card">
              <span className="mini-label">Estimated Completion</span>
              <h4 className="mini-value">
                {progress >= 100 ? "Completed 🎉" : "12 months"}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavingsGoal;