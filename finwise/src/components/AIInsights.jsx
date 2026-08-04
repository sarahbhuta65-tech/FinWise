import "./AIInsights.css";
import { useEffect, useState } from "react";

function AIInsights() {

  const [insights, setInsights] = useState([]);
  const [currentInsight, setCurrentInsight] = useState(0);

  useEffect(() => {
    if (!insights.length) return;

    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [insights]);

  const loadInsights = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/insights/${user._id}`
      );

      const data = await res.json();
      console.log(data);
      setInsights(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div className="ai-insights">

      <div className="story-progress">
          {insights.map((_, index) => (
            <div
              key={index}
              className={`story-bar ${
                index === currentInsight ? "active" : ""
              }`}
            ></div>
          ))}
        </div>

      <div className="ai-header">
        ✨ AI Insights
      </div>

      <div className="ai-list">

        {insights.length > 0 && (
          <div
            key={currentInsight}
            className="insight-card fade-in"
          >
            <span className="insight-icon">
              {insights[currentInsight].icon}
            </span>
            <span className="insight-text">
              {insights[currentInsight].text}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}

export default AIInsights;