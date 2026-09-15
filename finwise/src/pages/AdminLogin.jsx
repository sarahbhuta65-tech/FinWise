import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Auth.css";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiBase = import.meta.env.VITE_API_URL;

            if (!apiBase) {
                toast.error("VITE_API_URL is not set.");
                return;
            }

            const res = await fetch(`${apiBase}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const text = await res.text();

            let data = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch (error) {
                console.error("Invalid login response:", error);
            }

            if (!res.ok) {
                toast.error(
                    data?.message || "Login failed"
                );
                return;
            }

            if (!data?.user || !data?.token) {
                toast.error("Invalid login response.");
                return;
            }

            // Check admin authorization
            if (!data.user.isAdmin) {
                toast.error(
                    "You don't have permission to access the Admin Panel."
                );
                return;
            }

            // Save authenticated admin
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "adminLoggedIn",
                "true"
            );

            setSuccess(true);

            toast.success("Admin login successful");

            setTimeout(() => {
                navigate("/admin-dashboard", { replace: true });
            }, 750);

        } catch (error) {
            console.error("Admin login error:", error);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-left">

                <p className="auth-kicker">
                    FinWise Admin
                </p>

                <h1>
                    Manage your<br />
                    financial platform.
                </h1>

                <p className="auth-sub">
                    Secure administration for FinWise.
                </p>

                <div className="ledger-strip">

                    <div
                        className="ledger-row"
                        style={{ animationDelay: "0.55s" }}
                    >
                        <span>User management</span>
                        <span className="ledger-amt">
                            — control
                        </span>
                    </div>

                    <div
                        className="ledger-row"
                        style={{ animationDelay: "0.7s" }}
                    >
                        <span>Subscriptions</span>
                        <span className="ledger-amt">
                            — manage
                        </span>
                    </div>

                    <div
                        className="ledger-row"
                        style={{ animationDelay: "0.85s" }}
                    >
                        <span>Website content</span>
                        <span className="ledger-amt">
                            — oversee
                        </span>
                    </div>

                </div>

            </div>

            <div className="auth-right">

                <div className="auth-card">

                    {success && (
                        <div
                            className="stamp-overlay"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="stamp">
                                <span>Verified</span>
                            </div>
                        </div>
                    )}

                    <h2>
                        Admin Login
                    </h2>

                    <p>
                        Authorized personnel only
                    </p>

                    <form onSubmit={handleAdminLogin}>

                        <div className="field">

                            <input
                                id="admin-email"
                                type="email"
                                placeholder=" "
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                            <label htmlFor="admin-email">
                                Email
                            </label>

                            <span className="field-underline"></span>

                        </div>

                        <div className="field password-box">

                            <input
                                id="admin-password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder=" "
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                            <label htmlFor="admin-password">
                                Password
                            </label>

                            <span className="field-underline"></span>

                            <span
                                className="toggle-password"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                role="button"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword
                                    ? "🙈"
                                    : "👁"}
                            </span>

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={
                                loading
                                    ? "login-btn loading"
                                    : "login-btn"
                            }
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Verifying...
                                </>
                            ) : (
                                "Access Admin Panel"
                            )}
                        </button>

                    </form>

                    <span>
                        <Link to="/login">
                            ← Back to FinWise Login
                        </Link>
                    </span>

                </div>

            </div>

        </div>
    );
}

export default AdminLogin;