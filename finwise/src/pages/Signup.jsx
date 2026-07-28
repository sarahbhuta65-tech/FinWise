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
    const Navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

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
                Navigate("/login");
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

            const data = await res.json();
            if (!res.ok) {
              toast.error(data.message || "Google Signup Failed");
              return;
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            toast.success(`Welcome ${data.user.name} 👋`);
            Navigate("/dashboard");
          } catch (error) {
            console.error(error);
            toast.error("Google Signup Failed");
          } finally {
            setLoading(false);
          }
        };

        return (
            <div className="auth-page">
              <div className="auth-left">
                <h1>FinWise</h1>
                <p>Smart finance management made simple.</p>

                <div className="auth-features">
                    <div>📊 Track expenses easily</div>
                    <div>💰 Plan savings goals</div>
                    <div>🤖 AI financial guidance</div>
                </div>
              </div>

              <div className="auth-right">
                <div className="auth-card">
                    <h2>Create Account</h2>
                    <p>Join FinWise today</p>

                    <form onSubmit={handleSignup}>
                        <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        />

                        <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="password-box">
                          <input
                            type="password"
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
                        
                        <button type="submit" disabled={loading}>
                          {loading ? "Creating account..." : "Signup"}
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
                        Already have a account? <Link to="/login">Login</Link>
                    </span>
                </div>
              </div>
            </div>
        );
}

export default Signup;
