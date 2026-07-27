import "./MyAccount.css";

function Activity() {

    const user = JSON.parse(localStorage.getItem("user"));

    return (

        <div className="settings-card">

            <h2>📊 Activity</h2>

            <p>
                Here's a quick summary of your FinWise account.
            </p>

            <div className="activity-grid">

                <div className="activity-card">
                    <h4>🗓 Member Since</h4>
                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="activity-card">
                    <h4>📝 Last Updated</h4>
                    <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>

                <div className="activity-card">
                    <h4>👤 Profile Status</h4>
                    <p>Verified User ✅</p>
                </div>

                <div className="activity-card">
                    <h4>💼 Occupation</h4>
                    <p>{user.occupation}</p>
                </div>

            </div>

        </div>

    );

}

export default Activity;