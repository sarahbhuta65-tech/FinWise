import "./MyAccount.css";

function ProfileStats() {
  return (
    <div className="profile-stats">

      <div className="stat-card">
        <span>💰</span>
        <h3>₹45,000</h3>
        <p>Total Savings</p>
      </div>

      <div className="stat-card">
        <span>🎯</span>
        <h3>3</h3>
        <p>Active Goals</p>
      </div>

      <div className="stat-card">
        <span>📚</span>
        <h3>14</h3>
        <p>Blogs Read</p>
      </div>

      <div className="stat-card">
        <span>🔥</span>
        <h3>7 Days</h3>
        <p>Login Streak</p>
      </div>

    </div>
  );
}

export default ProfileStats;