import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext"; // Ensure the path is correct
import "./Navbar.css";
import LanguageSwitcher from "./LanguageSwitcher"; // Import the Language Switcher
import { useTranslation } from "react-i18next"; // Import the hook for translation

const Navbar = () => {
  const { t } = useTranslation(); // Initialize translation
  const [click, setClick] = useState(false);
  const [profileImage, setProfileImage] = useState("/Images/user.png"); // Default profile picture
  const { isLoggedIn, logout } = useAuth(); // Use logout directly from the context
  const history = useHistory();

  useEffect(() => {
    if (isLoggedIn) {
      const fetchProfileImage = async () => {
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
          if (user.image) {
            setProfileImage(user.image);
          }
        } catch (error) {
          console.error("Error fetching profile image:", error);
        }
      };

      fetchProfileImage();
    }
  }, [isLoggedIn]);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const handleLogout = async () => {
    try {
      await logout(); // Directly use the logout function
      history.push("/sign-in"); // Redirect to sign-in page after logout
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      <nav className="navbar-modern">
        <div className="container-modern flex-space-modern">
          <div className="logo-modern">
            <Link to="/" className="logo-link-modern" onClick={closeMobileMenu}>
              <p>
                4<span className="logo-highlight-modern">EVER</span>BOOKING
              </p>
            </Link>
          </div>
  
          <div className="menu-icon-modern" onClick={handleClick}>
            <i className={click ? "fas fa-times" : "fas fa-bars"}></i>
          </div>
  
          <ul className={click ? "nav-menu-modern active" : "nav-menu-modern"}>
            <li className="nav-item-modern">
              <Link to="/" className="nav-link-modern" onClick={closeMobileMenu}>
                {t("home")}
              </Link>
            </li>
            <li className="nav-item-modern">
              <Link
                to="/about"
                className="nav-link-modern"
                onClick={closeMobileMenu}
              >
                {t("about_us")}
              </Link>
            </li>
  
            <li className="nav-item-modern">
              <Link
                to="/halls"
                className="nav-link-modern"
                onClick={closeMobileMenu}
              >
                {t("halls")}
              </Link>
            </li>
  
            <li className="nav-item-modern">
              <Link
                to="/contact"
                className="nav-link-modern"
                onClick={closeMobileMenu}
              >
                {t("contact_us")}
              </Link>
            </li>
          </ul>
  
          <div className="login-area-modern flex-modern">
            {isLoggedIn ? (
              <li className="profile-dropdown-modern">
                <div
                  className="profile-trigger-modern"
                  onClick={closeMobileMenu}
                >
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-image-modern"
                  />
                  <span className="profile-text-modern">{t("my_profile")}</span>
                </div>
                <ul className="dropdown-menu-modern">
                  <li>
                    <Link to="/dashboard/edit-profile" className="dropdown-link-modern">
                      <i className="fas fa-cog"></i> {t("settings")}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-link-modern" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> {t("logout")}
                    </Link>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="login-link-modern">
                  <Link
                    to="/sign-in"
                    className="nav-link-modern"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-sign-in-alt"></i> {t("sign_in")}
                  </Link>
                </li>
                <li className="login-link-modern">
                  <Link
                    to="/register"
                    className="nav-link-modern"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-user-plus"></i> {t("register")}
                  </Link>
                </li>
              </>
            )}
          </div>
          {/* Language switcher here */}
          <LanguageSwitcher />
        </div>
      </nav>
    </>
  );
  
};

export default Navbar;
