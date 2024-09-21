import React, { useEffect, useRef } from "react";
import "./About.css";
import HeadTitle from "../../Common/HeadTitle/HeadTitle";
import { useTranslation } from "react-i18next"; // Import useTranslation hook

const About = () => {
  const { t } = useTranslation(); // Initialize translation hook

  // Create refs for sections
  const topSectionRef = useRef(null);
  const featuresSectionRef = useRef(null);

  useEffect(() => {
    // Callback for intersection
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    };

    // Intersection Observer options
    const observerOptions = {
      threshold: 0.5, // Trigger when 50% of the section is visible
    };

    // Create the observer
    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Observe sections
    if (topSectionRef.current) observer.observe(topSectionRef.current);
    if (featuresSectionRef.current)
      observer.observe(featuresSectionRef.current);

    // Cleanup observer on component unmount
    return () => {
      if (topSectionRef.current) observer.unobserve(topSectionRef.current);
      if (featuresSectionRef.current)
        observer.unobserve(featuresSectionRef.current);
    };
  }, []);

  return (
    <>
      <HeadTitle />

      {/* Top Section */}
      <section
        ref={topSectionRef}
        className="about-unique-container about-unique-top"
      >
        <div className="about-unique-inner-container">
          <div className="about-unique-card about-unique-mtop about-unique-flex-space">
            <div className="about-unique-row about-unique-image-left">
              <img
                src="https://res.cloudinary.com/dykzph9bu/image/upload/v1726928042/about-img-11_j5qzap.jpg"
                alt=""
                className="about-unique-image"
              />
            </div>
            <div className="about-unique-row about-unique-text-right">
              <h2>4Everbooking</h2>
              <h1>
                <span>{t("find_best_halls")}</span>
              </h1>
              <p>{t("creators_intro")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresSectionRef}
        className="about-unique-features about-unique-top hidden-section"
      >
        <div className="about-unique-inner-container about-unique-card about-unique-flex-space">
          <div className="about-unique-row about-unique-row1">
            <h2>{t("why_choose_us")}</h2>
            <h1>{t("wide_variety_of_halls")}</h1>
            <p>{t("what_makes_us_special")}</p>
          </div>
          <div className="about-unique-row about-unique-image">
            <img src="https://res.cloudinary.com/dykzph9bu/image/upload/v1726928042/about-img-22_iaaeyq.png" alt="" />
            <div className="about-unique-control-btn"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
