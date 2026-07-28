import { useNavigate } from "react-router-dom";
import "./MyAccount.css";

function Logout({ setUser }) {

    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.removeItem("user");
        if (setUser) setUser(null);

        navigate("/login");

    };

    return (

        <div className="settings-card logout-card">

            <h2>🚪 Logout</h2>

            <p>
                Are you sure you want to logout from your account?
            </p>

            <div className="logout-buttons">

                <button
                    className="cancel-btn"
                    onClick={() => navigate("/profile")}
                >
                    Cancel
                </button>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </div>

    );

}

export default Logout;