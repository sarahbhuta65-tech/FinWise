import { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";

function ManageSubscribers() {
    const [subscribers, setSubscribers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchSubscribers = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/admin/subscriptions/subscribers`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setSubscribers(res.data.subscribers || []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchSubscribers();
    }, []);

    const filteredSubscribers = subscribers.filter(
        (sub) =>
            sub.name?.toLowerCase().includes(search.toLowerCase()) ||
            sub.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="manage-page">
            <div className="page-header">
                <div>
                    <h1>Subscribers</h1>
                    <p>Users currently on a Premium plan.</p>
                </div>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search subscribers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button className="secondary-btn" onClick={() => setSearch("")}>
                        Clear
                    </button>
                )}
            </div>

            {filteredSubscribers.length === 0 ? (
                <div className="empty-state">
                    <h2>No subscribers yet.</h2>
                    <p>Premium subscribers will show up here once users upgrade.</p>
                </div>
            ) : (
                <div className="blogs-container">
                    {filteredSubscribers.map((sub) => (
                        <div className="blog-card" key={sub._id}>
                            <div className="blog-top">
                                <div>
                                    <h2 className="blog-title">{sub.name}</h2>
                                    <span className="category-badge">
                                        {sub.subscription.billingCycle}
                                    </span>
                                </div>
                            </div>

                            <p className="blog-description">{sub.email}</p>

                            <div className="blog-footer">
                                <div className="blog-meta">
                                    <span>
                                        📅 Ends{" "}
                                        {new Date(
                                            sub.subscription.currentPeriodEnd
                                        ).toLocaleDateString()}
                                    </span>
                                    {sub.subscription.cancelAtPeriodEnd && (
                                        <span>⚠ Cancels at period end</span>
                                    )}
                                </div>

                                <span
                                    className={
                                        sub.subscription.status === "active"
                                            ? "status published"
                                            : "status draft"
                                    }
                                >
                                    {sub.subscription.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ManageSubscribers;