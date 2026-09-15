import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "./Auth.css";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const Navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        try{
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();
            if (res.ok) {
               localStorage.setItem("user", JSON.stringify(data.user));
                toast.success("Account Created");
                setSuccess(true);
                setTimeout(() => Navigate("/login"), 750);
            } else {
                toast.error(data.message);
            }
         } catch(error) {
            toast.error("Something went wrong");
            console.log(error);
         } finally {
            setLoading(false);
         }
        };

        const handleGoogleSignup = async () => {
          setLoading(true);
          try {
            const result = await signInWithPopup(auth, googleProvider);
            const googleUser = result.user;
            const apiBase = import.meta.env.VITE_API_URL;

            if (!apiBase) {
              toast.error("VITE_API_URL is not set. Please set it in your .env file.");
              return;
            }

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

            const responseText = await res.text();
            let data;
            try {
              data = responseText ? JSON.parse(responseText) : null;
            } catch {
              throw new Error(`Google signup API returned a non-JSON response (${res.status}).`);
            }
            if (!res.ok) {
              throw new Error(data?.message || `Google signup API failed (${res.status}).`);
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);
            toast.success(`Welcome ${data.user.name} 👋`);
            setSuccess(true);
            setTimeout(() => Navigate("/dashboard"), 750);
          } catch (error) {
            console.error(error);
            const message = error?.code
              ? `Google sign-in failed: ${error.code}`
              : error?.message || "Google Signup Failed";
            toast.error(message);
          } finally {
            setLoading(false);
          }
        };

        return (
            <div className="auth-page">
              <div className="auth-left">
                <p className="auth-kicker">FinWise</p>
                <h1>Open a ledger<br />that pays attention.</h1>
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
                                <span>Account Opened</span>
                            </div>
                        </div>
                    )}

                    <h2>Create Account</h2>
                    <p>Join FinWise today</p>

                    <form onSubmit={handleSignup}>
                        <div className="field">
                            <input
                            id="signup-name"
                            type="text"
                            placeholder=" "
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            />
                            <label htmlFor="signup-name">Name</label>
                            <span className="field-underline"></span>
                        </div>

                        <div className="field">
                            <input
                            id="signup-email"
                            type="email"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            />
                            <label htmlFor="signup-email">Email</label>
                            <span className="field-underline"></span>
                        </div>

                        <div className="field password-box">
                          <input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                         />
                         <label htmlFor="signup-password">Password</label>
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
                              Creating account...
                            </>
                          ) : (
                            "Signup"
                          )}
                        </button>

                        <div className="divider">
                          <span>OR</span>
                        </div>

                        <button type="button" className="google-btn" onClick={handleGoogleSignup}>
                          <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            width="20"
                          />
                          Continue with Google
                        </button>
                    </form>

                    <span>
                        Already have an account? <Link to="/login">Login</Link>
                    </span>
                </div>
              </div>
            </div>
        );
}

export default Signup;