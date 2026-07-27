import { useState } from "react";
import axios from "axios";
import "./MyAccount.css";

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
            alert("Please fill all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
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

            alert(res.data.message);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (error) {

            alert(error.response?.data?.message);

        }

    };

    return (

        <div className="settings-card">

            <h2>🔒 Security</h2>

            <p>
                Change your account password.
            </p>

            <div className="password-field">

                <label>Current Password</label>

                <div className="password-input">

                    <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e)=>setCurrentPassword(e.target.value)}
                    />

                    <button
                        onClick={() => setShowCurrent(!showCurrent)}
                    >
                        👁
                    </button>

                </div>

            </div>

            <div className="password-field">

                <label>New Password</label>

                <div className="password-input">

                    <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e)=>setNewPassword(e.target.value)}
                    />

                    <button
                        onClick={() => setShowNew(!showNew)}
                    >
                        👁
                    </button>

                </div>

            </div>

            <div className="password-field">

                <label>Confirm Password</label>

                <div className="password-input">

                    <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e)=>setConfirmPassword(e.target.value)}
                    />

                    <button
                        onClick={() => setShowConfirm(!showConfirm)}
                    >
                        👁
                    </button>

                </div>

            </div>

            <button
                className="save-btn"
                onClick={handleSubmit}
            >
                Change Password
            </button>

            <div className="password-strength">

                <div
                    className={`strength-bar ${
                        newPassword.length < 6
                            ? "weak"
                            : newPassword.length < 10
                            ? "medium"
                            : "strong"
                    }`}
                ></div>

                <span>
                    {newPassword.length < 6
                        ? "Weak Password"
                        : newPassword.length < 10
                        ? "Medium Password"
                        : "Strong Password"}
                </span>

            </div>

        </div>

    );

}

export default Security;