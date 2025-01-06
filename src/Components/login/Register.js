import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";

import DialogTitle from "@mui/material/DialogTitle";
import "./register.css";
import zxcvbn from "zxcvbn";

const Register = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [userType, setUserType] = useState("user"); // "user" or "hallOwner"
  const [companyName, setCompanyName] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [successDialog, setSuccessDialog] = useState({
    open: false,
    message: "",
  });

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(zxcvbn(value)); // Evaluate password strength
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      setLoading(true); // Show loading overlay
      let userData = {
        user: {
          email,
          firstName,
          lastName,
          password,
          address,
          dateOfBirth,
          phone,
        },
      };

      let apiUrl = "http://localhost:8080/whitelist/CustomerRegister";

      if (userType === "hallOwner") {
        userData = {
          companyName,
          ...userData,
        };
        apiUrl = "http://localhost:8080/whitelist/RegisterHallOwner";
      }

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
        if (!response.ok) {
          throw new Error(t("registration_error"));
        }

        setSuccessDialog({
          open: true,
          message: t("registration_success"),
        });

        const data = await response.json();
        console.log("Registration Data:", data);

        // Extract token from the response
        const token = data.access_token; // Updated to match the response format
        if (!token) {
          throw new Error("Token not found in the registration response.");
        }

        // Fetch the user ID using the token
        const userResponse = await fetch(
          "http://localhost:8080/whitelist/getUser",
          {
            method: "GET",
            headers: {
              Accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error(`Get User API error! status: ${userResponse.status}`);
        }

        const userDetails = await userResponse.json();
        const userId = userDetails.id; // Extracting the `id` field
        console.log("User ID:", userId);

        if (userType === "hallOwner") {
          // Call API to get Stripe account setup link
          const stripeResponse = await fetch(
            `http://localhost:8080/whitelist/createHallOwnerStripeAccount/${userId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "*/*",
              },
            }
          );

          if (!stripeResponse.ok) {
            throw new Error(
              `Stripe API error! status: ${stripeResponse.status}`
            );
          }

          const stripeLink = await stripeResponse.text(); // Handle as plain text
          console.log("Stripe Setup Link:", stripeLink);
          setLoading(false); // Hide loading overlay before redirection
          // Redirect to the Stripe account setup link
          window.location.href = stripeLink;
          return;
        }

        alert(t("registration_success")); // Use translated registration success message
        // Reset form after successful registration
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");
        setAddress("");
        setDateOfBirth("");
        setPhone("");
        setCompanyName(""); // Reset company name if it was used
        setLoading(false); // Hide loading overlay before redirection
        // Redirect to login page
        window.location.href = "/sign-in";
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      } catch (error) {
        console.error("Error:", error);
        setLoading(false); // Hide loading overlay before redirection
        setErrorDialog({
          open: true,
          message: t("registration_error"),
        });
      }
    }
  };

  const validateForm = () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !address ||
      !dateOfBirth ||
      !phone ||
      (userType === "hallOwner" && !companyName)
    ) {
      setErrorDialog({ open: true, message: t("all_fields_required") });
      return false;
    }

    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/.test(password)) {
      setErrorDialog({ open: true, message: t("password_requirements") });
      return false;
    }

    if (password !== confirmPassword) {
      setErrorDialog({ open: true, message: t("password_mismatch") });
      return false;
    }

    setError("");
    return true;
  };

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>{t("loading")}</p>
        </div>
      )}
      <section className="register-forms top">
        <div className="register-container">
          <div className="register-sign-box">
            <p>{t("create_account_prompt")}</p>{" "}
            {/* Translated account prompt */}
            {/* Toggle Buttons */}
            <div className="register-toggle-buttons">
              <button
                type="button"
                className={userType === "user" ? "active" : ""}
                onClick={() => setUserType("user")}
              >
                {t("user")}
              </button>
              <button
                type="button"
                className={userType === "hallOwner" ? "active" : ""}
                onClick={() => setUserType("hallOwner")}
              >
                {t("hall_owner")}
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Two-column input layout */}
              <div className="register-form-grid">
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("first_name")}
                  className="register-input-field"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("last_name")}
                  className="register-input-field"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email")}
                  className="register-input-field register-full-width"
                  required
                />
                <input
                  type="text"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("phone")}
                  className="register-input-field"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setIsPasswordFocused(true)} // Show conditions box
                  onBlur={() => setIsPasswordFocused(false)} // Hide conditions box
                  placeholder="Enter Password"
                  className="register-input-field"
                  required
                />
                {isPasswordFocused && (
                  <div className="password-conditions-box">
                    <ul>
                      <li>Must be at least 8 characters long</li>
                      <li>Must contain at least one uppercase letter</li>
                      <li>Must contain at least one lowercase letter</li>
                      <li>Must contain at least one number</li>
                      <li>
                        Must contain at least one special character (e.g., @, #,
                        $, etc.)
                      </li>
                    </ul>

                    {/* Password Strength Meter */}
                    {passwordStrength && (
                      <div className="password-strength-meter">
                        <progress
                          value={passwordStrength.score}
                          max="4"
                          className={`strength-${passwordStrength.score}`}
                        ></progress>
                        <p className="strength-text">
                          {
                            ["Weak", "Fair", "Good", "Strong", "Very Strong"][
                              passwordStrength.score
                            ]
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirm_password")}
                  className="register-input-field"
                  required
                />

                <input
                  type="text"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t("address")}
                  className="register-input-field register-full-width"
                  required
                />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="register-input-field"
                  required
                />
                {/* Conditionally Render Company Name Input */}
                {userType === "hallOwner" && (
                  <input
                    type="text"
                    name="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t("company_name")}
                    className="register-input-field register-full-width"
                    required
                  />
                )}
              </div>

              {error && <p className="register-error">{error}</p>}
              <button type="submit" className="register-primary-btn">
                {t("create_account")}
              </button>
              <p>
                {t("have_account")}{" "}
                <Link to="/sign-in" className="register-signin-link">
                  {t("sign_in")}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
      {/* Success Dialog */}
      <Dialog
        open={successDialog.open}
        onClose={() => setSuccessDialog({ open: false, message: "" })}
      >
        <DialogTitle>{t("success")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{successDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSuccessDialog({ open: false, message: "" })}
            autoFocus
          >
            {t("close")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({ open: false, message: "" })}
      >
        <DialogTitle>{t("error")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setErrorDialog({ open: false, message: "" })}
            autoFocus
          >
            {t("close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Register;
