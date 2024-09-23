import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
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

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(zxcvbn(value)); // Evaluate password strength
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
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
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
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

        // Redirect to login page
        window.location.href = "/sign-in";
      } catch (error) {
        console.error("Error:", error);
        alert(t("registration_error")); // Use translated registration error message
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
      setError(t("all_fields_required")); // Use translated error message
      return false;
    }

    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/.test(password)) {
      setError(t("password_requirements")); // Use translated password requirements error
      return false;
    }

    if (password !== confirmPassword) {
      setError(t("password_mismatch")); // Use translated password mismatch error
      return false;
    }

    setError("");
    return true;
  };

  return (
    <>
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
    </>
  );
};

export default Register;
