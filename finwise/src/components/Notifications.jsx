import { useEffect, useState } from "react";
import "./MyAccount.css";
import toast from "react-hot-toast";

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

    toast.success("Notification settings saved successfully!");
  };

  const notifications = [
    {
      key: "email",
      icon: "📧",
      title: "Email Notifications",
      description: "Receive important updates and account information.",
    },
    {
      key: "goal",
      icon: "🎯",
      title: "Goal Reminders",
      description: "Get reminders to stay on track with your savings goals.",
    },
    {
      key: "sip",
      icon: "💰",
      title: "SIP Reminders",
      description: "Never miss your scheduled investment contributions.",
    },
    {
      key: "weekly",
      icon: "📅",
      title: "Weekly Reports",
      description: "Receive a weekly summary of your financial activity.",
    },
    {
      key: "tips",
      icon: "💡",
      title: "Investment Tips",
      description: "Get useful tips and insights to improve your finances.",
    },
  ];

  return (
    <div className="notifications-page">

      {/* Header */}
      <div className="notifications-header">

        <div>
          <span className="notifications-eyebrow">
            STAY INFORMED
          </span>

          <h2>Notifications</h2>

          <p>
            Choose which updates and reminders you want to receive.
          </p>
        </div>

        <div className="notifications-icon">
          🔔
        </div>

      </div>

      <div className="notifications-divider" />

      {/* Status Banner */}
      <div className="notifications-banner">

        <div className="notifications-status-icon">
          🔔
        </div>

        <div>
          <strong>
            Keep your finances on track
          </strong>

          <span>
            Enable reminders and updates that help you stay informed.
          </span>
        </div>

      </div>

      {/* Notification Settings */}
      <div className="notifications-section">

        <span className="notifications-label">
          NOTIFICATION PREFERENCES
        </span>

        <div className="notifications-list">

          {notifications.map((item) => (
            <div
              className={`notification-option ${
                settings[item.key] ? "enabled" : ""
              }`}
              key={item.key}
            >

              <div className="notification-option-left">

                <div className="notification-option-icon">
                  {item.icon}
                </div>

                <div className="notification-option-info">

                  <strong>
                    {item.title}
                  </strong>

                  <span>
                    {item.description}
                  </span>

                </div>

              </div>

              {/* Toggle */}
              <button
                type="button"
                className={`notification-toggle ${
                  settings[item.key] ? "on" : ""
                }`}
                onClick={() => handleToggle(item.key)}
                aria-label={`Toggle ${item.title}`}
              >
                <span />
              </button>

            </div>
          ))}

        </div>

      </div>

      {/* Save */}
      <button
        className="notification-save-btn"
        onClick={handleSave}
      >
        Save Preferences
        <span>→</span>
      </button>

      {/* Note */}
      <div className="notifications-note">

        <span>🔔</span>

        <p>
          You can change these preferences at any time.
        </p>

      </div>

    </div>
  );
}

export default Notifications;