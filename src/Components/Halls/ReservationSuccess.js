import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./reservationSuccess.css"; // Custom CSS for styling the success message
import { useTranslation } from "react-i18next";

const ReservationSuccess = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // Clear the reservation details from local storage on component mount
    localStorage.removeItem("reservationDetails");
  }, []); // Empty dependency array ensures this runs only once on component mount

  return (
    <div className="reservation-success-page">
      <h1>{t("reservation_successful")}</h1>
      <p>{t("reservation_completed_successfully")}</p>
      <p>
        {t("view_reserved_halls")}{" "}
        <Link to="/dashboard/reserved-halls">{t("reserved_halls_page")}</Link>.
      </p>
      <Link
        onClick={() => {
          document.body.scrollTop = 0; // For Safari
          document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, Opera
        }}
        to="/"
        className="home-button"
      >
        {t("back_to_home")}
      </Link>
    </div>
  );
};

export default ReservationSuccess;
