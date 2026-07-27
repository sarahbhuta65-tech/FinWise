import { useState } from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { FaCog } from "react-icons/fa";
import { FaMoon } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";


function AdminTopbar() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    return (
        <div className="admin-topbar">

            <div className="topbar-left">
                <h1>Welcome Back</h1>
                <p>Manage blogs, FAQs and website content efficiently.</p>
            </div>

            <div className="topbar-right">
                <div
                    className="notification"
                    onClick={() => setShowNotifications(!showNotifications)}
                >
                    <FaBell />

                    {showNotifications && (
                        <div className="notification-dropdown">

                            <h4>Notifications</h4>

                            <div className="notification-item">
                                📝 New blog created successfully
                            </div>

                            <div className="notification-item">
                                ❓ FAQ added successfully
                            </div>

                            <div className="notification-item">
                                🎉 Welcome back Sarah!
                            </div>

                        </div>
                    )}
                </div>

                <div
                    className="admin-profile"
                    onClick={() => setShowProfile(!showProfile)}
                >

                    <FaUserCircle className="profile-icon"/>

                    <div>
                        <strong>Sarah</strong>
                        <p>Administrator</p>
                    </div>

                    {showProfile && (

                        <div className="profile-dropdown">

                            <div className="profile-item">
                                <FaUserCircle />
                                My Profile
                            </div>

                            <div className="profile-item">
                                <FaCog />
                                Settings
                            </div>

                            <div className="profile-item">
                                <FaMoon />
                                Dark Mode
                            </div>

                            <div
                                className="profile-item logout-item"
                                onClick={()=>{
                                    localStorage.removeItem("adminLoggedIn");
                                    window.location.href="/login";
                                }}
                            >
                                <FaSignOutAlt />
                                Logout
                            </div>

                        </div>

                    )}

                </div>

            </div>
        </div>
    );
}

export default AdminTopbar;