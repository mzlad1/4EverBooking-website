import React from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import "./About.css";

const AboutCard = () => {
  const { t } = useTranslation(); // Initialize translation hook

  return (
    <>
      <div className="aboutcard-unique-heading">
        <h1>who we are?</h1>
        <div className="aboutcard-unique-line"></div>{" "}
        {/* Divider under the heading */}
      </div>
      <div className="about-unique-card about-unique-mtop about-unique-flex-space">
        <div className="about-unique-row about-unique-image-left">
          <img
            src="/images/about-img-11.jpg"
            alt=""
            className="about-unique-image"
          />
        </div>
        <div className="about-unique-row about-unique-text-right">
          <h2>4Everbooking</h2>
          <h1>
            <span>{t("find_best_halls")}</span>{" "}
            {/* Translated "Find The Best Halls For Your Event." */}
          </h1>
          <p>{t("creators_intro")}</p> {/* Translated creators' introduction */}
        </div>
      </div>
    </>
  );
};

export default AboutCard;
