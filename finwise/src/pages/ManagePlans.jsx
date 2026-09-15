import { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";

function ManagePlans() {
    const [plans, setPlans] = useState([]);
    const [editingCycle, setEditingCycle] = useState(null);
    const [formData, setFormData] = useState({ name: "", price: "", description: "", features: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const apiUrl = import.meta.env.VITE_API_URL;
    const authHeaders = { Authorization: `Bearer ${localStorage.getItem("token")}` };

    const fetchPlans = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/admin/subscriptions/plans`, {
                headers: authHeaders,
            });
            setPlans(res.data.plans || []);
        } catch (requestError) {
            console.error(requestError);
            setError(requestError.response?.data?.message || "Unable to load plans.");
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const startEdit = (plan) => {
        setEditingCycle(plan.billingCycle);
        setFormData({
            name: plan.name,
            price: plan.price,
            description: plan.description,
            features: (plan.features || []).join("\n"),
        });
    };

    const cancelEdit = () => {
        setEditingCycle(null);
        setError("");
    };

    const handleSave = async (billingCycle) => {
        setSaving(true);
        setError("");
        try {
            const payload = {
                name: formData.name,
                price: Number(formData.price),
                description: formData.description,
                features: formData.features
                    .split("\n")
                    .map((f) => f.trim())
                    .filter(Boolean),
            };

            const res = await axios.patch(
                `${apiUrl}/api/admin/subscriptions/plans/${billingCycle}`,
                payload,
                { headers: authHeaders }
            );

            setPlans((prev) =>
                prev.map((p) => (p.billingCycle === billingCycle ? res.data.plan : p))
            );
            setEditingCycle(null);
        } catch (requestError) {
            console.error(requestError);
            setError(requestError.response?.data?.message || "Unable to update plan.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="manage-page">
            <div className="page-header">
                <div>
                    <h1>Subscription Plans</h1>
                    <p>Premium plans currently offered to FinWise users.</p>
                </div>
            </div>

            <div className="empty-state" style={{ padding: "16px 24px", marginBottom: "20px", textAlign: "left", minHeight: "auto" }}>
                <p style={{ margin: 0, color: "var(--admin-muted)", fontSize: "13px" }}>
                    Editing here updates the name, price, description, and features shown to users.
                    It does <strong>not</strong> change what Razorpay actually bills — that stays linked
                    to your configured Razorpay plan until billing sync is added.
                </p>
            </div>

            {error && (
                <div className="empty-state" style={{ padding: "16px 24px", marginBottom: "20px", minHeight: "auto" }}>
                    <p style={{ margin: 0, color: "#b44e42" }}>{error}</p>
                </div>
            )}

            <div className="blogs-container">
                {plans.map((plan) => (
                    <div className="blog-card" key={plan.billingCycle}>
                        {editingCycle === plan.billingCycle ? (
                            <div>
                                <label>Plan Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />

                                <label>Price (₹)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />

                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                />

                                <label>Features (one per line)</label>
                                <textarea
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    rows={4}
                                />

                                <div className="admin-actions" style={{ marginTop: "14px" }}>
                                    <button
                                        className="action-btn"
                                        disabled={saving}
                                        onClick={() => handleSave(plan.billingCycle)}
                                    >
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        className="secondary-btn"
                                        disabled={saving}
                                        onClick={cancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="blog-top">
                                    <div>
                                        <h2 className="blog-title">{plan.name}</h2>
                                        <span className="category-badge">{plan.billingCycle}</span>
                                    </div>
                                </div>

                                <p className="blog-description">{plan.description}</p>

                                {plan.features?.length > 0 && (
                                    <ul style={{ margin: "12px 0 0", paddingLeft: "18px", color: "var(--admin-muted)" }}>
                                        {plan.features.map((f, i) => (
                                            <li key={i} style={{ fontSize: "13px", marginBottom: "4px" }}>{f}</li>
                                        ))}
                                    </ul>
                                )}

                                <div className="blog-footer">
                                    <div className="blog-meta">
                                        <span>₹{plan.price} / {plan.billingCycle === "monthly" ? "month" : "year"}</span>
                                    </div>
                                    <div className="admin-actions">
                                        <button className="action-btn" onClick={() => startEdit(plan)}>
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ManagePlans;