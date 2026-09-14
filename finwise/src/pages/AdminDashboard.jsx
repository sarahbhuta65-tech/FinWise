import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import toast from "react-hot-toast";
import "./Admin.css";
import DashboardChart from "./DashboardChart";
import SignupsTrendChart from "./SignupsTrendChart";
import { PLAN_PRICES } from "../utils/PlanConfig";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard({ darkMode, setDarkMode }) {
    const [blogs, setBlogs] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const [blogsResponse, faqsResponse, usersResponse] =
                    await Promise.all([
                        fetch(`${import.meta.env.VITE_API_URL}/api/blogs/admin/all`, { headers }),
                        fetch(`${import.meta.env.VITE_API_URL}/api/faqs/admin/all`, { headers }),
                        fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers }),
                    ]);

                if (!blogsResponse.ok || !faqsResponse.ok || !usersResponse.ok) {
                    throw new Error("Failed to fetch admin data");
                }

                const blogsData = await blogsResponse.json();
                const faqsData = await faqsResponse.json();
                const usersData = await usersResponse.json();

                setBlogs(blogsData);
                setFaqs(faqsData);
                setUsers(usersData.users || []);
            } catch (error) {
                console.error("Admin dashboard fetch error:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const latestBlog = blogs.length > 0 ? blogs[0] : null;
    const latestFaq = faqs.length > 0 ? faqs[0] : null;

    const publishedBlogs = blogs.filter((blog) => blog.status === "Published").length;
    const draftBlogs = blogs.filter((blog) => blog.status === "Draft").length;
    const publishedFaqs = faqs.filter((faq) => faq.status === "Published").length;
    const draftFaqs = faqs.filter((faq) => faq.status === "Draft").length;

    const totalPublished = publishedBlogs + publishedFaqs;
    const totalDrafts = draftBlogs + draftFaqs;

    // ---- Growth + revenue ledger, derived from users[].createdAt / subscription ----
    const ledger = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        const isInMonth = (dateStr, month, year) => {
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return d.getMonth() === month && d.getFullYear() === year;
        };

        const newThisMonth = users.filter((u) => isInMonth(u.createdAt, thisMonth, thisYear)).length;
        const newLastMonth = users.filter((u) => isInMonth(u.createdAt, lastMonth, lastMonthYear)).length;

        const signupDelta =
            newLastMonth === 0
                ? newThisMonth > 0
                    ? 100
                    : 0
                : Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100);

        const activePremium = users.filter(
            (u) => u.subscription?.plan === "premium" && u.subscription?.status === "active"
        );
        const monthlySubs = activePremium.filter((u) => u.subscription?.billingCycle === "monthly");
        const yearlySubs = activePremium.filter((u) => u.subscription?.billingCycle === "yearly");
        const freeUsers = users.length - activePremium.length;

        const mrr =
            monthlySubs.length * PLAN_PRICES.monthly +
            yearlySubs.length * (PLAN_PRICES.yearly / 12);

        // Last 6 months of signups, oldest -> newest, for the trend chart
        const trend = Array.from({ length: 6 }).map((_, idx) => {
            const d = new Date(thisYear, thisMonth - (5 - idx), 1);
            const count = users.filter((u) => isInMonth(u.createdAt, d.getMonth(), d.getFullYear())).length;
            return {
                label: d.toLocaleString("default", { month: "short" }),
                count,
            };
        });

        // Most recently started active subscription, for Recent Activity
        const latestSubscriber = [...activePremium].sort(
            (a, b) => new Date(b.subscription?.startDate || 0) - new Date(a.subscription?.startDate || 0)
        )[0];

        return {
            totalUsers: users.length,
            newThisMonth,
            newLastMonth,
            signupDelta,
            activePremiumCount: activePremium.length,
            monthlyCount: monthlySubs.length,
            yearlyCount: yearlySubs.length,
            freeUsers,
            mrr,
            trend,
            latestSubscriber,
        };
    }, [users]);

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <div className="admin-main">
                <AdminTopbar darkMode={darkMode} setDarkMode={setDarkMode} />

                <div className="dashboard-content">

                    {/* ---- Growth ledger: the headline numbers admins actually asked for ---- */}
                    <div className="ledger-strip">
                        <div className="ledger-entry">
                            <span className="ledger-label">Total Users</span>
                            <span className="ledger-value">{loading ? "—" : ledger.totalUsers}</span>
                        </div>

                        <div className="ledger-entry">
                            <span className="ledger-label">New This Month</span>
                            <span className="ledger-value">{loading ? "—" : ledger.newThisMonth}</span>
                            {!loading && (
                                <span className={`ledger-delta ${ledger.signupDelta >= 0 ? "up" : "down"}`}>
                                    {ledger.signupDelta >= 0 ? "▲" : "▼"} {Math.abs(ledger.signupDelta)}% vs last month
                                </span>
                            )}
                        </div>

                        <div className="ledger-entry">
                            <span className="ledger-label">Premium Subscribers</span>
                            <span className="ledger-value">{loading ? "—" : ledger.activePremiumCount}</span>
                            {!loading && (
                                <span className="ledger-delta neutral">
                                    {ledger.monthlyCount} monthly · {ledger.yearlyCount} yearly
                                </span>
                            )}
                        </div>

                        <div className="ledger-entry">
                            <span className="ledger-label">Est. Monthly Revenue</span>
                            <span className="ledger-value">
                                {loading ? "—" : `₹${Math.round(ledger.mrr).toLocaleString("en-IN")}`}
                            </span>
                        </div>
                    </div>

                    {/* ---- Content stats: secondary, demoted from the old primary row ---- */}
                    <div className="admin-cards admin-cards--secondary">
                        <div className="admin-card">
                            <h3>Blogs</h3>
                            <h1>{blogs.length}</h1>
                            <p>Total Blogs</p>
                        </div>

                        <div className="admin-card">
                            <h3>FAQs</h3>
                            <h1>{faqs.length}</h1>
                            <p>Total FAQs</p>
                        </div>

                        <div className="admin-card">
                            <h3>Published</h3>
                            <h1>{totalPublished}</h1>
                            <p>Total Published</p>
                        </div>

                        <div className="admin-card">
                            <h3>Drafts</h3>
                            <h1>{totalDrafts}</h1>
                            <p>Total Drafts</p>
                        </div>
                    </div>

                    {/* ---- Growth chart + plan breakdown ---- */}
                    <div className="growth-row">
                        <div className="chart-card growth-chart-card">
                            <h2>Signups, Last 6 Months</h2>
                            <SignupsTrendChart data={ledger.trend} loading={loading} />
                        </div>

                        <div className="chart-card plan-ledger-card">
                            <h2>Plan Breakdown</h2>
                            <table className="plan-ledger-table">
                                <thead>
                                    <tr>
                                        <th>Plan</th>
                                        <th>Users</th>
                                        <th>Est. Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <span className="plan-chip monthly">Premium Monthly</span>
                                        </td>
                                        <td>{loading ? "—" : ledger.monthlyCount}</td>
                                        <td>
                                            {loading
                                                ? "—"
                                                : `₹${(ledger.monthlyCount * PLAN_PRICES.monthly).toLocaleString("en-IN")}/mo`}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span className="plan-chip yearly">Premium Yearly</span>
                                        </td>
                                        <td>{loading ? "—" : ledger.yearlyCount}</td>
                                        <td>
                                            {loading
                                                ? "—"
                                                : `₹${(ledger.yearlyCount * PLAN_PRICES.yearly).toLocaleString("en-IN")}/yr`}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span className="plan-chip free">Free</span>
                                        </td>
                                        <td>{loading ? "—" : ledger.freeUsers}</td>
                                        <td>—</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ---- Recent Activity: now includes the latest subscriber ---- */}
                    <div className="activity-card">
                        <h2>Recent Activity</h2>

                        {ledger.latestSubscriber && (
                            <div
                                className="activity-item"
                                onClick={() => navigate("/admin/subscriptions/subscribers")}
                            >
                                <div className="activity-icon">₹</div>
                                <div className="activity-content">
                                    <h4>Newest Subscriber</h4>
                                    <p>
                                        {ledger.latestSubscriber.name} —{" "}
                                        {ledger.latestSubscriber.subscription?.billingCycle === "yearly"
                                            ? "Premium Yearly"
                                            : "Premium Monthly"}
                                    </p>
                                    <span>
                                        {ledger.latestSubscriber.subscription?.startDate
                                            ? new Date(ledger.latestSubscriber.subscription.startDate).toLocaleDateString()
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        )}

                        {latestBlog && (
                            <div className="activity-item" onClick={() => navigate("/admin/blogs")}>
                                <div className="activity-icon">📝</div>
                                <div className="activity-content">
                                    <h4>Latest Blog</h4>
                                    <p>{latestBlog.title}</p>
                                    <span>{latestBlog.publishDate}</span>
                                </div>
                            </div>
                        )}

                        {latestFaq && (
                            <div className="activity-item" onClick={() => navigate("/admin/faqs")}>
                                <div className="activity-icon">❓</div>
                                <div className="activity-content">
                                    <h4>Latest FAQ</h4>
                                    <p>{latestFaq.question}</p>
                                    <span>{latestFaq.publishDate}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <DashboardChart blogs={blogs} faqs={faqs} />

                    <div className="quick-actions">
                        <h2>Quick Actions</h2>
                        <div className="action-buttons">
                            <button onClick={() => navigate("/admin/blogs/create")}>Add Blogs</button>
                            <button onClick={() => navigate("/admin/faqs/create")}>Add FAQs</button>
                            <button onClick={() => navigate("/admin/subscriptions/subscribers")}>View Subscribers</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;