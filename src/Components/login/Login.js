import React, { useState } from "react";
import { useAuth } from "../../Context/AuthContext"; // Adjust the path as needed
import HeadTitle from "../../Common/HeadTitle/HeadTitle";
import { Link, useHistory } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import "./login.css";

const Login = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      login(data.access_token, data.refresh_token); // Use login from context

      // Fetch the user ID and role using the access token
      const userResponse = await fetch(
        "http://localhost:8080/whitelist/getUser",
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${data.access_token}`,
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      localStorage.setItem("userId", userData.id); // Save user ID in local storage
      localStorage.setItem("role", userData.role); // Save user role in local storage
      console.log("User role saved:", userData.role);

      if (userData.role === "CUSTOMER") {
        // Fetch the customer ID using the user ID and access token
        const customerResponse = await fetch(
          `http://localhost:8080/customer/getCustomerByUserId/${userData.id}`,
          {
            method: "GET",
            headers: {
              Accept: "*/*",
              Authorization: `Bearer ${data.access_token}`,
            },
          }
        );

        if (!customerResponse.ok) {
          throw new Error(`HTTP error! status: ${customerResponse.status}`);
        }

        const customerId = await customerResponse.text(); // Get the customer ID
        localStorage.setItem("customerId", customerId); // Store the customer ID in localStorage
        console.log("Customer ID saved:", customerId);
      } else if (userData.role === "HALL_OWNER") {
        // Fetch hall owner info using the user ID and access token
        const hallOwnerResponse = await fetch(
          `http://localhost:8080/hallOwner/getHallOwnerByUserId/${userData.id}`,
          {
            method: "GET",
            headers: {
              Accept: "*/*",
              Authorization: `Bearer ${data.access_token}`,
            },
          }
        );

        if (!hallOwnerResponse.ok) {
          throw new Error(`HTTP error! status: ${hallOwnerResponse.status}`);
        }

        const hallOwnerData = await hallOwnerResponse.json(); // Expecting a JSON response
        const hallOwnerId = hallOwnerData.id; // Extract the hall owner ID
        const companyName = hallOwnerData.companyName; // Extract the company name

        // Store the hall owner ID and company name in localStorage
        localStorage.setItem("hallOwnerId", hallOwnerId);
        localStorage.setItem("companyName", companyName);

        console.log("Hall Owner ID saved:", hallOwnerId);
        console.log("Company Name saved:", companyName);
      }

      history.push("/"); // Redirect to home
    } catch (error) {
      console.error("Login Error:", error);
      setError(t("login_error")); // Set translated error message
    }
  };

  return (
    <>
      <HeadTitle />
      <section className="login-form-section">
        <div className="login-form-container">
          <div className="login-form-box">
            <p className="login-form-title">{t("login_prompt")}</p> {/* Translated login prompt */}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-input-wrapper">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email")}
                  required
                  className="login-input-field"
                />
              </div>
  
              <div className="login-input-wrapper">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("password")}
                  required
                  className="login-input-field"
                />
              </div>
  
              <div className="login-flex-space">
                <div className="login-checkbox-container">
                  <input type="checkbox" className="login-checkbox" />
                  <label>{t("remember_me")}</label>{" "}
                  {/* Translated Remember Me */}
                </div>
                <div className="login-forgot-password">
                  <Link to="/reset-password">{t("forgot_password")}</Link>{" "}
                  {/* Translated Forgot Password */}
                </div>
              </div>
  
              {error && (
                <div className="login-error">
                  <ErrorOutlineIcon color="error" />
                  {error} {/* Error message */}
                </div>
              )}
  
              <button type="submit" className="login-submit-btn">
                {t("sign_in")} {/* Translated Sign In */}
              </button>
              <p className="login-signup-prompt">
                {t("no_account")} {/* Translated "Don't have an account?" */}
                <Link to="/register" className="login-signup-link">{t("signup")}</Link>{" "}
                {/* Translated Signup */}
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
  
};

export default Login;
