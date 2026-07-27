import "./MyAccount.css";
import { useRef } from "react";
import axios from "axios";

function AccountHeader() {
    const fileInputRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const profileFields = [
      user?.name,
      user?.email,
      user?.number,
      user?.occupation,
      user?.city,
      user?.dob,
      user?.bio,
      user?.profilePicture,
    ];

    const completedFields = profileFields.filter(
      (field) => field && field.toString().trim() !== ""
    ).length;

    const completionPercentage = Math.round(
      (completedFields / profileFields.length) * 100
    );

  const hour = new Date().getHours();

  let greeting = "Good Evening 🌙";

  if (hour < 12) {
    greeting = "Good Morning ☀️";
  } else if (hour < 18) {
    greeting = "Good Afternoon 👋";
  }
  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("profilePicture", file);
      try {
          const res = await axios.put(
              `http://${import.meta.env.VITE_API_URL}/api/auth/profile-picture/${user._id}`,
              formData,
              {
                  headers: {
                      "Content-Type": "multipart/form-data",
                  },
              }
          );

          localStorage.setItem(
              "user",
              JSON.stringify(res.data.user)
          );

          setUser(res.data.user);

      } catch (error) {
          console.log(error.response?.data);
          console.log(error.response?.status);
          console.error(error);
          alert("Image upload failed.");
      }

  };
  return (
    <div className="account-header">

      <div className="header-left">
        <div className="profile-image-wrapper">
            <img
                src={
                    user.profilePicture
                        ? `http://${import.meta.env.VITE_API_URL}${user.profilePicture}`
                        : "/660513.jpg"
                }
                alt="Profile"
                className="profile-image"
            />
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
            />
            <button
                className="edit-profile-image"
                onClick={() => fileInputRef.current.click()}
            >
                📷
            </button>
        </div>
        <div className="header-info">

          <h4>{greeting},</h4>

          <h1>{user?.name}</h1>

          <p>
            Track smarter. Save better. Grow faster.
          </p>

          <div className="header-tags">

            <span className="verified-badge">
              ✅ Verified User
            </span>

            <span className="occupation-badge">
              🎓 {user?.occupation || "Occupation"}
            </span>

          </div>

        </div>

      </div>

      <div className="header-right">

        <div className="completion-box">

          <h3>Profile Completion</h3>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <span>{completionPercentage}% Completed</span>

          <small>
           {completionPercentage === 100
            ? "🎉 Your profile is fully completed!"
            : `Complete ${profileFields.length - completedFields} more field(s) to reach 100%.`}
          </small>

        </div>

      </div>

    </div>
  );
}

export default AccountHeader;