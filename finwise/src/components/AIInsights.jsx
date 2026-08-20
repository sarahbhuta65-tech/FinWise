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

            <div className="ai-insights-header">
                <div className="insights-title">
                    <span className="insights-sparkle">✦</span>

                    <div>
                        <h3>AI Insights</h3>
                        <p>Smart tips for your finances</p>
                    </div>
                </div>

                <span className="insights-label">AI</span>
            </div>

            {insights.length > 0 ? (
                <>
                    <div className="story-progress">
                        {insights.map((_, index) => (
                            <div
                                key={index}
                                className={`story-bar ${
                                    index === currentInsight ? "active" : ""
                                }`}
                            />
                        ))}
                    </div>

                    <div className="ai-list">
                        <div
                            key={currentInsight}
                            className="insight-card fade-in"
                        >
                            <div className="insight-icon">
                                {insights[currentInsight].icon}
                            </div>

                            <div className="insight-content">
                                <span className="insight-label-text">
                                    Financial Insight
                                </span>

                                <p>
                                    {insights[currentInsight].text}
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="insight-empty">
                    <span>✦</span>
                    <p>Your personalized insights will appear here.</p>
                </div>
            )}

        </div>
    );
}

export default AIInsights;