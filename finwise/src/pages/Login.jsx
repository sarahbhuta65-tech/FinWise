import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "./Auth.css";

function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const Navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try{
            const apiBase = import.meta.env.VITE_API_URL;
            if (!apiBase) {
                toast.error("VITE_API_URL is not set. Please set it in your .env file.");
                return;
            }

            const res = await fetch(`${apiBase}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            // Safely parse JSON (handle empty or non-JSON responses)
            let data = null;
            const text = await res.text();
            try {
                data = text ? JSON.parse(text) : null;
            } catch (parseErr) {
                console.warn("Failed to parse JSON from login response:", parseErr);
            }

            if (res.ok) {
                if (data && data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);

                if (setUser) setUser(data.user);
            } else {
                    // Successful status but no user payload
                    console.warn("Login returned no user payload", { status: res.status, data });
                }
                toast.success("Login successful");
                setSuccess(true);
                setTimeout(() => Navigate("/dashboard"), 750);
            } else {
                const message = data && data.message ? data.message : `Login failed (status ${res.status})`;
                toast.error(message);
            }
         } catch(error) {
            toast.error("Something went wrong");
            console.log(error);
         } finally {
            setLoading(false);
         }
        };

       const handleGoogleLogin = async () => {
            try {
                // Firebase Google Login
                const result = await signInWithPopup(auth, googleProvider);
                const googleUser = result.user;

                const apiBase = import.meta.env.VITE_API_URL;

                // Send Google user to backend
                const res = await fetch(`${apiBase}/api/auth/google-login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: googleUser.displayName,
                        email: googleUser.email,
                        photo: googleUser.photoURL,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    toast.error(data.message || "Google Login Failed");
                    return;
                }

                // Save MongoDB user
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);
                if (setUser) {
                    setUser(data.user);
                }

                toast.success(`Welcome ${data.user.name} 👋`);
                setSuccess(true);
                setTimeout(() => Navigate("/dashboard"), 750);

            } catch (error) {
                console.error(error);
                toast.error("Google Login Failed");
            }
        };


        return (
            <div className="auth-page">
              <div className="auth-left">
                <p className="auth-kicker">FinWise</p>
                <h1>Every rupee,<br />on the record.</h1>
                <p className="auth-sub">Smart finance management made simple.</p>

                <div className="ledger-strip">
                    <div className="ledger-row" style={{ animationDelay: "0.55s" }}>
                        <span>Expense tracking</span>
                        <span className="ledger-amt">— live</span>
                    </div>
                    <div className="ledger-row" style={{ animationDelay: "0.7s" }}>
                        <span>Savings goals</span>
                        <span className="ledger-amt">— planned</span>
                    </div>
                    <div className="ledger-row" style={{ animationDelay: "0.85s" }}>
                        <span>AI financial guidance</span>
                        <span className="ledger-amt">— on call</span>
                    </div>
                </div>
              </div>

              <div className="auth-right">
                <div className="auth-card">
                    {success && (
                        <div className="stamp-overlay" role="status" aria-live="polite">
                            <div className="stamp">
                                <span>Verified</span>
                            </div>
                        </div>
                    )}

                    <h2>Welcome Back</h2>
                    <p>Login to continue</p>

                    <form onSubmit={handleLogin}>
                        <div className="field">
                            <input
                            id="login-email"
                            type="email"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            />
                            <label htmlFor="login-email">Email</label>
                            <span className="field-underline"></span>
                        </div>

                        <div className="field password-box">
                          <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                         />
                         <label htmlFor="login-password">Password</label>
                         <span className="field-underline"></span>

                         <span
                           className="toggle-password"
                           onClick={() => setShowPassword(!showPassword)}
                           role="button"
                           aria-label={showPassword ? "Hide password" : "Show password"}
                         >
                            {showPassword ? "🙈" : "👁"}
                        </span>
                        </div>

                        <button type="submit" disabled={loading} className={loading ? "login-btn loading" : "login-btn"}>
                          {loading ? (
                            <>
                              <span className="spinner"></span>
                              Logging in...
                            </>
                          ) : (
                            "Login"
                          )}
                        </button>

                        <div className="divider">
                            <span>OR</span>
                        </div>

                        <button
                            type="button"
                            className="google-btn"
                            onClick={handleGoogleLogin}
                        >
                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google"
                                width="20"
                            />
                            Continue with Google
                        </button>
                    </form>

                    <span>
                        Don't have an account? <Link to="/signup">Signup</Link>
                    </span>
                </div>
              </div>
            </div>
        );
}

export default Login;