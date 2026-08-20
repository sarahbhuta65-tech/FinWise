import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./FinancialSummary.css";
import AddCommitmentModal from "../components/AddCommitmentModal";

function FinancialSummary() {
    const [summary, setSummary] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    // =========================================================
    // USER
    // =========================================================

    const getUser = () => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch (error) {
            console.error("User data error:", error);
            return null;
        }
    };

    const user = getUser();

    // =========================================================
    // CURRENT MONTH / YEAR
    // =========================================================

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthName = currentDate.toLocaleString("default", {
        month: "long",
    });

    // =========================================================
    // FETCH FINANCIAL SUMMARY
    // =========================================================

    const fetchSummary = async () => {
        const currentUser = getUser();

        if (!currentUser?._id) {
            return;
        }

        try {
            setLoading(true);

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/financial-summary/${currentUser._id}`,
                {
                    params: {
                        month: currentMonth + 1,
                        year: currentYear,
                    },
                }
            );

            if (Array.isArray(response.data)) {
                setSummary(response.data);
            } else {
                setSummary([]);
            }
        } catch (error) {
            console.error("Financial Summary Error:", error);
            console.error("Response:", error.response);
            console.error("Data:", error.response?.data);

            toast.error(
                error.response?.data?.message ||
                    "Unable to load financial commitments."
            );

            setSummary([]);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD SUMMARY WHEN MONTH CHANGES
    // =========================================================

    useEffect(() => {
        fetchSummary();
    }, [currentMonth, currentYear]);

    // =========================================================
    // DATE HELPERS
    // =========================================================

    const getDateOnly = (date) => {
        if (!date) {
            return null;
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return null;
        }

        return new Date(
            value.getFullYear(),
            value.getMonth(),
            value.getDate()
        );
    };

    const today = getDateOnly(new Date());

    const formatDate = (date) => {
        if (!date) {
            return "Date not available";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "Date not available";
        }

        return value.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // =========================================================
    // COMMITMENT STATUS
    // =========================================================

    const getCommitmentStatus = (item) => {
        if (item.paid) {
            return "paid";
        }

        const dueDate = getDateOnly(item.dueDate);

        if (!dueDate || !today) {
            return "upcoming";
        }

        if (dueDate < today) {
            return "overdue";
        }

        if (dueDate.getTime() === today.getTime()) {
            return "today";
        }

        return "upcoming";
    };

    // =========================================================
    // DAYS DIFFERENCE
    // =========================================================

    const getDaysDifference = (date) => {
        const dueDate = getDateOnly(date);

        if (!dueDate || !today) {
            return 0;
        }

        const difference =
            dueDate.getTime() - today.getTime();

        return Math.round(
            difference / (1000 * 60 * 60 * 24)
        );
    };

    // =========================================================
    // CURRENT MONTH DATA
    // =========================================================

    const monthlySummary = summary;

    // =========================================================
    // STATS
    // =========================================================

    const stats = useMemo(() => {
        const totalAmount = monthlySummary.reduce(
            (sum, item) =>
                sum + Number(item.amount || 0),
            0
        );

        const totalPaid = monthlySummary
            .filter((item) => item.paid)
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount || 0),
                0
            );

        const totalPending = monthlySummary
            .filter((item) => !item.paid)
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount || 0),
                0
            );

        const totalInvestment = monthlySummary
            .filter((item) =>
                ["SIP", "Savings"].includes(item.type)
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount || 0),
                0
            );

        const totalEMI = monthlySummary
            .filter((item) => item.type === "EMI")
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount || 0),
                0
            );

        const overdue = monthlySummary.filter(
            (item) =>
                getCommitmentStatus(item) === "overdue"
        );

        const dueToday = monthlySummary.filter(
            (item) =>
                getCommitmentStatus(item) === "today"
        );

        const upcoming = monthlySummary.filter(
            (item) =>
                getCommitmentStatus(item) === "upcoming"
        );

        const paid = monthlySummary.filter(
            (item) => item.paid
        );

        const progress =
            totalAmount > 0
                ? Math.round(
                      (totalPaid / totalAmount) * 100
                  )
                : 0;

        return {
            totalAmount,
            totalPaid,
            totalPending,
            totalInvestment,
            totalEMI,
            overdue,
            dueToday,
            upcoming,
            paid,
            progress,
        };
    }, [monthlySummary]);

    // =========================================================
    // MONTH NAVIGATION
    // =========================================================

    const changeMonth = (direction) => {
        setCurrentDate(
            new Date(
                currentYear,
                currentMonth + direction,
                1
            )
        );
    };

    // =========================================================
    // MARK PAYMENT AS PAID / UNPAID
    // =========================================================

    const handleMarkPaid = async (id) => {
        if (!id) {
            toast.error("Invalid commitment.");
            return;
        }

        try {
            setProcessingId(id);

            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/financial-summary/${id}`,
                {},
                {
                    params: {
                        month: currentMonth + 1,
                        year: currentYear,
                    },
                }
            );

            const message =
                response.data?.message ||
                "Payment status updated successfully.";

            toast.success(message);

            // Refresh current month's data
            await fetchSummary();
        } catch (error) {
            console.error(
                "Payment Status Error:",
                error
            );

            console.error(
                "Response:",
                error.response
            );

            console.error(
                "Data:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                    "Unable to update payment status."
            );
        } finally {
            setProcessingId(null);
        }
    };

    // =========================================================
    // DELETE COMMITMENT
    // =========================================================

    const handleDeleteCommitment = async (id) => {
        if (!id) {
            toast.error("Invalid commitment.");
            return;
        }

        const confirmed = window.confirm(
            "Delete this commitment? This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(id);

            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/financial-summary/${id}`
            );

            toast.success(
                "Commitment deleted successfully."
            );

            await fetchSummary();
        } catch (error) {
            console.error(
                "Delete Commitment Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                    "Unable to delete commitment."
            );
        } finally {
            setProcessingId(null);
        }
    };

    // =========================================================
    // STATUS LABEL
    // =========================================================

    const getStatusLabel = (item) => {
        const status = getCommitmentStatus(item);

        if (status === "paid") {
            return "Paid";
        }

        if (status === "overdue") {
            const days = Math.abs(
                getDaysDifference(item.dueDate)
            );

            return `Overdue by ${days} ${
                days === 1 ? "day" : "days"
            }`;
        }

        if (status === "today") {
            return "Due Today";
        }

        const days = getDaysDifference(
            item.dueDate
        );

        if (days === 1) {
            return "Due Tomorrow";
        }

        return `Due in ${days} days`;
    };

    // =========================================================
    // STATUS ICON
    // =========================================================

    const getStatusIcon = (item) => {
        const status = getCommitmentStatus(item);

        if (status === "paid") {
            return "✓";
        }

        if (
            status === "overdue" ||
            status === "today"
        ) {
            return "!";
        }

        return "○";
    };

    // =========================================================
    // COMMITMENT CARD
    // =========================================================

    const renderCommitment = (item) => {
        const status = getCommitmentStatus(item);

        const isProcessing =
            processingId === item._id;

        return (
            <div
                className={`commitment-card status-${status}`}
                key={item._id}
            >
                <div className="commitment-main">

                    <div className="commitment-top">

                        <span
                            className={`commitment-type ${
                                item.type
                                    ?.toLowerCase()
                                    .replace(/\s+/g, "-") ||
                                ""
                            }`}
                        >
                            {item.type}
                        </span>

                        <span
                            className={`commitment-status ${status}`}
                        >
                            <span className="status-icon">
                                {getStatusIcon(item)}
                            </span>

                            {getStatusLabel(item)}
                        </span>

                    </div>

                    <h3>
                        {item.title || "Untitled Commitment"}
                    </h3>

                    <p className="commitment-date">
                        Due {formatDate(item.dueDate)}
                    </p>

                    {item.notes && (
                        <p className="commitment-notes">
                            {item.notes}
                        </p>
                    )}

                </div>

                <div className="commitment-side">

                    <div className="commitment-amount">
                        ₹
                        {Number(
                            item.amount || 0
                        ).toLocaleString("en-IN")}
                    </div>

                    <div className="commitment-actions">

                        {!item.paid && (
                            <button
                                className="mark-paid-btn"
                                disabled={isProcessing}
                                onClick={() =>
                                    handleMarkPaid(
                                        item._id
                                    )
                                }
                            >
                                {isProcessing
                                    ? "Updating..."
                                    : "Mark Paid"}
                            </button>
                        )}

                        <button
                            className="delete-commitment-btn"
                            disabled={isProcessing}
                            onClick={() =>
                                handleDeleteCommitment(
                                    item._id
                                )
                            }
                        >
                            {isProcessing
                                ? "..."
                                : "Delete"}
                        </button>

                    </div>

                </div>
            </div>
        );
    };

    // =========================================================
    // ADD COMMITMENT
    // =========================================================

    const handleSaveCommitment = async (data) => {
        const currentUser = getUser();

        if (!currentUser?._id) {
            toast.error("Please login first.");
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/financial-summary/${currentUser._id}`,
                data
            );

            toast.success(
                "Commitment added successfully."
            );

            setShowModal(false);

            await fetchSummary();
        } catch (error) {
            console.error(
                "Add Commitment Error:",
                error
            );

            console.error(
                "Response:",
                error.response
            );

            console.error(
                "Data:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                    "Unable to save commitment."
            );
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="financial-summary-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="financial-header">

                <div>
                    <div className="financial-heading">

                        <span className="summary-icon">
                            ◷
                        </span>

                        <div>
                            <h1>
                                Financial Summary
                            </h1>

                            <p>
                                Keep track of your
                                commitments, payments
                                and upcoming financial
                                tasks.
                            </p>
                        </div>

                    </div>
                </div>

                <button
                    className="add-btn"
                    onClick={() =>
                        setShowModal(true)
                    }
                >
                    <span>+</span>
                    Add Commitment
                </button>

            </div>

            {/* =================================================
                MONTH SELECTOR
            ================================================= */}

            <div className="month-selector">

                <button
                    className="month-arrow"
                    onClick={() =>
                        changeMonth(-1)
                    }
                    aria-label="Previous month"
                >
                    ‹
                </button>

                <div className="month-info">

                    <span>
                        Financial Overview
                    </span>

                    <strong>
                        {monthName} {currentYear}
                    </strong>

                </div>

                <button
                    className="month-arrow"
                    onClick={() =>
                        changeMonth(1)
                    }
                    aria-label="Next month"
                >
                    ›
                </button>

            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
                <div className="clean-state">
                    <span>○</span>

                    <div>
                        <h3>
                            Loading financial summary...
                        </h3>

                        <p>
                            Please wait while your
                            commitments are loaded.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="summary-stats">

                        <div className="stat-card total">

                            <div className="stat-icon">
                                ₹
                            </div>

                            <div>
                                <span>
                                    Total Commitments
                                </span>

                                <strong>
                                    ₹
                                    {stats.totalAmount.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div className="stat-card paid">

                            <div className="stat-icon">
                                ✓
                            </div>

                            <div>
                                <span>
                                    Paid
                                </span>

                                <strong>
                                    ₹
                                    {stats.totalPaid.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div className="stat-card pending">

                            <div className="stat-icon">
                                ○
                            </div>

                            <div>
                                <span>
                                    Pending
                                </span>

                                <strong>
                                    ₹
                                    {stats.totalPending.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div className="stat-card overdue">

                            <div className="stat-icon">
                                !
                            </div>

                            <div>
                                <span>
                                    Overdue
                                </span>

                                <strong>
                                    {stats.overdue.length}
                                </strong>
                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        NEEDS ATTENTION
                    ================================================= */}

                    {(stats.overdue.length > 0 ||
                        stats.dueToday.length > 0) && (

                        <section className="attention-section">

                            <div className="section-heading">

                                <div>

                                    <span className="section-eyebrow">
                                        Action required
                                    </span>

                                    <h2>
                                        Needs Your Attention
                                    </h2>

                                    <p>
                                        These commitments
                                        need to be taken
                                        care of.
                                    </p>

                                </div>

                            </div>

                            <div className="commitment-list">

                                {[
                                    ...stats.overdue,
                                    ...stats.dueToday,
                                ].map(
                                    renderCommitment
                                )}

                            </div>

                        </section>
                    )}

                    {/* =================================================
                        MONTHLY PROGRESS
                    ================================================= */}

                    <section className="progress-section">

                        <div className="progress-card">

                            <div className="progress-top">

                                <div>

                                    <span className="section-eyebrow">
                                        Monthly progress
                                    </span>

                                    <h2>
                                        You're{" "}
                                        {stats.progress}%
                                        through your
                                        commitments
                                    </h2>

                                </div>

                                <strong>
                                    {stats.progress}%
                                </strong>

                            </div>

                            <div className="progress-track">

                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${stats.progress}%`,
                                    }}
                                />

                            </div>

                            <div className="progress-details">

                                <span>
                                    <i className="dot paid-dot" />

                                    Paid ₹
                                    {stats.totalPaid.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>

                                <span>
                                    <i className="dot pending-dot" />

                                    Pending ₹
                                    {stats.totalPending.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>

                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        UPCOMING
                    ================================================= */}

                    <section className="commitment-section">

                        <div className="section-heading">

                            <div>

                                <span className="section-eyebrow">
                                    Coming up
                                </span>

                                <h2>
                                    Upcoming Commitments
                                </h2>

                                <p>
                                    Payments and
                                    investments you need
                                    to take care of
                                    next.
                                </p>

                            </div>

                            <span className="section-count">
                                {stats.upcoming.length}
                            </span>

                        </div>

                        {stats.upcoming.length > 0 ? (

                            <div className="commitment-list">

                                {stats.upcoming.map(
                                    renderCommitment
                                )}

                            </div>

                        ) : (

                            <div className="clean-state">

                                <span>✓</span>

                                <div>

                                    <h3>
                                        You're all caught up
                                    </h3>

                                    <p>
                                        There are no upcoming
                                        commitments for this
                                        month.
                                    </p>

                                </div>

                            </div>

                        )}

                    </section>

                    {/* =================================================
                        COMPLETED
                    ================================================= */}

                    <section className="commitment-section completed-section">

                        <div className="section-heading">

                            <div>

                                <span className="section-eyebrow">
                                    Completed
                                </span>

                                <h2>
                                    Paid Commitments
                                </h2>

                                <p>
                                    Financial commitments
                                    you've already
                                    completed this month.
                                </p>

                            </div>

                            <span className="section-count">
                                {stats.paid.length}
                            </span>

                        </div>

                        {stats.paid.length > 0 ? (

                            <div className="commitment-list">

                                {stats.paid.map(
                                    renderCommitment
                                )}

                            </div>

                        ) : (

                            <div className="clean-state">

                                <span>○</span>

                                <div>

                                    <h3>
                                        No payments
                                        completed yet
                                    </h3>

                                    <p>
                                        Mark a commitment
                                        as paid once
                                        you've completed
                                        it.
                                    </p>

                                </div>

                            </div>

                        )}

                    </section>

                    {/* =================================================
                        EMPTY MONTH
                    ================================================= */}

                    {monthlySummary.length === 0 && (

                        <section className="empty-state">

                            <div className="empty-state-icon">
                                +
                            </div>

                            <h2>
                                Nothing planned for{" "}
                                {monthName}
                            </h2>

                            <p>
                                Add your EMI, SIP, bills
                                or savings commitments
                                to start tracking your
                                monthly finances.
                            </p>

                            <button
                                className="empty-btn"
                                onClick={() =>
                                    setShowModal(true)
                                }
                            >
                                Add Your First
                                Commitment
                            </button>

                        </section>

                    )}
                </>
            )}

            {/* =================================================
                ADD COMMITMENT MODAL
            ================================================= */}

            {showModal && (
                <AddCommitmentModal
                    closeModal={() =>
                        setShowModal(false)
                    }
                    onSave={handleSaveCommitment}
                />
            )}

        </div>
    );
}

export default FinancialSummary;