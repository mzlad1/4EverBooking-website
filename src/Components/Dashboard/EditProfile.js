import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "../../apiClient";
import "./EditProfile.css";

const primaryColor = "#cba36b";

const EditProfile = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    id: null,
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    image: "/Images/user.png",
    companyName: "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState(null);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState(null);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(null);

  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
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
          companyName,
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

  const handlePasswordSave = async () => {
    setPasswordSuccessMessage(null);
    setPasswordErrorMessage(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordErrorMessage(t("passwords_do_not_match"));
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

      setPasswordSuccessMessage(t("password_changed_success"));
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordErrorMessage(
        `${t("error_changing_password")} ${error.message}`
      );
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      let apiEndpoint = "";
      let body = {};

      if (
        userRole === "CUSTOMER" ||
        userRole === "ADMIN" ||
        userRole === "SUPER_ADMIN"
      ) {
        apiEndpoint = `http://localhost:8080/customer/updateProfile/${profile.id}`;
        body = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          address: profile.address,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
        };
      } else if (userRole === "HALL_OWNER") {
        apiEndpoint = `http://localhost:8080/hallOwner/UpdateProfile/${profile.id}`;
        body = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          address: profile.address,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          companyName: profile.companyName,
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

      if (userRole === "HALL_OWNER") {
        localStorage.setItem("companyName", profile.companyName);
      }
      setMessage(t("profile_updated_success"));
    } catch (error) {
      setMessage(`${t("error_saving_profile")} ${error.message}`);
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
        `http://localhost:8080/common/uploadImageToProfile?id=${profile.id}`, // Enclosed in backticks for string interpolation
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Enclosed in backticks for string interpolation
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
    <Box className="edit-profile-container-modern" p={3}>
      <Box className="edit-profile-modern" mb={3}>
        <Typography variant="h4">{t("edit_profile")}</Typography>
        <Box className="profile-picture-modern" my={3}>
          <Avatar
            src={profile.image}
            alt="Profile"
            sx={{ width: 100, height: 100 }}
          />
          <input
            type="file"
            id="profileImage"
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageChange}
          />
          <label htmlFor="profileImage" className="change-picture-btn-modern">
            {t("change_picture")}
          </label>
        </Box>
        <Box className="profile-info-modern">
          <TextField
            label={t("first_name")}
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label={t("last_name")}
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label={t("email")}
            name="email"
            value={profile.email}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label={t("address")}
            name="address"
            value={profile.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label={t("phone")}
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label={t("date_of_birth")}
            name="dateOfBirth"
            type="date"
            value={profile.dateOfBirth}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          {userRole === "HALL_OWNER" && (
            <TextField
              label={t("company_name")}
              name="companyName"
              value={profile.companyName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          )}
          <Button
            variant="contained"
            onClick={handleSave}
            fullWidth
            sx={{
              mt: 2,
              backgroundColor: primaryColor,
              "&:hover": { backgroundColor: "#b5884e" },
            }}
          >
            {t("save_profile")}
          </Button>
          {message && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
        </Box>
      </Box>

      <Box className="utils-modern">
        <Typography variant="h5">{t("change_password")}</Typography>
        <TextField
          label={t("old_password")}
          type="password"
          name="oldPassword"
          value={passwords.oldPassword}
          onChange={handlePasswordChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label={t("new_password")}
          type="password"
          name="newPassword"
          value={passwords.newPassword}
          onChange={handlePasswordChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label={t("confirm_new_password")}
          type="password"
          name="confirmPassword"
          value={passwords.confirmPassword}
          onChange={handlePasswordChange}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          onClick={handlePasswordSave}
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: primaryColor,
            "&:hover": { backgroundColor: "#b5884e" },
          }}
        >
          {t("change_password")}
        </Button>
        {passwordSuccessMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {passwordSuccessMessage}
          </Alert>
        )}
        {passwordErrorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {passwordErrorMessage}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default EditProfile;
