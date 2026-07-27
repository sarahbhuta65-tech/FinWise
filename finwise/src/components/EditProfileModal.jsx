import { useState } from "react";
import axios from "axios";
import "./MyAccount.css";

function EditProfileModal({ user, onClose }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [number, setNumber] = useState(user?.number || "");
  const [occupation, setOccupation] = useState(
    user?.occupation || ""
  );
  const [city, setCity] = useState(user?.city || "");
  const [dob, setDob] = useState(user?.dob || "");
  const [bio, setBio] = useState(user?.bio || "");

  const handleSave = async () => {
      try {
          const currentUser = JSON.parse(
              localStorage.getItem("user")
          );
          const res = await axios.put(
              `http://localhost:5000/api/auth/profile/${currentUser._id}`,
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
          alert("Profile updated successfully!");
          window.location.reload();
      } catch (error) {
          console.error(error);
          alert("Something went wrong");
      }
  };

  return (
    <div className="modal-overlay">

      <div className="edit-profile-modal">

        <h2>Edit Profile</h2>

        <div className="modal-form">

          <label>👤 Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>📧 Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>📱 Phone Number</label>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />

          <label>🎓 Occupation</label>
          <input
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          />

          <label>📍 City</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <label>🎂 Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />

          <label>📝 Bio</label>
          <textarea
            rows="4"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

        </div>

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
          </button>

        </div>

      </div>

    </div>
  );
}

export default EditProfileModal;