import React, { useState } from "react";
import HeadTitle from "../../Common/HeadTitle/HeadTitle";
import { Link } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // Import success icon
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import { fetchWithAuth } from "../../apiClient"; // Import the fetchWithAuth function

import "./resetpassword.css"; // Ensure this path is correct to apply your CSS styles

const ResetPassword = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const url = `http://localhost:8080/whitelist/send-verification-code?email=${encodeURIComponent(
        email
      )}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setMessage(t("verification_sent_success")); // Use translated success message
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          setError(errorData.errorMessage || t("unexpected_error")); // Use translated error message
        } else {
          const errorText = await response.text();
          setError(errorText || t("unexpected_error")); // Use translated error message
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeadTitle />
      <section className="reset-form-section top">
        <div className="reset-container">
          <div className="reset-sign-box">
            <p>{t("reset_password_prompt")}</p> {/* Translated prompt */}
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email")} // Translated placeholder for email
                required
                className="reset-input-field"
              />

              {error && (
                <div className="reset-error">
                  <ErrorOutlineIcon color="error" />{" "}
                  {/* Using MUI icon with error styling */}
                  {error}
                </div>
              )}

              {message && (
                <div className="reset-message">
                  <CheckCircleOutlineIcon color="success" />{" "}
                  {/* Using MUI success icon */}
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="reset-primary-btn"
                disabled={loading}
              >
                {t("send_verification_code")} {/* Translated button text */}
              </button>
              <p className="reset-signin-prompt">
                {t("remember_password")}{" "}
                {/* Translated "Remember your password?" */}
                <Link to="/sign-in" className="reset-signin-link">
                  {t("sign_in")}
                </Link>{" "}
                {/* Translated "Sign In!" */}
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ResetPassword;
