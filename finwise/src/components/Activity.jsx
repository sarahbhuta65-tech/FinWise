import "./MyAccount.css";

function Activity() {
    const user = JSON.parse(localStorage.getItem("user"));

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "Not available";

    const lastUpdated = user?.updatedAt
        ? new Date(user.updatedAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "Not available";

    return (
        <div className="settings-card activity-page">

            {/* Header */}
            <div className="activity-header">
                <div>
                    <span className="account-eyebrow">
                        ACCOUNT OVERVIEW
                    </span>

                    <h2>Activity</h2>

                    <p>
                        Review your FinWise account activity and profile details.
                    </p>
                </div>

                <div className="activity-header-icon">
                    📊
                </div>
            </div>

            <div className="account-divider"></div>

            {/* Account status */}
            <div className="activity-status">
                <div className="activity-status-icon">
                    ✓
                </div>

                <div>
                    <strong>Your account is active</strong>
                    <span>
                        Your FinWise profile is currently verified and in good standing.
                    </span>
                </div>
            </div>

            {/* Activity information */}
            <div className="activity-section">

                <span className="account-eyebrow">
                    ACCOUNT ACTIVITY
                </span>

                <div className="activity-grid">

                    <div className="activity-card">
                        <div className="activity-card-icon">
                            🗓
                        </div>

                        <div>
                            <span>MEMBER SINCE</span>
                            <h3>{memberSince}</h3>
                        </div>
                    </div>

                    <div className="activity-card">
                        <div className="activity-card-icon">
                            ✏️
                        </div>

                        <div>
                            <span>LAST UPDATED</span>
                            <h3>{lastUpdated}</h3>
                        </div>
                    </div>

                    <div className="activity-card">
                        <div className="activity-card-icon">
                            🛡️
                        </div>

                        <div>
                            <span>PROFILE STATUS</span>
                            <h3>Verified User</h3>
                        </div>
                    </div>

                    <div className="activity-card">
                        <div className="activity-card-icon">
                            🎓
                        </div>

                        <div>
                            <span>OCCUPATION</span>
                            <h3>{user?.occupation || "Not specified"}</h3>
                        </div>
                    </div>

                </div>

            </div>

            {/* Footer information */}
            <div className="activity-footer">
                <span>FINWISE ACCOUNT</span>
                <p>
                    Your account information is securely stored and managed through FinWise.
                </p>
            </div>

        </div>
    );
}

export default Activity;