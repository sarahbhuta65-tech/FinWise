import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./FinancialSummary.css";
import AddCommitmentModal from "../components/AddCommitmentModal";

function FinancialSummary() {
    const [summary, setSummary] = useState([]);
    const [stats, setStats] = useState({
        totalInvestment: 0,
        totalEMI: 0,
        totalPaid: 0,
        totalPending: 0,
        progress: 0,
        overdue: 0,
    });
    const [showModal, setShowModal] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    const calculateStats = (items) => {
        const totalPaid = items
            .filter((item) => item.paid)
            .reduce((sum, item) => sum + Number(item.amount), 0);

        const totalPending = items
            .filter((item) => !item.paid)
            .reduce((sum, item) => sum + Number(item.amount), 0);

        const totalEMI = items
            .filter((item) => item.type === "EMI")
            .reduce((sum, item) => sum + Number(item.amount), 0);

        const totalInvestment = items
            .filter((item) => ["SIP", "Savings"].includes(item.type))
            .reduce((sum, item) => sum + Number(item.amount), 0);

        const totalAmount = items.reduce(
            (sum, item) => sum + Number(item.amount),
            0
        );

        const overdue = items.filter(
            (item) => !item.paid && new Date(item.dueDate) < new Date()
        ).length;

        const progress = totalAmount
            ? Math.round((totalPaid / totalAmount) * 100)
            : 0;

        setStats({
            totalInvestment,
            totalEMI,
            totalPaid,
            totalPending,
            progress,
            overdue,
        });
    };

    const fetchSummary = async () => {
        if (!user?._id) return;

        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/financial-summary/${user._id}`
            );

            setSummary(res.data);
            calculateStats(res.data);
        } catch (err) {
            console.log("Full Error:", err);
            console.log("Response:", err.response);
            console.log("Data:", err.response?.data);
            toast.error(err.response?.data?.message || "Unable to load commitments.");
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [user]);

    const handleMarkPaid = async (id) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/financial-summary/${id}`
            );
            toast.success("Status updated successfully.");
            fetchSummary();
        } catch (err) {
            console.log(err);
            toast.error("Unable to update status.");
        }
    };

    const handleDeleteCommitment = async (id) => {
        const confirmed = window.confirm(
            "Delete this commitment? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/financial-summary/${id}`
            );
            toast.success("Commitment deleted.");
            fetchSummary();
        } catch (err) {
            console.log(err);
            toast.error("Unable to delete commitment.");
        }
    };

    return (
        <div className="financial-summary-page">
            <div className="financial-header">
                <div className="financial-title">
                    <span className="summary-icon">📅</span>
                    <div>
                        <h1>Financial Summary</h1>
                        <p>
                            Stay on top of your monthly commitments with one
                            smart planner.
                        </p>
                    </div>
                </div>

                <button className="add-btn" onClick={() => setShowModal(true)}>
                    + Add Commitment
                </button>
            </div>

            <div className="summary-cards">
                <div className="summary-card investment">
                    <span>📈</span>
                    <h4>Total Investment</h4>
                    <h2>₹{stats.totalInvestment.toLocaleString()}</h2>
                </div>

                <div className="summary-card emi">
                    <span>💳</span>
                    <h4>Total EMI</h4>
                    <h2>₹{stats.totalEMI.toLocaleString()}</h2>
                </div>

                <div className="summary-card paid">
                    <span>✅</span>
                    <h4>Paid</h4>
                    <h2>₹{stats.totalPaid.toLocaleString()}</h2>
                </div>

                <div className="summary-card pending">
                    <span>⏳</span>
                    <h4>Pending</h4>
                    <h2>₹{stats.totalPending.toLocaleString()}</h2>
                </div>
            </div>

            <div className="progress-card">
                <div className="progress-header">
                    <h3>Monthly Progress</h3>
                    <span>{stats.progress}%</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${stats.progress}%` }}
                    ></div>
                </div>
                <p>
                    {stats.overdue
                        ? `${stats.overdue} overdue commitment${
                              stats.overdue === 1 ? "" : "s"
                          } � pay them first.`
                        : "On track. Keep adding commitments to improve your cash flow."}
                </p>
            </div>

            <div className="ai-summary-card">
                <h3>🤖 AI Insight</h3>
                <p>
                    {stats.overdue
                        ? "One or more commitments are overdue. Move them to paid status or update your schedule."
                        : "Your commitments are in good shape. FinWise will keep tracking due dates and payment status for you."}
                </p>
            </div>

            <div className="commitment-list">
                {summary.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h2>No Financial Commitments Yet</h2>
                        <p>
                            Add your first EMI, SIP, bill, or savings goal to
                            start tracking your monthly finances.
                        </p>
                        <button
                            className="empty-btn"
                            onClick={() => setShowModal(true)}
                        >
                            + Add First Commitment
                        </button>
                    </div>
                ) : (
                    summary.map((item) => (
                        <div className="commitment-card" key={item._id}>
                            <div className="card-left">
                                <span className={`tag ${item.type.toLowerCase()}`}>
                                    {item.type}
                                </span>
                                <h3>{item.title}</h3>
                                <p>
                                    Due: {new Date(item.dueDate).toLocaleDateString()}
                                </p>
                                {item.notes && <p className="notes">{item.notes}</p>}
                            </div>

                            <div className="card-right">
                                <h2>?{Number(item.amount).toLocaleString()}</h2>
                                <span
                                    className={
                                        item.paid ? "status paid" : "status pending"
                                    }
                                >
                                    {item.paid ? "Paid" : "Pending"}
                                </span>
                                <div className="commitment-actions">
                                    <button
                                        className="primary-btn"
                                        onClick={() => handleMarkPaid(item._id)}
                                        disabled={item.paid}
                                    >
                                        {item.paid ? "Completed" : "Mark Paid"}
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteCommitment(item._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <AddCommitmentModal
                    closeModal={() => setShowModal(false)}
                    onSave={async (data) => {
                        try {
                            await axios.post(
                                `${import.meta.env.VITE_API_URL}/api/financial-summary/${user._id}`,
                                data
                            );
                            toast.success("Commitment added successfully.");
                            fetchSummary();
                            setShowModal(false);
                        } catch (err) {
                            console.log(err);
                            toast.error("Unable to save commitment.");
                        }
                    }}
                />
            )}
        </div>
    );
}

export default FinancialSummary;
