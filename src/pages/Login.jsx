import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const Navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        try{
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("user", JSON.stringify(data.user));
                alert("Login successful");
                Navigate("/dashboard");
            } else {
                alert(data.message);
            }
         } catch(error) {
            alert("Something went wrong");
            console.log(error);
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
                        
                        <button type="submit">Login</button>
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