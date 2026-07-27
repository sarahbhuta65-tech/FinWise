import { useEffect, useState } from "react";
import "./MyAccount.css";

function Notifications() {

    const [settings, setSettings] = useState({
        email: true,
        goal: true,
        sip: true,
        weekly: false,
        tips: true,
    });

    useEffect(() => {
        const saved = localStorage.getItem("notificationSettings");

        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    const handleToggle = (key) => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSave = () => {
        localStorage.setItem(
            "notificationSettings",
            JSON.stringify(settings)
        );

        alert("Notification settings saved successfully!");
    };

    return (
        <div className="settings-card">

            <h2>🔔 Notifications</h2>

            <p>
                Choose which notifications you want to receive.
            </p>

            <div className="notification-list">

                <div className="notification-item">
                    <span>📧 Email Notifications</span>

                    <input
                        type="checkbox"
                        checked={settings.email}
                        onChange={() => handleToggle("email")}
                    />
                </div>

                <div className="notification-item">
                    <span>🎯 Goal Reminders</span>

                    <input
                        type="checkbox"
                        checked={settings.goal}
                        onChange={() => handleToggle("goal")}
                    />
                </div>

                <div className="notification-item">
                    <span>💰 SIP Reminders</span>

                    <input
                        type="checkbox"
                        checked={settings.sip}
                        onChange={() => handleToggle("sip")}
                    />
                </div>

                <div className="notification-item">
                    <span>📅 Weekly Reports</span>

                    <input
                        type="checkbox"
                        checked={settings.weekly}
                        onChange={() => handleToggle("weekly")}
                    />
                </div>

                <div className="notification-item">
                    <span>💡 Investment Tips</span>

                    <input
                        type="checkbox"
                        checked={settings.tips}
                        onChange={() => handleToggle("tips")}
                    />
                </div>

            </div>

            <button
                className="save-btn"
                onClick={handleSave}
            >
                Save Preferences
            </button>

        </div>
    );
}

export default Notifications;