import "./MyAccount.css";
import EditProfileModal from "./EditProfileModal";
import { useState } from "react";

function PersonalInfo() {

    const [showModal, setShowModal] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));

    return (

        <div className="personal-info">

            <div className="section-header">

                <h2>Personal Information</h2>

                <button
                className="edit-profile-btn"
                onClick={() => setShowModal(true)}
                >
                ✏ Edit
                </button>
                {
                showModal && (
                <EditProfileModal
                user={user}
                onClose={() => setShowModal(false)}
                />
                )
                }
            </div>

            <div className="profile-info-grid">

                <div className="info-card">
                    <span>👤</span>
                    <h4>Full Name</h4>
                    <p>{user?.name}</p>
                </div>

                <div className="info-card">
                    <span>📧</span>
                    <h4>Email</h4>
                    <p>{user?.email}</p>
                </div>

                <div className="info-card">
                    <span>📱</span>
                    <h4>Phone</h4>
                    <p>{user?.number}</p>
                </div>

                <div className="info-card">
                    <span>🎓</span>
                    <h4>Occupation</h4>
                    <p>{user?.occupation}</p>
                </div>

                <div className="info-card">
                    <span>📍</span>
                    <h4>City</h4>
                    <p>{user?.city}</p>
                </div>

                <div className="info-card">
                    <span>🎂</span>
                    <h4>Date of Birth</h4>
                    <p>{user?.dob}</p>
                </div>

            </div>

        </div>

    );
}

export default PersonalInfo;