import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./FinancialNudge.css";

function FinancialNudge() {
    const navigate = useNavigate();

    const [nudge, setNudge] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNudge = async () => {
            try {
                const user = JSON.parse(
                    localStorage.getItem("user")
                );

                if (!user?._id) {
                    setLoading(false);
                    return;
                }

                const baseUrl =
                    import.meta.env.VITE_API_URL;

                // Generate a fresh nudge
                const generateRes = await axios.post(
                    `${baseUrl}/api/financial-nudges/generate/${user._id}`
                );

                setNudge(generateRes.data);

            } catch (error) {
                console.error(
                    "Failed to generate financial nudge:",
                    error
                );

                // If generation fails, try getting
                // the latest saved nudge
                try {
                    const user = JSON.parse(
                        localStorage.getItem("user")
                    );

                    if (user?._id) {
                        const response = await axios.get(
                            `${import.meta.env.VITE_API_URL}/api/financial-nudges/${user._id}`
                        );

                        setNudge(response.data);
                    }
                } catch (fallbackError) {
                    console.error(
                        "Failed to fetch latest nudge:",
                        fallbackError
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNudge();
    }, []);

    if (loading) {
        return (
            <div className="financial-nudge positive">
                <div className="nudge-header">
                    <div className="nudge-icon">
                        ✦
                    </div>

                    <div>
                        <span className="nudge-label">
                            FINANCIAL NUDGE
                        </span>

                        <h3>
                            Analyzing your finances...
                        </h3>
                    </div>

                    <span className="nudge-badge">
                        AI
                    </span>
                </div>
            </div>
        );
    }

    if (!nudge) {
        return (
            <div className="financial-nudge positive">
                <div className="nudge-header">
                    <div className="nudge-icon">
                        ✦
                    </div>

                    <div>
                        <span className="nudge-label">
                            FINANCIAL NUDGE
                        </span>

                        <h3>
                            You're on track
                        </h3>
                    </div>

                    <span className="nudge-badge">
                        AI
                    </span>
                </div>

                <div className="nudge-body">
                    <p>
                        Your finances are looking
                        balanced. Keep maintaining
                        your current habits.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`financial-nudge ${
                nudge.type || "positive"
            }`}
        >
            <div className="nudge-header">

                <div className="nudge-icon">
                    ✦
                </div>

                <div>
                    <span className="nudge-label">
                        FINANCIAL NUDGE
                    </span>

                    <h3>
                        {nudge.title}
                    </h3>
                </div>

                <span className="nudge-badge">
                    AI
                </span>

            </div>

            <div className="nudge-body">

                <p>
                    {nudge.message}
                </p>

                {nudge.action && nudge.path && (
                    <button
                        onClick={() =>
                            navigate(nudge.path)
                        }
                    >
                        {nudge.action}
                        <span>→</span>
                    </button>
                )}

            </div>
        </div>
    );
}

export default FinancialNudge;