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
                    if (setUser) setUser(data.user);
                } else {
                    // Successful status but no user payload
                    console.warn("Login returned no user payload", { status: res.status, data });
                }
                toast.success("Login successful");
                Navigate("/dashboard");
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

                if (setUser) {
                    setUser(data.user);
                }

                toast.success(`Welcome ${data.user.name} 👋`);

                Navigate("/dashboard");

            } catch (error) {
                console.error(error);
                toast.error("Google Login Failed");
            }
        };


        return (
            <div className="auth-page">
              <div className="auth-left">
                <h1>Finwise</h1>
                <p>Smart finance management made simple.</p>

                <div className="auth-features">
                    <div>📊 Track expenses easily</div>
                    <div>💰 Plan savings goals</div>
                    <div>🤖 AI financial guidance</div>
                </div>
              </div>

              <div className="auth-right">
                <div className="auth-card">
                    <h2>Welcome Back</h2>
                    <p>Login to continue</p>

                    <form onSubmit={handleLogin}>
                        <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="password-box">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                         />

                         <span 
                           className="toggle-password"
                           onClick={() => setShowPassword(!showPassword)}
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