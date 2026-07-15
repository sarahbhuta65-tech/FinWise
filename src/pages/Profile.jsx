import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Profile.css";

function Profile({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [number, setNumber] = useState(user?.number || "");
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSave = () => {
  const updatedUser = { ...user, name, email, number };

  localStorage.setItem("user", JSON.stringify(updatedUser));
  setEditing(false);

  window.location.reload();
  };
  const handlePasswordChange = () => {
    if (currentPassword !== user.password) {
      alert("Current password is incorrect");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const updatedUser = {
      ...user,
      password: newPassword,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    alert("Password changed successfully!");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordBox(false);
  };

  return (
    <div className="profile-page">
      <h1> Welcome Back, {user.name}! </h1>

      <div className="profile-grid">

        <div className="profile-card">
          <h2>Personal Info</h2>
          {!editing ? (
          <>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Phone Number: {user.number}</p>
            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </>
        ) : (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />

            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Enter phone number"
            />

            <div className="edit-buttons">
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>

              <button
                className="cancel-btn"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </>
        )}
        </div>

        <div className="profile-card">
          <h2>Appearance</h2>
          <p>Choose your preferred theme</p>
          <button
            className="theme-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="profile-card">
          <h2>About FinWise</h2>
          <p>
            FinWise helps users manage expenses, track savings,
            calculate SIP & EMI, and receive smart financial insights.
          </p>
        </div>

        <div className="profile-card">
        <h2>Security</h2>
        {!showPasswordBox ? (
          <>
            <button
              className="password-btn"
              onClick={() => setShowPasswordBox(true)}
            >
              Change Password
            </button>

            <p>🛡 Secure Data Encryption</p>
          </>
        ) : (
          <div className="password-box">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="password-buttons">
              <button onClick={handlePasswordChange}>Save</button>
              <button onClick={() => setShowPasswordBox(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

        <div className="logout-card">
          <button className="logout-btn-big" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}

export default Profile;