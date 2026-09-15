import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    FaBell,
    FaUserCircle,
    FaCog,
    FaMoon,
    FaSignOutAlt,
} from "react-icons/fa";
import "./AdminTopbar.css";

function AdminTopbar({ darkMode, setDarkMode }) {
    const location = useLocation();
    const navigate = useNavigate();

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [activity, setActivity] = useState([]);
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        const savedNotifications =
            localStorage.getItem("adminNotifications");

        return savedNotifications !== null
            ? JSON.parse(savedNotifications)
            : true;
    });

    const user = JSON.parse(localStorage.getItem("user"));
    const isDashboard = location.pathname === "/admin-dashboard";


    const getPageInfo = () => {
        const path = location.pathname;

        if (path.includes("/users")) {
            return {
                label: "Users",
                description: "Manage FinWise users and their accounts.",
            };
        }

        if (path.includes("/subscriptions/plans")) {
            return {
                label: "Subscription Plans",
                description: "Manage FinWise subscription plans and pricing.",
            };
        }

        if (path.includes("/subscriptions/subscribers")) {
            return {
                label: "Subscribers",
                description: "View and manage FinWise subscribers.",
            };
        }

        if (path.includes("/subscriptions")) {
            return {
                label: "Subscriptions",
                description: "Manage subscription plans and subscribers.",
            };
        }

        if (path.includes("/blogs")) {
            return {
                label: "Blogs",
                description: "Create and manage FinWise blog content.",
            };
        }

        if (path.includes("/faqs")) {
            return {
                label: "FAQs",
                description: "Create and manage frequently asked questions.",
            };
        }

        if (path.includes("/settings/site-configuration")) {
            return {
                label: "Site Configuration",
                description: "Manage your FinWise website configuration.",
            };
        }

        if (path.includes("/settings")) {
            return {
                label: "Settings",
                description: "Manage your Admin Panel settings.",
            };
        }

        return {
            label: "Admin Dashboard",
            description:
                "Manage users, subscriptions and website content efficiently.",
        };
    };

    const pageInfo = getPageInfo();



    useEffect(() => {
        localStorage.setItem(
            "adminNotifications",
            JSON.stringify(notificationsEnabled)
        );
    }, [notificationsEnabled]);



    const handleLogout = () => {
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/admin-login");
    };

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/admin/activity`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setActivity(res.data.items || []);
            } catch (error) {
                console.error("Failed to load activity:", error);
            }
        };
        fetchActivity();
    }, []);


    return (
        <div className="admin-topbar">

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="topbar-left">

                <div className="admin-breadcrumb">

                    {!isDashboard && (
                        <button
                            type="button"
                            onClick={() => navigate("/admin-dashboard")}
                        >
                            ← Dashboard
                        </button>
                    )}

                    <span>{pageInfo.label}</span>

                </div>

                <h1>
                    {isDashboard
                        ? "Welcome Back"
                        : pageInfo.label}
                </h1>

                <p>{pageInfo.description}</p>

            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="topbar-right">

                {/* View Site */}

                <Link
                    className="view-site-link"
                    to="/"
                >
                    View site
                </Link>


                {/* Notifications */}

                <div
                    className={`notification ${
                        !notificationsEnabled
                            ? "notifications-disabled"
                            : ""
                    }`}
                    onClick={() => {
                        if (!notificationsEnabled) return;

                        setShowNotifications(
                            !showNotifications
                        );

                        setShowProfile(false);
                    }}
                >

                    <FaBell />

                    {notificationsEnabled && (
                        <span className="notification-dot"></span>
                    )}

                    {showNotifications && (
                        <div
                            className="notification-dropdown"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="notification-header">
                                <h4>Notifications</h4>
                                <span>{activity.length} recent</span>
                            </div>

                            {activity.length === 0 ? (
                                <div className="notification-item">
                                    <span className="notification-icon">👋</span>
                                    <div>
                                        <strong>No recent activity</strong>
                                        <small>You're all caught up.</small>
                                    </div>
                                </div>
                            ) : (
                                activity.map((item, i) => (
                                    <div className="notification-item" key={i}>
                                        <span className="notification-icon">
                                            {item.type === "blog" ? "📝" : item.type === "faq" ? "❓" : "👤"}
                                        </span>
                                        <div>
                                            <strong>{item.text}</strong>
                                            <small>{new Date(item.date).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                ))
                            )}

                        </div>
                    )}

                </div>


                {/* Profile */}

                <div
                    className="admin-profile"
                    onClick={() => {
                        setShowProfile(!showProfile);
                        setShowNotifications(false);
                    }}
                >

                    <FaUserCircle className="profile-icon" />

                    <div className="profile-details">

                        <strong>
                            {user?.name || "Admin"}
                        </strong>

                        <p>
                            Administrator
                        </p>

                    </div>


                    {/* Profile Dropdown */}

                    {showProfile && (

                        <div
                            className="profile-dropdown"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div
                                className="profile-item"
                                onClick={() => {
                                    setShowProfile(false);
                                    setShowProfileModal(true);
                                }}
                            >
                                <FaUserCircle />

                                <span>
                                    My Profile
                                </span>
                            </div>


                            <div
                                className="profile-item"
                                onClick={() => {
                                    setShowProfile(false);
                                    setShowSettingsModal(true);
                                }}
                            >
                                <FaCog />

                                <span>
                                    Settings
                                </span>
                            </div>


                            <div
                                className="profile-item"
                                onClick={() => {
                                    setDarkMode(!darkMode);
                                    setShowProfile(false);
                                }}
                            >
                                <FaMoon />

                                <span>
                                    {darkMode
                                        ? "Light Mode"
                                        : "Dark Mode"}
                                </span>
                            </div>


                            <div
                                className="profile-item logout-item"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt />

                                <span>
                                    Logout
                                </span>
                            </div>

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
                PROFILE MODAL
            ================================================= */}

            {showProfileModal && (

                <div
                    className="admin-profile-modal-overlay"
                    onClick={() =>
                        setShowProfileModal(false)
                    }
                >

                    <div
                        className="admin-profile-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className="profile-modal-close"
                            onClick={() =>
                                setShowProfileModal(false)
                            }
                        >
                            ×
                        </button>

                        <FaUserCircle className="profile-modal-icon" />

                        <h2>
                            {user?.name || "Admin"}
                        </h2>

                        <p>
                            {user?.email ||
                                "No email available"}
                        </p>


                        <div className="profile-info">

                            <div>
                                <span>
                                    Account Type
                                </span>

                                <strong>
                                    Administrator
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Admin Access
                                </span>

                                <strong>
                                    Enabled
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                SETTINGS MODAL
            ================================================= */}

            {showSettingsModal && (

                <div
                    className="admin-profile-modal-overlay"
                    onClick={() =>
                        setShowSettingsModal(false)
                    }
                >

                    <div
                        className="admin-settings-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className="profile-modal-close"
                            onClick={() =>
                                setShowSettingsModal(false)
                            }
                        >
                            ×
                        </button>


                        <div className="settings-header">

                            <FaCog className="settings-icon" />

                            <div>
                                <h2>
                                    Admin Settings
                                </h2>

                                <p>
                                    Manage your Admin Panel preferences.
                                </p>
                            </div>

                        </div>


                        <div className="settings-list">

                            {/* Notifications */}

                            <div className="settings-row">

                                <div>
                                    <strong>
                                        Notifications
                                    </strong>

                                    <span>
                                        Receive admin panel notifications
                                    </span>
                                </div>


                                <button
                                    type="button"
                                    className={`settings-toggle ${
                                        notificationsEnabled
                                            ? "enabled"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setNotificationsEnabled(
                                            !notificationsEnabled
                                        )
                                    }
                                >
                                    <span></span>
                                </button>

                            </div>


                            {/* Appearance */}

                            <div className="settings-row">

                                <div>
                                    <strong>
                                        Appearance
                                    </strong>

                                    <span>
                                        Manage the Admin Panel theme
                                    </span>
                                </div>


                                <span className="settings-value">
                                    {darkMode
                                        ? "Dark Mode"
                                        : "Light Mode"}
                                </span>

                            </div>


                            {/* Access */}

                            <div className="settings-row">

                                <div>
                                    <strong>
                                        Access Level
                                    </strong>

                                    <span>
                                        Current administrator permissions
                                    </span>
                                </div>


                                <span className="settings-value">
                                    Administrator
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminTopbar;

