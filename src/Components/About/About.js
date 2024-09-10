import React from "react";
import "./About.css";
import AboutCard from "./AboutCard";
import HeadTitle from "../../Common/HeadTitle/HeadTitle";
import { useTranslation } from "react-i18next"; // Import useTranslation hook

const About = () => {
  const { t } = useTranslation(); // Initialize translation hook

  return (
    <>
      <HeadTitle />

      <section className="about-unique-container about-unique-top">
        <div className="about-unique-inner-container">
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
              <p>{t("creators_intro")}</p>{" "}
              {/* Translated creators' introduction */}
            </div>
          </div>{" "}
        </div>
      </section>

      <section className="about-unique-features about-unique-top">
        <div className="about-unique-inner-container about-unique-card about-unique-flex-space">
          <div className="about-unique-row about-unique-row1">
            <h2>{t("why_choose_us")}</h2> {/* Translated "Why choose us?" */}
            <h1>{t("wide_variety_of_halls")}</h1>{" "}
            {/* Translated "We Give A Wide Variety Of Halls In Palestine." */}
            <p>{t("what_makes_us_special")}</p> {/* Translated paragraph */}
          </div>
          <div className="about-unique-row about-unique-image">
            <img src="/images/about-img-22.jpg" alt="" />
            <div className="about-unique-control-btn"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
