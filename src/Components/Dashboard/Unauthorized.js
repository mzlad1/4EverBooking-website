import React from "react";
import { useHistory } from "react-router-dom";
import "./Unauthorized.css"; // Import the CSS for styling

const Unauthorized = () => {
  const history = useHistory();

  const userRole = localStorage.getItem("role"); // Get the user's role from localStorage

  const goHome = () => {
    if (userRole === "ADMIN") {
      history.push("/dashboard/edit-profile"); // Admin's settings page
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    } else {
      history.push("/"); // Home page for other roles
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1 className="unauthorized-heading">403</h1>
        <h2 className="unauthorized-subheading">Unauthorized Access</h2>
        <p className="unauthorized-message">
          You don't have permission to view this page. Please make sure you're
          signed in with the right account.
        </p>
        <button className="unauthorized-btn" onClick={goHome}>
          {userRole === "ADMIN" ? "Go to settings" : "Go to Home"}
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
