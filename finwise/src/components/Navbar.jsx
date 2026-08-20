import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Navbar({
  user,
  sidebarOpen,
  setSidebarOpen,
}) {
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      if (!user?._id) return;

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications/${user._id}`
      );

      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/notifications/read/${id}`
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user?._id) return;

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/notifications/read-all/${user._id}`
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  const getNotificationIcon = (type) => {
    if (type === "overdue") return "🔴";
    if (type === "due") return "🟠";
    if (type === "upcoming") return "🟡";
    if (type === "paid") return "🟢";

    return "🔵";
  };

  return (
    <>
      {!sidebarOpen && (
        <button
          type="button"
          className="sidebar-hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          ☰
        </button>
      )}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : "closed"
        }`}
      >

        {/* Brand */}
        <div className="sidebar-brand">

          <Link
            to="/"
            className="sidebar-brand-link"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="brand-mark">
              F
            </div>

            <div className="sidebar-title">
              <span>FinWise</span>
              <small>Personal Ledger</small>
            </div>
          </Link>

          <button
            type="button"
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ×
          </button>

        </div>


        {/* Navigation */}
        <nav className="sidebar-links">

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "sidebar-item active-link"
                : "sidebar-item"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "sidebar-item active-link"
                : "sidebar-item"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/sip"
            className={({ isActive }) =>
              isActive
                ? "sidebar-item active-link"
                : "sidebar-item"
            }
          >
            SIP
          </NavLink>

          <NavLink
            to="/emi"
            className={({ isActive }) =>
              isActive
                ? "sidebar-item active-link"
                : "sidebar-item"
            }
          >
            EMI
          </NavLink>

          <NavLink
            to="/expense"
            className={({ isActive }) =>
              isActive
                ? "sidebar-item active-link"
                : "sidebar-item"
            }
          >
            Expense
          </NavLink>

          <NavLink
            to="/goal"
            className={({ isActive }) =>
              isActive
                ? "sidebar-item active-link"
                : "sidebar-item"
            }
          >
            Goal
          </NavLink>

          <NavLink
            to="/financial-summary"
            className={({ isActive }) =>
              isActive
                ? "sidebar-item active-link"
                : "sidebar-item"
            }
          >
            Financial Summary
          </NavLink>

          <NavLink
              to="/calendar"
              className={({ isActive }) =>
                  isActive
                      ? "sidebar-item active-link"
                      : "sidebar-item"
              }
          >
              Smart Calendar
          </NavLink>
          <NavLink
              to="/budget"
              className={({ isActive }) =>
                  isActive
                      ? "sidebar-item active-link"
                      : "sidebar-item"
              }
          >
              Budget Planner
          </NavLink>

        </nav>


        {/* Footer */}
        <div className="sidebar-footer">

          {user && (

            <div className="notification-wrapper">

              <button
                type="button"
                className="notification-btn"
                onClick={() =>
                  setNotificationOpen(
                    !notificationOpen
                  )
                }
              >
                <span className="notification-icon">
                  🔔
                </span>

                <span>
                  Notifications
                </span>

                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>


              {notificationOpen && (

                <div className="notification-panel">

                  <div className="notification-header">

                    <h3>
                      Notifications
                    </h3>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                      >
                        Mark all read
                      </button>
                    )}

                  </div>


                  <div className="notification-list">

                    {notifications.length === 0 ? (

                      <div className="no-notifications">
                        <span>🔔</span>
                        <p>
                          No new notifications
                        </p>
                      </div>

                    ) : (

                      notifications.map(
                        (notification) => (

                          <div
                            key={notification._id}
                            className={`notification-item ${
                              !notification.read
                                ? "unread"
                                : ""
                            }`}
                            onClick={() =>
                              !notification.read &&
                              markAsRead(
                                notification._id
                              )
                            }
                          >

                            <div className="notification-item-icon">
                              {getNotificationIcon(
                                notification.type
                              )}
                            </div>

                            <div className="notification-content">

                              <h4>
                                {notification.title}
                              </h4>

                              <p>
                                {notification.message}
                              </p>

                              <small>
                                {new Date(
                                  notification.createdAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )}
                              </small>

                            </div>

                          </div>

                        )
                      )

                    )}

                  </div>

                </div>

              )}

            </div>

          )}


          {user ? (

            <Link
              to="/profile"
              className="profile-btn"
            >
              Profile
            </Link>

          ) : (

            <div className="auth-links">

              <Link
                to="/login"
                className="login-btn"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="signup-btn"
              >
                Signup
              </Link>

            </div>

          )}

        </div>

      </aside>
    </>
  );
}

export default Navbar;