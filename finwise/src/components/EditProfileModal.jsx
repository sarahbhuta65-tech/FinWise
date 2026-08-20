import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./MyAccount.css";

function EditProfileModal({ user, onClose }) {
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [number, setNumber] = useState(user?.number || "");
    const [occupation, setOccupation] = useState(user?.occupation || "");
    const [city, setCity] = useState(user?.city || "");
    const [dob, setDob] = useState(user?.dob || "");
    const [bio, setBio] = useState(user?.bio || "");

    const handleSave = async () => {
        try {
            const currentUser = JSON.parse(
                localStorage.getItem("user")
            );

            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/auth/profile/${currentUser._id}`,
                {
                    name,
                    email,
                    number,
                    occupation,
                    city,
                    dob,
                    bio,
                }
            );

            localStorage.setItem(
                "user",
                JSON.stringify(res.data.user)
            );

            toast.success("Profile updated successfully!");

            window.location.reload();

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="modal-overlay">

            <div className="edit-profile-modal">

                {/* Header */}
                <div className="modal-header">

                    <div>
                        <span className="account-eyebrow">
                            PROFILE SETTINGS
                        </span>

                        <h2>Edit Profile</h2>

                        <p>
                            Keep your personal information up to date.
                        </p>
                    </div>

                    <button
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>

                <div className="account-divider"></div>

                {/* Form */}
                <div className="modal-form">

                    <div className="form-field">
                        <label>👤 Full Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-field">
                        <label>📧 Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-field">
                        <label>📱 Phone Number</label>
                        <input
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div className="form-field">
                        <label>🎓 Occupation</label>
                        <input
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            placeholder="Enter your occupation"
                        />
                    </div>

                    <div className="form-field">
                        <label>📍 City</label>
                        <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Enter your city"
                        />
                    </div>

                    <div className="form-field">
                        <label>🎂 Date of Birth</label>
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />
                    </div>

                    <div className="form-field full-width">
                        <label>📝 Bio</label>

                        <textarea
                            rows="4"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us a little about yourself..."
                        />
                    </div>

                </div>

                {/* Buttons */}
                <div className="modal-buttons">

                    <button
                        className="secondary-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="primary-btn"
                        onClick={handleSave}
                    >
                        Save Changes
                        <span>→</span>
                    </button>

                </div>

            </div>

        </div>
    );
}

export default EditProfileModal;