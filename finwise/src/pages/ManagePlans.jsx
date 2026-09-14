import { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";

function ManagePlans() {
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/admin/subscriptions/plans`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setPlans(res.data.plans || []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchPlans();
    }, []);

    return (
        <div className="manage-page">
            <div className="page-header">
                <div>
                    <h1>Subscription Plans</h1>
                    <p>Premium plans currently offered to FinWise users.</p>
                </div>
            </div>

            <div className="blogs-container">
                {plans.map((plan) => (
                    <div className="blog-card" key={plan.billingCycle}>
                        <div className="blog-top">
                            <div>
                                <h2 className="blog-title">{plan.name}</h2>
                                <span className="category-badge">{plan.billingCycle}</span>
                            </div>
                        </div>

                        <p className="blog-description">{plan.description}</p>

                        <div className="blog-footer">
                            <div className="blog-meta">
                                <span>
                                    ₹{plan.price} / {plan.billingCycle === "monthly" ? "month" : "year"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ marginTop: "20px", color: "#94a3b8", fontSize: "13px" }}>
                Plan pricing is managed via Razorpay + backend config — read-only here for now.
            </p>
        </div>
    );
}

export default ManagePlans;