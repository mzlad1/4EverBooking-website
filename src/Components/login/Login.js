import React, { useState } from "react";
import { useAuth } from "../../Context/AuthContext"; // Adjust the path as needed
import { useLocation, Link, useHistory, Redirect } from "react-router-dom"; // Make sure Redirect is imported
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import "./login.css";
import { fetchWithAuth } from "../../apiClient"; // Import the fetchWithAuth function

const Login = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const { login, isLoggedIn } = useAuth(); // Use login and isLoggedIn from context
  const history = useHistory();
  const location = useLocation();

  // Check if already logged in, if so, redirect to the previous page or home
  if (isLoggedIn) {
    return <Redirect to={"/"} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading overlay
    try {
      const response = await fetchWithAuth("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      login(data.access_token, data.refresh_token);
      console.log("accessToken:", data.access_token);
      console.log("refreshToken:", data.refresh_token);

      // Fetch user data
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
      localStorage.setItem("userId", userData.id);
      localStorage.setItem("role", userData.role);
      console.log("User role saved:", userData.role);
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      // Handle CUSTOMER role
      if (userData.role === "CUSTOMER") {
        const customerResponse = await fetchWithAuth(
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

        const customerId = await customerResponse.text();
        localStorage.setItem("customerId", customerId);
        console.log("Customer ID saved:", customerId);
      }

      // Handle HALL_OWNER role
      if (userData.role === "HALL_OWNER") {
        console.log("Handling Hall Owner role...");

        try {
          const hallOwnerResponse = await fetchWithAuth(
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
            throw new Error(
              `Failed to fetch hall owner data: ${hallOwnerResponse.status}`
            );
          }

          const hallOwnerData = await hallOwnerResponse.json();
          const connectedAccountId = hallOwnerData.connectedAccountId;

          if (!connectedAccountId) {
            console.error("connectedAccountId is null or undefined.");
            setError(t("stripe_account_error")); // Add a user-friendly error message
            return;
          }

          console.log("Connected Account ID:", connectedAccountId);

          const stripeResponse = await fetch(
            "http://localhost:8080/payments/resend-onboarding-link",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${data.access_token}`,
              },
              body: JSON.stringify({ connectedAccountId }),
            }
          );

          if (!stripeResponse.ok) {
            throw new Error(
              `Stripe onboarding failed: ${stripeResponse.status}`
            );
          }

          const stripeData = await stripeResponse.json();
          console.log("Stripe Response:", stripeData);

          if (
            stripeData.onboardingLink &&
            stripeData.onboardingLink !== "Onboarding is already complete."
          ) {
            console.log("Redirecting to Stripe Onboarding...");
            window.location.href = stripeData.onboardingLink;
            return;
          } else if (!stripeData.onboardingLink) {
            console.error("Stripe onboarding link is undefined.");
            setError(t("stripe_onboarding_error"));
            return;
          }

          const hallOwnerId = hallOwnerData.id;
          const companyName = hallOwnerData.companyName;
          localStorage.setItem("hallOwnerId", hallOwnerId);
          localStorage.setItem("companyName", companyName);
          console.log("Hall Owner ID saved:", hallOwnerId);
        } catch (error) {
          console.error("Error handling Hall Owner:", error.message);
          setError(t("stripe_onboarding_error"));
        }
      }

      // Handle ADMIN role or default redirection
      if (userData.role === "ADMIN" || userData.role === "SUPER_ADMIN") {
        history.push("/dashboard/edit-profile");
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      } else {
        history.push("/");
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError(t("login_error"));
    } finally {
      setLoading(false); // Hide loading overlay
    }
  };

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>{t("loading")}</p>
        </div>
      )}
      <section className="login-form-section">
        <div className="login-form-container">
          <div className="login-form-box">
            <Link to="/">
              <img
                src="https://res.cloudinary.com/dykzph9bu/image/upload/v1726955497/logo1_nw0jcc.png"
                alt="Website Logo"
                className="login-logo"
              />
            </Link>

            <p className="login-form-title">{t("Log_in_to_your_account")}</p>
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
                <div className="login-forgot-password">
                  <Link to="/reset-password">{t("forgot_password")}</Link>
                </div>
              </div>

              {error && (
                <div className="login-error">
                  <ErrorOutlineIcon color="error" />
                  {error}
                </div>
              )}

              <button type="submit" className="login-submit-btn">
                {t("sign_in")}
              </button>
              <p className="login-signup-prompt">
                {t("no_account")}
                <Link to="/register" className="login-signup-link">
                  {t("signup")}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
