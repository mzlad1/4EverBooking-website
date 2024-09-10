import React from "react";
import Cards from "./Cards";
import "./MostPopular.css";
import { useTranslation } from "react-i18next"; // Import useTranslation hook

const MostPopular = () => {
  const { t } = useTranslation(); // Initialize translation hook

  return (
    <>
      <section className="popular top">
        <div className="full_container">
          <div className="heading">
            <h1>{t("recommended_halls")}</h1> {/* Use translated text */}
            <div className="Line"></div>
          </div>

          <div className="content">
            <Cards />
          </div>
        </div>
      </section>
    </>
  );
};

export default MostPopular;
