import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Data from "./Data";
import "./slide.css";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const length = Data.length;
  const history = useHistory();
  const userRole = localStorage.getItem("role");
  const nextSlide = () => {
    setCurrent(current === length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? length - 1 : current - 1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (!showSearchInput) {
      setShowSearchInput(true);
    } else {
      history.push(`/halls?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      <section className="slider">
        <div className="control-btn">
          <button className="prev" onClick={prevSlide}>
            <i className="fas fa-caret-left"></i>
          </button>
          <button className="next" onClick={nextSlide}>
            <i className="fas fa-caret-right"></i>
          </button>
        </div>

        {Data.map((slide, index) => (
          <div
            className={index === current ? "slide active" : "slide"}
            key={index}
          >
            {index === current && (
              <img
                src={slide.image}
                alt="Home Image"
                style={{ width: "100%", height: "90vh" }}
              />
            )}
          </div>
        ))}

        <div className="welcome-message">
          <h1>{t("welcome_message")}</h1>
          <p>{t("find_best_halls_home")}</p>

          {/* Conditionally render the search container if userRole is NOT "HALL_OWNER" */}
          {userRole !== "HALL_OWNER" && (
            <div className="search1-container">
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={searchTerm}
                onChange={handleSearchChange}
                className={showSearchInput ? "visible" : ""}
              />
              <button className="search-button" onClick={handleSearch}>
                <i className="fas fa-search"></i>
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
