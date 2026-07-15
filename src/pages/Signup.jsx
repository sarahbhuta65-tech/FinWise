import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const Navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        try{
            const res = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();
            if (res.ok) {
               localStorage.setItem("user", JSON.stringify(data.user));
                alert("Account Created");
                Navigate("/login");
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
                        
                        <button type="submit">Signup</button>
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
