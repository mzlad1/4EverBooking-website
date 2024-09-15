import React, { useState, useEffect } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next"; // Import the useTranslation hook
import "./EditProfile.css";
import { fetchWithAuth } from "../../apiClient"; // Import the fetchWithAuth function

const EditProfile = () => {
  const { t } = useTranslation(); // Initialize the translation hook
  const [profile, setProfile] = useState({
    id: null,
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    image: "/Images/user.png", // Default profile picture
    companyName: "", // For hall owner only
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState(null); // State for displaying messages
  const [passwordMessage, setPasswordMessage] = useState(null); // State for password change messages

  const userRole = localStorage.getItem("role"); // Get the user's role (CUSTOMER or HALL_OWNER)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetchWithAuth(
          "http://localhost:8080/whitelist/getUser",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const user = await response.json();
        const dob = new Date(user.dateOfBirth).toISOString().split("T")[0];

        // Get companyName from localStorage if the user is a hall owner
        const companyName =
          userRole === "HALL_OWNER"
            ? localStorage.getItem("companyName") || ""
            : "";

        setProfile({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          phone: user.phone,
          email: user.email,
          dateOfBirth: dob,
          image: user.image || "/Images/user.png",
          companyName, // Set companyName from localStorage if available
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [userRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      let apiEndpoint = "";
      let body = {};

      if (userRole === "CUSTOMER") {
        // CUSTOMER profile update
        apiEndpoint = `http://localhost:8080/customer/updateProfile/${profile.id}`;
        body = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          address: profile.address,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
        };
      } else if (userRole === "HALL_OWNER") {
        // HALL_OWNER profile update with company name
        apiEndpoint = `http://localhost:8080/hallOwner/UpdateProfile/${profile.id}`;
        body = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          address: profile.address,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          companyName: profile.companyName, // Include company name for hall owner
        };
      }

      const response = await fetchWithAuth(apiEndpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      // Update companyName in localStorage if the user is a HALL_OWNER
      if (userRole === "HALL_OWNER") {
        localStorage.setItem("companyName", profile.companyName);
      }
      setMessage(t("profile_updated_success")); // Set translated success message
    } catch (error) {
      setMessage(`${t("error_saving_profile")} ${error.message}`); // Set translated error message
    }
  };
  const handlePasswordSave = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert(t("passwords_do_not_match")); // Translated password mismatch message
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const email = profile.email;

      const response = await fetchWithAuth(
        `http://localhost:8080/common/changePassword?email=${encodeURIComponent(
          email
        )}&oldPassword=${encodeURIComponent(
          passwords.oldPassword
        )}&newPassword=${encodeURIComponent(passwords.newPassword)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to change password");
      }

      setPasswordMessage(t("password_changed_success")); // Set translated success message
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordMessage(`${t("error_changing_password")} ${error.message}`); // Set translated error message
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetchWithAuth(
        `http://localhost:8080/common/uploadImageToProfile?id=${profile.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      setProfile((prevProfile) => ({
        ...prevProfile,
        image: URL.createObjectURL(file),
      }));

      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="edit-profile-container-modern">
      <div className="edit-profile-modern">
        <h2>{t("edit_profile")}</h2> {/* Translated Edit Profile */}
        <div className="profile-picture-modern">
          <img src={profile.image} alt="Profile" />
          <input
            type="file"
            id="profileImage"
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageChange}
          />
          <label htmlFor="profileImage" className="change-picture-btn-modern">
            {t("change_picture")} {/* Translated Change Picture */}
          </label>
        </div>
        <div className="profile-info-modern">
          <div className="form-row-modern">
            <div className="form-group-modern">
              <label>{t("first_name")}:</label> {/* Translated First Name */}
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group-modern">
              <label>{t("last_name")}:</label> {/* Translated Last Name */}
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group-modern">
            <label>{t("email")}:</label> {/* Translated Email */}
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled
            />
          </div>
          <div className="form-group-modern">
            <label>{t("address")}:</label> {/* Translated Address */}
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group-modern">
            <label>{t("phone")}:</label> {/* Translated Phone */}
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group-modern">
            <label>{t("date_of_birth")}:</label>{" "}
            {/* Translated Date of Birth */}
            <input
              type="date"
              name="dateOfBirth"
              value={profile.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          {/* Render the Company Name field only for Hall Owners */}
          {userRole === "HALL_OWNER" && (
            <div className="form-group-modern">
              <label>{t("company_name")}:</label>{" "}
              {/* Translated Company Name */}
              <input
                type="text"
                name="companyName"
                value={profile.companyName}
                onChange={handleChange}
              />
            </div>
          )}

          <button onClick={handleSave} className="save-btn-modern">
            {t("save_profile")} {/* Translated Save Profile */}
          </button>
        </div>
        {message && (
          <div className="message-modern">
            <CheckCircleOutlineIcon color="success" /> {message}
          </div>
        )}
      </div>
      <div className="utils-modern">
        <div className="change-password-section-modern">
          <h2>{t("change_password")}</h2> {/* Translated Change Password */}
          <div className="form-group-modern">
            <label>{t("old_password")}:</label> {/* Translated Old Password */}
            <input
              type="password"
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="form-group-modern">
            <label>{t("new_password")}:</label> {/* Translated New Password */}
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="form-group-modern">
            <label>{t("confirm_new_password")}:</label>{" "}
            {/* Translated Confirm New Password */}
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <button onClick={handlePasswordSave} className="save-btn-modern">
            {t("change_password")} {/* Translated Change Password */}
          </button>
          {passwordMessage && (
            <div className="message-modern">
              {passwordMessage.startsWith("Error") ? (
                <ErrorOutlineIcon color="error" />
              ) : (
                <CheckCircleOutlineIcon color="success" />
              )}
              {passwordMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
