import React from "react";
import { useHistory } from "react-router-dom";
import "./Unauthorized.css"; // Import the CSS for styling

const Unauthorized = () => {
  const history = useHistory();

  const goHome = () => {
    history.push("/");
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
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;