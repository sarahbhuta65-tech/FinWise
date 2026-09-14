import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    MdDashboard,
    MdPeople,
    MdCardMembership,
    MdArticle,
    MdQuestionAnswer,
    MdSettings,
    MdLogout,
    MdExpandMore,
    MdExpandLess,
    MdPayments,
} from "react-icons/md";

import "./AdminSidebar.css";

function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [openGroups, setOpenGroups] = useState({
        subscriptions:
            location.pathname.includes("/admin/subscriptions"),

        content:
            location.pathname.includes("/admin/blogs") ||
            location.pathname.includes("/admin/faqs"),

        settings:
            location.pathname.includes("/admin/settings"),
    });

    const toggleGroup = (group) => {
        setOpenGroups((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/admin-login");
    };

    return (
        <aside className="admin-sidebar">

            {/* Logo */}
            <div className="admin-logo">
                <div>
                    <h2>FinWise</h2>
                    <span>Administration Panel</span>
                </div>
            </div>


            {/* Navigation */}
            <nav className="admin-menu">

                {/* Overview */}
                <div className="menu-section-title">
                    Overview
                </div>

                <NavLink
                    to="/admin-dashboard"
                    className={({ isActive }) =>
                        `menu-item${isActive ? " active" : ""}`
                    }
                >
                    <MdDashboard />
                    <span>Dashboard</span>
                </NavLink>


                {/* User Management */}
                <div className="menu-section-title">
                    User Management
                </div>

                <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                        `menu-item${isActive ? " active" : ""}`
                    }
                >
                    <MdPeople />
                    <span>All Users</span>
                </NavLink>


                {/* Subscriptions */}
                <div className="menu-section-title">
                    Monetization
                </div>

                <button
                    type="button"
                    className="menu-item group-toggle"
                    onClick={() => toggleGroup("subscriptions")}
                >
                    <MdCardMembership />

                    <span>Subscriptions</span>

                    {openGroups.subscriptions ? (
                        <MdExpandLess className="chevron" />
                    ) : (
                        <MdExpandMore className="chevron" />
                    )}
                </button>

                {openGroups.subscriptions && (
                    <div className="submenu">

                        <NavLink
                            to="/admin/subscriptions/plans"
                            className={({ isActive }) =>
                                `submenu-item${isActive ? " active" : ""}`
                            }
                        >
                            <MdCardMembership />
                            <span>Plans & Pricing</span>
                        </NavLink>

                        <NavLink
                            to="/admin/subscriptions/subscribers"
                            className={({ isActive }) =>
                                `submenu-item${isActive ? " active" : ""}`
                            }
                        >
                            <MdPeople />
                            <span>Subscribers</span>
                        </NavLink>

                        <NavLink
                            to="/admin/subscriptions/payments"
                            className={({ isActive }) =>
                                `submenu-item${isActive ? " active" : ""}`
                            }
                        >
                            <MdPayments />
                            <span>Payments</span>
                        </NavLink>

                    </div>
                )}


                {/* Content */}
                <div className="menu-section-title">
                    Content
                </div>

                <button
                    type="button"
                    className="menu-item group-toggle"
                    onClick={() => toggleGroup("content")}
                >
                    <MdArticle />

                    <span>Content</span>

                    {openGroups.content ? (
                        <MdExpandLess className="chevron" />
                    ) : (
                        <MdExpandMore className="chevron" />
                    )}
                </button>

                {openGroups.content && (
                    <div className="submenu">

                        <NavLink
                            to="/admin/blogs"
                            className={({ isActive }) =>
                                `submenu-item${isActive ? " active" : ""}`
                            }
                        >
                            <MdArticle />
                            <span>Blogs</span>
                        </NavLink>

                        <NavLink
                            to="/admin/faqs"
                            className={({ isActive }) =>
                                `submenu-item${isActive ? " active" : ""}`
                            }
                        >
                            <MdQuestionAnswer />
                            <span>FAQs</span>
                        </NavLink>

                    </div>
                )}


                {/* Settings */}
                <div className="menu-section-title">
                    System
                </div>

                <button
                    type="button"
                    className="menu-item group-toggle"
                    onClick={() => toggleGroup("settings")}
                >
                    <MdSettings />

                    <span>Settings</span>

                    {openGroups.settings ? (
                        <MdExpandLess className="chevron" />
                    ) : (
                        <MdExpandMore className="chevron" />
                    )}
                </button>

                {openGroups.settings && (
                    <div className="submenu">

                        <NavLink
                            to="/admin/settings/site-configuration"
                            className={({ isActive }) =>
                                `submenu-item${isActive ? " active" : ""}`
                            }
                        >
                            <MdSettings />
                            <span>Site Configuration</span>
                        </NavLink>

                    </div>
                )}

            </nav>


            {/* Logout */}
            <button
                type="button"
                className="logout-admin"
                onClick={handleLogout}
            >
                <MdLogout />
                <span>Logout</span>
            </button>

        </aside>
    );
}

export default AdminSidebar;