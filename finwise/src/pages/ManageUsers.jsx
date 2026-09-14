import { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [pendingId, setPendingId] = useState(null); // disables buttons on the row being updated

    const apiUrl = import.meta.env.VITE_API_URL;
    const authHeaders = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/admin/users`, {
                    headers: authHeaders,
                });
                setUsers(response.data.users || []);
            } catch (requestError) {
                console.error("Failed to load users:", requestError);
                setError(requestError.response?.data?.message || "Unable to load users.");
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) =>
        `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())
    );

    const handleTogglePlan = async (user) => {
        const isPremium = user.subscription?.plan === "premium";
        const endpoint = isPremium ? "revoke-premium" : "grant-premium";
        setPendingId(user._id);
        setActionError("");

        try {
            const response = await axios.post(
                `${apiUrl}/api/admin/subscriptions/subscribers/${user._id}/${endpoint}`,
                {},
                { headers: authHeaders }
            );

            setUsers((prev) =>
                prev.map((u) =>
                    u._id === user._id ? { ...u, subscription: response.data.subscriber.subscription } : u
                )
            );
        } catch (requestError) {
            console.error("Failed to update plan:", requestError);
            setActionError(requestError.response?.data?.message || "Unable to update plan.");
        } finally {
            setPendingId(null);
        }
    };

    const handleDelete = async (user) => {
        const confirmed = window.confirm(`Delete ${user.name}? This cannot be undone.`);
        if (!confirmed) return;

        setPendingId(user._id);
        setActionError("");

        try {
            await axios.delete(`${apiUrl}/api/admin/users/${user._id}`, {
                headers: authHeaders,
            });
            setUsers((prev) => prev.filter((u) => u._id !== user._id));
        } catch (requestError) {
            console.error("Failed to delete user:", requestError);
            setActionError(requestError.response?.data?.message || "Unable to delete user.");
        } finally {
            setPendingId(null);
        }
    };

    return (
        <div className="manage-page">
            <div className="page-header">
                <div>
                    <h1>Users</h1>
                    <p>View and manage registered FinWise users.</p>
                </div>
            </div>

            <div className="search-bar">
                <input
                    type="search"
                    placeholder="Search users..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            {actionError && <div className="empty-state error-inline">{actionError}</div>}

            {error ? (
                <div className="empty-state">
                    <h2>Unable to load users</h2>
                    <p>{error}</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="empty-state">
                    <h2>No users found.</h2>
                    <p>Registered users will appear here.</p>
                </div>
            ) : (
                <div className="blogs-container">
                    {filteredUsers.map((user) => {
                        const isPremium = user.subscription?.plan === "premium";
                        const isPending = pendingId === user._id;

                        return (
                            <div className="blog-card" key={user._id}>
                                <div className="blog-top">
                                    <div>
                                        <h2 className="blog-title">{user.name}</h2>
                                        <span className="category-badge">{user.email}</span>
                                    </div>
                                </div>
                                <div className="blog-footer">
                                    <div className="blog-meta">
                                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                        <span className={isPremium ? "status published" : "status draft"}>
                                            {isPremium ? "Premium" : "Free"}
                                        </span>
                                    </div>
                                    <div className="admin-actions">
                                        <button
                                            type="button"
                                            className="action-btn"
                                            disabled={isPending}
                                            onClick={() => handleTogglePlan(user)}
                                        >
                                            {isPremium ? "Revoke Premium" : "Make Premium"}
                                        </button>
                                        <button
                                            type="button"
                                            className="action-btn danger"
                                            disabled={isPending}
                                            onClick={() => handleDelete(user)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ManageUsers;