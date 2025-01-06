import React from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./noreserveinfo.css"; // Import the CSS for styling

const Unauthorized = () => {
  const history = useHistory();
  const { t } = useTranslation(); // Initialize the translation hook

  const goHome = () => {
    history.push("/");
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1 className="unauthorized-heading">{t("error_heading")}</h1>
        <h2 className="unauthorized-subheading">{t("error_subheading")}</h2>
        <p className="unauthorized-message">{t("error_message")}</p>
        <button className="unauthorized-btn" onClick={goHome}>
          {t("go_home")}
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
