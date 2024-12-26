import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import "./HeadTitle.css";

const HeadTitle = () => {
  const location = useLocation(); // Get current location
  const { t } = useTranslation(); // Initialize translation hook

  // Mapping of route paths to translation keys
  const routeNames = {
    "": "home",
    about: "about_us",
    gallery: "gallery",
    halls: "halls",
    hall: "hall_details",
    dashboard: "dashboard",
    "sign-in": "sign_in",
    register: "register",
    "reset-password": "reset_password",
  };

  // Extract the base route name from the path
  const currentPath = location.pathname.split("/")[1];
  const title = t(routeNames[currentPath] || "home"); // Default to "home" if path is not found

  return (
    <section className="headtitle-image-heading">
      <div className="headtitle-container">
        <h1 className="headtitle-title">{title}</h1>
      </div>
    </section>
  );
};

export default HeadTitle;
