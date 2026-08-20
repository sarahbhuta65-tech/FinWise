import { useNavigate } from "react-router-dom";
import "./MyAccount.css";

function Logout({ setUser }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");

        if (setUser) {
            setUser(null);
        }

        navigate("/login");
    };

    return (
        <div className="settings-card logout-page">

            {/* Header */}
            <div className="logout-header">

                <div>
                    <span className="account-eyebrow">
                        ACCOUNT
                    </span>

                    <h2>Logout</h2>

                    <p>
                        Sign out of your FinWise account securely.
                    </p>
                </div>

                <div className="logout-header-icon">
                    🚪
                </div>

            </div>

            <div className="account-divider"></div>

            {/* Confirmation */}
            <div className="logout-confirmation">

                <div className="logout-icon">
                    🚪
                </div>

                <div className="logout-message">

                    <h3>Ready to leave?</h3>

                    <p>
                        Are you sure you want to logout from your FinWise
                        account? You can sign back in anytime.
                    </p>

                </div>

            </div>

            {/* Security information */}
            <div className="logout-info">

                <div className="logout-info-item">
                    <span>🔒</span>

                    <div>
                        <strong>Your data stays secure</strong>
                        <p>
                            Logging out will end your current session.
                        </p>
                    </div>
                </div>

                <div className="logout-info-item">
                    <span>↩️</span>

                    <div>
                        <strong>Come back anytime</strong>
                        <p>
                            Your FinWise data will remain available when you sign in again.
                        </p>
                    </div>
                </div>

            </div>

            {/* Buttons */}
            <div className="logout-buttons">

                <button
                    className="cancel-btn"
                    onClick={() => navigate("/profile")}
                >
                    Stay Signed In
                </button>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                    <span>→</span>
                </button>

            </div>

        </div>
    );
}

export default Logout;