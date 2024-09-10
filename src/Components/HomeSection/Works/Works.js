import React from "react";
import "../popular/MostPopular.css"; // If this CSS is necessary for some shared styles
import "./Works.css"; // Main CSS for this component
import Card from "./Card";
import Wdata from "./Wdata";

const Works = () => {
  return (
    <>
      <section className="works-unique-section">
        <div className="works-unique-container">
          <div className="works-unique-heading">
            <h1>How it Works</h1>
            <div className="works-unique-line"></div> {/* Divider under the heading */}
          </div>

          {/* Add top spacing above the cards */}
          <div className="works-unique-content works-unique-grid">
            {Wdata.map((value, index) => {
              return (
                <Card
                  key={index}
                  cover={value.cover}
                  title={value.title}
                  desc={value.desc}
                />
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default Works;
