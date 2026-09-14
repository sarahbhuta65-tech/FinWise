import { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";

function ManagePayments() {
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/admin/subscriptions/payments`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setPayments(res.data.payments || []);
            } catch (requestError) {
                console.error(requestError);
                setError(requestError.response?.data?.message || "Unable to load payments.");
            }
        };
        fetchPayments();
    }, []);

    return (
        <div className="manage-page">
            <div className="page-header">
                <div>
                    <h1>Payments</h1>
                    <p>Captured Razorpay payments from Premium subscribers.</p>
                </div>
            </div>

            {error ? (
                <div className="empty-state">
                    <h2>Unable to load payments</h2>
                    <p>{error}</p>
                </div>
            ) : payments.length === 0 ? (
                <div className="empty-state">
                    <h2>No payments yet.</h2>
                    <p>Captured payments will appear here once the webhook is live.</p>
                </div>
            ) : (
                <div className="blogs-container">
                    {payments.map((payment) => (
                        <div className="blog-card" key={payment._id}>
                            <div className="blog-top">
                                <div>
                                    <h2 className="blog-title">{payment.user?.name || "Unknown user"}</h2>
                                    <span className="category-badge">{payment.user?.email}</span>
                                </div>
                            </div>
                            <div className="blog-footer">
                                <div className="blog-meta">
                                    <span>₹{payment.amount} · {payment.billingCycle}</span>
                                    <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className="status published">{payment.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ManagePayments;