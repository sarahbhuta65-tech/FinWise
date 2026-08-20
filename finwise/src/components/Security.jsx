import { useState } from "react";
import axios from "axios";
import "./MyAccount.css";
import toast from "react-hot-toast";

function Security() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async () => {
        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            toast.error("Please fill all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/auth/change-password/${user._id}`,
                {
                    currentPassword,
                    newPassword,
                }
            );

            toast.success(res.data.message);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    };

    return (
        <div className="settings-card security-card">

            {/* Header */}
            <div className="settings-section-header">
                <div>
                    <span className="settings-eyebrow">
                        ACCOUNT PROTECTION
                    </span>

                    <h2>Security</h2>

                    <p>
                        Keep your FinWise account secure by regularly
                        updating your password.
                    </p>
                </div>

                <div className="security-icon">
                    🔒
                </div>
            </div>

            {/* Security notice */}
            <div className="security-notice">
                <span>🛡️</span>

                <div>
                    <strong>Your account is protected</strong>
                    <p>
                        Use a strong password that you don't use on
                        other websites.
                    </p>
                </div>
            </div>

            {/* Password Form */}
            <div className="security-form">

                <div className="security-form-title">
                    <span>CHANGE PASSWORD</span>
                </div>

                {/* Current Password */}
                <div className="password-field">
                    <label>Current Password</label>

                    <div className="password-input">
                        <input
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            placeholder="Enter current password"
                            onChange={(e) =>
                                setCurrentPassword(e.target.value)
                            }
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowCurrent(!showCurrent)
                            }
                            aria-label="Toggle current password visibility"
                        >
                            {showCurrent ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div className="password-field">
                    <label>New Password</label>

                    <div className="password-input">
                        <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            placeholder="Enter new password"
                            onChange={(e) =>
                                setNewPassword(e.target.value)
                            }
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowNew(!showNew)
                            }
                            aria-label="Toggle new password visibility"
                        >
                            {showNew ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="password-field">
                    <label>Confirm New Password</label>

                    <div className="password-input">
                        <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            placeholder="Confirm new password"
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirm(!showConfirm)
                            }
                            aria-label="Toggle confirm password visibility"
                        >
                            {showConfirm ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                {/* Password Strength */}
                <div className="password-strength">
                    <div className="strength-header">
                        <span>PASSWORD STRENGTH</span>

                        <strong>
                            {newPassword.length < 6
                                ? "Weak"
                                : newPassword.length < 10
                                ? "Medium"
                                : "Strong"}
                        </strong>
                    </div>

                    <div className="strength-track">
                        <div
                            className={`strength-bar ${
                                newPassword.length < 6
                                    ? "weak"
                                    : newPassword.length < 10
                                    ? "medium"
                                    : "strong"
                            }`}
                        />
                    </div>

                    <small>
                        {newPassword.length < 6
                            ? "Use at least 6 characters."
                            : newPassword.length < 10
                            ? "Good start. A longer password is recommended."
                            : "Strong password. Nice work!"}
                    </small>
                </div>

                {/* Button */}
                <div className="security-actions">
                    <button
                        className="save-btn security-save-btn"
                        onClick={handleSubmit}
                    >
                        Update Password
                        <span>→</span>
                    </button>
                </div>

            </div>

        </div>
    );
}

export default Security;