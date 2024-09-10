import React from "react";
import { Link } from "react-router-dom";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import "./Footer.css"; // Assuming this is where the CSS will be placed

const Footer = () => {
  return (
    <>
      <footer className="foote-unique-footer">
        <div className="foote-unique-container foote-unique-grid">
          {/* About Us Section */}
          <div className="foote-unique-box">
            <h2>ABOUT US</h2>
            <p>
              4EverBooking is a website created especially for event organizers
              and halls' owners. Hoping to help these two categories in finding
              a suitable hall, and organizing their reservations, respectively.
            </p>
            <br />
            <p>Find The Best Halls For Your Event.</p>
            <div className="foote-unique-icon foote-unique-flex_space">
              <i className="fab fa-facebook-f"></i>
              <i className="fab fa-twitter"></i>
              <i className="fab fa-instagram"></i>
            </div>
          </div>

          {/* Logo Section */}
          <div className="foote-unique-box foote-unique-logo_box">
            <img
              src={"Images/logo.png"}
              className="foote-unique-footer_logo"
              alt="Footer Logo"
            />
            <p>4EverBooking Lifestyle</p>
          </div>

          {/* Contact Section */}
          <div className="foote-unique-box">
            <h2>CONTACTS</h2>
            <ul>
              <li>
                <PhoneIcon /> +880 170 1111 000
              </li>
              <li>
                <EmailIcon /> info@example.com
              </li>
              <li>
                <LocationOnIcon /> Ramallah, Palestine
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <div className="foote-unique-legal">
        <p>
          ©opyright 2025 <Link to="/">4EverBooking</Link>
        </p>
      </div>
    </>
  );
};

export default Footer;
