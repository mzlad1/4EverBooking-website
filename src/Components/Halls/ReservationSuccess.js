import React from "react";
import { Link } from "react-router-dom";
import "./reservationSuccess.css"; // Custom CSS for styling the success message

const ReservationSuccess = () => {
  return (
    <div className="reservation-success-page">
      <h1>Reservation Successful!</h1>
      <p>Your reservation was completed successfully.</p>
      <p>
        You can view your reserved halls on the{" "}
        <Link to="/dashboard/reserved-halls">Reserved Halls</Link> page.
      </p>
      <Link to="/" className="home-button">
        Back to Home
      </Link>
    </div>
  );
};

export default ReservationSuccess;
