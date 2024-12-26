import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Importing the translation hook
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import logo from "./logo1.png";
import "./Footer.css"; // Assuming this is where the CSS will be placed

const Footer = () => {
  const { t } = useTranslation(); // Initialize translation hook

  return (
    <>
      <footer className="foote-unique-footer">
        <div className="foote-unique-container foote-unique-grid">
          {/* About Us Section */}
          <div className="foote-unique-box">
            <h2>{t("about_us")}</h2>
            <p>{t("about_us_description")}</p>
            <br />
            <p>{t("find_best_halls")}</p>
            <div className="foote-unique-icon foote-unique-flex_space">
              <i className="fab fa-facebook-f"></i>
              <i className="fab fa-twitter"></i>
              <i className="fab fa-instagram"></i>
            </div>
          </div>

          {/* Logo Section */}
          <div className="foote-unique-box foote-unique-logo_box">
            <img
              src={logo}
              className="foote-unique-footer_logo"
              alt={t("footer_logo_alt", { defaultValue: "Footer Logo" })}
            />
          </div>

          {/* Contact Section */}
          <div className="foote-unique-box-contact">
            <h2>{t("contacts")}</h2>
            <ul>
              <li>
                <PhoneIcon /> {t("phone_number_footer")}
              </li>
              <li>
                <EmailIcon /> {t("email_address_footer")}
              </li>
              <li>
                <LocationOnIcon /> {t("location_footer")}
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <div className="foote-unique-legal">
        <p>
          {t("copyright")} <Link to="/">{t("footer_link")}</Link>
        </p>
      </div>
    </>
  );
};

export default Footer;
