import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Data from "./Data";
import "./slide.css";
import { useTranslation } from "react-i18next";
import ReactTypingEffect from "react-typing-effect";

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
          <h1>
            <ReactTypingEffect
              text={[
                t("welcome_message"), // First message
                t("find_your_perfect_venue"), // Second message
                t("book_your_dream_event"), // Third message
                t("discover_unforgettable_halls"), // Fourth message
              ]}
              speed={100} // Typing speed
              eraseDelay={3000} // Delay before erasing
              typingDelay={500} // Delay before typing starts
              eraseSpeed={80} // Speed of erasing the text
            />
          </h1>
          <p>{t("find_best_halls_home")}</p>

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
