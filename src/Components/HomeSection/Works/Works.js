import React from "react";
import "../popular/MostPopular.css"; // If this CSS is necessary for some shared styles
import "./Works.css"; // Main CSS for this component
import Card from "./Card";
import { useTranslation } from "react-i18next";

const Works = () => {
  const { t } = useTranslation(); // Initialize translation

  const Wdata = [
    {
      id: 1,
      cover: "https://res.cloudinary.com/dykzph9bu/image/upload/v1726928048/work-1_if3ttl.png",
      title: t("wdata.0.title"),
      desc: t("wdata.0.desc"),
    },
    {
      id: 2,
      cover: "https://res.cloudinary.com/dykzph9bu/image/upload/v1726928048/work-2_l0sfoh.png",
      title: t("wdata.1.title"),
      desc: t("wdata.1.desc"),
    },
    {
      id: 3,
      cover: "https://res.cloudinary.com/dykzph9bu/image/upload/v1726928048/work-3_f6mzq2.png",
      title: t("wdata.2.title"),
      desc: t("wdata.2.desc"),
    },
  ];

  return (
    <>
      <section className="works-unique-section">
        <div className="works-unique-container">
          <div className="works-unique-heading">
            <h1>{t("how_it_works.heading")}</h1>
            <div className="works-unique-line"></div> {/* Divider under the heading */}
          </div>

          {/* Add top spacing above the cards */}
          <div className="works-unique-content works-unique-grid">
            {Wdata.map((value, index) => (
              <Card
                key={index}
                cover={value.cover}
                title={value.title}
                desc={value.desc}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Works;
