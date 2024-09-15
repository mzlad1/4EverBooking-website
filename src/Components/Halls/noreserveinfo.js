import React from "react";
import { useHistory } from "react-router-dom";
import "./noreserveinfo.css"; // Import the CSS for styling

const Unauthorized = () => {
  const history = useHistory();

  const goHome = () => {
    history.push("/");
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1 className="unauthorized-heading">Error!</h1>
        <h2 className="unauthorized-subheading">No Hall details selected</h2>
        <p className="unauthorized-message">
          You should select a hall details to view this page. Please make sure
          you're already selected it right.
        </p>
        <button className="unauthorized-btn" onClick={goHome}>
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
