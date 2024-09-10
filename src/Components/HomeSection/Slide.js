import React, { useState } from "react";
import { useHistory } from "react-router-dom"; // Import useHistory
import Data from "./Data";
import "./slide.css";
import { useTranslation } from "react-i18next"; // Import useTranslation hook

const Home = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [current, setCurrent] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); // State to hold search term
  const length = Data.length;
  const history = useHistory(); // Initialize useHistory

  const nextSlide = () => {
    setCurrent(current === length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? length - 1 : current - 1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update the search term state
  };

  const handleSearch = () => {
    // Navigate to halls page and pass the search term as a query parameter
    history.push(`/halls?search=${encodeURIComponent(searchTerm)}`);
  };

  if (!Array.isArray(Data) || Data.length <= 0) {
    return null;
  }

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
          <h1>{t('welcome_message')}</h1> {/* Translated welcome message */}
          <p>{t('find_best_halls_home')}</p> {/* Translated "Find The Best Halls For Your Event." */}
          <div className="search1-container">
            <input
              type="text"
              placeholder={t('search_placeholder')} // Translated placeholder text
              value={searchTerm}
              onChange={handleSearchChange}
              autoFocus
            />
            <button className="search-button" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
